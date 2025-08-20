'use client'

import { useEffect } from 'react'
import { getPublisherId, shouldShowAds, getAdSlot } from '@/lib/google-ads-config'

interface GoogleAdsProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  className?: string
}

export function GoogleAds({ adSlot, adFormat = 'auto', className = '' }: GoogleAdsProps) {
  // Don't render ads if they're disabled
  if (!shouldShowAds()) {
    return null
  }

  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script')
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }

    // Initialize ads after script loads
    const initAds = () => {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (error) {
          console.error('Error loading Google Ads:', error)
        }
      }
    }

    // Wait for script to load
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      initAds()
    } else {
      const checkAds = setInterval(() => {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          initAds()
          clearInterval(checkAds)
        }
      }, 100)
    }
  }, [adSlot])

  return (
    <div className={`google-ads-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={getPublisherId()}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// Content break ads - placed between content sections
export function ContentBreakAds({ adSlot }: { adSlot: string }) {
  return (
    <div className="my-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Sponsored
            </span>
          </div>
          <GoogleAds 
            adSlot={adSlot}
            adFormat="auto"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

// Hero section ads - placed below hero content
export function HeroAds({ adSlot }: { adSlot: string }) {
  return (
    <div className="py-8 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="text-center mb-4">
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              Recommended
            </span>
          </div>
          <GoogleAds 
            adSlot={adSlot}
            adFormat="auto"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

// Grid ads - placed within location grids
export function GridAds({ adSlot }: { adSlot: string }) {
  return (
    <div className="col-span-full lg:col-span-2 xl:col-span-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
        <div className="text-center mb-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Sponsored
          </span>
        </div>
        <GoogleAds 
          adSlot={adSlot}
          adFormat="auto"
          className="w-full"
        />
      </div>
    </div>
  )
}

// Inline ads component for content areas (updated styling)
export function InlineAds({ adSlot }: { adSlot: string }) {
  return (
    <div className="my-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Sponsored
            </span>
          </div>
          <GoogleAds 
            adSlot={adSlot}
            adFormat="auto"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
