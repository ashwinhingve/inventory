import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { ROLES } from '@/models/user';
import Organization from '@/models/organization';
import bcrypt from 'bcryptjs';

/**
 * Setup API endpoint to create a default owner account
 * This should only be called during initial setup or when no users exist
 */
export async function POST() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if any users exist already
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Setup has already been completed. Cannot create default owner account.' 
        },
        { status: 403 }
      );
    }
    
    // Create default organization if none exists
    let organization = await Organization.findOne();
    
    if (!organization) {
      organization = new Organization({
        name: 'Default Organization',
        active: true,
        createdAt: new Date()
      });
      await organization.save();
    }
    
    // Generate a secure default password
    const defaultPassword = process.env.DEFAULT_OWNER_PASSWORD || 'defaultOwnerPassword';
    
    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    
    // Create the default owner account
    const owner = new User({
      name: 'System Owner',
      email: 'owner@example.com',
      password: hashedPassword,
      role: ROLES.OWNER,
      organization: organization._id,
      isActive: true,
      dataVisibility: 'all',
      createdAt: new Date(),
      lastActive: new Date()
    });
    
    await owner.save();
    
    // Update the organization with the owner reference
    organization.createdBy = owner._id;
    await organization.save();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Default owner account created successfully',
        ownerEmail: 'owner@example.com',
        organizationName: organization.name
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating default owner account:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create default owner account',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if any users exist
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      isSetup: userCount > 0,
      message: userCount > 0 ? 'System is already set up' : 'System needs setup'
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check system setup' },
      { status: 500 }
    );
  }
}
