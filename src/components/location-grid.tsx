'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { LocationCard } from './location-card'
import { FilterPanel } from './filter-panel'
import { GridAds } from './google-ads'
import { getAdSlot, shouldShowAds } from '@/lib/google-ads-config'

interface LocationGridProps {
  cityId: string
}

interface Location {
  id: string
  name: string
  description: string
  address: string
  priceRange: string
  wifiQuality: string
  noiseLevel: string
  seating: string
  isPremium: boolean
  avgRating: number | null
  _count: {
    reviews: number
  }
  photos: Array<{
    url: string
    alt: string
  }>
  tags: Array<{
    name: string
    color: string
  }>
}

interface LocationsResponse {
  locations: Location[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

async function fetchLocations(cityId: string, filters: Record<string, string> = {}): Promise<LocationsResponse> {
  const params = new URLSearchParams({
    cityId,
    ...filters
  })
  
  const response = await fetch(`/api/locations?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch locations')
  }
  
  return response.json()
}

export function LocationGrid({ cityId }: LocationGridProps) {
  const [filters, setFilters] = useState<Record<string, string>>({})
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['locations', cityId, filters],
    queryFn: () => fetchLocations(cityId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading locations. Please try again.</p>
      </div>
    )
  }

  if (!data?.locations.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No locations found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className="lg:w-1/4">
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
            cityId={cityId}
          />
        </div>

        {/* Locations Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.locations.map((location, index) => (
              <LocationCard key={location.id} location={location} />
            ))}
            
            {/* Insert ads at strategic positions */}
            {shouldShowAds() && data.locations.length > 3 && (
              <>
                {/* Ad after 3rd location */}
                {data.locations.length > 3 && (
                  <GridAds adSlot={getAdSlot('locationGrid1')} />
                )}
                
                {/* Ad after 6th location */}
                {data.locations.length > 6 && (
                  <GridAds adSlot={getAdSlot('locationGrid2')} />
                )}
                
                {/* Ad after 9th location */}
                {data.locations.length > 9 && (
                  <GridAds adSlot={getAdSlot('locationGrid3')} />
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page: page.toString() }))}
                    className={`px-3 py-2 rounded ${
                      page === data.pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 