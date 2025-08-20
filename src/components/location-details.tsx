'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  DollarSign, 
  Clock, 
  Phone, 
  Globe, 
  Zap, 
  Car, 
  Utensils, 
  Volume2, 
  Sun, 
  PawPrint, 
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { MapPopup } from './map-popup'
import { LocationReviews } from './location-reviews'
import { StarButton } from './star-button'
import { GooglePlacesConnector } from './google-places-connector'

interface Location {
  id: string
  name: string
  description: string
  address: string
  cityId: string
  city: {
    id: string
    name: string
    state: string | null
    country: string
    description: string | null
    imageUrl: string | null
    createdAt: Date
    updatedAt: Date
  }
  latitude?: number | null
  longitude?: number | null
  website?: string | null
  phone?: string | null
  hours?: string | null
  priceRange: string
  wifiQuality: string
  noiseLevel: string
  seating: string
  powerOutlets: boolean
  parking: boolean
  food: boolean
  coffee: boolean
  quiet: boolean
  outdoor: boolean
  petFriendly: boolean
  wheelchair: boolean
  isPremium: boolean
  isApproved: boolean
  submittedBy?: string | null
  createdAt: Date
  updatedAt: Date
  avgRating: number | null
  googleRating?: number | null
  googleReviewCount?: number | null
  googlePlaceId?: string | null
  lastGoogleSync?: Date | null
  photos: Array<{
    id: string
    url: string
    alt?: string | null
    createdAt: Date
    locationId: string
    isPrimary: boolean
  }>
  reviews: Array<{
    id: string
    rating: number
    comment?: string | null
    createdAt: Date
    updatedAt: Date
    userId: string
    locationId: string
    user: {
      name?: string | null
      image?: string | null
    }
  }>
  googleReviews: Array<{
    id: string
    googleId: string
    authorName: string
    authorUrl?: string | null
    rating: number
    text?: string | null
    time: Date
    language?: string | null
    profilePhotoUrl?: string | null
    locationId: string
  }>
  tags: Array<{
    id: string
    name: string
    color: string
    createdAt: Date
  }>
  _count: {
    reviews: number
    googleReviews: number
  }
}

interface LocationDetailsProps {
  location: Location
}

