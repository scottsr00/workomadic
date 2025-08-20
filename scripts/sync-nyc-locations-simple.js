#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Google Places API configuration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

class GooglePlacesService {
  constructor() {
    this.apiKey = GOOGLE_API_KEY
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required')
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,rating,user_ratings_total,reviews,photos&key=${this.apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status, data.error_message)
        return null
      }

      return data.result || null
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  async getPlacePhoto(photoReference, maxWidth = 800) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        console.error('Error fetching place photo:', response.status, response.statusText)
        return null
      }

      // Convert the image to a data URL
      const arrayBuffer = await response.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = response.headers.get('content-type') || 'image/jpeg'
      
      return `data:${mimeType};base64,${base64}`
    } catch (error) {
      console.error('Error fetching place photo:', error)
      return null
    }
  }

  async syncLocationPhotos(locationId, placeId) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId)
      if (!placeDetails || !placeDetails.photos) {
        console.log('No photos found for place:', placeId)
        return []
      }

      // Clear existing photos for this location
      await prisma.photo.deleteMany({
        where: { locationId }
      })

      const savedPhotos = []

      // Fetch and save photos (limit to first 5 to avoid API quota issues)
      for (let i = 0; i < Math.min(placeDetails.photos.length, 5); i++) {
        const photo = placeDetails.photos[i]
        const photoUrl = await this.getPlacePhoto(photo.photo_reference)
        
        if (photoUrl) {
          const savedPhoto = await prisma.photo.create({
            data: {
              url: photoUrl,
              alt: `${placeDetails.name} - Photo ${i + 1}`,
              isPrimary: i === 0, // First photo is primary
              locationId
            }
          })
          savedPhotos.push(savedPhoto)
        }
      }

      console.log(`Synced ${savedPhotos.length} photos for location ${locationId}`)
      return savedPhotos
    } catch (error) {
      console.error('Error syncing location photos:', error)
      throw error
    }
  }

  async syncLocationReviews(locationId, placeId) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId)
      if (!placeDetails) {
        throw new Error('Failed to fetch place details')
      }

      // Update location with Google data
      await prisma.location.update({
        where: { id: locationId },
        data: {
          googlePlaceId: placeId,
          googleRating: placeDetails.rating || null,
          googleReviewCount: placeDetails.user_ratings_total || 0,
          lastGoogleSync: new Date()
        }
      })

      // Sync reviews if available
      if (placeDetails.reviews && placeDetails.reviews.length > 0) {
        for (const review of placeDetails.reviews) {
          await prisma.googleReview.upsert({
            where: { googleId: `${placeId}_${review.time}_${review.author_name}` },
            update: {
              authorName: review.author_name,
              authorUrl: review.author_url || null,
              rating: review.rating,
              text: review.text || null,
              time: new Date(review.time * 1000),
              language: review.language || null,
              profilePhotoUrl: review.profile_photo_url || null
            },
            create: {
              googleId: `${placeId}_${review.time}_${review.author_name}`,
              authorName: review.author_name,
              authorUrl: review.author_url || null,
              rating: review.rating,
              text: review.text || null,
              time: new Date(review.time * 1000),
              language: review.language || null,
              profilePhotoUrl: review.profile_photo_url || null,
              locationId
            }
          })
        }
      }

      return placeDetails
    } catch (error) {
      console.error('Error syncing location reviews:', error)
      throw error
    }
  }

  async syncLocationData(locationId, placeId) {
    try {
      // Sync both reviews and photos
      const [reviewsResult, photosResult] = await Promise.all([
        this.syncLocationReviews(locationId, placeId),
        this.syncLocationPhotos(locationId, placeId)
      ])

      return {
        reviews: reviewsResult,
        photos: photosResult
      }
    } catch (error) {
      console.error('Error syncing location data:', error)
      throw error
    }
  }
}

async function syncNYCLocations() {
  console.log('🔄 Starting sync of NYC locations...\n')
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
    process.exit(1)
  }

  const googlePlacesService = new GooglePlacesService()
  
  try {
    // Get all NYC locations that have Google Place IDs
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
  node scripts/sync-nyc-locations-simple.js [options]

Options:
  --help, -h     Show this help message

Examples:
  node scripts/sync-nyc-locations-simple.js
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
