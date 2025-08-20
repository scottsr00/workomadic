export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

// Check if we should use mock data (when no database is available)
export const shouldUseMockData = () => {
  // If no DATABASE_URL is set, use mock data
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL found, using mock data')
    return true
  }
  
  // If DATABASE_URL is set but invalid, use mock data
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('Invalid DATABASE_URL format, using mock data')
    return true
  }
  
  return false
}

// Get database URL with fallback
export const getDatabaseUrl = () => {
  return process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock'
} 