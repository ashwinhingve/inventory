import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import { isValidObjectId } from 'mongoose';

interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
  organization?: string;
  store?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire -customPermissions');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json() as UserUpdate;
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being updated and if it's already taken
    if (body.email && body.email !== user.email) {
      const existingUser = await User.findOne({ email: body.email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire -customPermissions');
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}