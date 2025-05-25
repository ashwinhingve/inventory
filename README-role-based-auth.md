# Hierarchical Role-Based Authentication System

This document provides an overview of the hierarchical role-based authentication system implemented in our application.

## Overview

The application implements a comprehensive role-based access control (RBAC) system with a clear hierarchy. This system ensures that users can only perform actions and access data appropriate for their role level and position in the organization hierarchy.

## Roles Hierarchy

The system defines the following roles in order of decreasing privilege:

1. **SUPER_ADMIN**: Complete system access with ability to manage organizations and other admins
2. **ADMIN**: Administration access with ability to manage all teams (except super admins)
3. **MANAGER**: Team management with delegated admin functions
4. **STAFF**: Standard operational access for day-to-day tasks
5. **VIEWER**: Read-only access to system data

Each role inherits all permissions from the roles below it.

## Key Concepts

### 1. Permissions

Each role has a predefined set of permissions that determine what actions they can perform:

```javascript
// From app/models/user.ts
export const PERMISSIONS = {
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // User permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // ... additional permissions
};
```

### 2. Management Hierarchy

The system uses several fields to track management relationships:

- **adminDomain**: References the admin who manages a user
- **managedStaff**: List of users managed by an admin/manager
- **managementPath**: String containing the full hierarchy path (comma-separated IDs)
- **createdBy**: The user who created this account

This creates a tree structure where:
- SUPER_ADMINs manage ADMINs
- ADMINs manage MANAGERs
- MANAGERs manage STAFF and VIEWERs

### 3. Data Visibility

Users have a `dataVisibility` property that controls their access scope:

- **own**: Only see their own data
- **store**: See data for assigned stores
- **admin_group**: See data for their admin domain
- **all**: See all data in the organization

## Implementation Details

### User Model

The core of the system is the User model, which contains role and permission definitions and important methods:

```javascript
// From app/models/user.ts
UserSchema.methods.hasPermission = function(permission) {
  return this.allPermissions.includes(permission);
};

// Method to check if user can access specific data
UserSchema.methods.canAccessData = function(dataOwnerId, dataStoreId, dataAdminDomainId, dataOrganizationId) {
  // Implementation that checks visibility and hierarchy
};

// Method to check if user can manage another user
UserSchema.methods.canManageUser = async function(targetUserId) {
  // Implementation that enforces hierarchy and permissions
};
```

### API Endpoints

1. **`app/api/auth/permissions/route.ts`**
   - Returns user permissions based on role and custom permissions
   - Used by the AccessControl component

2. **`app/api/auth/roles/route.ts`**
   - Returns available roles based on user's current role
   - Used by the RoleSelector component

3. **`app/api/users/route.ts`**
   - Implements CRUD operations for users
   - Enforces role-based access for listing, creating, updating, and deleting users

### UI Components

1. **`app/components/AccessControl.tsx`**
   - Client-side component for permission-based UI protection
   - Used to conditionally render UI elements based on user permissions

   Usage example:
   ```jsx
   <AccessControl permissions={['create_users']}>
     <button>Create New User</button>
   </AccessControl>
   ```

2. **`app/components/RoleSelector.tsx`**
   - Provides role selection based on the user's current role
   - Only shows roles that the current user is allowed to assign

3. **`app/components/UserCreationForm.tsx`**
   - Form for creating new users with role selection
   - Includes validation and permission checks

## Security Considerations

1. **Role Hierarchy Enforcement**: Users can only create accounts with roles lower than their own
2. **Organization Isolation**: Users can only access data within their organization
3. **Management Path Validation**: Users can only manage those below them in hierarchy
4. **Permission Checking**: Both client and server-side permission validation

## Usage

### Checking Permissions

```typescript
// In server components or API routes
import User from '@/models/user';
import { hasPermission } from '@/lib/userContext';

// Check if user has permission
const canCreateUser = await hasPermission(req, 'create_users');

// In client components
import { AccessControl } from '@/components/AccessControl';

// Render content only if user has permission
<AccessControl permissions={['edit_products']}>
  <EditProductForm />
</AccessControl>
```

### Managing Users

When creating a new user:

1. The created user inherits the creator's organization
2. The creator becomes the admin domain for the new user (if creator is an admin)
3. The management path is automatically generated
4. The user is added to the creator's managed staff list

### Role-Based UI

The UI adapts based on the user's role:

1. Navigation shows only accessible sections
2. Action buttons (create, edit, delete) are only shown for permitted operations
3. Data tables filter records based on visibility settings
4. Forms show/hide fields based on user permissions

## Troubleshooting

Common issues:

1. **Missing UI Elements**: If expected UI elements are missing, check that the user has the required permissions and that AccessControl components are used correctly.

2. **Permission Denied Errors**: Ensure the user has the appropriate role and permission. Check management hierarchy relationships.

3. **Data Visibility Issues**: Verify the dataVisibility setting and ensure organization, admin domain, and store assignments are correct. 