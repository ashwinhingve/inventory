import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import { getToken } from 'next-auth/jwt';
import { JWT } from 'next-auth/jwt';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dataVisibility: string;
  store?: string;
}

// This middleware can be called directly from API route handlers
export async function authenticateUser(req: NextRequest) {
  try {
    // Get token from cookie or header
    const token = req.cookies.get('token')?.value || 
      req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { 
        error: 'Authentication required',
        status: 401
      };
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'your-jwt-secret';
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    
    if (!decoded || !decoded.id) {
      return {
        error: 'Invalid token',
        status: 401
      };
    }
    
    // Connect to database
    await connectToDB();
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return {
        error: 'User not found',
        status: 404
      };
    }
    
    if (!user.isActive) {
      return {
        error: 'User account is deactivated',
        status: 403
      };
    }
    
    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();
    
    // Return user data (without sensitive fields)
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        dataVisibility: user.dataVisibility,
        store: user.store?.toString()
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: 'Authentication failed',
      status: 401
    };
  }
}

// Export a wrapper for API routes that require authentication
export function withAuth(handler: (req: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = await authenticateUser(req);
    
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Authentication failed' },
        { status: auth.status || 401 }
      );
    }
    
    // Call the handler with the authenticated user
    return handler(req, auth.user);
  };
}

interface TokenPayload extends JWT {
  id: string;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const payload = token as TokenPayload;
    
    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-user-role', payload.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 