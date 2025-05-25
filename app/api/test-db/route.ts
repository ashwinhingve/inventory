import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDB();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
} 