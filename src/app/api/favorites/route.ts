import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { safePrismaQuery } from '@/lib/db'
import { Session } from 'next-auth'

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null
  
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const result = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }

      const favorites = await prisma.favorite.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          location: {
            include: {
              city: true,
              photos: {
                where: { isPrimary: true },
                take: 1
              },
              reviews: {
                select: {
                  rating: true
                }
              },
              tags: true,
              _count: {
                select: {
                  reviews: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const favoritesWithAvgRating = favorites.map((favorite: typeof favorites[0]) => {
        const location = favorite.location
        const avgRating = location.reviews.length > 0
          ? location.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / location.reviews.length
          : null

        return {
          ...favorite,
          location: {
            ...location,
            avgRating,
            reviews: undefined // Remove reviews array, keep only count
          }
        }
      })

      return favoritesWithAvgRating
    },
    []
  )

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null
  
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { locationId } = body

    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) {
          throw new Error('No database connection')
        }

        // Verify location exists and is approved
        const location = await prisma.location.findFirst({
          where: {
            id: locationId,
            isApproved: true
          }
        })

        if (!location) {
          throw new Error('Location not found or not approved')
        }

        // Check if favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
          where: {
            userId_locationId: {
              userId: session.user.id,
              locationId
            }
          }
        })

        if (existingFavorite) {
          throw new Error('Location is already favorited')
        }

        // Create the favorite
        const favorite = await prisma.favorite.create({
          data: {
            userId: session.user.id,
            locationId
          },
          include: {
            location: {
              include: {
                city: true
              }
            }
          }
        })

        return favorite
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Location added to favorites!',
        favorite: result 
      },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error('Error adding favorite:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage === 'Location not found or not approved') {
      return NextResponse.json(
        { error: 'Location not found or not approved' },
        { status: 404 }
      )
    }
    
    if (errorMessage === 'Location is already favorited') {
      return NextResponse.json(
        { error: 'Location is already in your favorites' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
