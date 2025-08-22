#!/usr/bin/env node

/**
 * Austin Location Expansion Script
 * Finds and adds the best work locations in Austin based on Google reviews
 */

const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient()

// Google Places API configuration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const AUSTIN_CENTER = { lat: 30.2672, lng: -97.7431 }

// Work-friendly location types to search for
const WORK_LOCATION_TYPES = [
  'cafe',
  'library',
  'book_store',
  'meal_takeaway' // This includes many coffee shops and quick food places
  // 'restaurant', // Let's skip restaurants for now as they can be too noisy
  // 'hotel', // Hotels are typically not work-friendly for non-guests
]

// Popular Austin neighborhoods for remote work
const AUSTIN_NEIGHBORHOODS = [
  { name: 'Downtown Austin', lat: 30.2672, lng: -97.7431 },
  { name: 'East Austin', lat: 30.2672, lng: -97.7200 },
  { name: 'South Congress (SoCo)', lat: 30.2500, lng: -97.7500 },
  { name: 'West Austin', lat: 30.2800, lng: -97.7500 },
  { name: 'North Austin', lat: 30.3500, lng: -97.7200 },
  { name: 'South Austin', lat: 30.2000, lng: -97.7500 },
  { name: 'Hyde Park', lat: 30.3000, lng: -97.7300 },
  { name: 'Zilker', lat: 30.2600, lng: -97.7700 },
  { name: 'Barton Springs', lat: 30.2600, lng: -97.7700 },
  { name: 'Clarksville', lat: 30.2800, lng: -97.7600 },
  { name: 'Tarrytown', lat: 30.3000, lng: -97.7800 },
  { name: 'Allandale', lat: 30.3200, lng: -97.7400 }
]

// Keywords that indicate work-friendly locations
const WORK_FRIENDLY_KEYWORDS = [
  'wifi',
  'coffee',
  'cafe',
  'coworking',
  'library',
  'quiet',
  'study',
  'work',
  'laptop',
  'outlet',
  'power',
  'tech',
  'startup'
]

class AustinLocationExpander {
  constructor() {
    this.existingPlaceIds = new Set()
    this.addedLocations = []
    this.skippedLocations = []
  }

  async initialize() {
    console.log('🚀 Initializing Austin Location Expander...')
    
    // Get existing Google Place IDs to avoid duplicates
    const existingLocations = await prisma.location.findMany({
      where: {
        city: { name: 'Austin' }
      },
      select: { googlePlaceId: true }
    })
    
    existingLocations.forEach(loc => {
      if (loc.googlePlaceId) {
        this.existingPlaceIds.add(loc.googlePlaceId)
      }
    })
    
    console.log(`📊 Found ${existingLocations.length} existing Austin locations`)
    console.log(`🔍 Will skip ${this.existingPlaceIds.size} existing Google Place IDs`)
  }

