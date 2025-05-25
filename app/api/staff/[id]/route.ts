import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { PERMISSIONS } from '@/models/user';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

// Get a single staff member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if current user has permission to view users
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || !currentUser.hasPermission(PERMISSIONS.VIEW_USERS)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate object ID
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the staff member
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire');
    
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
    console.error('Error fetching staff member:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch staff member: ${err.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

// Update a staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if current user has permission to edit users
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || !currentUser.hasPermission(PERMISSIONS.EDIT_USERS)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate object ID
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the user to update
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get update data from request
    const data = await request.json();
    
    // Fields that can be updated
    const allowedFields = ['name', 'phone', 'role', 'isActive', 'customPermissions'];
    
    // Apply updates to allowed fields only
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)[field] = data[field];
      }
    });
    
    // Email updates need special handling for uniqueness
    if (data.email && data.email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email is already in use' },
          { status: 400 }
        );
      }
      user.email = data.email;
    }
    
    // Save the updated user
    await user.save();
    
    // Return user without sensitive fields
    const updatedUser = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire');
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to update staff member: ${err.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

// Delete a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Check if current user has permission to delete users
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || !currentUser.hasPermission(PERMISSIONS.DELETE_USERS)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Validate object ID
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent deletion of the current user
    if (currentUser._id.toString() === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete staff member: ${err.message || 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}