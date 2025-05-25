import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Party from '@/models/party';

interface PartyQuery {
  name?: { $regex: string; $options: string };
  type?: string;
  status?: string;
}

// GET /api/parties - Get all parties with optional filtering
export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build query
    const query: PartyQuery = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await Party.countDocuments(query);
    
    // Get parties with pagination
    const parties = await Party.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      parties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parties' },
      { status: 500 }
    );
  }
}

// POST /api/parties - Create a new party
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
    
    // Create new party
    const party = await Party.create(body);
    
    return NextResponse.json({
      success: true,
      party
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create party' },
      { status: 500 }
    );
  }
} 