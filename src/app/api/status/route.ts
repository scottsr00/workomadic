import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db'
import { shouldUseMockData } from '@/lib/env'

export async function GET() {
  const dbConnected = await checkDatabaseConnection()
  const useMockData = shouldUseMockData()
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      connected: dbConnected,
      usingMockData: useMockData || !dbConnected
    },
    version: '1.0.0'
  })
} 