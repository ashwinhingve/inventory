import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Organization from '@/models/organization';
import User from '@/models/user';
import { isValidObjectId } from 'mongoose';

// GET /api/organizations/[id]/members - List organization members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
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
    
    const members = await User.find({ organization: id })
      .select('-password')
      .sort({ name: 1 });
    
    return NextResponse.json({
      success: true,
      members
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Add member to organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();
    
    const { id } = await params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid organization ID' },
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
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'role'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create new member
    const member = await User.create({
      ...body,
      organization: id
    });
    
    return NextResponse.json({
      success: true,
      member
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding organization member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add organization member' },
      { status: 500 }
    );
  }
}