import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

// Define NextAuthOptions type for NextAuth v4 compatibility
interface NextAuthOptions {
  providers: any[]
  callbacks: any
  pages?: any
  session?: any
  secret?: string
  debug?: boolean
}

// Check if Google credentials are properly configured
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const nextAuthUrl = process.env.NEXTAUTH_URL

if (!googleClientId || !googleClientSecret || googleClientId === "your-google-client-id") {
  console.warn("⚠️ Google OAuth credentials not properly configured!")
  console.warn("Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local file")
  console.warn("See AUTHENTICATION_SETUP.md for detailed instructions")
}

console.log("🔧 NextAuth Configuration:")
console.log(`   NEXTAUTH_URL: ${nextAuthUrl}`)
console.log(`   Google Client ID: ${googleClientId ? '✅ Configured' : '❌ Missing'}`)
console.log(`   Google Client Secret: ${googleClientSecret ? '✅ Configured' : '❌ Missing'}`)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId || "mock-client-id",
      clientSecret: googleClientSecret || "mock-client-secret",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (session?.user && token?.sub) {
        // Get the actual user ID from the database
        try {
          const { prisma } = await import('@/lib/prisma')
          if (prisma && session.user.email) {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { id: true }
            })
            if (dbUser) {
              session.user.id = dbUser.id
            } else {
              session.user.id = token.sub
            }
          } else {
            session.user.id = token.sub
          }
        } catch (error) {
          console.error("❌ Error getting user ID from database:", error)
          session.user.id = token.sub
        }
      }
      return session
    },
    jwt: async ({ token, user, account }: { token: JWT; user?: any; account?: any }) => {
      if (user) {
        token.sub = user.id
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    signIn: async ({ user, account }: { user: any; account: any }) => {
      console.log("🔐 Sign-in callback triggered:", { 
        provider: account?.provider, 
        userEmail: user?.email 
      })
      
      // You can add custom logic here, like creating a user in your database
      if (account?.provider === "google") {
        // Ensure user has required fields
        if (!user.email) {
          console.warn("❌ User email is missing")
          return false
        }
        
        try {
          // Create or update user in database
          const { prisma } = await import('@/lib/prisma')
          if (prisma) {
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                name: user.name,
                image: user.image,
              },
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
              },
            })
          }
        } catch (error) {
          console.error("❌ Error creating/updating user in database:", error)
          // Don't block sign-in if database operation fails
        }
        
        console.log("✅ Google sign-in successful")
      }
      return true
    },
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      console.log("🔄 Redirect callback:", { url, baseUrl })
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 