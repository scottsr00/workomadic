'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Wifi, Coffee, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { MapPopup } from './map-popup'
import { StarButton } from './star-button'

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

interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)

  const getPriceRangeText = (range: string) => {
    switch (range) {
      case 'FREE': return 'Free'
      case 'LOW': return '$'
      case 'MEDIUM': return '$$'
      case 'HIGH': return '$$$'
      default: return 'N/A'
    }
  }

  const getWifiQualityText = (quality: string) => {
    switch (quality) {
      case 'EXCELLENT': return 'Excellent'
      case 'GOOD': return 'Good'
      case 'FAIR': return 'Fair'
      case 'POOR': return 'Poor'
      default: return 'Unknown'
    }
  }

  const handleAddressClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMapOpen(true)
  }

  return (
    <>
      <Link href={`/locations/${location.id}`} className="group">
        <div className="card card-hover overflow-hidden">
          {/* Image */}
          <div className="relative h-56 bg-gray-100">
            {location.photos.length > 0 ? (
              <Image
                src={location.photos[0].url}
                alt={location.photos[0].alt || location.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Coffee className="h-16 w-16" />
              </div>
            )}
            
            {/* Premium Badge and Star Button */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <StarButton locationId={location.id} size="sm" className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg" />
              {location.isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ⭐ Premium
                </div>
              )}
            </div>
            
            {/* Rating Badge */}
            {location.avgRating && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{location.avgRating.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-1">
              {location.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {location.description}
            </p>

            {/* Address */}
            <div 
              className="flex items-start gap-2 text-gray-500 text-sm mb-4 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleAddressClick}
            >
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{location.address}</span>
            </div>

            {/* Amenities */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Wifi className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">{getWifiQualityText(location.wifiQuality)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium">{getPriceRangeText(location.priceRange)}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {location.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full border"
                  style={{ 
                    backgroundColor: `${tag.color}10`, 
                    color: tag.color,
                    borderColor: `${tag.color}30`
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Reviews Count */}
            {location._count.reviews > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{location._count.reviews} reviews</span>
                <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Map Popup */}
      <MapPopup
        address={location.address}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </>
  )
} 