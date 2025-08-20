import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { safePrismaQuery } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const locationId = params.locationId

  const result = await safePrismaQuery(
    async () => {
      const { prisma } = await import('@/lib/prisma')
      if (!prisma) {
        throw new Error('No database connection')
      }

      // Find and delete the favorite
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_locationId: {
            userId: session.user.id,
            locationId
          }
        }
      })

      if (!favorite) {
        throw new Error('Favorite not found')
      }

      await prisma.favorite.delete({
        where: {
          userId_locationId: {
            userId: session.user.id,
            locationId
          }
        }
      })

      return { success: true }
    },
    null
  )

  if (!result) {
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { message: 'Location removed from favorites' },
    { status: 200 }
  )
}
