import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ROLES } from '@/models/user';

export async function GET() {
  try {
    // Connect to the database
    await connectToDB();
    
    console.log('Attempting to update MongoDB schema for User model...');
    
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json({
        success: false,
        message: 'MongoDB connection not ready',
        readyState: mongoose.connection.readyState
      }, { status: 500 });
    }
    
    // Get the User collection directly to bypass Mongoose validation
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'Database connection exists but db object is undefined'
      }, { status: 500 });
    }
    
    const usersCollection = db.collection('users');
    
    // Get available roles
    const validRoles = Object.values(ROLES);
    console.log('Valid roles:', validRoles);
    
    // Update MongoDB validation schema - this modifies the collection schema directly
    try {
      // Set role enum values directly in the database
      await db.command({
        collMod: 'users',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['email', 'password', 'role'],
            properties: {
              role: {
                enum: validRoles,
                description: 'Role must be one of the specified values'
              }
            }
          }
        },
        validationLevel: 'moderate'
      });
      
      console.log('Successfully updated MongoDB schema validation for users collection');
    } catch (schemaError) {
      console.error('Failed to update MongoDB schema:', schemaError);
      return NextResponse.json({
        success: false,
        message: 'Failed to update MongoDB schema',
        error: schemaError instanceof Error ? schemaError.message : String(schemaError)
      }, { status: 500 });
    }
    
    // Update all users with invalid roles
    const result = await usersCollection.updateMany(
      { role: { $nin: validRoles } },
      { $set: { role: 'sales_operator' } }
    );
    
    // Count users with specific roles
    const roleCounts: Record<string, number> = {};
    for (const role of validRoles) {
      const count = await usersCollection.countDocuments({ role });
      roleCounts[role] = count;
    }
    
    // If no users exist and schema was updated, try creating an owner user
    if (await usersCollection.countDocuments() === 0) {
      console.log('No users found, schema fix is ready for the first user registration.');
    }
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB schema updated successfully',
      modifiedCount: result.modifiedCount,
      roleCounts,
      validRoles
    });
  } catch (error) {
    console.error('Error updating schema:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 