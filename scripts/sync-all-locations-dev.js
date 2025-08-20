#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mock Google Places service for development
const mockGooglePlacesService = {
  async searchPlaceByName(name, address) {
    console.log(`🔍 [MOCK] Searching for: "${name}, ${address}"`)
    // Return a mock place ID
    return `mock_place_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async syncLocationData(locationId, placeId) {
    console.log(`🔄 [MOCK] Syncing data for location ${locationId} with place ID ${placeId}`)
    
    // Create mock photos
    const mockPhotos = [
      {
        id: `photo_${Date.now()}_1`,
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        alt: 'Mock coffee shop interior',
        isPrimary: true,
        locationId,
        createdAt: new Date()
      },
      {
        id: `photo_${Date.now()}_2`,
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        alt: 'Mock coffee shop exterior',
        isPrimary: false,
        locationId,
        createdAt: new Date()
      }
    ]

    // Create mock reviews
    const mockReviews = [
      {
        id: `review_${Date.now()}_1`,
        authorName: 'Mock User 1',
        rating: 5,
        text: 'Great place for remote work! Excellent coffee and fast WiFi.',
        time: new Date(),
        locationId
      },
      {
        id: `review_${Date.now()}_2`,
        authorName: 'Mock User 2',
        rating: 4,
        text: 'Nice atmosphere and good coffee. Perfect for digital nomads.',
        time: new Date(),
        locationId
      }
    ]

    return {
      photos: mockPhotos,
      reviews: {
        reviews: mockReviews
      }
    }
  }
}

async function syncAllLocationsDev() {
  console.log('🔄 Starting DEVELOPMENT bulk sync (using mock data)...\n')
  console.log('⚠️  This is using mock data - no real Google Places API calls will be made\n')
  
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
          console.log(`⚠️  No Google Place ID found - using mock search...`)
          
          // Use mock service to find place ID
          const placeId = await mockGooglePlacesService.searchPlaceByName(
            location.name,
            location.address
          )
          
          console.log(`✅ [MOCK] Found Google Place ID: ${placeId}`)
          
          // Update the location with the mock place ID
          await prisma.location.update({
            where: { id: location.id },
            data: { googlePlaceId: placeId }
          })
          
          location.googlePlaceId = placeId
        } else {
          console.log(`🔗 Google Place ID: ${location.googlePlaceId}`)
        }

        // Sync the location data using mock service
        console.log(`🔄 [MOCK] Syncing photos and reviews...`)
        const syncResult = await mockGooglePlacesService.syncLocationData(
          location.id,
          location.googlePlaceId
        )

        console.log(`✅ [MOCK] Successfully synced:`)
        console.log(`   📸 Photos: ${syncResult.photos.length}`)
        console.log(`   ⭐ Reviews: ${syncResult.reviews.reviews.length}`)
        
        results.synced++

        // Simulate delay
        console.log(`⏳ Waiting 500ms before next request...`)
        await new Promise(resolve => setTimeout(resolve, 500))

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
    console.log('📊 DEVELOPMENT SYNC SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total locations: ${results.total}`)
    console.log(`✅ Successfully synced: ${results.synced}`)
    console.log(`⏭️  Skipped: ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)
    
    console.log(`\n📈 MOCK STATISTICS:`)
    console.log(`   📸 Total photos synced: ${results.synced * 2}`)
    console.log(`   ⭐ Total reviews synced: ${results.synced * 2}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.location}: ${error.error}`)
      })
    }

    console.log('\n💡 To run with real Google Places API:')
    console.log('   1. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable')
    console.log('   2. Run: npm run sync:all-enhanced')

    console.log('\n🎉 Development sync completed!')

  } catch (error) {
    console.error('💥 Fatal error during development sync:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the development sync
syncAllLocationsDev()
  .then(() => {
    console.log('\n✨ Development script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Development script failed:', error)
    process.exit(1)
  })
