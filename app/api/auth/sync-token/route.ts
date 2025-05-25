import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token found' },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return NextResponse.json({ valid: true, decoded });
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch {
    console.error('Token sync error: Failed to process request');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 