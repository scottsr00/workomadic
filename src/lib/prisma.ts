import { PrismaClient } from '@prisma/client'
import { getDatabaseUrl, isDevelopment, shouldUseMockData } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

// Only create Prisma client if we have a real database URL
const createPrismaClient = () => {
  // If we're using mock data, don't create a real client
  if (shouldUseMockData()) {
    console.log('Creating mock Prisma client - no database connection')
    return null
  }
  
  const databaseUrl = getDatabaseUrl()
  
  // If we have a mock URL, don't create a real client
  if (databaseUrl.includes('mock')) {
    console.log('Creating mock Prisma client - mock database URL')
    return null
  }
  
  try {
    return new PrismaClient({
      log: isDevelopment ? ['error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    })
  } catch (error) {
    console.warn('Failed to create Prisma client, using mock data:', error)
    return null
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Type guard to check if prisma is available
export const isPrismaAvailable = () => prisma !== null && prisma !== undefined

// Graceful shutdown
process.on('beforeExit', async () => {
  if (isPrismaAvailable()) {
    await prisma!.$disconnect()
  }
}) 