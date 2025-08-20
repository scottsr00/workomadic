#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showSyncStatus() {
  console.log('📊 Google Places Sync Status Report\n')
  
  try {
    // Get all locations with sync information
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
        _count: {
          select: {
            photos: true,
            googleReviews: true
          }
        }
      },
      orderBy: {
        lastGoogleSync: 'desc'
      }
    })

    console.log(`📈 Found ${locations.length} approved locations\n`)

    if (locations.length === 0) {
      console.log('❌ No approved locations found')
      return
    }

    const stats = {
      total: locations.length,
      withGoogleId: 0,
      withoutGoogleId: 0,
      recentlySynced: 0,
      neverSynced: 0,
      totalPhotos: 0,
      totalReviews: 0
    }

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))

    console.log('📍 Location Sync Status:')
    console.log('='.repeat(80))

    locations.forEach((location, index) => {
      const hasGoogleId = !!location.googlePlaceId
      const hasBeenSynced = !!location.lastGoogleSync
      const isRecentlySynced = hasBeenSynced && location.lastGoogleSync > oneDayAgo
      
      if (hasGoogleId) stats.withGoogleId++
      else stats.withoutGoogleId++
      
      if (isRecentlySynced) stats.recentlySynced++
      if (!hasBeenSynced) stats.neverSynced++
      
      stats.totalPhotos += location._count.photos
      stats.totalReviews += location._count.googleReviews

      const syncStatus = hasBeenSynced 
        ? isRecentlySynced ? '🟢 Recently Synced' : '🟡 Synced'
        : '🔴 Never Synced'
      
      const googleIdStatus = hasGoogleId ? '✅' : '❌'
      
      console.log(`${index + 1}. ${location.name}`)
      console.log(`   📍 ${location.address}`)
      console.log(`   🔗 Google Place ID: ${googleIdStatus} ${location.googlePlaceId || 'Not found'}`)
      console.log(`   📊 Sync Status: ${syncStatus}`)
      
      if (hasBeenSynced) {
        const hoursAgo = Math.round((now - location.lastGoogleSync) / (1000 * 60 * 60))
        const daysAgo = Math.round((hoursAgo / 24) * 10) / 10
        console.log(`   ⏰ Last Sync: ${hoursAgo} hours ago (${daysAgo} days)`)
      }
      
      if (location.googleRating) {
        console.log(`   ⭐ Google Rating: ${location.googleRating}/5`)
      }
      
      if (location.googleReviewCount) {
        console.log(`   📝 Total Reviews: ${location.googleReviewCount}`)
      }
      
      console.log(`   📸 Photos: ${location._count.photos}`)
      console.log(`   💬 Synced Reviews: ${location._count.googleReviews}`)
      console.log('')
    })

    // Summary statistics
    console.log('📊 SUMMARY STATISTICS:')
    console.log('='.repeat(50))
    console.log(`Total Locations: ${stats.total}`)
    console.log(`✅ With Google Place ID: ${stats.withGoogleId}`)
    console.log(`❌ Without Google Place ID: ${stats.withoutGoogleId}`)
    console.log(`🟢 Recently Synced (< 24h): ${stats.recentlySynced}`)
    console.log(`🔴 Never Synced: ${stats.neverSynced}`)
    console.log(`📸 Total Photos: ${stats.totalPhotos}`)
    console.log(`💬 Total Synced Reviews: ${stats.totalReviews}`)

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:')
    console.log('='.repeat(50))
    
    if (stats.withoutGoogleId > 0) {
      console.log(`🔍 ${stats.withoutGoogleId} locations need Google Place ID discovery`)
    }
    
    if (stats.neverSynced > 0) {
      console.log(`🔄 ${stats.neverSynced} locations have never been synced`)
    }
    
    if (stats.recentlySynced === stats.total) {
      console.log('✅ All locations are up to date (synced within 24 hours)')
    } else if (stats.recentlySynced > 0) {
      console.log(`⏭️  ${stats.total - stats.recentlySynced} locations could be re-synced`)
    }

    console.log('\n🚀 COMMANDS:')
    console.log('='.repeat(50))
    console.log('npm run sync:all-enhanced          # Sync all locations')
    console.log('npm run sync:all-enhanced -- --force  # Force sync (ignore timestamps)')
    console.log('npm run sync:test                  # Test with dry-run')

  } catch (error) {
    console.error('💥 Error generating sync status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the status report
showSyncStatus()
  .then(() => {
    console.log('\n✨ Status report completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Status report failed:', error)
    process.exit(1)
  })
