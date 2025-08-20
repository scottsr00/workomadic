import { ReactNode } from 'react'

interface LayoutWithAdsProps {
  children: ReactNode
}

export function LayoutWithAds({ children }: LayoutWithAdsProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
