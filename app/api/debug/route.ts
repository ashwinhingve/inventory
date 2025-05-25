import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/user';
import mongoose from 'mongoose';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastActive: Date;
  organization?: string;
}

interface OrganizationDetail {
  id: string;
  name: string;
  active: boolean;
  createdBy?: string;
}

export async function GET() {
  try {
    // Check database connection
    let dbStatus = 'Unknown';
    try {
      await connectToDB();
      dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    } catch (error) {
      console.error('DB connection error:', error);
      dbStatus = 'Error connecting';
    }

    // Check User model
    let userModelStatus = 'Unknown';
    let adminExists = false;
    let userCount = 0;
    let userDetails: UserDetail[] = [];
    
    try {
      userModelStatus = mongoose.models.User ? 'Model exists' : 'Model not found';
      if (mongoose.models.User) {
        userCount = await User.countDocuments();
        adminExists = (await User.countDocuments({ role: 'admin' })) > 0;
        
        // Get details of all users (without passwords)
        const users = await User.find().select('-password');
        userDetails = users.map(user => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastActive: user.lastActive,
          organization: user.organization?.toString()
        }));
      }
    } catch (error) {
      console.error('User model check error:', error instanceof Error ? error.message : 'Unknown error');
      userModelStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Check Organization model
    let orgModelStatus = 'Unknown';
    let orgCount = 0;
    let orgDetails: OrganizationDetail[] = [];
    
    try {
      orgModelStatus = mongoose.models.Organization ? 'Model exists' : 'Model not found';
      if (mongoose.models.Organization) {
        orgCount = await mongoose.models.Organization.countDocuments();
        
        // Get details of all organizations
        const orgs = await mongoose.models.Organization.find();
        orgDetails = orgs.map(org => ({
          id: org._id.toString(),
          name: org.name,
          active: org.active,
          createdBy: org.createdBy?.toString()
        }));
      }
    } catch (error) {
      console.error('Organization model check error:', error instanceof Error ? error.message : 'Unknown error');
      orgModelStatus = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      success: true,
      debug: {
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          mongooseVersion: mongoose.version,
        },
        models: {
          user: {
            status: userModelStatus,
            count: userCount,
            adminExists,
            users: userDetails
          },
          organization: {
            status: orgModelStatus,
            count: orgCount,
            organizations: orgDetails
          }
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
        }
      }
    });
  } catch (error) {
    console.error('Debug API error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Debug API error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 