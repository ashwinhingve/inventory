// Script to reset admin password
// Run this with: node reset-admin-password.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection string from your .env.local
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

// User schema (simplified version)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    organization: mongoose.Schema.Types.ObjectId,
    isActive: Boolean,
    dataVisibility: String
});

const User = mongoose.model('User', userSchema);

async function resetAdminPassword() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const admin = await User.findOne({ role: 'store_admin' });

        if (!admin) {
            console.log('❌ No admin user found in database');
            await mongoose.connection.close();
            return;
        }

        console.log(`\n📧 Admin found: ${admin.email}`);
        console.log(`👤 Name: ${admin.name}`);

        // Set new password
        const newPassword = 'Admin123!'; // You can change this
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        console.log('\n✅ Password reset successfully!');
        console.log('\n📝 New login credentials:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${newPassword}`);
        console.log('\n⚠️  Please change this password after logging in!');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

resetAdminPassword();
