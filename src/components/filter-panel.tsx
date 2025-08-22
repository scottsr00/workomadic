'use client'

import { useState } from 'react'
import { Filter, Plus } from 'lucide-react'
import Link from 'next/link'

interface FilterPanelProps {
  filters: Record<string, string>
  onFiltersChange: (filters: Record<string, string>) => void
  cityId?: string
}

export function FilterPanel({ filters, onFiltersChange, cityId }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value) {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <div className="lg:block">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-900">Price Range</h4>
            <div className="space-y-2">
              {[
                { value: 'FREE', label: 'Free' },
                { value: 'LOW', label: 'Low ($)' },
                { value: 'MEDIUM', label: 'Medium ($$)' },
                { value: 'HIGH', label: 'High ($$$)' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    value={option.value}
                    checked={filters.priceRange === option.value}
                    onChange={(e) => updateFilter('priceRange', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* WiFi Quality */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-900">WiFi Quality</h4>
            <div className="space-y-2">
              {[
                { value: 'EXCELLENT', label: 'Excellent' },
                { value: 'GOOD', label: 'Good' },
                { value: 'FAIR', label: 'Fair' },
                { value: 'POOR', label: 'Poor' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="wifiQuality"
                    value={option.value}
                    checked={filters.wifiQuality === option.value}
                    onChange={(e) => updateFilter('wifiQuality', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Noise Level */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-900">Noise Level</h4>
            <div className="space-y-2">
              {[
                { value: 'QUIET', label: 'Quiet' },
                { value: 'MODERATE', label: 'Moderate' },
                { value: 'LOUD', label: 'Loud' },
                { value: 'VERY_LOUD', label: 'Very Loud' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="noiseLevel"
                    value={option.value}
                    checked={filters.noiseLevel === option.value}
                    onChange={(e) => updateFilter('noiseLevel', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h4 className="font-medium mb-3 text-gray-900">Amenities</h4>
            <div className="space-y-2">
              {[
                { key: 'powerOutlets', label: 'Power Outlets' },
                { key: 'parking', label: 'Parking' },
                { key: 'food', label: 'Food Available' },
                { key: 'coffee', label: 'Coffee' },
                { key: 'quiet', label: 'Quiet Space' },
                { key: 'outdoor', label: 'Outdoor Seating' },
                { key: 'petFriendly', label: 'Pet Friendly' },
                { key: 'wheelchair', label: 'Wheelchair Accessible' }
              ].map((amenity) => (
                <label key={amenity.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters[amenity.key] === 'true'}
                    onChange={(e) => updateFilter(amenity.key, e.target.checked ? 'true' : '')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Premium Only */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isPremium === 'true'}
                onChange={(e) => updateFilter('isPremium', e.target.checked ? 'true' : '')}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-900">Premium Listings Only</span>
            </label>
          </div>

          {/* Add New Spot Link */}
          {cityId && (
            <div className="pt-4 border-t border-gray-200">
              <Link
                href={`/cities/${cityId}/add`}
                className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Add New Spot</span>
              </Link>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Help the community by adding a new location
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 