import { Suspense } from 'react'
import { FeaturedCities } from '@/components/featured-cities'
import { Hero } from '@/components/hero'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <Hero />
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedCities />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