export function LocationDetails({ location }: LocationDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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

  const getNoiseLevelText = (level: string) => {
    switch (level) {
      case 'QUIET': return 'Quiet'
      case 'MODERATE': return 'Moderate'
      case 'LOUD': return 'Loud'
      case 'VERY_LOUD': return 'Very Loud'
      default: return 'Unknown'
    }
  }

  const getSeatingText = (seating: string) => {
    switch (seating) {
      case 'CHAIRS': return 'Chairs'
      case 'BOOTHS': return 'Booths'
      case 'OUTDOOR': return 'Outdoor'
      case 'STANDING': return 'Standing'
      case 'MIXED': return 'Mixed'
      default: return 'Unknown'
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === location.photos.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? location.photos.length - 1 : prev - 1
    )
  }

  const handleAddressClick = () => {
    setIsMapOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href={`/cities/${location.cityId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {location.city.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{location.name}</h1>
              <p className="text-gray-600">{location.city.name}{location.city.state ? `, ${location.city.state}` : ''}</p>
            </div>
            <StarButton locationId={location.id} size="lg" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="relative h-96 bg-gray-100">
                {location.photos.length > 0 ? (
                  <>
                    <Image
                      src={location.photos[currentImageIndex].url}
                      alt={location.photos[currentImageIndex].alt || location.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    {location.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    {location.photos.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {location.photos.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Coffee className="h-24 w-24" />
                  </div>
                )}

                {/* Premium Badge */}
                {location.isPremium && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Premium Location
                  </div>
                )}

                {/* Rating Badge */}
                {(location.avgRating || location.googleRating) && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <div className="flex items-center gap-4">
                      {location.avgRating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{location.avgRating.toFixed(1)}</span>
                          <span className="text-gray-600">({location._count.reviews})</span>
                        </div>
                      )}
                      {location.googleRating && (
                        <div className="flex items-center gap-2">
                          <div className="w-px h-4 bg-gray-300"></div>
                          <span className="text-xs text-gray-500">Google:</span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{location.googleRating.toFixed(1)}</span>
                          <span className="text-gray-600 text-xs">({location.googleReviewCount})</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {location.photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {location.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <Image
                        src={photo.url}
                        alt={photo.alt || `${location.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{location.description}</p>
            </div>

            {/* Reviews */}
            <LocationReviews location={location} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              
              {/* Address */}
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-900 font-medium">Address</p>
                  <button
                    onClick={handleAddressClick}
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    {location.address}
                  </button>
                </div>
              </div>

              {/* Hours */}
              {location.hours && (
                <div className="flex items-start gap-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Hours</p>
                    <p className="text-gray-600 text-sm">{location.hours}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {location.phone && (
                <div className="flex items-start gap-3 mb-4">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Phone</p>
                    <a 
                      href={`tel:${location.phone}`}
                      className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Website */}
              {location.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Website</p>
                    <a 
                      href={location.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm transition-colors inline-flex items-center gap-1"
                    >
                      Visit website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* WiFi Quality */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Wifi className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WiFi</p>
                    <p className="font-medium text-gray-900">{getWifiQualityText(location.wifiQuality)}</p>
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium text-gray-900">{getPriceRangeText(location.priceRange)}</p>
                  </div>
                </div>

                {/* Noise Level */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Volume2 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Noise</p>
                    <p className="font-medium text-gray-900">{getNoiseLevelText(location.noiseLevel)}</p>
                  </div>
                </div>

                {/* Seating */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Coffee className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seating</p>
                    <p className="font-medium text-gray-900">{getSeatingText(location.seating)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                <div className="grid grid-cols-2 gap-3">
                  {location.powerOutlets && (
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>Power Outlets</span>
                    </div>
                  )}
                  {location.parking && (
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="h-4 w-4 text-blue-500" />
                      <span>Parking</span>
                    </div>
                  )}
                  {location.food && (
                    <div className="flex items-center gap-2 text-sm">
                      <Utensils className="h-4 w-4 text-red-500" />
                      <span>Food</span>
                    </div>
                  )}
                  {location.coffee && (
                    <div className="flex items-center gap-2 text-sm">
                      <Coffee className="h-4 w-4 text-brown-500" />
                      <span>Coffee</span>
                    </div>
                  )}
                  {location.quiet && (
                    <div className="flex items-center gap-2 text-sm">
                      <Volume2 className="h-4 w-4 text-green-500" />
                      <span>Quiet</span>
                    </div>
                  )}
                  {location.outdoor && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>Outdoor</span>
                    </div>
                  )}
                  {location.petFriendly && (
                    <div className="flex items-center gap-2 text-sm">
                      <PawPrint className="h-4 w-4 text-purple-500" />
                      <span>Pet Friendly</span>
                    </div>
                  )}
                  {location.wheelchair && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-4 w-4 text-blue-500">♿</div>
                      <span>Wheelchair Access</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {location.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {location.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-block px-3 py-1 text-sm font-medium rounded-full border"
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
              </div>
            )}

            {/* Google Places Integration (Admin/Moderator Only) */}
            <GooglePlacesConnector
              locationId={location.id}
              locationName={location.name}
              locationAddress={location.address}
              googlePlaceId={location.googlePlaceId}
              onConnect={(placeId) => {
                // Refresh the page to show updated data
                window.location.reload()
              }}
              onSyncComplete={() => {
                // Refresh the page to show updated photos and reviews
                window.location.reload()
              }}
            />
          </div>
        </div>
      </div>

      {/* Map Popup */}
      <MapPopup
        address={location.address}
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
      />
    </>
  )
}
