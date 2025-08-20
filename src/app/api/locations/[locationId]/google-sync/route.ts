import { NextRequest, NextResponse } from 'next/server'
import { googlePlacesService } from '@/lib/google-places'
import { safePrismaQuery } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const locationId = params.locationId
    const { placeId } = await request.json()

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      )
    }

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        
        // Check if location exists
        const location = await prisma.location.findUnique({
          where: { id: locationId },
          include: {
            photos: true
          }
        })

        if (!location) {
          throw new Error('Location not found')
        }

        // Sync Google Places data (reviews and photos)
        const syncResult = await googlePlacesService.syncLocationData(locationId, placeId)

        // Return updated location with new photos
        const updatedLocation = await prisma.location.findUnique({
          where: { id: locationId },
          include: {
            photos: {
              orderBy: { isPrimary: 'desc' }
            },
            googleReviews: {
              orderBy: { time: 'desc' },
              take: 10
            }
          }
        })

        return {
          location: updatedLocation,
          syncResult
        }
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to sync location data' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error syncing Google Places data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
