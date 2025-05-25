import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import { verifyToken, extractToken } from '@/lib/tokenUtils';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get token using our utility function
    const token = extractToken(
      request.headers.get('Authorization'),
      request.headers.get('cookie')
    );
    
    // Check if token exists
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Verify token using our utility function - This is running server-side
    // so we use the Node.js compatible version
    const decoded = verifyToken(token);
    
    // Check if token verification failed
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    console.log('Token decoded successfully:', {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    });
    
    try {
      await connectToDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return a more specific error for database connection issues
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error connecting to database',
          error: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 503 }
      );
    }
    
    // Find user from decoded token
    let user;
    try {
      user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log('User found in database:', {
        id: user._id,
        role: user.role,
        email: user.email,
        isActive: user.isActive
      });
      
    } catch (userError) {
      console.error('User fetch error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Error fetching user data',
          error: userError instanceof Error ? userError.message : String(userError)
        },
        { status: 500 }
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User account is inactive' },
        { status: 403 }
      );
    }
    
    // Update user's last active timestamp
    user.lastActive = new Date();
    try {
      await user.save();
    } catch (saveError) {
      console.error('Error updating lastActive:', saveError);
      // Continue anyway if we can't update lastActive
    }
    
    // Return user data with cache control headers to prevent caching
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, message: 'Token expired' },
        { status: 401 }
      );
    }
    
    console.error('Token verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during token verification',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 