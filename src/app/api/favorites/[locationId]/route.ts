import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { safePrismaQuery } from '@/lib/db'
import { Session } from 'next-auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await context.params
  const session = await getServerSession(authOptions) as Session | null
  
  if (!session || !session.user?.id) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }



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
