#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function syncDemo() {
  console.log('🔄 Google Places Sync Demo\n')
  
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
        _count: {
          select: {
            photos: true,
            googleReviews: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 5 // Limit to 5 for demo
    })

    console.log(`📊 Found ${locations.length} approved locations to process\n`)

    if (locations.length === 0) {
      console.log('❌ No approved locations found in the database')
      return
    }

    const results = {
      total: locations.length,
      wouldSync: 0,
      wouldSkip: 0,
      stats: {
        locationsWithGoogleId: 0,
        locationsWithoutGoogleId: 0,
        totalExistingPhotos: 0,
        totalExistingReviews: 0
      }
    }

    // Process each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i]
      const progress = `${i + 1}/${locations.length}`
      
      console.log(`\n${progress} Processing: ${location.name}`)
      console.log(`📍 Address: ${location.address}`)

      if (!location.googlePlaceId) {
        results.stats.locationsWithoutGoogleId++
        console.log(`⚠️  No Google Place ID found - would search Google Places API`)
        console.log(`🔍 Would search for: "${location.name}, ${location.address}"`)
      } else {
        results.stats.locationsWithGoogleId++
        console.log(`🔗 Google Place ID: ${location.googlePlaceId}`)
      }

      // Check existing data
      console.log(`📸 Existing photos: ${location._count.photos}`)
      console.log(`⭐ Existing Google reviews: ${location._count.googleReviews}`)
      
      if (location.googleRating) {
        console.log(`📊 Google rating: ${location.googleRating}/5`)
      }
      
      if (location.googleReviewCount) {
        console.log(`📈 Total Google reviews: ${location.googleReviewCount}`)
      }

      // Simulate what would happen
      if (location.googlePlaceId) {
        console.log(`🔄 Would sync photos and reviews from Google Places`)
        results.wouldSync++
        results.stats.totalExistingPhotos += location._count.photos
        results.stats.totalExistingReviews += location._count.googleReviews
      } else {
        console.log(`⏭️  Would skip - no Google Place ID available`)
        results.wouldSkip++
      }

      // Simulate delay
      console.log(`⏳ Would wait 1 second before next request...`)
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 DEMO SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total locations: ${results.total}`)
    console.log(`🔄 Would sync: ${results.wouldSync}`)
    console.log(`⏭️  Would skip: ${results.wouldSkip}`)
    
    console.log(`\n📈 CURRENT STATISTICS:`)
    console.log(`   📸 Total existing photos: ${results.stats.totalExistingPhotos}`)
    console.log(`   ⭐ Total existing Google reviews: ${results.stats.totalExistingReviews}`)
    console.log(`   🔗 Locations with Google Place ID: ${results.stats.locationsWithGoogleId}`)
    console.log(`   ❓ Locations without Google Place ID: ${results.stats.locationsWithoutGoogleId}`)

    console.log('\n💡 To run actual sync:')
    console.log('   1. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable')
    console.log('   2. Run: npm run sync:all-enhanced -- --dry-run')
    console.log('   3. Run: npm run sync:all-enhanced (for actual sync)')

    console.log('\n🎉 Demo completed!')

  } catch (error) {
    console.error('💥 Error during demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the demo
syncDemo()
  .then(() => {
    console.log('\n✨ Demo completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Demo failed:', error)
    process.exit(1)
  })
