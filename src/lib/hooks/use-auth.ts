import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAuthenticated = !!session
  const isLoading = status === 'loading'

  const login = async (provider: string = 'google', callbackUrl?: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: callbackUrl || '/',
        redirect: false,
      })
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async (callbackUrl?: string) => {
    try {
      await signOut({ callbackUrl: callbackUrl || '/' })
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const requireAuth = (redirectTo: string = '/auth/signin') => {
    if (!isAuthenticated && !isLoading) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  return {
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
  }
}
