'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface MapPopupProps {
  address: string
  isOpen: boolean
  onClose: () => void
}

export function MapPopup({ address, isOpen, onClose }: MapPopupProps) {
  const [encodedAddress, setEncodedAddress] = useState('')

  useEffect(() => {
    if (address) {
      setEncodedAddress(encodeURIComponent(address))
    }
  }, [address])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Location Map</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Map */}
        <div className="relative">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}`}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map of ${address}`}
          />
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            <strong>Address:</strong> {address}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
              }}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Open in Google Maps
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
