import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Organization from '@/models/organization';
import User from '@/models/user';
import { isValidObjectId } from 'mongoose';

interface MemberUpdate {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  permissions?: string[];
}

// GET /api/organizations/[id]/members/[userId] - Get member details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    await connectToDB();
    
    const { id, userId } = await params;
    
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const organization = await Organization.findById(id);
    
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    const member = await User.findOne({
      _id: userId,
      organization: id
    }).select('-password');
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      member
    });
  } catch (error) {
    console.error('Error fetching organization member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization member' },
      { status: 500 }
    );
  }
}

// PUT /api/organizations/[id]/members/[userId] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    await connectToDB();
    
    const { id, userId } = await params;
    
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const organization = await Organization.findById(id);
    
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json() as MemberUpdate;
    
    const member = await User.findOneAndUpdate(
      {
        _id: userId,
        organization: id
      },
      body,
      { new: true }
    ).select('-password');
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      member
    });
  } catch (error) {
    console.error('Error updating organization member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update organization member' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members/[userId] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    await connectToDB();
    
    const { id, userId } = await params;
    
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID' },
        { status: 400 }
      );
    }
    
    const organization = await Organization.findById(id);
    
    if (!organization) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    const member = await User.findOneAndDelete({
      _id: userId,
      organization: id
    });
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing organization member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove organization member' },
      { status: 500 }
    );
  }
}