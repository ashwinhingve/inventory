import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/app/api/middleware';

export const GET = withAuth(async (req: NextRequest, user: AuthenticatedUser) => {
  try {
    // The user object is already provided by the withAuth middleware
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}); 