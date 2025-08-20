'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'

interface AddLocationFormProps {
  cityId: string
  cityName: string
}

export function AddLocationForm({ cityId, cityName }: AddLocationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    website: '',
    phone: '',
    hours: '',
    priceRange: 'FREE',
    wifiQuality: 'UNKNOWN',
    noiseLevel: 'UNKNOWN',
    seating: 'UNKNOWN',
    powerOutlets: false,
    parking: false,
    food: false,
    coffee: false,
    quiet: false,
    outdoor: false,
    petFriendly: false,
    wheelchair: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cityId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit location')
      }

      setSuccess(data.message)
      setFormData({
        name: '',
        description: '',
        address: '',
        website: '',
        phone: '',
        hours: '',
        priceRange: 'FREE',
        wifiQuality: 'UNKNOWN',
        noiseLevel: 'UNKNOWN',
        seating: 'UNKNOWN',
        powerOutlets: false,
        parking: false,
        food: false,
        coffee: false,
        quiet: false,
        outdoor: false,
        petFriendly: false,
        wheelchair: false
      })

      // Redirect back to city page after a short delay
      setTimeout(() => {
        router.push(`/cities/${cityId}`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Add New Spot</h1>
        </div>
        
        <p className="text-gray-600 mb-6">
          Help the community by adding a new work-friendly location in {cityName}.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Central Coffee Shop"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the atmosphere, work environment, and what makes this place great for remote work"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Hours
                </label>
                <input
                  type="text"
                  id="hours"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mon-Fri 7AM-7PM, Sat-Sun 8AM-6PM"
                />
              </div>
            </div>
          </div>

          {/* Work Environment */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Environment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="FREE">Free</option>
                  <option value="LOW">Low ($)</option>
                  <option value="MEDIUM">Medium ($$)</option>
                  <option value="HIGH">High ($$$)</option>
                </select>
              </div>

              <div>
                <label htmlFor="wifiQuality" className="block text-sm font-medium text-gray-700 mb-1">
                  WiFi Quality
                </label>
                <select
                  id="wifiQuality"
                  name="wifiQuality"
                  value={formData.wifiQuality}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UNKNOWN">Unknown</option>
                  <option value="POOR">Poor</option>
                  <option value="FAIR">Fair</option>
                  <option value="GOOD">Good</option>
                  <option value="EXCELLENT">Excellent</option>
                </select>
              </div>

              <div>
                <label htmlFor="noiseLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Noise Level
                </label>
                <select
                  id="noiseLevel"
                  name="noiseLevel"
                  value={formData.noiseLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UNKNOWN">Unknown</option>
                  <option value="QUIET">Quiet</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOUD">Loud</option>
                  <option value="VERY_LOUD">Very Loud</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="seating" className="block text-sm font-medium text-gray-700 mb-1">
                Seating Type
              </label>
              <select
                id="seating"
                name="seating"
                value={formData.seating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="CHAIRS">Chairs</option>
                <option value="BOOTHS">Booths</option>
                <option value="OUTDOOR">Outdoor</option>
                <option value="STANDING">Standing</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    name={amenity.key}
                    checked={formData[amenity.key as keyof typeof formData] as boolean}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Submit Location
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
