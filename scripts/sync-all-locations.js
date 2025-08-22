#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { googlePlacesService } = require('../src/lib/google-places')

const prisma = new PrismaClient()

async function syncAllLocations() {
  console.log('🔄 Starting bulk sync of all locations...\n')
  
  // Check command line arguments
  const args = process.argv.slice(2)
  const forceSync = args.includes('--force')
  const syncRecent = args.includes('--recent')
  
  if (forceSync) {
    console.log('🔧 FORCE MODE - Will sync all locations regardless of sync status\n')
  } else if (syncRecent) {
    console.log('🕒 RECENT MODE - Will sync locations added in the last 3 hours\n')
  } else {
    console.log('📋 NORMAL MODE - Will only sync locations that haven\'t been synced yet\n')
  }
  
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
        lastGoogleSync: true,
        googleRating: true,
        googleReviewCount: true,
        createdAt: true,
        _count: {
          select: {
            photos: true,
            googleReviews: true
          }
        }
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

        // Check if we should skip based on whether location has been synced
        const forceSync = args.includes('--force')
        const syncRecent = args.includes('--recent')
        
        // A location is considered synced if it has:
        // 1. A Google Place ID AND
        // 2. Either photos, reviews, or a lastGoogleSync timestamp
        const hasGooglePlaceId = !!location.googlePlaceId
        const hasSyncedData = location._count.photos > 0 || 
                             location._count.googleReviews > 0 || 
                             location.lastGoogleSync ||
                             (location.googleRating && location.googleReviewCount > 0)
        
        // Check if location was added in the last 3 hours
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
        const isRecentlyAdded = location.createdAt && location.createdAt > threeHoursAgo
        
        // Skip logic:
        // - If force sync: never skip
        // - If sync recent: only skip if not recently added AND already synced
        // - Otherwise: skip if already synced
        let shouldSkip = false
        if (forceSync) {
          shouldSkip = false
        } else if (syncRecent) {
          shouldSkip = !isRecentlyAdded && hasGooglePlaceId && hasSyncedData
        } else {
          shouldSkip = hasGooglePlaceId && hasSyncedData
        }
        
        if (shouldSkip) {
          let skipReason = 'already synced'
          if (location.lastGoogleSync) {
            const hoursSinceLastSync = (Date.now() - location.lastGoogleSync.getTime()) / (1000 * 60 * 60)
            skipReason = `synced ${Math.round(hoursSinceLastSync)} hours ago`
          } else if (location._count.photos > 0) {
            skipReason = `has ${location._count.photos} photos`
          } else if (location._count.googleReviews > 0) {
            skipReason = `has ${location._count.googleReviews} reviews`
          }
          console.log(`⏭️  Skipping - ${skipReason}`)
          results.skipped++
          continue
        }

        // Sync the location data
        if (syncRecent && isRecentlyAdded) {
          console.log(`🕒 Syncing recently added location (added ${Math.round((Date.now() - location.createdAt.getTime()) / (1000 * 60 * 60))} hours ago)...`)
        } else {
          console.log(`🔄 Syncing photos and reviews...`)
        }
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
  npm run sync:all [options]

Options:
  --help, -h     Show this help message
  --force        Force sync all locations (including recently synced)
  --recent       Sync locations added in the last 3 hours (regardless of sync status)
  
Default behavior:
  Only syncs locations that haven't been synced yet (no lastGoogleSync timestamp)

Examples:
  npm run sync:all                    # Sync only unsynced locations
  npm run sync:all -- --force         # Force sync all locations
  npm run sync:all -- --recent        # Sync locations added in last 3 hours
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
