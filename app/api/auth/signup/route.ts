import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user';
import Organization from '@/models/organization';
import mongoose from 'mongoose';
import { ROLES } from '@/models/user';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Type for organization document
interface OrganizationDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  active: boolean;
  createdBy?: mongoose.Types.ObjectId | null;
  save(): Promise<OrganizationDocument>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process');
    
    try {
      await connectToDatabase();
      console.log('Connected to MongoDB successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database connection failed', error: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed:', { ...body, password: '[REDACTED]' });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid request body', error: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 }
      );
    }
    
    const { name, email, password, organizationName, role } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'A user with this email already exists' },
          { status: 409 }
        );
      }
    } catch (findError) {
      console.error('Error checking existing user:', findError);
      return NextResponse.json(
        { success: false, message: 'Error checking user existence', error: findError instanceof Error ? findError.message : String(findError) },
        { status: 500 }
      );
    }
    
    // For store_admin role, check if an admin already exists
    if (role === ROLES.STORE_ADMIN) {
      try {
        const adminCount = await User.countDocuments({ role: ROLES.STORE_ADMIN });
        if (adminCount > 0) {
          return NextResponse.json(
            { success: false, message: 'An admin user already exists' },
            { status: 403 }
          );
        }
      } catch (countError) {
        console.error('Error counting admin users:', countError);
        return NextResponse.json(
          { success: false, message: 'Error checking admin existence', error: countError instanceof Error ? countError.message : String(countError) },
          { status: 500 }
        );
      }
    }
    
    try {
      // Create or get organization
      let organization: OrganizationDocument;
      
      if (role === ROLES.STORE_ADMIN) {
        // For admin, create a new organization
        try {
          console.log('Creating organization:', organizationName);
          organization = await Organization.create({
            name: organizationName || 'Default Organization',
            active: true,
            createdBy: null // Will update after user creation
          }) as OrganizationDocument;
          console.log('Organization created:', organization._id.toString());
        } catch (orgError) {
          console.error('Error creating organization:', orgError);
          // If organization creation fails, create a simplified version
          organization = await Organization.create({
            name: 'Default Organization',
            active: true
          }) as OrganizationDocument;
        }
      } else {
        // For staff, must provide organization ID
        if (!request.headers.get('Authorization')) {
          return NextResponse.json(
            { success: false, message: 'Authorization required to create staff accounts' },
            { status: 401 }
          );
        }
        
        // Get admin user from token (should be validated by middleware)
        const adminUser = await User.findOne({ email: request.headers.get('Admin-Email') });
        if (!adminUser || adminUser.role !== ROLES.STORE_ADMIN) {
          return NextResponse.json(
            { success: false, message: 'Only admins can create staff accounts' },
            { status: 403 }
          );
        }
        
        organization = await Organization.findById(adminUser.organization) as OrganizationDocument;
        if (!organization) {
          // If admin doesn't have an organization, create one
          organization = await Organization.create({
            name: 'Default Organization',
            active: true,
            createdBy: adminUser._id
          }) as OrganizationDocument;
          
          // Update admin user with the new organization
          adminUser.organization = organization._id;
          await adminUser.save();
        }
      }
      
      // Create the user
      const userData = {
        name,
        email: email.toLowerCase(),
        password, // Will be hashed by mongoose pre-save hook
        role: role || ROLES.SALES_OPERATOR,
        organization: organization._id,
        isActive: true,
        dataVisibility: role === ROLES.STORE_ADMIN ? 'all' : 'own',
        adminId: role === ROLES.SALES_OPERATOR || role === ROLES.SALES_PURCHASE_OPERATOR ? request.headers.get('Admin-ID') : null
      };
      
      console.log('Creating user:', { ...userData, password: '[REDACTED]' });
      
      // Create user and handle potential validation errors
      const user = await User.create(userData);
      console.log('User created successfully:', user._id.toString());
      
      // Update organization createdBy if this is an admin
      if (role === ROLES.STORE_ADMIN && organization) {
        organization.createdBy = user._id;
        await organization.save();
        console.log('Updated organization with creator ID');
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error creating user or organization:', error);
      if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation error', 
            errors: error.errors 
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during signup',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}