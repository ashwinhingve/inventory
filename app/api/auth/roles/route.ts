import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    roles: [
      { id: 'owner', name: 'Owner', description: 'Full system access' },
      { id: 'admin', name: 'Admin', description: 'Administrative access' },
      { id: 'manager', name: 'Manager', description: 'Management access' },
      { id: 'user', name: 'User', description: 'Standard user access' }
    ]
  });
} 