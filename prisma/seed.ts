import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create cities
  const nyc = await prisma.city.upsert({
    where: { id: 'nyc' },
    update: {},
    create: {
      id: 'nyc',
      name: 'New York City',
      state: 'NY',
      country: 'USA',
      description: 'The city that never sleeps offers endless remote work options',
      imageUrl: '/images/nyc-skyline.jpg'
    }
  })

  const austin = await prisma.city.upsert({
    where: { id: 'austin' },
    update: {},
    create: {
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
    prisma.tag.upsert({
      where: { name: 'WiFi' },
      update: {},
      create: { name: 'WiFi', color: '#3B82F6' }
    }),
    prisma.tag.upsert({
      where: { name: 'Quiet' },
      update: {},
      create: { name: 'Quiet', color: '#10B981' }
    }),
    prisma.tag.upsert({
      where: { name: 'Coffee' },
      update: {},
      create: { name: 'Coffee', color: '#8B4513' }
    }),
    prisma.tag.upsert({
      where: { name: 'Food' },
      update: {},
      create: { name: 'Food', color: '#EF4444' }
    }),
    prisma.tag.upsert({
      where: { name: 'Outdoor' },
      update: {},
      create: { name: 'Outdoor', color: '#059669' }
    }),
    prisma.tag.upsert({
      where: { name: 'Premium' },
      update: {},
      create: { name: 'Premium', color: '#F59E0B' }
    })
  ])

  // NYC Locations
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
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Blue Bottle Coffee - Williamsburg
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
      priceRange: 'HIGH' as const,
      wifiQuality: 'EXCELLENT' as const,
      noiseLevel: 'QUIET' as const,
      seating: 'CHAIRS' as const,
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
    },
    {
      name: 'Starbucks Reserve - Chelsea',
      description: 'Upscale Starbucks with artisanal coffee and a sophisticated atmosphere for work.',
      address: '150 8th Ave, New York, NY 10011',
      latitude: 40.7419,
      longitude: -74.0047,
      website: 'https://starbucks.com',
      hours: '6:00 AM - 10:00 PM',
      priceRange: 'MEDIUM' as const,
      wifiQuality: 'GOOD' as const,
      noiseLevel: 'MODERATE' as const,
      seating: 'CHAIRS' as const,
      powerOutlets: true,
      parking: false,
      food: true,
      coffee: true,
      quiet: false,
      outdoor: false,
      petFriendly: false,
      wheelchair: true,
      isPremium: false,
      isApproved: true,
      tags: ['WiFi', 'Coffee', 'Food']
    },
    {
      name: 'The Wing - SoHo',
      description: 'Women-focused coworking space with beautiful design and community events.',
      address: '55 Mercer St, New York, NY 10013',
      latitude: 40.7234,
      longitude: -74.0025,
      website: 'https://www.thewing.com',
      hours: '8:00 AM - 8:00 PM',
      priceRange: 'HIGH' as const,
      wifiQuality: 'EXCELLENT' as const,
      noiseLevel: 'QUIET' as const,
      seating: 'CHAIRS' as const,
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
    },
    {
      name: 'Devoción - Williamsburg',
      description: 'Colombian coffee roaster with fresh beans and a peaceful atmosphere for work.',
      address: '69 Grand St, Brooklyn, NY 11249',
      latitude: 40.7169,
      longitude: -73.9578,
      website: 'https://devocion.com',
      hours: '7:00 AM - 6:00 PM',
      priceRange: 'MEDIUM',
      wifiQuality: 'GOOD',
      noiseLevel: 'QUIET',
      seating: 'CHAIRS',
      powerOutlets: true,
      parking: false,
      food: false,
      coffee: true,
      quiet: true,
      outdoor: false,
      petFriendly: false,
      wheelchair: true,
      isPremium: false,
      isApproved: true,
      tags: ['WiFi', 'Coffee', 'Quiet']
    }
  ]

  // Austin Locations
  const austinLocations = [
    {
      name: 'Spider House Cafe',
      description: 'Eclectic cafe with outdoor seating, live music, and a creative atmosphere perfect for work.',
      address: '2908 Fruth St, Austin, TX 78705',
      latitude: 30.2977,
      longitude: -97.7431,
      website: 'https://spiderhousecafe.com',
      hours: '8:00 AM - 12:00 AM',
      priceRange: 'LOW',
      wifiQuality: 'GOOD',
      noiseLevel: 'MODERATE',
      seating: 'MIXED',
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
      priceRange: 'HIGH',
      wifiQuality: 'EXCELLENT',
      noiseLevel: 'QUIET',
      seating: 'CHAIRS',
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
    },
    {
      name: 'Houndstooth Coffee - North Lamar',
      description: 'Specialty coffee shop with a focus on quality beans and a clean, minimal aesthetic.',
      address: '4200 N Lamar Blvd, Austin, TX 78756',
      latitude: 30.3077,
      longitude: -97.7431,
      website: 'https://houndstoothcoffee.com',
      hours: '7:00 AM - 7:00 PM',
      priceRange: 'MEDIUM',
      wifiQuality: 'GOOD',
      noiseLevel: 'QUIET',
      seating: 'CHAIRS',
      powerOutlets: true,
      parking: true,
      food: false,
      coffee: true,
      quiet: true,
      outdoor: false,
      petFriendly: false,
      wheelchair: true,
      isPremium: false,
      isApproved: true,
      tags: ['WiFi', 'Coffee', 'Quiet']
    },
    {
      name: 'Capital Factory',
      description: 'Tech incubator and coworking space with startup community and events.',
      address: '701 Brazos St, Austin, TX 78701',
      latitude: 30.2672,
      longitude: -97.7431,
      website: 'https://capitalfactory.com',
      hours: '8:00 AM - 6:00 PM',
      priceRange: 'HIGH',
      wifiQuality: 'EXCELLENT',
      noiseLevel: 'MODERATE',
      seating: 'CHAIRS',
      powerOutlets: true,
      parking: true,
      food: true,
      coffee: true,
      quiet: false,
      outdoor: false,
      petFriendly: false,
      wheelchair: true,
      isPremium: true,
      isApproved: true,
      tags: ['WiFi', 'Premium']
    },
    {
      name: 'Radio Coffee & Beer',
      description: 'Popular spot with great coffee, beer, and food trucks. Perfect for casual work sessions.',
      address: '4204 Menchaca Rd, Austin, TX 78704',
      latitude: 30.2237,
      longitude: -97.7431,
      website: 'https://radiocoffeeandbeer.com',
      hours: '7:00 AM - 12:00 AM',
      priceRange: 'LOW',
      wifiQuality: 'FAIR',
      noiseLevel: 'MODERATE',
      seating: 'MIXED',
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

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 