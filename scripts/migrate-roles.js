/**
 * Role Migration Script
 * 
 * This script migrates users from the old role system to the new role system.
 * It should be run once after deploying the new role system changes.
 * 
 * Usage: 
 * 1. Make sure MongoDB connection variables are properly set in your .env file
 * 2. Run the script with: node scripts/migrate-roles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Define the old and new roles
const OLD_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  INVENTORY_MANAGER: 'inventory_manager',
  SALES_ASSOCIATE: 'sales_associate',
  CASHIER: 'cashier',
  ACCOUNTANT: 'accountant',
  VIEWER: 'viewer',
  STAFF: 'staff',
  USER: 'user'
};

const NEW_ROLES = {
  STORE_ADMIN: 'store_admin',
  SALES_OPERATOR: 'sales_operator',
  SALES_PURCHASE_OPERATOR: 'sales_purchase_operator',
};

// Role mapping from old to new
const ROLE_MAPPING = {
  [OLD_ROLES.ADMIN]: NEW_ROLES.STORE_ADMIN,
  [OLD_ROLES.MANAGER]: NEW_ROLES.STORE_ADMIN,
  [OLD_ROLES.INVENTORY_MANAGER]: NEW_ROLES.SALES_PURCHASE_OPERATOR,
  [OLD_ROLES.SALES_ASSOCIATE]: NEW_ROLES.SALES_OPERATOR,
  [OLD_ROLES.CASHIER]: NEW_ROLES.SALES_OPERATOR,
  [OLD_ROLES.ACCOUNTANT]: NEW_ROLES.SALES_PURCHASE_OPERATOR,
  [OLD_ROLES.VIEWER]: NEW_ROLES.SALES_OPERATOR,
  [OLD_ROLES.STAFF]: NEW_ROLES.SALES_OPERATOR,
  [OLD_ROLES.USER]: NEW_ROLES.SALES_OPERATOR
};

async function migrateRoles() {
  try {
    // Load User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      adminId: mongoose.Schema.Types.ObjectId,
    }));

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    // Create a log of the migration
    const migrationLog = [];

    // First pass: set adminIds for admin users to their own IDs
    // and create a map of admin users
    const adminUsers = {};
    for (const user of users) {
      if (user.role === OLD_ROLES.ADMIN || user.role === OLD_ROLES.MANAGER) {
        adminUsers[user._id.toString()] = true;
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              adminId: user._id,
              role: NEW_ROLES.STORE_ADMIN 
            } 
          }
        );
        
        migrationLog.push({
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          oldRole: user.role,
          newRole: NEW_ROLES.STORE_ADMIN,
          adminId: user._id.toString()
        });
        
        console.log(`Migrated admin user: ${user.email} (${user._id}) from ${user.role} to ${NEW_ROLES.STORE_ADMIN}`);
      }
    }

    // Second pass: handle non-admin users
    // If a user doesn't have an adminId, assign them to the first admin user
    let defaultAdminId = null;
    if (Object.keys(adminUsers).length > 0) {
      defaultAdminId = Object.keys(adminUsers)[0];
    } else {
      // If there are no admin users, create one
      const newAdmin = await User.create({
        name: 'System Admin',
        email: 'admin@system.com', // This should be changed after migration
        password: 'change_me_immediately', // This should be changed after migration
        role: NEW_ROLES.STORE_ADMIN
      });
      
      await User.updateOne(
        { _id: newAdmin._id },
        { $set: { adminId: newAdmin._id } }
      );
      
      defaultAdminId = newAdmin._id.toString();
      console.log(`Created a default admin user with ID: ${defaultAdminId}`);
    }

    // Migrate the rest of the users
    for (const user of users) {
      if (user.role !== OLD_ROLES.ADMIN && user.role !== OLD_ROLES.MANAGER) {
        const newRole = ROLE_MAPPING[user.role] || NEW_ROLES.SALES_OPERATOR;
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              role: newRole,
              adminId: user.adminId || defaultAdminId
            } 
          }
        );
        
        migrationLog.push({
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          oldRole: user.role,
          newRole: newRole,
          adminId: (user.adminId || defaultAdminId).toString()
        });
        
        console.log(`Migrated user: ${user.email} (${user._id}) from ${user.role} to ${newRole}`);
      }
    }

    // Write migration log to file
    fs.writeFileSync(
      'roles-migration-log.json',
      JSON.stringify(migrationLog, null, 2)
    );

    console.log('Migration completed successfully');
    console.log(`Migration log written to roles-migration-log.json`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
connectToDatabase()
  .then(() => migrateRoles())
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 