import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

interface Favorite {
  id: string
  locationId: string
  createdAt: string
  location: {
    id: string
    name: string
    description: string
    address: string
    city: {
      name: string
      state: string | null
    }
    avgRating: number | null
    _count: {
      reviews: number
    }
    photos: Array<{
      url: string
      alt: string | null
    }>
    tags: Array<{
      name: string
      color: string
    }>
  }
}

export function useFavorites() {
  const { isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's favorites
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([])
      setFavoriteIds(new Set())
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/favorites')
      if (!response.ok) {
        throw new Error('Failed to load favorites')
      }

      const data = await response.json()
      setFavorites(data)
      setFavoriteIds(new Set(data.map((fav: Favorite) => fav.locationId)))
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Add a location to favorites
  const addFavorite = async (locationId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to add favorites')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add favorite')
      }

      // Update local state
      setFavoriteIds(prev => new Set([...prev, locationId]))
      
      // Reload favorites to get the full data
      await loadFavorites()
      
      return true
    } catch (err: unknown) {
      console.error('Error adding favorite:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add favorite'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove a location from favorites
  const removeFavorite = async (locationId: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to manage favorites')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/favorites/${locationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove favorite')
      }

      // Update local state
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(locationId)
        return newSet
      })
      
      setFavorites(prev => prev.filter(fav => fav.locationId !== locationId))
      
      return true
    } catch (err: unknown) {
      console.error('Error removing favorite:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove favorite'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Toggle favorite status
  const toggleFavorite = async (locationId: string) => {
    if (favoriteIds.has(locationId)) {
      return await removeFavorite(locationId)
    } else {
      return await addFavorite(locationId)
    }
  }

  // Check if a location is favorited
  const isFavorited = (locationId: string) => {
    return favoriteIds.has(locationId)
  }

  // Load favorites on mount and when authentication changes
  useEffect(() => {
    loadFavorites()
  }, [isAuthenticated, loadFavorites])

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    loadFavorites,
  }
}
