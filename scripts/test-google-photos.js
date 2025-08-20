const { googlePlacesService } = require('../src/lib/google-places.ts')

async function testGooglePhotos() {
  try {
    console.log('Testing Google Places Photo Integration...')
    
    // Test with a real Google Place ID (Blue Bottle Coffee - Williamsburg)
    const placeId = 'ChIJN1t_tDeuEmsRUsoyG83frY4'
    
    console.log(`Fetching place details for: ${placeId}`)
    const placeDetails = await googlePlacesService.getPlaceDetails(placeId)
    
    if (placeDetails) {
      console.log('✅ Place details fetched successfully!')
      console.log(`Name: ${placeDetails.name}`)
      console.log(`Rating: ${placeDetails.rating || 'No rating'}`)
      console.log(`Reviews: ${placeDetails.user_ratings_total || 0}`)
      console.log(`Photos available: ${placeDetails.photos ? placeDetails.photos.length : 0}`)
      
      if (placeDetails.photos && placeDetails.photos.length > 0) {
        console.log('\n📸 Photo details:')
        placeDetails.photos.forEach((photo, index) => {
          console.log(`Photo ${index + 1}: ${photo.width}x${photo.height}`)
        })
        
        // Test fetching the first photo
        console.log('\n🔄 Fetching first photo...')
        const photoUrl = await googlePlacesService.getPlacePhoto(placeDetails.photos[0].photo_reference)
        
        if (photoUrl) {
          console.log('✅ Photo fetched successfully!')
          console.log(`Photo URL length: ${photoUrl.length} characters`)
          console.log(`Photo URL starts with: ${photoUrl.substring(0, 50)}...`)
        } else {
          console.log('❌ Failed to fetch photo')
        }
      } else {
        console.log('⚠️  No photos available for this place')
      }
    } else {
      console.log('❌ Failed to fetch place details')
    }
    
  } catch (error) {
    console.error('❌ Error testing Google Photos:', error)
  }
}

// Run the test
testGooglePhotos()
