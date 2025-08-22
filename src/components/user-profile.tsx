'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'
import { User, Settings, LogOut, ChevronDown, ChevronUp } from 'lucide-react'

export function UserProfile() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (!session?.user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-700 hidden sm:block">
            {session.user.name}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name}
            </p>
            <p className="text-sm text-gray-500">
              {session.user.email}
            </p>
          </div>
          
          <button
            onClick={() => {
              // Add settings functionality here
              setIsOpen(false)
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
