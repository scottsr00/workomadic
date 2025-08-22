import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check if we have a database connection
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    // Check if data already exists
    const existingCities = await prisma.city.count()
    if (existingCities > 0) {
      return NextResponse.json(
        { message: 'Database already seeded', count: existingCities },
        { status: 200 }
      )
    }

    // Create cities
    const nyc = await prisma.city.create({
      data: {
        id: 'nyc',
        name: 'New York City',
        state: 'NY',
        country: 'USA',
        description: 'The city that never sleeps offers endless remote work options',
        imageUrl: '/images/nyc-skyline.jpg'
      }
    })

    const austin = await prisma.city.create({
      data: {
        id: 'austin',
        name: 'Austin',
        state: 'TX',
        country: 'USA',
        description: 'Tech hub with a vibrant coffee culture and coworking scene',
        imageUrl: '/images/austin-downtown.jpg'
      }
    })

    // Create tags
    const tags = await Promise.all([
      prisma.tag.create({
        data: { name: 'WiFi', color: '#3B82F6' }
      }),
      prisma.tag.create({
        data: { name: 'Quiet', color: '#10B981' }
      }),
      prisma.tag.create({
        data: { name: 'Coffee', color: '#8B4513' }
      }),
      prisma.tag.create({
        data: { name: 'Food', color: '#EF4444' }
      }),
      prisma.tag.create({
        data: { name: 'Outdoor', color: '#059669' }
      }),
      prisma.tag.create({
        data: { name: 'Premium', color: '#F59E0B' }
      })
    ])

    // Sample locations data
    const nycLocations = [
      {
        name: 'Blue Bottle Coffee - Williamsburg',
        description: 'Minimalist coffee shop with excellent WiFi and plenty of seating. Perfect for focused work sessions.',
        address: '160 Berry St, Brooklyn, NY 11249',
        latitude: 40.7182,
        longitude: -73.9582,
        website: 'https://bluebottlecoffee.com',
        hours: '7:00 AM - 7:00 PM',
        priceRange: 'MEDIUM' as any,
        wifiQuality: 'EXCELLENT' as any,
        noiseLevel: 'MODERATE' as any,
        seating: 'CHAIRS' as any,
        powerOutlets: true,
        parking: false,
        food: true,
        coffee: true,
        quiet: false,
        outdoor: false,
        petFriendly: false,
        wheelchair: true,
        isPremium: true,
        isApproved: true,
        googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        tags: ['WiFi', 'Coffee', 'Food', 'Premium']
      },
      {
        name: 'WeWork - Flatiron',
        description: 'Professional coworking space with meeting rooms, phone booths, and networking events.',
        address: '41 E 20th St, New York, NY 10003',
        latitude: 40.7389,
        longitude: -73.9887,
        website: 'https://wework.com',
        hours: '24/7',
        priceRange: 'HIGH' as any,
        wifiQuality: 'EXCELLENT' as any,
        noiseLevel: 'QUIET' as any,
        seating: 'CHAIRS' as any,
        powerOutlets: true,
        parking: false,
        food: true,
        coffee: true,
        quiet: true,
        outdoor: false,
        petFriendly: false,
        wheelchair: true,
        isPremium: true,
        isApproved: true,
        tags: ['WiFi', 'Quiet', 'Premium']
      }
    ]

    const austinLocations = [
      {
        name: 'Spider House Cafe',
        description: 'Eclectic cafe with outdoor seating, live music, and a creative atmosphere perfect for work.',
        address: '2908 Fruth St, Austin, TX 78705',
        latitude: 30.2977,
        longitude: -97.7431,
        website: 'https://spiderhousecafe.com',
        hours: '8:00 AM - 12:00 AM',
        priceRange: 'LOW' as any,
        wifiQuality: 'GOOD' as any,
        noiseLevel: 'MODERATE' as any,
        seating: 'MIXED' as any,
        powerOutlets: true,
        parking: true,
        food: true,
        coffee: true,
        quiet: false,
        outdoor: true,
        petFriendly: true,
        wheelchair: true,
        isPremium: false,
        isApproved: true,
        tags: ['WiFi', 'Coffee', 'Food', 'Outdoor']
      },
      {
        name: 'WeWork - Congress',
        description: 'Modern coworking space in the heart of downtown Austin with great amenities.',
        address: '600 Congress Ave, Austin, TX 78701',
        latitude: 30.2672,
        longitude: -97.7431,
        website: 'https://wework.com',
        hours: '24/7',
        priceRange: 'HIGH' as any,
        wifiQuality: 'EXCELLENT' as any,
        noiseLevel: 'QUIET' as any,
        seating: 'CHAIRS' as any,
        powerOutlets: true,
        parking: true,
        food: true,
        coffee: true,
        quiet: true,
        outdoor: false,
        petFriendly: false,
        wheelchair: true,
        isPremium: true,
        isApproved: true,
        tags: ['WiFi', 'Quiet', 'Premium']
      }
    ]

    // Create locations for NYC
    for (const locationData of nycLocations) {
      const { tags: tagNames, ...locationFields } = locationData
      const location = await prisma.location.create({
        data: {
          ...locationFields,
          cityId: nyc.id,
          photos: {
            create: {
              url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
              alt: locationData.name,
              isPrimary: true
            }
          }
        }
      })

      // Connect tags
      for (const tagName of tagNames) {
        const tag = tags.find(t => t.name === tagName)
        if (tag) {
          await prisma.location.update({
            where: { id: location.id },
            data: {
              tags: {
                connect: { id: tag.id }
              }
            }
          })
        }
      }
    }

    // Create locations for Austin
    for (const locationData of austinLocations) {
      const { tags: tagNames, ...locationFields } = locationData
      const location = await prisma.location.create({
        data: {
          ...locationFields,
          cityId: austin.id,
          photos: {
            create: {
              url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
              alt: locationData.name,
              isPrimary: true
            }
          }
        }
      })

      // Connect tags
      for (const tagName of tagNames) {
        const tag = tags.find(t => t.name === tagName)
        if (tag) {
          await prisma.location.update({
            where: { id: location.id },
            data: {
              tags: {
                connect: { id: tag.id }
              }
            }
          })
        }
      }
    }

    const totalLocations = await prisma.location.count()
    const totalCities = await prisma.city.count()
    const totalTags = await prisma.tag.count()

    return NextResponse.json({
      message: 'Database seeded successfully!',
      stats: {
        cities: totalCities,
        locations: totalLocations,
        tags: totalTags
      }
    })

  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const stats = {
      cities: await prisma.city.count(),
      locations: await prisma.location.count(),
      tags: await prisma.tag.count(),
      users: await prisma.user.count(),
      reviews: await prisma.review.count()
    }

    return NextResponse.json({
      message: 'Database status',
      stats,
      hasData: stats.cities > 0
    })

  } catch (error) {
    console.error('Error checking database status:', error)
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    )
  }
}
