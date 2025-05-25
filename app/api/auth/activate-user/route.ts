import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDB();
    
    // Get the email and activation status from the request body
    const { email, activate = true } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Update the user's isActive status
    user.isActive = activate;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: `User account ${activate ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error activating/deactivating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 