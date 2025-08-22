import { NextRequest, NextResponse } from 'next/server'
import { googlePlacesService } from '@/lib/google-places'
import { safePrismaQuery } from '@/lib/db'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await context.params
    const body = await request.json()
    const { placeId, searchByName } = body

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) {
          throw new Error('No database connection')
        }

        // Get location details
        const location = await prisma.location.findFirst({
          where: {
            id: locationId,
            isApproved: true
          }
        })

        if (!location) {
          throw new Error('Location not found or not approved')
        }

        let targetPlaceId = placeId

        // If no placeId provided, try to find it by name
        if (!targetPlaceId && searchByName) {
          targetPlaceId = await googlePlacesService.searchPlaceByName(
            location.name,
            location.address
          )
        }

        if (!targetPlaceId) {
          throw new Error('Could not find Google Place ID for this location')
        }

        // Get place details (including photos) without syncing to database yet
        const placeDetails = await googlePlacesService.getPlaceDetails(targetPlaceId)
        
        if (!placeDetails) {
          throw new Error('Could not fetch place details from Google Places')
        }

        return placeDetails
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to sync Google reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Google Places data retrieved successfully!',
        placeDetails: result 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error syncing Google reviews:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  try {
    const { locationId } = await context.params

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) {
          throw new Error('No database connection')
        }

        // Get location with Google reviews
        const location = await prisma.location.findFirst({
          where: {
            id: locationId,
            isApproved: true
          },
          include: {
            googleReviews: {
              orderBy: {
                time: 'desc'
              },
              take: 20 // Limit to most recent 20 reviews
            }
          }
        })

        if (!location) {
          throw new Error('Location not found or not approved')
        }

        return location
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to fetch Google reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

