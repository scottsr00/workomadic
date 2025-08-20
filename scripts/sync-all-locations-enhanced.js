#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')
const { googlePlacesService } = require('../src/lib/google-places')

const prisma = new PrismaClient()

// Load configuration
const { getConfig } = require('./sync-config')
const CONFIG = getConfig()

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryOperation(operation, maxRetries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      console.log(`⚠️  Attempt ${attempt} failed, retrying in ${CONFIG.retryDelay}ms...`)
      await sleep(CONFIG.retryDelay)
    }
  }
}

async function syncAllLocations() {
  console.log('🔄 Starting bulk sync of all locations...\n')
  
  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No actual syncing will occur\n')
  }
  
  try {
    // Get all locations that are approved
    let locations = await prisma.location.findMany({
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
        googleReviewCount: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Apply max locations limit if set
    if (CONFIG.maxLocations && locations.length > CONFIG.maxLocations) {
      console.log(`⚠️  Limiting to first ${CONFIG.maxLocations} locations for testing`)
      locations = locations.slice(0, CONFIG.maxLocations)
    }

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
      errors: [],
      stats: {
        totalPhotos: 0,
        totalReviews: 0,
        locationsWithGoogleId: 0,
        locationsWithoutGoogleId: 0
      }
    }

    // Process each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]
      const progress = `${i + 1}/${locations.length}`
      
      console.log(`\n${progress} Processing: ${location.name}`)
      console.log(`📍 Address: ${location.address}`)

      try {
        if (!location.googlePlaceId) {
          results.stats.locationsWithoutGoogleId++
          console.log(`⚠️  No Google Place ID found - attempting to search...`)
          
          if (CONFIG.dryRun) {
            console.log(`🔍 [DRY RUN] Would search for Google Place ID`)
            results.skipped++
            continue
          }
          
          // Try to find the place by name and address
          const placeId = await retryOperation(() => 
            googlePlacesService.searchPlaceByName(location.name, location.address)
          )
          
          if (placeId) {
            console.log(`✅ Found Google Place ID: ${placeId}`)
            
            // Update the location with the found place ID
            await prisma.location.update({
              where: { id: location.id },
              data: { googlePlaceId: placeId }
            })
            
            location.googlePlaceId = placeId
            results.stats.locationsWithGoogleId++
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
          results.stats.locationsWithGoogleId++
          console.log(`🔗 Google Place ID: ${location.googlePlaceId}`)
        }

        // Check if we should skip based on last sync time
        if (CONFIG.skipRecentlySynced && !CONFIG.forceSync && location.lastGoogleSync) {
          const now = new Date()
          const lastSync = new Date(location.lastGoogleSync)
          const hoursSinceLastSync = (now - lastSync) / (1000 * 60 * 60)
          const daysSinceLastSync = hoursSinceLastSync / 24
          
          const skipThreshold = CONFIG.skipRecentlySyncedDays || (CONFIG.skipRecentlySyncedHours / 24)
          
          if (daysSinceLastSync < skipThreshold) {
            console.log(`⏭️  Skipping - synced ${Math.round(daysSinceLastSync * 24)} hours ago (${Math.round(daysSinceLastSync * 10) / 10} days)`)
            results.skipped++
            continue
          }
        }

        // Sync the location data
        if (CONFIG.dryRun) {
          console.log(`🔍 [DRY RUN] Would sync photos and reviews for ${location.name}`)
          results.skipped++
          continue
        }

        console.log(`🔄 Syncing photos and reviews...`)
        const syncResult = await retryOperation(() => 
          googlePlacesService.syncLocationData(location.id, location.googlePlaceId)
        )

        console.log(`✅ Successfully synced:`)
        console.log(`   📸 Photos: ${syncResult.photos.length}`)
        console.log(`   ⭐ Reviews: ${syncResult.reviews?.reviews?.length || 0}`)
        
        results.synced++
        results.stats.totalPhotos += syncResult.photos.length
        results.stats.totalReviews += syncResult.reviews?.reviews?.length || 0

        // Add delay to avoid hitting API rate limits
        if (i < locations.length - 1) { // Don't delay after the last item
          console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests}ms before next request...`)
          await sleep(CONFIG.delayBetweenRequests)
        }

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
    console.log('\n' + '='.repeat(60))
    console.log('📊 SYNC SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total locations: ${results.total}`)
    console.log(`✅ Successfully synced: ${results.synced}`)
    console.log(`⏭️  Skipped: ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)
    
    if (!CONFIG.dryRun) {
      console.log(`\n📈 STATISTICS:`)
      console.log(`   📸 Total photos synced: ${results.stats.totalPhotos}`)
      console.log(`   ⭐ Total reviews synced: ${results.stats.totalReviews}`)
      console.log(`   🔗 Locations with Google Place ID: ${results.stats.locationsWithGoogleId}`)
      console.log(`   ❓ Locations without Google Place ID: ${results.stats.locationsWithoutGoogleId}`)
    }
    
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

// Parse command line arguments
const args = process.argv.slice(2)

for (const arg of args) {
  switch (arg) {
    case '--help':
    case '-h':
      console.log(`
🔄 Google Places Bulk Sync Script (Enhanced)

Usage:
  node scripts/sync-all-locations-enhanced.js [options]

Options:
  --help, -h           Show this help message
  --dry-run            Show what would be synced without actually syncing
  --force              Force sync even for recently synced locations
  --limit <number>     Limit processing to first N locations (useful for testing)
  --no-delay           Remove delay between requests (use with caution)
  --skip-recent        Skip locations synced within configured threshold

Examples:
  node scripts/sync-all-locations-enhanced.js
  node scripts/sync-all-locations-enhanced.js --dry-run
  node scripts/sync-all-locations-enhanced.js --limit 5
  node scripts/sync-all-locations-enhanced.js --force --no-delay
`)
      process.exit(0)
      break
      
    case '--dry-run':
      CONFIG.dryRun = true
      break
      
    case '--force':
      CONFIG.forceSync = true
      CONFIG.skipRecentlySynced = false
      break
      
    case '--skip-recent':
      CONFIG.skipRecentlySynced = true
      break
      
    case '--no-delay':
      CONFIG.delayBetweenRequests = 0
      break
      
    default:
      if (arg.startsWith('--limit=')) {
        const limit = parseInt(arg.split('=')[1])
        if (!isNaN(limit)) {
          CONFIG.maxLocations = limit
        }
      }
      break
  }
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
