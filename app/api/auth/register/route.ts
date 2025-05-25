import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export async function POST(request: Request) {
  try {
    await connectToDB();
    
    const { name, email, password, role = 'user' }: RegisterRequest = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive: true
    });
    
    await user.save();
    
    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 