import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenPayload {
  userId: string;
  email: string;
  id?: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    
    // Get token from cookie or header
    const token = req.cookies.get('token')?.value || 
      req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token required' },
        { status: 401 }
      );
    }
    
    // Verify token
    let decoded;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      // Check if token is expired
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        try {
          // Try to decode the token without verification to get the user ID
          decoded = jwt.decode(token) as jwt.JwtPayload;
          
          if (!decoded || !decoded.id) {
            throw new Error('Invalid token format');
          }
        } catch {
          return NextResponse.json(
            { success: false, error: 'Invalid refresh token' },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid refresh token' },
          { status: 401 }
        );
      }
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User account is deactivated' },
        { status: 403 }
      );
    }
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie with the new token
    const response = NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 