import { NextRequest, NextResponse } from 'next/server'
import { safePrismaQuery } from '@/lib/db'
import { mockLocations } from '@/lib/mock-data'

export async function GET(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  const locationId = params.locationId

  const result = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      
      const location = await prisma.location.findFirst({
        where: {
          OR: [
            { id: locationId },
            { name: { contains: locationId, mode: 'insensitive' } }
          ],
          isApproved: true
        },
        include: {
          city: true,
          photos: {
            orderBy: { isPrimary: 'desc' }
          },
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          tags: true,
          _count: {
            select: {
              reviews: true
            }
          }
        }
      })

      if (!location) {
        return null
      }

      // Calculate average rating
      const avgRating = location.reviews.length > 0
        ? location.reviews.reduce((sum, review) => sum + review.rating, 0) / location.reviews.length
        : null

      return {
        ...location,
        avgRating
      }
    },
    mockLocations.find(location => 
      location.id === locationId || 
      location.name.toLowerCase().includes(locationId.toLowerCase())
    ) || null
  )

  if (!result) {
    return NextResponse.json(
      { error: 'Location not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(result)
}

