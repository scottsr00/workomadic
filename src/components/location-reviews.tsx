'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, MessageCircle, User } from 'lucide-react'

interface Review {
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
}

interface GoogleReview {
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
}

interface Location {
  id: string
  name: string
  avgRating: number | null
  googleRating?: number | null
  googleReviewCount?: number | null
  googlePlaceId?: string | null
  lastGoogleSync?: Date | null
  reviews: Review[]
  googleReviews: GoogleReview[]
  _count: {
    reviews: number
    googleReviews: number
  }
}

interface LocationReviewsProps {
  location: Location
}

export function LocationReviews({ location }: LocationReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false)
  const [activeTab, setActiveTab] = useState<'internal' | 'google'>('internal')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/locations/${location.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      // Reset form
      setRating(5)
      setComment('')
      setShowReviewForm(false)
      
      // TODO: Refresh reviews data or add the new review to the list
      // For now, we'll need to refresh the page to see the new review
      window.location.reload()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSyncGoogleReviews = async () => {
    setIsSyncingGoogle(true)
    try {
      const response = await fetch(`/api/locations/${location.id}/google-reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchByName: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sync Google reviews')
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error('Error syncing Google reviews:', error)
      alert('Failed to sync Google reviews. Please try again.')
    } finally {
      setIsSyncingGoogle(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
          <div className="flex items-center gap-4">
            {/* Internal Reviews Rating */}
            {location.avgRating && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{location.avgRating.toFixed(1)}</span>
                <span className="text-gray-600">({location._count.reviews} reviews)</span>
              </div>
            )}
            
            {/* Google Reviews Rating */}
            {location.googleRating && (
              <div className="flex items-center gap-2">
                <div className="w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">Google:</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{location.googleRating.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm">({location.googleReviewCount} reviews)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {location.googlePlaceId && (
            <button
              onClick={handleSyncGoogleReviews}
              disabled={isSyncingGoogle}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSyncingGoogle ? 'Syncing...' : 'Sync Google Reviews'}
            </button>
          )}
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Write Review
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('internal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Our Reviews ({location._count.reviews})
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'google'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Google Reviews ({location._count.googleReviews})
          </button>
        </nav>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your experience with this location..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews Content */}
      {activeTab === 'internal' ? (
        // Internal Reviews
        location.reviews.length > 0 ? (
          <div className="space-y-6">
            {location.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {review.user.name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this location!
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Write the First Review
            </button>
          </div>
        )
      ) : (
        // Google Reviews
        location.googleReviews.length > 0 ? (
          <div className="space-y-6">
            {location.googleReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.profilePhotoUrl ? (
                      <Image
                        src={review.profilePhotoUrl}
                        alt={review.authorName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {review.authorName}
                      </h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.time)}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        Google
                      </span>
                    </div>
                    
                    {review.text && (
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Google reviews yet</h3>
            <p className="text-gray-600 mb-4">
              {location.googlePlaceId 
                ? "This location doesn't have any Google reviews yet."
                : "This location hasn't been connected to Google Places yet."
              }
            </p>
            {!location.googlePlaceId && (
              <button
                onClick={handleSyncGoogleReviews}
                disabled={isSyncingGoogle}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSyncingGoogle ? 'Connecting...' : 'Connect to Google Places'}
              </button>
            )}
          </div>
        )
      )}
    </div>
  )
}
