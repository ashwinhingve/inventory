import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Staff from '@/models/staff';
import { isValidObjectId } from 'mongoose';

// Reset password for a staff member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid staff ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (!body.password) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }
    
    const staff = await Staff.findById(id);
    
    if (!staff) {
      return NextResponse.json(
        { success: false, error: 'Staff not found' },
        { status: 404 }
      );
    }
    
    staff.password = body.password;
    await staff.save();
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}