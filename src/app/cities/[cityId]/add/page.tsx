import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { safePrismaQuery } from '@/lib/db'
import { mockCities } from '@/lib/mock-data'
import { AddLocationForm } from '@/components/add-location-form'
import { LoadingSpinner } from '@/components/loading-spinner'

interface AddLocationPageProps {
  params: Promise<{
    cityId: string
  }>
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

export default async function AddLocationPage({ params }: AddLocationPageProps) {
  const resolvedParams = await params
  const city = await getCity(resolvedParams.cityId)

  if (!city) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href={`/cities/${createCitySlug(city.name)}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {city.name}</span>
          </Link>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AddLocationForm cityId={city.id} cityName={city.name} city={city} />
        </Suspense>
      </div>
    </div>
  )
}
