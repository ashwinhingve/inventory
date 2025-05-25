import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import { connectToDB } from '@/lib/mongodb';
import Organization from '@/models/organization';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();
    
    // Get request body
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasMatchPassword: typeof user.matchPassword === 'function'
    });
    
    // Check password
    try {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } catch (passwordError) {
      console.error('Password check error:', passwordError);
      const errorMessage = passwordError instanceof Error 
        ? passwordError.message 
        : 'Unknown password validation error';
        
      return NextResponse.json(
        { 
          error: 'Error validating credentials', 
          debug: `Password validation error: ${errorMessage}`
        },
        { status: 500 }
      );
    }
    
    // Check if user is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'User account is inactive', debug: 'isActive is false' },
        { status: 403 }
      );
    }
    
    // Make sure isActive is set if it's undefined (for backward compatibility)
    if (user.isActive === undefined || user.isActive === null) {
      user.isActive = true;
    }
    
    // Check if organization field is missing and fix it
    if (!user.organization) {
      // First try to find an existing organization
      let organization = await Organization.findOne();
      
      // If no organization exists, create a default one
      if (!organization) {
        organization = new Organization({
          name: 'Default Organization',
          active: true,
          createdBy: user._id
        });
        await organization.save();
      }
      
      // Assign the organization to the user
      user.organization = organization._id as mongoose.Types.ObjectId;;
    }
    
    // Save any changes to the user
    try {
      await user.save();
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      // If we can't save the user, we'll try to continue anyway and just log the error
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const response = NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    // Update last active
    user.lastActive = new Date();
    try {
      await user.save();
    } catch (saveError) {
      console.error('Error updating lastActive:', saveError);
      // Continue anyway if we can't update lastActive
    }
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
