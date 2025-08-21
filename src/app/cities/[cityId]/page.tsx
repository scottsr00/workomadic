import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { safePrismaQuery } from '@/lib/db'
import { mockCities } from '@/lib/mock-data'
import { LocationGrid } from '@/components/location-grid'
import { CityHeader } from '@/components/city-header'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ContentBreakAds } from '@/components/google-ads'
import { getAdSlot } from '@/lib/google-ads-config'

interface CityPageProps {
  params: {
    cityId: string
  }
}

// Helper function to create URL-friendly slug from city name
function createCitySlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function getCity(citySlug: string) {
  const city = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      return await prisma.city.findFirst({
        where: {
          OR: [
            { id: citySlug },
            { name: { contains: citySlug, mode: 'insensitive' } },
            // Match against slugified city names
            {
              name: {
                in: mockCities
                  .filter(city => createCitySlug(city.name) === citySlug)
                  .map(city => city.name)
              }
            }
          ]
        },
        include: {
          _count: {
            select: {
              locations: true
            }
          }
        }
      })
    },
    mockCities.find(city => 
      city.id === citySlug || 
      city.name.toLowerCase().includes(citySlug.toLowerCase()) ||
      createCitySlug(city.name) === citySlug
    ) || null
  )

  return city
}

export default async function CityPage({ params }: CityPageProps) {
  const resolvedParams = await params
  const city = await getCity(resolvedParams.cityId)

  if (!city) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CityHeader city={city} />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <LocationGrid cityId={city.id} city={city} />
        </Suspense>
        <ContentBreakAds adSlot={getAdSlot('cityPage')} />
      </div>
    </div>
  )
} 