import Image from 'next/image'
import Link from 'next/link'
import { safePrismaQuery } from '@/lib/db'
import { mockCities } from '@/lib/mock-data'

interface FeaturedCity {
  id: string
  name: string
  state: string
  description: string
  locationCount: number
  imageUrl: string
  gradient: string
}

async function getFeaturedCities(): Promise<FeaturedCity[]> {
  const cities = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      return await prisma.city.findMany({
        include: {
          _count: {
            select: {
              locations: true
            }
          }
        },
        take: 2
      })
    },
    mockCities
  )

  return cities.map((city, index) => ({
    id: city.id,
    name: city.name,
    state: city.state || '',
    description: city.description || '',
    locationCount: city._count?.locations || 0,
    imageUrl: city.imageUrl || `/images/${city.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    gradient: index === 0 ? 'from-blue-500 to-purple-600' : 'from-orange-500 to-red-600'
  }))
}

export async function FeaturedCities() {
  const featuredCities = await getFeaturedCities()
  
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Explore Featured Cities
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the best remote work spots in these vibrant cities
          </p>
        </div>
        
        {/* Cities Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {featuredCities.map((city: FeaturedCity) => (
            <Link 
              key={city.id}
              href={`/cities/${city.id}`}
              className="group block card card-hover overflow-hidden"
            >
              <div className="relative h-80">
                <Image
                  src={city.imageUrl}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${city.gradient} opacity-90`} />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {city.name}, {city.state}
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {city.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-white font-semibold">
                          {city.locationCount} spots
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Explore Button */}
                  <div className="flex items-center text-white font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore {city.name}</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Cities CTA */}
        <div className="text-center mt-12">
          <Link 
            href="/cities"
            className="btn-secondary inline-flex items-center"
          >
            <span>View All Cities</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 