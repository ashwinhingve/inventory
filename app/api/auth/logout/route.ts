import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // For a complete logout solution, you would need:
    // 1. If using HTTP-only cookies to store the token - clear that cookie
    // 2. If using client-side token storage - the client will handle removal
    
    // This is a simple implementation that responds with success
    // The client side will need to remove the token from storage
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
} 