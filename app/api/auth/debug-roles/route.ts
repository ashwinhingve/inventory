import { NextResponse } from 'next/server';
import { ROLES } from '@/models/user';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Return info about the ROLES enum
    return NextResponse.json({
      success: true,
      message: 'Role debug information',
      data: {
        roles: ROLES,
        values: Object.values(ROLES),
        owner_value: ROLES.OWNER,
        mongoose_models: Object.keys(mongoose.models),
        mongoose_connection_status: mongoose.connection.readyState
      }
    });
  } catch (error) {
    console.error('Debug roles error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 