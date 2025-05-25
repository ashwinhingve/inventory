import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectToDB();
    
    // Find all users without an organization
    const users = await User.find({ organization: { $exists: false } });
    
    if (users.length === 0) {
      return NextResponse.json({ message: 'No users need fixing' });
    }
    
    // Create a default/placeholder ObjectId for organization
    // You should replace this with an actual organization ID from your database
    const defaultOrganizationId = new mongoose.Types.ObjectId();
    
    // Alternative: Find an existing organization or create a default one
    // const defaultOrganization = await Organization.findOne() || await Organization.create({ name: 'Default Organization' });
    // const defaultOrganizationId = defaultOrganization._id;
    
    // Update each user
    for (const user of users) {
      user.organization = defaultOrganizationId;
      await user.save();
    }
    
    return NextResponse.json({ 
      message: `Fixed ${users.length} users`,
      users: users.map(u => ({ id: u._id, email: u.email })),
      organizationId: defaultOrganizationId
    });
  } catch (error) {
    console.error('Error fixing users:', error);
    return NextResponse.json(
      { error: 'Failed to fix users' },
      { status: 500 }
    );
  }
}