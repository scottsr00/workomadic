import { prisma, isPrismaAvailable } from './prisma'
import { shouldUseMockData } from './env'

export async function checkDatabaseConnection(): Promise<boolean> {
  // If no Prisma client or using mock data, return false
  if (!isPrismaAvailable() || shouldUseMockData()) {
    return false
  }
  
  try {
    await prisma!.$connect()
    return true
  } catch (error) {
    console.warn('Database connection failed, using mock data:', error)
    return false
  }
}

export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  // If no Prisma client or using mock data, return fallback immediately
  if (!isPrismaAvailable() || shouldUseMockData()) {
    console.log('Using fallback data - no database connection available')
    return fallback
  }
  
  try {
    return await queryFn()
  } catch (error) {
    console.warn('Database query failed, using fallback data:', error)
    return fallback
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isPrismaAvailable()) {
    return
  }
  
  try {
    await prisma!.$disconnect()
  } catch (error) {
    console.warn('Error disconnecting from database:', error)
  }
} 