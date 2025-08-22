'use client'

import { useState } from 'react'
import { Search, RefreshCw, CheckCircle, AlertCircle, Camera } from 'lucide-react'

interface GooglePlacesConnectorProps {
  locationId: string
  locationName: string
  locationAddress: string
  googlePlaceId?: string | null
  onConnect: (placeId: string) => void
  onSyncComplete?: () => void
}

export function GooglePlacesConnector({ 
  locationId, 
  locationName, 
  locationAddress, 
  googlePlaceId,
  onConnect,
  onSyncComplete
}: GooglePlacesConnectorProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<{ 
    place_id: string; 
    name: string; 
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: Array<{ photo_reference: string; height: number; width: number; html_attributions: string[] }>;
  }>>([])
  const [error, setError] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const searchGooglePlaces = async () => {
    setIsSearching(true)
    setError(null)
    setSearchResults([])

    try {
      const response = await fetch(`/api/locations/${locationId}/google-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchByName: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search Google Places')
      }

      const data = await response.json()
      
      if (data.placeDetails) {
        setSearchResults([data.placeDetails])
        onConnect(data.placeDetails.place_id)
      } else {
        setError('No matching Google Places found for this location')
      }
    } catch (error) {
      console.error('Error searching Google Places:', error)
      setError(error instanceof Error ? error.message : 'Failed to search Google Places')
    } finally {
      setIsSearching(false)
    }
  }

  const syncGoogleData = async () => {
    if (!googlePlaceId) return

    setIsSyncing(true)
    setError(null)
    setSyncMessage('Syncing reviews and photos from Google Places...')

    try {
      const response = await fetch(`/api/locations/${locationId}/google-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: googlePlaceId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync Google Places data')
      }

      const data = await response.json()
      setSyncMessage(`Successfully synced ${data.syncResult.photos.length} photos and reviews from Google Places!`)
      
      // Call the callback to refresh the location data
      if (onSyncComplete) {
        onSyncComplete()
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncMessage(null)
      }, 3000)
    } catch (error) {
      console.error('Error syncing Google Places data:', error)
      setError(error instanceof Error ? error.message : 'Failed to sync Google Places data')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Google Places Integration</h3>
        {googlePlaceId && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
          <div className="text-sm text-gray-600">
            <p><strong>Name:</strong> {locationName}</p>
            <p><strong>Address:</strong> {locationAddress}</p>
            {googlePlaceId && (
              <p><strong>Google Place ID:</strong> <code className="bg-gray-200 px-1 rounded">{googlePlaceId}</code></p>
            )}
          </div>
        </div>

        {!googlePlaceId ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Connect this location to Google Places to automatically sync reviews, ratings, and photos.
            </p>
            <button
              onClick={searchGooglePlaces}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search & Connect
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              This location is connected to Google Places. You can sync reviews and photos to get the latest data.
            </p>
            <div className="flex gap-2">
              <button
                onClick={searchGooglePlaces}
                disabled={isSearching || isSyncing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Reconnect
                  </>
                )}
              </button>
              <button
                onClick={syncGoogleData}
                disabled={isSearching || isSyncing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Sync Photos & Reviews
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {syncMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-700">{syncMessage}</span>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Search Results</h4>
            {searchResults.map((result, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Found matching location</span>
                </div>
                <div className="text-sm text-green-700">
                  <p><strong>Name:</strong> {result.name}</p>
                  <p><strong>Rating:</strong> {result.rating ? `${result.rating}/5` : 'No rating'}</p>
                  <p><strong>Reviews:</strong> {result.user_ratings_total || 0}</p>
                  <p><strong>Photos:</strong> {result.photos ? result.photos.length : 0} available</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

