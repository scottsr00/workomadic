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

async function getCity(cityId: string) {
  const city = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      return await prisma.city.findFirst({
        where: {
          OR: [
            { id: cityId },
            { name: { contains: cityId, mode: 'insensitive' } }
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
      city.id === cityId || 
      city.name.toLowerCase().includes(cityId.toLowerCase())
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
          <LocationGrid cityId={city.id} />
        </Suspense>
        <ContentBreakAds adSlot={getAdSlot('cityPage')} />
      </div>
    </div>
  )
} 