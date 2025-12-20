import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/user';
import { ROLES } from '@/models/user';

export async function GET() {
    try {
        await connectToDatabase();

        // Check if any admin user exists
        const adminCount = await User.countDocuments({ role: ROLES.STORE_ADMIN });

        return NextResponse.json({
            success: true,
            adminExists: adminCount > 0,
            count: adminCount
        });
    } catch (error) {
        console.error('Error checking for admin:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error checking for admin user',
                error: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
