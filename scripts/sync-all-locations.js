#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { googlePlacesService } = require('../src/lib/google-places')

const prisma = new PrismaClient()

async function syncAllLocations() {
  console.log('🔄 Starting bulk sync of all locations...\n')
  
  try {
    // Get all locations that are approved
    const locations = await prisma.location.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        address: true,
        googlePlaceId: true,
        lastGoogleSync: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`📊 Found ${locations.length} approved locations to process\n`)

    if (locations.length === 0) {
      console.log('❌ No approved locations found in the database')
      return
    }

    const results = {
      total: locations.length,
      synced: 0,
      skipped: 0,
      failed: 0,
      errors: []
    }

    // Process each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]
      const progress = `${i + 1}/${locations.length}`
      
      console.log(`\n${progress} Processing: ${location.name}`)
      console.log(`📍 Address: ${location.address}`)

      try {
        if (!location.googlePlaceId) {
          console.log(`⚠️  No Google Place ID found - attempting to search...`)
          
          // Try to find the place by name and address
          const placeId = await googlePlacesService.searchPlaceByName(
            location.name,
            location.address
          )
          
          if (placeId) {
            console.log(`✅ Found Google Place ID: ${placeId}`)
            
            // Update the location with the found place ID
            await prisma.location.update({
              where: { id: location.id },
              data: { googlePlaceId: placeId }
            })
            
            location.googlePlaceId = placeId
          } else {
            console.log(`❌ Could not find Google Place ID for this location`)
            results.skipped++
            results.errors.push({
              location: location.name,
              error: 'No Google Place ID found'
            })
            continue
          }
        } else {
          console.log(`🔗 Google Place ID: ${location.googlePlaceId}`)
        }

        // Check if we should skip based on last sync time (optional)
        const shouldSkip = false // Set to true if you want to skip recently synced locations
        if (shouldSkip && location.lastGoogleSync) {
          const hoursSinceLastSync = (Date.now() - location.lastGoogleSync.getTime()) / (1000 * 60 * 60)
          if (hoursSinceLastSync < 24) { // Skip if synced within last 24 hours
            console.log(`⏭️  Skipping - synced ${Math.round(hoursSinceLastSync)} hours ago`)
            results.skipped++
            continue
          }
        }

        // Sync the location data
        console.log(`🔄 Syncing photos and reviews...`)
        const syncResult = await googlePlacesService.syncLocationData(
          location.id,
          location.googlePlaceId
        )

        console.log(`✅ Successfully synced:`)
        console.log(`   📸 Photos: ${syncResult.photos.length}`)
        console.log(`   ⭐ Reviews: ${syncResult.reviews?.reviews?.length || 0}`)
        
        results.synced++

        // Add a small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.log(`❌ Error syncing ${location.name}: ${error.message}`)
        results.failed++
        results.errors.push({
          location: location.name,
          error: error.message
        })
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total locations: ${results.total}`)
    console.log(`✅ Successfully synced: ${results.synced}`)
    console.log(`⏭️  Skipped: ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.location}: ${error.error}`)
      })
    }

    console.log('\n🎉 Bulk sync completed!')

  } catch (error) {
    console.error('💥 Fatal error during bulk sync:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const command = args[0]

if (command === '--help' || command === '-h') {
  console.log(`
🔄 Google Places Bulk Sync Script

Usage:
  node scripts/sync-all-locations.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be synced without actually syncing
  --force        Force sync even for recently synced locations

Examples:
  node scripts/sync-all-locations.js
  node scripts/sync-all-locations.js --dry-run
  node scripts/sync-all-locations.js --force
`)
  process.exit(0)
}

// Run the sync
syncAllLocations()
  .then(() => {
    console.log('\n✨ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })
