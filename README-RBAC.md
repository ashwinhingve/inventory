# Role-Based Access Control (RBAC) System

This document provides detailed information about the Role-Based Access Control system implemented in the application.

## Role Hierarchy

The system defines the following roles in order of decreasing privilege:

1. **Owner**: Full system access with ability to manage all aspects of the application, including creating other roles.
2. **Store Admin**: Access to most operational aspects, excluding administrative, financial reporting, and certain inventory management features.
3. **Sales Purchase Operator**: Access to both sales and purchase operations.
4. **Sales Operator**: Limited access focused primarily on sales-related activities.

## Role Permissions

### Owner Role

The Owner role has full access to all pages and functionalities within the application:

- **All Pages**: Full access to dashboard, parties, all-entries, sales, purchases, inventory, accounting, reports, help, staff, and settings.
- **Special Permissions**: Ability to create and manage other user roles (Store Admin, Sales Operator, Sales Purchase Operator).
- **Administrative Access**: Can manage system settings, staff accounts, and view all reports.

### Store Admin Role

The Store Admin role has access to most operational aspects of the application:

- **Accessible Pages**: parties, all-entries, sales/invoice, sales/return, sales/payment-in, sales/orders, sales/quotes, purchase/invoice, purchase/return, purchase/orders, purchase/payment-out, inventory/stock, inventory/items, accounting/expense, help
- **Limited Access**: Cannot access dashboard, inventory/barcode, inventory/stores, accounting/cash-bank, reports, staff, settings
- **User Management**: Can create and manage Sales Operator and Sales Purchase Operator accounts.

### Sales Operator Role

The Sales Operator role focuses on sales-related activities:

- **Accessible Pages**: all-entries, sales/invoice, sales/return, sales/orders, sales/quotes, inventory/stock, help
- **Limited Access**: Cannot access dashboard, parties, sales/payment-in, purchase/*, inventory/items, inventory/barcode, inventory/stores, accounting/*, reports, staff, settings
- **User Management**: Cannot create user accounts.

### Sales Purchase Operator Role

The Sales Purchase Operator role handles both sales and purchase operations:

- **Accessible Pages**: all-entries, sales/invoice, sales/return, sales/orders, sales/quotes, purchase/invoice, purchase/return, purchase/orders, inventory/stock, help
- **Limited Access**: Cannot access dashboard, parties, sales/payment-in, purchase/payment-out, inventory/items, inventory/barcode, inventory/stores, accounting/*, reports, staff, settings
- **User Management**: Cannot create user accounts.

## Implementation Details

### User Model

The RBAC system is primarily implemented through the User model which includes:

- `role` field defining the user's role (owner, store_admin, sales_operator, sales_purchase_operator)
- Comprehensive permissions definitions for each role
- Methods to check if a user has specific permissions

### Access Control Mechanisms

Access control is implemented at multiple levels:

1. **Middleware**: Server-side protection for routes based on user role
2. **Component-Level Protection**: Client-side UI protection through AccessControl components
3. **API-Level Protection**: Server-side API protection checking user permissions before performing actions

### Default Owner Account

The system creates a default owner account upon initial setup:

- **Email**: owner@example.com
- **Password**: defaultOwnerPassword (configurable through environment variable)

To set up the default owner account:
1. Navigate to `/setup` in your browser
2. Follow the prompts to create the default owner account
3. Log in with the default credentials
4. **Important**: Change the default password immediately after logging in

## Managing Users and Roles

### Creating Users

1. Only Owner and Store Admin roles can create other users
2. Navigate to Staff/Users section (accessible only to authorized roles)
3. Click "Add User" button
4. Fill in user details and select appropriate role
5. The available roles will depend on your current role:
   - Owners can create any role
   - Store Admins can only create Sales Operators and Sales Purchase Operators

### Modifying User Roles

1. Navigate to the user's profile
2. Use the role dropdown to select a new role (only available to users with appropriate permissions)
3. Save the changes

### Role Permissions

The permissions for each role are pre-defined and cannot be modified on a per-user basis. This ensures consistency and security in the role-based system.

## Error Handling

When a user attempts to access a page or resource they don't have permission for:

1. **Page Access**: User is redirected to the dashboard with an "access denied" message
2. **Component Access**: Protected UI elements are not rendered
3. **API Access**: API returns a 403 Forbidden status code with an appropriate error message

## Technical Implementation

The RBAC system is integrated into various parts of the application:

- **Middleware**: `middleware.ts` implements route-based access control
- **Components**: `AccessControl.tsx` and `DirectPermissionCheck.tsx` implement UI-level access control
- **API Routes**: Permission checks in API route handlers
- **User Model**: Role and permission definitions in the database schema

## Security Considerations

- Role checks are performed on both client and server side
- All role-based routes are protected by middleware
- Access tokens include user role information 
- User permissions are re-validated on every request that requires authorization

## Extending the System

To add new roles or modify existing ones:

1. Update the `ROLES` object in `models/user.ts`
2. Define the permissions for the new role in the `rolePermissions` mapping
3. Update the `pageAccessByRole` mapping in `middleware.ts`
4. Update any role-based UI components to handle the new role

## Troubleshooting

Common issues:

1. **"Access Denied" Errors**: Verify the user has the correct role assigned and that the role has the necessary permissions.
2. **Missing UI Elements**: Check if the UI element is properly wrapped with an AccessControl component and that the user's role has the required permissions.
3. **API Permission Errors**: Ensure the API endpoint is checking for the correct permissions and that the user's role includes those permissions. 