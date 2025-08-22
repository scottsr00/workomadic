'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, X } from 'lucide-react'
import { LocationCard } from './location-card'
import { LoadingSpinner } from './loading-spinner'

interface SearchResultsProps {
  query: string
  city: string
  wifiQuality: string
  noiseLevel: string
  priceRange: string
  coffee: string
  powerOutlets: string
  outdoor: string
  page: number
}

interface Location {
  id: string
  name: string
  description: string
  address: string
  cityId: string
  city: {
    name: string
    state: string
  }
  photos: Array<{
    url: string
    alt: string
  }>
  priceRange: string
  wifiQuality: string
  noiseLevel: string
  seating: string
  isPremium: boolean
  avgRating: number | null
  _count: {
    reviews: number
  }
  tags: Array<{
    name: string
    color: string
  }>
}

interface SearchResponse {
  locations: Location[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const cities = [
  { id: 'cmej5xfkq00006dldx90icnji', name: 'New York City', state: 'NY' },
  { id: 'cmej5xflj00016dldpvl0cck9', name: 'Austin', state: 'TX' },
]

export function SearchResults({ query, city, wifiQuality, noiseLevel, priceRange, coffee, powerOutlets, outdoor, page }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(query)
  const [selectedCity, setSelectedCity] = useState(city)
  const [selectedWifiQuality, setSelectedWifiQuality] = useState(wifiQuality)
  const [selectedNoiseLevel, setSelectedNoiseLevel] = useState(noiseLevel)
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRange)
  const [selectedCoffee, setSelectedCoffee] = useState(coffee)
  const [selectedPowerOutlets, setSelectedPowerOutlets] = useState(powerOutlets)
  const [selectedOutdoor, setSelectedOutdoor] = useState(outdoor)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchSearchResults = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.append('search', query)
      if (city) params.append('cityId', city)
      if (wifiQuality) params.append('wifiQuality', wifiQuality)
      if (noiseLevel) params.append('noiseLevel', noiseLevel)
      if (priceRange) params.append('priceRange', priceRange)
      if (coffee) params.append('coffee', coffee)
      if (powerOutlets) params.append('powerOutlets', powerOutlets)
      if (outdoor) params.append('outdoor', outdoor)
      params.append('page', page.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/locations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch search results')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [query, city, wifiQuality, noiseLevel, priceRange, coffee, powerOutlets, outdoor, page])

  useEffect(() => {
    // Only fetch results if there are any filters applied
    const hasAnyFilters = query || city || wifiQuality || noiseLevel || priceRange || coffee || powerOutlets || outdoor
    if (hasAnyFilters) {
      fetchSearchResults()
    } else {
      setLoading(false)
      setResults(null)
    }
  }, [fetchSearchResults, query, city, wifiQuality, noiseLevel, priceRange, coffee, powerOutlets, outdoor])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCity) params.append('city', selectedCity)
    if (selectedWifiQuality) params.append('wifiQuality', selectedWifiQuality)
    if (selectedNoiseLevel) params.append('noiseLevel', selectedNoiseLevel)
    if (selectedPriceRange) params.append('priceRange', selectedPriceRange)
    if (selectedCoffee) params.append('coffee', selectedCoffee)
    if (selectedPowerOutlets) params.append('powerOutlets', selectedPowerOutlets)
    if (selectedOutdoor) params.append('outdoor', selectedOutdoor)
    
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity('')
    setSelectedWifiQuality('')
    setSelectedNoiseLevel('')
    setSelectedPriceRange('')
    setSelectedCoffee('')
    setSelectedPowerOutlets('')
    setSelectedOutdoor('')
    router.push('/search')
  }

  const hasActiveFilters = query || city || wifiQuality || noiseLevel || priceRange || coffee || powerOutlets || outdoor

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={fetchSearchResults}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Show search form when no filters are applied
  if (!hasActiveFilters) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Remote Work Locations
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Find the perfect remote work spot by searching for cafes, coworking spaces, libraries, and more.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City Selector */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
            </div>

            {/* WiFi Quality */}
            <select
              value={selectedWifiQuality}
              onChange={(e) => setSelectedWifiQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All WiFi Quality</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>

            {/* Price Range */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="FREE">Free</option>
              <option value="LOW">Low ($)</option>
              <option value="MEDIUM">Medium ($$)</option>
              <option value="HIGH">High ($$$)</option>
            </select>
          </div>

          <div className="flex items-center justify-center mt-6">
            <button type="submit" className="btn-primary px-12 min-w-[120px] flex items-center justify-center whitespace-nowrap">
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Or try these popular filters:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'WiFi', filter: 'wifiQuality', value: 'EXCELLENT' },
              { label: 'Quiet', filter: 'noiseLevel', value: 'QUIET' },
              { label: 'Coffee', filter: 'coffee', value: 'true' },
              { label: 'Power Outlets', filter: 'powerOutlets', value: 'true' },
              { label: 'Outdoor', filter: 'outdoor', value: 'true' }
            ].map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.append(filter.filter, filter.value)
                  router.push(`/search?${params.toString()}`)
                }}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Results
          {results && (
            <span className="text-gray-500 font-normal ml-2">
              ({results.pagination.total} locations found)
            </span>
          )}
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City Selector */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </option>
                ))}
              </select>
            </div>

            {/* WiFi Quality */}
            <select
              value={selectedWifiQuality}
              onChange={(e) => setSelectedWifiQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All WiFi Quality</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>

            {/* Price Range */}
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="FREE">Free</option>
              <option value="LOW">Low ($)</option>
              <option value="MEDIUM">Medium ($$)</option>
              <option value="HIGH">High ($$$)</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button type="submit" className="btn-primary px-12 min-w-[120px] flex items-center justify-center whitespace-nowrap">
              <Search className="h-4 w-4 mr-2" />
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </form>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: &quot;{query}&quot;
              </span>
            )}
            {city && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                City: {cities.find(c => c.id === city)?.name || city}
              </span>
            )}
            {wifiQuality && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                WiFi: {wifiQuality}
              </span>
            )}
            {noiseLevel && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Noise: {noiseLevel}
              </span>
            )}
            {priceRange && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Price: {priceRange}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {results && results.locations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {results.locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>

          {/* Pagination */}
          {results.pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {page > 1 && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', (page - 1).toString())
                    router.push(`/search?${params.toString()}`)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              <span className="px-4 py-2 text-gray-600">
                Page {page} of {results.pagination.pages}
              </span>
              
              {page < results.pagination.pages && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.set('page', (page + 1).toString())
                    router.push(`/search?${params.toString()}`)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            No locations found matching your search criteria.
          </div>
          <button
            onClick={clearFilters}
            className="btn-primary"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
