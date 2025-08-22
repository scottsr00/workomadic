'use client'

import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { LogIn, Star, Search } from 'lucide-react'
import { UserProfile } from './user-profile'

export function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="/workomadic-hz.png" 
              alt="Workomadic Logo" 
              className="h-20 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
            <Link href="/cities/new-york-city" className="text-gray-600 hover:text-blue-600 transition-colors">
              NYC
            </Link>
            <Link href="/cities/austin" className="text-gray-600 hover:text-blue-600 transition-colors">
              Austin
            </Link>
            <Link href="/submit" className="text-gray-600 hover:text-blue-600 transition-colors">
              Add Location
            </Link>
            {session && (
              <Link href="/favorites" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Star className="w-4 h-4" />
                <span>Favorites</span>
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            {session ? (
              <UserProfile />
            ) : (
              <button
                onClick={() => signIn('google')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 