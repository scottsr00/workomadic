import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { SearchResults } from '@/components/search-results'
import { LoadingSpinner } from '@/components/loading-spinner'

interface SearchPageProps {
  searchParams: {
    q?: string
    city?: string
    wifiQuality?: string
    noiseLevel?: string
    priceRange?: string
    coffee?: string
    powerOutlets?: string
    outdoor?: string
    page?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q || ''
  const city = resolvedSearchParams.city || ''
  const wifiQuality = resolvedSearchParams.wifiQuality || ''
  const noiseLevel = resolvedSearchParams.noiseLevel || ''
  const priceRange = resolvedSearchParams.priceRange || ''
  const coffee = resolvedSearchParams.coffee || ''
  const powerOutlets = resolvedSearchParams.powerOutlets || ''
  const outdoor = resolvedSearchParams.outdoor || ''
  const page = parseInt(resolvedSearchParams.page || '1')

  // If no search query or filters, show empty search page
  const hasAnyFilters = query || city || wifiQuality || noiseLevel || priceRange || coffee || powerOutlets || outdoor

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <SearchResults 
            query={query}
            city={city}
            wifiQuality={wifiQuality}
            noiseLevel={noiseLevel}
            priceRange={priceRange}
            coffee={coffee}
            powerOutlets={powerOutlets}
            outdoor={outdoor}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  )
}
