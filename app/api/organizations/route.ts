import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Organization from '@/models/organization';
// import User from '@/models/user';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { PERMISSIONS } from '@/models/user';

interface OrganizationQuery {
  name?: { $regex: string; $options: string };
  status?: string;
  createdBy?: string;
}

// GET /api/organizations - List organizations (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: OrganizationQuery = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Organization.countDocuments(query);
    
    // Get organizations with pagination
    const organizations = await Organization.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      organizations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create new organization (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    
    // Create new organization
    const organization = await Organization.create(body);
    
    return NextResponse.json({
      success: true,
      organization
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 