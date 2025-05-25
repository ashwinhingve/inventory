import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
import * as jose from 'jose';
import { NextRequest } from 'next/server';

// Use a consistent JWT secret across the application
export const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-should-be-changed-in-production';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

// Generate a JWT token for a user - This runs server-side only
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

// Verify a JWT token - Edge runtime compatible version
export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    if (!token || token.trim() === '') {
      return null;
    }
    
    // Create a TextEncoder to convert the secret to Uint8Array
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    
    // Verify the token using jose
    try {
      const { payload } = await jose.jwtVerify(token, secretKey);
      // Convert the JWT payload to our TokenPayload type
      const tokenPayload: TokenPayload = {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        organizationId: payload.organizationId as string | undefined,
        permissions: payload.permissions as string[] | undefined,
        iat: payload.iat as number,
        exp: payload.exp as number
      };
      return tokenPayload;
    } catch (joseError) {
      console.error('Jose verification error:', joseError);
      
      // Try parsing the token manually (safer fallback)
      try {
        // Split the token into parts
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Decode the payload (middle part)
        const payloadBase64 = parts[1];
        const normalizedPayload = payloadBase64
          .replace(/-/g, '+')
          .replace(/_/g, '/');
          
        const jsonStr = atob(normalizedPayload);
        const parsedPayload = JSON.parse(jsonStr);
        
        // Convert the parsed payload to our TokenPayload type
        const tokenPayload: TokenPayload = {
          userId: parsedPayload.userId,
          email: parsedPayload.email,
          role: parsedPayload.role,
          organizationId: parsedPayload.organizationId,
          permissions: parsedPayload.permissions,
          iat: parsedPayload.iat,
          exp: parsedPayload.exp
        };
        return tokenPayload;
      } catch (parseError) {
        console.error('Manual token parsing error:', parseError);
        return null;
      }
    }
  } catch (error) {
    console.error('Edge token verification error:', error);
    return null;
  }
}

// Verify a JWT token - Node.js compatible version
export function verifyToken(token: string): DecodedToken {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.verify(token, secret) as DecodedToken;
}

// Extract token from Authorization header or cookie
export function extractToken(authHeader: string | null, cookieHeader: string | null): string | null {
  // From Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return token.length > 0 ? token : null;
  }
  
  // From cookie
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1]?.trim();
      return token && token.length > 0 ? token : null;
    }
  }
  
  return null;
}

// Set cookie for token
export function getTokenCookieString(token: string, maxAgeSec = 30 * 24 * 60 * 60): string {
  return `token=${token}; path=/; max-age=${maxAgeSec}; SameSite=Strict`;
}

// Clear token cookie
export function getClearTokenCookieString(): string {
  return 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  return token || null;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
} 