  async searchNearbyPlaces(lat, lng, type, radius = 1500) {
    try {
      // Note: Can't use both radius and rankby=rating, so we'll use radius and sort results by rating
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`
      
      console.log(`    🌐 API Request: ${url.replace(GOOGLE_API_KEY, 'HIDDEN_API_KEY')}`)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`    📝 API Response status: ${data.status}, results: ${data.results?.length || 0}`)
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`❌ Google Places API error: ${data.status}`, data.error_message)
        console.error(`❌ Full response:`, data)
        return []
      }
      
      // Sort results by rating descending
      const results = data.results || []
      return results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } catch (error) {
      console.error(`❌ Error searching nearby places:`, error)
      return []
    }
  }

  async getPlaceDetails(placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,user_ratings_total,reviews,types,website,formatted_phone_number,opening_hours,geometry&key=${GOOGLE_API_KEY}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status !== 'OK') {
        console.error(`❌ Error getting place details: ${data.status}`, data.error_message)
        return null
      }
      
      return data.result
    } catch (error) {
      console.error(`❌ Error fetching place details:`, error)
      return null
    }
  }

  isWorkFriendly(place) {
    // Check if place has good rating and review count
    if (!place.rating || place.rating < 4.0 || !place.user_ratings_total || place.user_ratings_total < 50) {
      return false
    }

    // Check if place name contains work-friendly keywords
    const nameLower = place.name.toLowerCase()
    const hasWorkFriendlyKeyword = WORK_FRIENDLY_KEYWORDS.some(keyword => 
      nameLower.includes(keyword)
    )

    // Check if place types are work-friendly
    const workFriendlyTypes = place.types || []
    const hasWorkFriendlyType = workFriendlyTypes.some(type => 
      WORK_LOCATION_TYPES.includes(type)
    )

    return hasWorkFriendlyKeyword || hasWorkFriendlyType
  }

  async analyzeReviews(place) {
    if (!place.reviews || place.reviews.length === 0) {
      return { workFriendlyScore: 0, workMentions: 0 }
    }

    let workMentions = 0
    let totalReviews = place.reviews.length

    place.reviews.forEach(review => {
      if (review.text) {
        const reviewText = review.text.toLowerCase()
        const workKeywords = ['work', 'laptop', 'wifi', 'quiet', 'study', 'coworking', 'remote', 'office', 'tech', 'startup']
        workKeywords.forEach(keyword => {
          if (reviewText.includes(keyword)) {
            workMentions++
          }
        })
      }
    })

    const workFriendlyScore = workMentions / totalReviews
    return { workFriendlyScore, workMentions }
  }

  async addLocationToDatabase(place, neighborhood) {
    try {
      // Get Austin city record
      const austinCity = await prisma.city.findUnique({
        where: { name: 'Austin' }
      })

      if (!austinCity) {
        console.error('❌ Austin city not found in database')
        return false
      }

      // Analyze reviews for work-friendliness
      const reviewAnalysis = await this.analyzeReviews(place)
      
      // Determine location attributes based on place data
      const attributes = this.determineLocationAttributes(place, reviewAnalysis)

      // Create location
      const location = await prisma.location.create({
        data: {
          name: place.name,
          description: this.generateDescription(place, neighborhood, reviewAnalysis),
          address: place.formatted_address,
          cityId: austinCity.id,
          latitude: place.geometry?.location?.lat,
          longitude: place.geometry?.location?.lng,
          website: place.website || null,
          phone: place.formatted_phone_number || null,
          hours: place.opening_hours?.weekday_text?.join('; ') || null,
          priceRange: attributes.priceRange,
          wifiQuality: attributes.wifiQuality,
          noiseLevel: attributes.noiseLevel,
          seating: attributes.seating,
          powerOutlets: attributes.powerOutlets,
          parking: attributes.parking,
          food: attributes.food,
          coffee: attributes.coffee,
          quiet: attributes.quiet,
          outdoor: attributes.outdoor,
          petFriendly: attributes.petFriendly,
          wheelchair: attributes.wheelchair,
          isPremium: place.rating >= 4.5 && place.user_ratings_total >= 200,
          isApproved: true,
          googlePlaceId: place.place_id,
          googleRating: place.rating,
          googleReviewCount: place.user_ratings_total,
          lastGoogleSync: new Date()
        }
      })

      // Add default photo
      await prisma.photo.create({
        data: {
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
          alt: `${place.name} - Austin Work Location`,
          isPrimary: true,
          locationId: location.id
        }
      })

      // Add appropriate tags
      await this.addLocationTags(location.id, place, attributes)

      console.log(`✅ Added: ${place.name} (${place.rating}⭐, ${place.user_ratings_total} reviews)`)
      this.addedLocations.push({
        name: place.name,
        rating: place.rating,
        reviewCount: place.user_ratings_total,
        workFriendlyScore: reviewAnalysis.workFriendlyScore
      })

      return true
    } catch (error) {
      console.error(`❌ Error adding location ${place.name}:`, error)
      return false
    }
  }

  determineLocationAttributes(place, reviewAnalysis) {
    const types = place.types || []
    const name = place.name.toLowerCase()
    
    return {
      priceRange: this.determinePriceRange(place, types),
      wifiQuality: reviewAnalysis.workFriendlyScore > 0.3 ? 'GOOD' : 'UNKNOWN',
      noiseLevel: types.includes('library') ? 'QUIET' : 'MODERATE',
      seating: 'CHAIRS',
      powerOutlets: reviewAnalysis.workFriendlyScore > 0.2,
      parking: false,
      food: types.includes('restaurant') || types.includes('food'),
      coffee: types.includes('cafe') || types.includes('coffee_shop') || name.includes('coffee'),
      quiet: types.includes('library') || reviewAnalysis.workFriendlyScore > 0.4,
      outdoor: types.includes('establishment') && name.includes('outdoor'),
      petFriendly: false,
      wheelchair: true
    }
  }

  determinePriceRange(place, types) {
    if (types.includes('library')) return 'FREE'
    if (types.includes('coworking_space')) return 'HIGH'
    if (types.includes('cafe') || types.includes('coffee_shop')) return 'MEDIUM'
    return 'LOW'
  }

  generateDescription(place, neighborhood, reviewAnalysis) {
    const baseDescription = `${place.name} is located in ${neighborhood.name} and offers a great environment for remote work.`
    
    if (reviewAnalysis.workFriendlyScore > 0.3) {
      return `${baseDescription} Based on customer reviews, this location is particularly popular among remote workers and digital nomads in Austin's vibrant tech scene.`
    }
    
    return baseDescription
  }

