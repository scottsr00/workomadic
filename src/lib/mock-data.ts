export const mockCities = [
  {
    id: 'nyc',
    name: 'New York City',
    state: 'NY',
    country: 'USA',
    description: 'The city that never sleeps offers endless remote work options',
    imageUrl: '/images/nyc-skyline.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      locations: 5
    }
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    country: 'USA',
    description: 'Tech hub with a vibrant coffee culture and coworking scene',
    imageUrl: '/images/austin-downtown.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      locations: 5
    }
  }
]

export const mockLocations = [
  // NYC Locations
  {
    id: 'nyc-1',
    name: 'Blue Bottle Coffee - Williamsburg',
    description: 'Minimalist coffee shop with excellent WiFi and plenty of seating. Perfect for focused work sessions.',
    address: '160 Berry St, Brooklyn, NY 11249',
    cityId: 'nyc',
    city: {
      id: 'nyc',
      name: 'New York City',
      state: 'NY',
      country: 'USA',
      description: 'The city that never sleeps offers endless remote work options',
      imageUrl: '/images/nyc-skyline.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    latitude: 40.7182,
    longitude: -73.9582,
    website: 'https://bluebottlecoffee.com',
    phone: '+1 (555) 123-4567',
    hours: '7:00 AM - 7:00 PM',
    priceRange: 'MEDIUM' as const,
    wifiQuality: 'EXCELLENT' as const,
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
    isPremium: true,
    isApproved: true,
    submittedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    avgRating: 4.5,
    _count: {
      reviews: 12
    },
    photos: [
      {
        id: 'photo-1',
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        alt: 'Blue Bottle Coffee - Williamsburg',
        createdAt: new Date(),
        locationId: 'nyc-1',
        isPrimary: true
      },
      {
        id: 'photo-2',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        alt: 'Coffee shop interior',
        createdAt: new Date(),
        locationId: 'nyc-1',
        isPrimary: false
      }
    ],
    reviews: [
      {
        id: 'review-1',
        rating: 5,
        comment: 'Excellent WiFi and great coffee! Perfect spot for remote work.',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
        userId: 'user-1',
        locationId: 'nyc-1',
        user: {
          name: 'Sarah Johnson',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100'
        }
      },
      {
        id: 'review-2',
        rating: 4,
        comment: 'Good atmosphere and reliable internet. Coffee is a bit pricey but worth it.',
        createdAt: new Date('2024-01-10T14:20:00Z'),
        updatedAt: new Date('2024-01-10T14:20:00Z'),
        userId: 'user-2',
        locationId: 'nyc-1',
        user: {
          name: 'Mike Chen',
          image: null
        }
      }
    ],
    tags: [
      { id: 'tag-1', name: 'WiFi', color: '#3B82F6', createdAt: new Date() },
      { id: 'tag-2', name: 'Coffee', color: '#8B4513', createdAt: new Date() },
      { id: 'tag-3', name: 'Food', color: '#EF4444', createdAt: new Date() },
      { id: 'tag-4', name: 'Premium', color: '#F59E0B', createdAt: new Date() }
    ]
  },
  {
    id: 'nyc-2',
    name: 'WeWork - Flatiron',
    description: 'Professional coworking space with meeting rooms, phone booths, and networking events.',
    address: '41 E 20th St, New York, NY 10003',
    cityId: 'nyc',
    city: {
      id: 'nyc',
      name: 'New York City',
      state: 'NY',
      country: 'USA',
      description: 'The city that never sleeps offers endless remote work options',
      imageUrl: '/images/nyc-skyline.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    latitude: 40.7389,
    longitude: -73.9887,
    website: 'https://wework.com',
    phone: '+1 (555) 987-6543',
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
    submittedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    avgRating: 4.8,
    _count: {
      reviews: 8
    },
    photos: [
      {
        id: 'photo-3',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        alt: 'WeWork - Flatiron',
        createdAt: new Date(),
        locationId: 'nyc-2',
        isPrimary: true
      }
    ],
    reviews: [
      {
        id: 'review-3',
        rating: 5,
        comment: 'Amazing facilities and great community. The WiFi is incredibly fast.',
        createdAt: new Date('2024-01-20T09:15:00Z'),
        updatedAt: new Date('2024-01-20T09:15:00Z'),
        userId: 'user-3',
        locationId: 'nyc-2',
        user: {
          name: 'Alex Rodriguez',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
        }
      },
      {
        id: 'review-4',
        rating: 4,
        comment: 'Professional environment with all the amenities you need. A bit expensive but worth it.',
        createdAt: new Date('2024-01-18T16:45:00Z'),
        updatedAt: new Date('2024-01-18T16:45:00Z'),
        userId: 'user-4',
        locationId: 'nyc-2',
        user: {
          name: 'Emily Davis',
          image: null
        }
      }
    ],
    tags: [
      { id: 'tag-1', name: 'WiFi', color: '#3B82F6', createdAt: new Date() },
      { id: 'tag-5', name: 'Quiet', color: '#10B981', createdAt: new Date() },
      { id: 'tag-4', name: 'Premium', color: '#F59E0B', createdAt: new Date() }
    ]
  },
  // Austin Locations
  {
    id: 'austin-1',
    name: 'Spider House Cafe',
    description: 'Eclectic cafe with outdoor seating, live music, and a creative atmosphere perfect for work.',
    address: '2908 Fruth St, Austin, TX 78705',
    cityId: 'austin',
    city: {
      id: 'austin',
      name: 'Austin',
      state: 'TX',
      country: 'USA',
      description: 'Tech hub with a vibrant coffee culture and coworking scene',
      imageUrl: '/images/austin-downtown.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    latitude: 30.2977,
    longitude: -97.7431,
    website: 'https://spiderhousecafe.com',
    phone: '+1 (555) 456-7890',
    hours: '8:00 AM - 12:00 AM',
    priceRange: 'LOW' as const,
    wifiQuality: 'GOOD' as const,
    noiseLevel: 'MODERATE' as const,
    seating: 'MIXED' as const,
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
    submittedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    avgRating: 4.2,
    _count: {
      reviews: 15
    },
    photos: [
      {
        id: 'photo-4',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        alt: 'Spider House Cafe',
        createdAt: new Date(),
        locationId: 'austin-1',
        isPrimary: true
      }
    ],
    reviews: [
      {
        id: 'review-5',
        rating: 4,
        comment: 'Great outdoor seating and creative vibe. WiFi is decent but can be slow during peak hours.',
        createdAt: new Date('2024-01-22T11:30:00Z'),
        updatedAt: new Date('2024-01-22T11:30:00Z'),
        userId: 'user-5',
        locationId: 'austin-1',
        user: {
          name: 'Jessica Kim',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
        }
      },
      {
        id: 'review-6',
        rating: 5,
        comment: 'Love the atmosphere here! Perfect for creative work sessions.',
        createdAt: new Date('2024-01-19T15:20:00Z'),
        updatedAt: new Date('2024-01-19T15:20:00Z'),
        userId: 'user-6',
        locationId: 'austin-1',
        user: {
          name: 'David Wilson',
          image: null
        }
      }
    ],
    tags: [
      { id: 'tag-1', name: 'WiFi', color: '#3B82F6', createdAt: new Date() },
      { id: 'tag-2', name: 'Coffee', color: '#8B4513', createdAt: new Date() },
      { id: 'tag-3', name: 'Food', color: '#EF4444', createdAt: new Date() },
      { id: 'tag-6', name: 'Outdoor', color: '#059669', createdAt: new Date() }
    ]
  },
  {
    id: 'austin-2',
    name: 'WeWork - Congress',
    description: 'Modern coworking space in the heart of downtown Austin with great amenities.',
    address: '600 Congress Ave, Austin, TX 78701',
    cityId: 'austin',
    city: {
      id: 'austin',
      name: 'Austin',
      state: 'TX',
      country: 'USA',
      description: 'Tech hub with a vibrant coffee culture and coworking scene',
      imageUrl: '/images/austin-downtown.jpg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    latitude: 30.2672,
    longitude: -97.7431,
    website: 'https://wework.com',
    phone: '+1 (555) 321-0987',
    hours: '24/7',
    priceRange: 'HIGH' as const,
    wifiQuality: 'EXCELLENT' as const,
    noiseLevel: 'QUIET' as const,
    seating: 'CHAIRS' as const,
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
    submittedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    avgRating: 4.7,
    _count: {
      reviews: 6
    },
    photos: [
      {
        id: 'photo-5',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        alt: 'WeWork - Congress',
        createdAt: new Date(),
        locationId: 'austin-2',
        isPrimary: true
      }
    ],
    reviews: [
      {
        id: 'review-7',
        rating: 5,
        comment: 'Top-notch facilities and great location. Perfect for serious work.',
        createdAt: new Date('2024-01-25T08:45:00Z'),
        updatedAt: new Date('2024-01-25T08:45:00Z'),
        userId: 'user-7',
        locationId: 'austin-2',
        user: {
          name: 'Maria Garcia',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
        }
      },
      {
        id: 'review-8',
        rating: 4,
        comment: 'Excellent coworking space with all the amenities. Highly recommend.',
        createdAt: new Date('2024-01-23T13:10:00Z'),
        updatedAt: new Date('2024-01-23T13:10:00Z'),
        userId: 'user-8',
        locationId: 'austin-2',
        user: {
          name: 'Tom Anderson',
          image: null
        }
      }
    ],
    tags: [
      { id: 'tag-1', name: 'WiFi', color: '#3B82F6', createdAt: new Date() },
      { id: 'tag-5', name: 'Quiet', color: '#10B981', createdAt: new Date() },
      { id: 'tag-4', name: 'Premium', color: '#F59E0B', createdAt: new Date() }
    ]
  }
] 