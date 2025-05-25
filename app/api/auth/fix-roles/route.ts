import { NextResponse } from 'next/server';
import { ROLES } from '@/models/user';
import User from '@/models/user';
import { connectToDB } from '@/lib/mongodb';

/**
 * This endpoint will fix any issues with user roles in the database.
 * It should only be used during development or as a one-time fix.
 */
export async function GET() {
  try {
    await connectToDB();
    
    console.log('Fixing user roles...');
    console.log('Valid roles are:', Object.values(ROLES));
    
    // Find all users with invalid roles
    const users = await User.find({});
    const fixedUsers = [];
    
    for (const user of users) {
      console.log(`Checking user ${user.email} with role: ${user.role}`);
      
      // Check if this user's role is in the valid roles
      if (!Object.values(ROLES).includes(user.role)) {
        const oldRole = user.role;
        
        // If this is the first user, make them owner
        if (user._id.toString() === users[0]._id.toString()) {
          user.role = ROLES.OWNER;
        } else {
          // Default to sales operator
          user.role = ROLES.SALES_OPERATOR;
        }
        
        // Save the user with the new role
        await user.save();
        fixedUsers.push({
          email: user.email,
          oldRole,
          newRole: user.role
        });
        
        console.log(`Fixed user ${user.email}: ${oldRole} -> ${user.role}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedUsers.length} users with invalid roles`,
      fixedUsers,
      validRoles: Object.values(ROLES)
    });
  } catch (error) {
    console.error('Fix roles error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 