'use client'

import { Star } from 'lucide-react'
import { useFavorites } from '@/lib/hooks/use-favorites'
import { useAuth } from '@/lib/hooks/use-auth'
import { useState } from 'react'

interface StarButtonProps {
  locationId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarButton({ locationId, size = 'md', className = '' }: StarButtonProps) {
  const { isAuthenticated } = useAuth()
  const { isFavorited, toggleFavorite, loading } = useFavorites()
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const isFav = isFavorited(locationId)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
      return
    }

    if (loading) return

    await toggleFavorite(locationId)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={loading}
        className={`
          transition-all duration-200 ease-in-out
          hover:scale-110 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star
          className={`
            ${sizeClasses[size]}
            transition-all duration-200
            ${isFav 
              ? 'fill-yellow-400 text-yellow-400' 
              : isHovered 
                ? 'text-yellow-400' 
                : 'text-gray-400'
            }
            ${loading ? 'animate-pulse' : ''}
          `}
        />
      </button>

      {/* Tooltip for unauthenticated users */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md whitespace-nowrap z-50">
          Sign in to add favorites
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}
