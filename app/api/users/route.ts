import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';

// Define user roles locally since there are issues with importing
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

type UserRole = typeof ROLES[keyof typeof ROLES];

interface UserQuery {
  role?: string;
  status?: string;
  search?: string;
}

interface UserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  organization?: string;
  store?: string;
}

interface UserMongoQuery {
  role?: UserRole;
  isActive?: boolean;
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(request.url);
    const query: UserQuery = {};
    
    const role = searchParams.get('role');
    if (role) {
      query.role = role;
    }
    
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }
    
    const search = searchParams.get('search');
    if (search) {
      query.search = search;
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Build MongoDB query
    const mongoQuery: UserMongoQuery = {};
    
    if (query.role && query.role !== 'all') {
      mongoQuery.role = query.role as UserRole;
    }
    
    if (query.status && query.status !== 'all') {
      mongoQuery.isActive = query.status === 'active';
    }
    
    if (query.search) {
      mongoQuery.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(mongoQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken -verificationExpire -customPermissions');
    
    const total = await User.countDocuments(mongoQuery);
    
    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    const body = await request.json() as UserCreate;
    
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }
    
    // Validate role is one of the allowed roles
    if (!Object.values(ROLES).includes(body.role as UserRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified' },
        { status: 400 }
      );
    }
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    const user = await User.create(body);
    
    return NextResponse.json({
      success: true,
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 