  async addLocationTags(locationId, place, attributes) {
    const tags = []
    
    if (attributes.wifiQuality !== 'UNKNOWN') tags.push('WiFi')
    if (attributes.coffee) tags.push('Coffee')
    if (attributes.food) tags.push('Food')
    if (attributes.quiet) tags.push('Quiet')
    if (attributes.outdoor) tags.push('Outdoor')
    if (place.rating >= 4.5) tags.push('Premium')

    for (const tagName of tags) {
      const tag = await prisma.tag.findUnique({
        where: { name: tagName }
      })
      
      if (tag) {
        await prisma.location.update({
          where: { id: locationId },
          data: {
            tags: {
              connect: { id: tag.id }
            }
          }
        })
      }
    }
  }

  async expandLocations() {
    console.log('🔍 Starting Austin location expansion...')
    
    for (const neighborhood of AUSTIN_NEIGHBORHOODS) {
      console.log(`\n📍 Searching in ${neighborhood.name}...`)
      
      for (const type of WORK_LOCATION_TYPES) {
        console.log(`  🔎 Searching for ${type}...`)
        
        const places = await this.searchNearbyPlaces(neighborhood.lat, neighborhood.lng, type)
        
        for (const place of places) {
          // Skip if already exists
          if (this.existingPlaceIds.has(place.place_id)) {
            this.skippedLocations.push(place.name)
            continue
          }

          // Check if work-friendly
          if (!this.isWorkFriendly(place)) {
            continue
          }

          // Get detailed place information
          const placeDetails = await this.getPlaceDetails(place.place_id)
          if (!placeDetails) continue

          // Add to database
          await this.addLocationToDatabase(placeDetails, neighborhood)
          
          // Rate limiting - pause between requests
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
    }
  }

  async generateReport() {
    console.log('\n📊 Austin Location Expansion Report')
    console.log('==================================')
    console.log(`✅ Added ${this.addedLocations.length} new locations`)
    console.log(`⏭️  Skipped ${this.skippedLocations.length} existing locations`)
    
    if (this.addedLocations.length > 0) {
      console.log('\n🏆 Top New Locations:')
      this.addedLocations
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10)
        .forEach((loc, index) => {
          console.log(`${index + 1}. ${loc.name} (${loc.rating}⭐, ${loc.reviewCount} reviews)`)
        })
    }
  }
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error('❌ Google Maps API key not found. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
    process.exit(1)
  }

  const expander = new AustinLocationExpander()
  
  try {
    await expander.initialize()
    await expander.expandLocations()
    await expander.generateReport()
  } catch (error) {
    console.error('❌ Error during expansion:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
