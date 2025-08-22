'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const cities = [
    { id: 'cmej5xfkq00006dldx90icnji', name: 'New York City', state: 'NY' },
    { id: 'cmej5xflj00016dldpvl0cck9', name: 'Austin', state: 'TX' },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Workspace
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search through thousands of remote work spots with detailed filters and reviews
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="card p-8">
            <div className="flex flex-col lg:flex-row gap-4">
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
              <button className="btn-primary text-lg px-8 py-4">
                <span className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </span>
              </button>
            </div>
            
            {/* Quick Filters */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                <span className="text-sm text-gray-500">Popular:</span>
                {['WiFi', 'Quiet', 'Coffee', 'Power Outlets', 'Outdoor'].map((filter) => (
                  <button
                    key={filter}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 