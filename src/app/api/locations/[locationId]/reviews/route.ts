import { NextRequest, NextResponse } from 'next/server'
import { safePrismaQuery } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  try {
    const body = await request.json()
    const { rating, comment } = body
    const locationId = params.locationId

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      )
    }

    const result = await safePrismaQuery(
      async () => {
        const { prisma } = await import('@/lib/prisma')
        if (!prisma) {
          throw new Error('No database connection')
        }

        // Verify location exists and is approved
        const location = await prisma.location.findFirst({
          where: {
            id: locationId,
            isApproved: true
          }
        })

        if (!location) {
          throw new Error('Location not found or not approved')
        }

        // TODO: Get current user from session
        // For now, create a review without user association
        const review = await prisma.review.create({
          data: {
            rating,
            comment: comment || null,
            locationId,
            userId: 'temp-user-id' // TODO: Replace with actual user ID from session
          },
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          }
        })

        return review
      },
      null
    )

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Review submitted successfully!',
        review: result 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

