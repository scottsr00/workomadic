import { NextResponse } from 'next/server'
import { safePrismaQuery } from '@/lib/db'
import { mockCities } from '@/lib/mock-data'

export async function GET() {
  const cities = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      return await prisma.city.findMany({
        include: {
          _count: {
            select: {
              locations: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    },
    mockCities
  )

  return NextResponse.json(cities)
} 