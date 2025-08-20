import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { safePrismaQuery } from '@/lib/db'
import { mockCities } from '@/lib/mock-data'
import { AddLocationForm } from '@/components/add-location-form'
import { LoadingSpinner } from '@/components/loading-spinner'

interface AddLocationPageProps {
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
            href={`/cities/${city.id}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {city.name}</span>
          </Link>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AddLocationForm cityId={city.id} cityName={city.name} />
        </Suspense>
      </div>
    </div>
  )
}
