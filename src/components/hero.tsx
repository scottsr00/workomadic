'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin } from 'lucide-react'

export function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const router = useRouter()

  const cities = [
    { id: 'cmej5xfkq00006dldx90icnji', name: 'New York City', state: 'NY' },
    { id: 'cmej5xflj00016dldpvl0cck9', name: 'Austin', state: 'TX' },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCity) params.append('city', selectedCity)
    
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg"
        style={{
          backgroundImage: `url('/hero-bg.jpg')`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium mb-8 shadow-lg">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Discover the best remote work spots
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              Remote Work Spot
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover the best cafes, coworking spaces, and remote work locations in NYC, Austin, and beyond. 
            Filter by amenities, read reviews, and find your ideal workspace.
          </p>
        </div>

        {/* Search Section - Integrated into hero */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 search-card">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Find Your Perfect Workspace
              </h2>
              <p className="text-lg text-gray-600">
                Search through thousands of remote work spots with detailed filters and reviews
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for cafes, coworking spaces, libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>

              {/* City Selector */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="pl-12 pr-10 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-lg min-w-[200px]"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Search Button */}
              <button type="submit" className="btn-primary text-lg px-12 py-4">
                <span className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </span>
              </button>
            </form>
            
            {/* Quick Filters */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <span className="text-sm text-gray-500">Popular:</span>
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
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-gray-200">Remote Work Spots</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">50+</div>
            <div className="text-gray-200">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-gray-200">Happy Users</div>
          </div>
        </div>
      </div>
    </section>
  )
} 