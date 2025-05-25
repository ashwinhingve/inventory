import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDB();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      mongodbState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        mongodbState: mongoose.connection.readyState
      },
      { status: 500 }
    );
  }
} 