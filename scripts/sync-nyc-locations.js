#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { googlePlacesService } = require('../src/lib/google-places')

const prisma = new PrismaClient()

async function syncNYCLocations() {
  console.log('🔄 Starting sync of NYC locations...\n')
  
  try {
    // Get all NYC locations that have Google Place IDs but haven't been synced recently
    const locations = await prisma.location.findMany({
      where: {
        isApproved: true,
        googlePlaceId: {
          not: null
        },
        city: {
          name: 'New York City'
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        googlePlaceId: true,
        lastGoogleSync: true,
        googleRating: true,
        googleReviewCount: true
      },
      orderBy: {
        lastGoogleSync: 'asc' // Sync oldest first
      }
    })

    console.log(`📊 Found ${locations.length} NYC locations to process\n`)

    if (locations.length === 0) {
      console.log('❌ No NYC locations found in the database')
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
      console.log(`🔗 Google Place ID: ${location.googlePlaceId}`)
      
      if (location.lastGoogleSync) {
        const hoursSinceLastSync = (Date.now() - location.lastGoogleSync.getTime()) / (1000 * 60 * 60)
        console.log(`⏰ Last synced: ${Math.round(hoursSinceLastSync)} hours ago`)
      } else {
        console.log(`⏰ Never synced before`)
      }

      try {
        // Sync the location data (reviews and photos)
        console.log(`🔄 Syncing photos and reviews...`)
        const syncResult = await googlePlacesService.syncLocationData(
          location.id,
          location.googlePlaceId
        )

        console.log(`✅ Successfully synced:`)
        console.log(`   📸 Photos: ${syncResult.photos.length}`)
        console.log(`   ⭐ Reviews: ${syncResult.reviews?.reviews?.length || 0}`)
        
        results.synced++

        // Add a delay to avoid hitting API rate limits
        console.log(`⏳ Waiting 2 seconds before next sync...`)
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.log(`❌ Error syncing ${location.name}: ${error.message}`)
        results.failed++
        results.errors.push({
          location: location.name,
          error: error.message
        })
        
        // Continue with next location even if this one fails
        continue
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 NYC SYNC SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total NYC locations: ${results.total}`)
    console.log(`✅ Successfully synced: ${results.synced}`)
    console.log(`⏭️  Skipped: ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.location}: ${error.error}`)
      })
    }

    console.log('\n🎉 NYC sync completed!')

  } catch (error) {
    console.error('💥 Fatal error during NYC sync:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const command = args[0]

if (command === '--help' || command === '-h') {
  console.log(`
🔄 NYC Locations Google Places Sync Script

Usage:
  node scripts/sync-nyc-locations.js [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be synced without actually syncing

Examples:
  node scripts/sync-nyc-locations.js
  node scripts/sync-nyc-locations.js --dry-run
`)
  process.exit(0)
}

// Run the sync
syncNYCLocations()
  .then(() => {
    console.log('\n✨ NYC sync script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 NYC sync script failed:', error)
    process.exit(1)
  })
