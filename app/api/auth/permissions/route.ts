import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User, { PERMISSIONS, ROLES } from '@/models/user';

// API endpoint to get user permissions based on their role
export async function GET(request: NextRequest) {
  try {
    // Add CORS headers
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.append('Cache-Control', 'no-store, max-age=0');
    
    // Handle OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers });
    }

    // Check if user is authenticated - use request parameter for the server side
    const session = await getServerSession(authOptions);
    
    // Debug the session to see what's being returned
    console.log('User session:', session);
    console.log('User email:', session?.user?.email);
    
    if (!session || !session.user) {
      console.error('Unauthorized: No valid session found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No valid session' },
        { status: 401, headers }
      );
    }

    // Make sure we have an email to work with
    if (!session.user.email) {
      console.error('Unauthorized: No email in session');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No email in session' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Find the user by email
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      console.error(`User not found in database: ${session.user.email}`);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }
    
    console.log('User found in database:', {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isOwner: user.role === ROLES.OWNER,
      isStoreAdmin: user.role === ROLES.STORE_ADMIN
    });
    
    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();
    
    // Create a helper function to get all permissions for a role
    const getPermissionsForRole = (role: string) => {
      // Role-based permission mapping
      const rolePermissions = {
        // Owner has full access to everything
        [ROLES.OWNER]: Object.values(PERMISSIONS),
        
        // Store Admin permissions
        [ROLES.STORE_ADMIN]: [
          // Primary access permissions
          PERMISSIONS.VIEW_PARTIES, PERMISSIONS.MANAGE_PARTIES,
          PERMISSIONS.VIEW_ALL_ENTRIES,
          
          // Sales permissions
          PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES, PERMISSIONS.DELETE_SALES,
          PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
          PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
          PERMISSIONS.VIEW_SALES_PAYMENT_IN, PERMISSIONS.MANAGE_SALES_PAYMENT_IN,
          PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
          PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
          
          // Purchase permissions
          PERMISSIONS.VIEW_PURCHASES, PERMISSIONS.CREATE_PURCHASES, PERMISSIONS.EDIT_PURCHASES, PERMISSIONS.DELETE_PURCHASES,
          PERMISSIONS.VIEW_PURCHASE_INVOICE, PERMISSIONS.MANAGE_PURCHASE_INVOICE,
          PERMISSIONS.VIEW_PURCHASE_RETURN, PERMISSIONS.MANAGE_PURCHASE_RETURN,
          PERMISSIONS.VIEW_PURCHASE_ORDERS, PERMISSIONS.MANAGE_PURCHASE_ORDERS,
          PERMISSIONS.VIEW_PURCHASE_PAYMENT_OUT, PERMISSIONS.MANAGE_PURCHASE_PAYMENT_OUT,
          
          // Inventory permissions
          PERMISSIONS.VIEW_STOCK, PERMISSIONS.MANAGE_STOCK,
          PERMISSIONS.VIEW_ITEMS, PERMISSIONS.MANAGE_ITEMS,
          
          // Accounting permissions
          PERMISSIONS.VIEW_EXPENSES, PERMISSIONS.MANAGE_EXPENSES,
          
          // Help permissions
          PERMISSIONS.VIEW_HELP,
          
          // User permissions
          PERMISSIONS.VIEW_USERS, PERMISSIONS.CREATE_USERS, PERMISSIONS.EDIT_USERS, PERMISSIONS.DELETE_USERS,
        ],
        
        // Sales Operator permissions
        [ROLES.SALES_OPERATOR]: [
          // Primary access permissions
          PERMISSIONS.VIEW_ALL_ENTRIES,
          
          // Sales permissions
          PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES,
          PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
          PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
          PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
          PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
          
          // Inventory permissions
          PERMISSIONS.VIEW_STOCK,
          
          // Help permissions
          PERMISSIONS.VIEW_HELP,
        ],
        
        // Sales Purchase Operator permissions
        [ROLES.SALES_PURCHASE_OPERATOR]: [
          // Primary access permissions
          PERMISSIONS.VIEW_ALL_ENTRIES,
          
          // Sales permissions
          PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES,
          PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
          PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
          PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
          PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
          
          // Purchase permissions
          PERMISSIONS.VIEW_PURCHASES, PERMISSIONS.CREATE_PURCHASES, PERMISSIONS.EDIT_PURCHASES,
          PERMISSIONS.VIEW_PURCHASE_INVOICE, PERMISSIONS.MANAGE_PURCHASE_INVOICE,
          PERMISSIONS.VIEW_PURCHASE_RETURN, PERMISSIONS.MANAGE_PURCHASE_RETURN,
          PERMISSIONS.VIEW_PURCHASE_ORDERS, PERMISSIONS.MANAGE_PURCHASE_ORDERS,
          
          // Inventory permissions
          PERMISSIONS.VIEW_STOCK,
          
          // Help permissions
          PERMISSIONS.VIEW_HELP,
        ]
      };
      
      return rolePermissions[role] || [];
    };
    
    // Get permissions for the user's role
    const permissions = getPermissionsForRole(user.role);
    
    // Debug log to verify permissions
    console.log(`User permissions for ${user.email} (${user.role}):`, {
      permissionsCount: permissions.length,
      hasViewUsers: permissions.includes(PERMISSIONS.VIEW_USERS),
      hasCreateUsers: permissions.includes(PERMISSIONS.CREATE_USERS),
      role: user.role
    });
    
    // Add cache control headers to prevent caching of permissions
    return NextResponse.json({
      success: true,
      permissions,
      role: user.role,
      isOwner: user.role === ROLES.OWNER,
      isStoreAdmin: user.role === ROLES.STORE_ADMIN
    }, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    
    // Add CORS headers to error response
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.append('Cache-Control', 'no-store, max-age=0');
    
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch permissions: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500, headers }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new NextResponse(null, { status: 204, headers });
} 