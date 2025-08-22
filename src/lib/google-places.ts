interface GooglePlaceDetails {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  reviews?: GoogleReview[]
  photos?: GooglePhoto[]
}

interface GoogleReview {
  author_name: string
  author_url?: string
  rating: number
  text?: string
  time: number
  language?: string
  profile_photo_url?: string
}

interface GooglePhoto {
  photo_reference: string
  height: number
  width: number
  html_attributions: string[]
}

interface GooglePlacesResponse {
  status: string
  result?: GooglePlaceDetails
  error_message?: string
}

export class GooglePlacesService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Google Maps API key is required')
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,rating,user_ratings_total,reviews,photos&key=${this.apiKey}`
      
      const response = await fetch(url)
      const data: GooglePlacesResponse = await response.json()

      if (data.status !== 'OK') {
        console.error('Google Places API error:', data.status, data.error_message)
        
        // If API key is not authorized, return mock data for development
        if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('not authorized')) {
          console.warn('Google Places API not authorized. Using mock data for development.')
          return this.getMockPlaceDetails(placeId)
        }
        
        return null
      }

      return data.result || null
    } catch (error) {
      console.error('Error fetching place details:', error)
      return null
    }
  }

  async getPlacePhoto(photoReference: string, maxWidth: number = 800): Promise<string | null> {
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

  private getMockPlaceDetails(placeId: string): GooglePlaceDetails {
    return {
      place_id: placeId,
      name: 'Mock Coffee Shop',
      rating: 4.2,
      user_ratings_total: 156,
      photos: [
        {
          photo_reference: 'mock_photo_ref_1',
          height: 800,
          width: 1200,
          html_attributions: ['Mock Photo Attribution']
        },
        {
          photo_reference: 'mock_photo_ref_2',
          height: 600,
          width: 800,
          html_attributions: ['Mock Photo Attribution']
        }
      ],
      reviews: [
        {
          author_name: 'Sarah Johnson',
          author_url: 'https://maps.google.com/maps/contrib/123456789',
          rating: 5,
          text: 'Great coffee and perfect for remote work! The WiFi is fast and the atmosphere is very conducive to productivity.',
          time: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
          language: 'en',
          profile_photo_url: 'https://lh3.googleusercontent.com/a/default-user'
        },
        {
          author_name: 'Mike Chen',
          author_url: 'https://maps.google.com/maps/contrib/987654321',
          rating: 4,
          text: 'Nice place to work from. Good coffee and plenty of outlets. Can get a bit crowded during peak hours.',
          time: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
          language: 'en',
          profile_photo_url: 'https://lh3.googleusercontent.com/a/default-user'
        },
        {
          author_name: 'Emily Rodriguez',
          author_url: 'https://maps.google.com/maps/contrib/456789123',
          rating: 5,
          text: 'Love this place! Perfect for digital nomads. Quiet atmosphere and excellent coffee. Highly recommend!',
          time: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
          language: 'en',
          profile_photo_url: 'https://lh3.googleusercontent.com/a/default-user'
        }
      ]
    }
  }

  async searchPlaceByName(name: string, address?: string): Promise<string | null> {
    try {
      const query = address ? `${name}, ${address}` : name
      const encodedQuery = encodeURIComponent(query)
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedQuery}&inputtype=textquery&fields=place_id&key=${this.apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
        return data.candidates[0].place_id
      }

      // If API key is not authorized, return a mock place ID for development
      if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('not authorized')) {
        console.warn('Google Places API not authorized. Using mock place ID for development.')
        return 'mock_place_id_' + Date.now()
      }

      return null
    } catch (error) {
      console.error('Error searching for place:', error)
      return null
    }
  }

  async syncLocationPhotos(locationId: string, placeId: string) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId)
      if (!placeDetails || !placeDetails.photos) {
        console.log('No photos found for place:', placeId)
        return []
      }

      const { prisma, isPrismaAvailable } = await import('@/lib/prisma')
      
      if (!isPrismaAvailable()) {
        console.log('Prisma not available - skipping photo sync')
        return []
      }
      
      // Clear existing photos for this location
      await prisma!.photo.deleteMany({
        where: { locationId }
      })

      const savedPhotos = []

      // Fetch and save photos (limit to first 5 to avoid API quota issues)
      for (let i = 0; i < Math.min(placeDetails.photos.length, 5); i++) {
        const photo = placeDetails.photos[i]
        const photoUrl = await this.getPlacePhoto(photo.photo_reference)
        
        if (photoUrl) {
          const savedPhoto = await prisma!.photo.create({
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

  async syncLocationReviews(locationId: string, placeId: string) {
    try {
      const placeDetails = await this.getPlaceDetails(placeId)
      if (!placeDetails) {
        throw new Error('Failed to fetch place details')
      }

      const { prisma, isPrismaAvailable } = await import('@/lib/prisma')
      
      if (!isPrismaAvailable()) {
        console.log('Prisma not available - skipping review sync')
        return placeDetails
      }
      
      // Update location with Google data
      await prisma!.location.update({
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
          await prisma!.googleReview.upsert({
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

  async syncLocationData(locationId: string, placeId: string) {
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

export const googlePlacesService = new GooglePlacesService()
