#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupMockData() {
  console.log('🧹 Cleaning up mock Google Place IDs...\n')
  
  try {
    // Find all locations with mock place IDs
    const locationsWithMockIds = await prisma.location.findMany({
      where: {
        googlePlaceId: {
          startsWith: 'mock_place_id_'
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        googlePlaceId: true
      }
    })

    console.log(`📊 Found ${locationsWithMockIds.length} locations with mock Google Place IDs\n`)

    if (locationsWithMockIds.length === 0) {
      console.log('✅ No mock Google Place IDs found to clean up')
      return
    }

    // Show what will be cleaned up
    console.log('📍 Locations with mock IDs:')
    locationsWithMockIds.forEach((location, index) => {
      console.log(`${index + 1}. ${location.name}`)
      console.log(`   Address: ${location.address}`)
      console.log(`   Mock ID: ${location.googlePlaceId}`)
      console.log('')
    })

    // Remove mock Google Place IDs
    const updateResult = await prisma.location.updateMany({
      where: {
        googlePlaceId: {
          startsWith: 'mock_place_id_'
        }
      },
      data: {
        googlePlaceId: null,
        lastGoogleSync: null
      }
    })

    console.log(`✅ Successfully cleaned up ${updateResult.count} mock Google Place IDs`)
    console.log('\n💡 Now you can run the sync script to search for real Google Place IDs:')
    console.log('   npm run sync:all-enhanced')

  } catch (error) {
    console.error('💥 Error cleaning up mock data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupMockData()
  .then(() => {
    console.log('\n✨ Cleanup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error)
    process.exit(1)
  })
