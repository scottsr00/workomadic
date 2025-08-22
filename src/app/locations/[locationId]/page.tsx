import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { safePrismaQuery } from '@/lib/db'
import { mockLocations } from '@/lib/mock-data'
import { LocationDetails } from '@/components/location-details'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ContentBreakAds } from '@/components/google-ads'
import { getAdSlot } from '@/lib/google-ads-config'

interface LocationPageProps {
  params: {
    locationId: string
  }
}

async function getLocation(locationId: string) {
  const location = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
            return await prisma.location.findFirst({
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
          googleReviews: {
            orderBy: { time: 'desc' },
            take: 20
          },
          tags: true,
          _count: {
            select: {
              reviews: true,
              googleReviews: true
            }
          }
        }
      })
    },
    mockLocations.find(location => 
      location.id === locationId || 
      location.name.toLowerCase().includes(locationId.toLowerCase())
    ) || null
  )

  if (location) {
    // Calculate average rating
    const avgRating = location.reviews && location.reviews.length > 0
      ? location.reviews.reduce((sum, review) => sum + review.rating, 0) / location.reviews.length
      : null

    return {
      ...location,
      avgRating
    }
  }

  return location
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params
  const location = await getLocation(resolvedParams.locationId)

  if (!location) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <LocationDetails location={location} />
      </Suspense>
      <ContentBreakAds adSlot={getAdSlot('locationPage')} />
    </div>
  )
}

