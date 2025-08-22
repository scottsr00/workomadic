import { NextRequest, NextResponse } from 'next/server'
import { safePrismaQuery } from '@/lib/db'
import { mockLocations } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cityId = searchParams.get('cityId')
  const search = searchParams.get('search')
  const wifiQuality = searchParams.get('wifiQuality')
  const noiseLevel = searchParams.get('noiseLevel')
  const priceRange = searchParams.get('priceRange')
  const coffee = searchParams.get('coffee')
  const powerOutlets = searchParams.get('powerOutlets')
  const outdoor = searchParams.get('outdoor')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit

  const result = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }
      
      const where: Record<string, any> = {
        isApproved: true
      }

      if (cityId) {
        where.cityId = cityId
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (wifiQuality) {
        where.wifiQuality = wifiQuality
      }

      if (noiseLevel) {
        where.noiseLevel = noiseLevel
      }

      if (priceRange) {
        where.priceRange = priceRange
      }

      if (coffee === 'true') {
        where.coffee = true
      }

      if (powerOutlets === 'true') {
        where.powerOutlets = true
      }

      if (outdoor === 'true') {
        where.outdoor = true
      }

      const [locations, total] = await Promise.all([
        prisma.location.findMany({
          where,
          include: {
            city: true,
            photos: {
              where: { isPrimary: true },
              take: 1
            },
            reviews: {
              select: {
                rating: true
              }
            },
            tags: true,
            _count: {
              select: {
                reviews: true
              }
            }
          },
          orderBy: [
            { isPremium: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        }),
        prisma.location.count({ where })
      ])

      const locationsWithAvgRating = locations.map((location: any) => {
        const avgRating = location.reviews.length > 0
          ? location.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / location.reviews.length
          : null

        return {
          ...location,
          avgRating,
          reviews: undefined // Remove reviews array, keep only count
        }
      })

      return {
        locations: locationsWithAvgRating,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    },
    {
      locations: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    }
  )

  // If database query failed, use mock data
  if (result.locations.length === 0) {
    // Filter mock data based on parameters
    let filteredLocations = mockLocations.filter(location => location.isApproved)

    if (cityId) {
      filteredLocations = filteredLocations.filter(location => location.cityId === cityId)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLocations = filteredLocations.filter(location =>
        location.name.toLowerCase().includes(searchLower) ||
        location.description.toLowerCase().includes(searchLower) ||
        location.address.toLowerCase().includes(searchLower)
      )
    }

    if (wifiQuality) {
      filteredLocations = filteredLocations.filter(location => location.wifiQuality === wifiQuality)
    }

    if (noiseLevel) {
      filteredLocations = filteredLocations.filter(location => location.noiseLevel === noiseLevel)
    }

    if (priceRange) {
      filteredLocations = filteredLocations.filter(location => location.priceRange === priceRange)
    }

    if (coffee === 'true') {
      filteredLocations = filteredLocations.filter(location => location.coffee === true)
    }

    if (powerOutlets === 'true') {
      filteredLocations = filteredLocations.filter(location => location.powerOutlets === true)
    }

    if (outdoor === 'true') {
      filteredLocations = filteredLocations.filter(location => location.outdoor === true)
    }

    const total = filteredLocations.length
    const startIndex = skip
    const endIndex = startIndex + limit
    const paginatedLocations = filteredLocations.slice(startIndex, endIndex)

    return NextResponse.json({
      locations: paginatedLocations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  }

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      address,
      cityId,
      website,
      phone,
      hours,
      priceRange,
      wifiQuality,
      noiseLevel,
      seating,
      powerOutlets,
      parking,
      food,
      coffee,
      quiet,
      outdoor,
      petFriendly,
      wheelchair
    } = body

    // Validate required fields
    if (!name || !description || !address || !cityId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, address, cityId' },
        { status: 400 }
      )
    }

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) {
          throw new Error('No database connection')
        }

        // Verify city exists
        const city = await prisma.city.findUnique({
          where: { id: cityId }
        })

        if (!city) {
          throw new Error('City not found')
        }

        // Create the location
        const location = await prisma.location.create({
          data: {
            name,
            description,
            address,
            cityId,
            website: website || null,
            phone: phone || null,
            hours: hours || null,
            priceRange: priceRange || 'FREE',
            wifiQuality: wifiQuality || 'UNKNOWN',
            noiseLevel: noiseLevel || 'UNKNOWN',
            seating: seating || 'UNKNOWN',
            powerOutlets: powerOutlets || false,
            parking: parking || false,
            food: food || false,
            coffee: coffee || false,
            quiet: quiet || false,
            outdoor: outdoor || false,
            petFriendly: petFriendly || false,
            wheelchair: wheelchair || false,
            isApproved: false, // New submissions need approval
            submittedBy: null // TODO: Add user authentication
          },
          include: {
            city: true
          }
        })

        return location
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create location' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Location submitted successfully! It will be reviewed before being published.',
        location: result 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 