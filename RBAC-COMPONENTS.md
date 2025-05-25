
# Role-Based Authentication Components

This document lists the components created for implementing the hierarchical role-based authentication system.

## API Endpoints

### 1. `/app/api/auth/roles/route.ts`

This endpoint returns available roles based on the current user's role level. Users can only assign roles that are below their own role in the hierarchy.

**Example Response:**
```json
{
  "success": true,
  "roles": ["manager", "staff", "viewer"],
  "currentUserRole": "admin",
  "hasCreateUserPermission": true
}
```

### 2. `/app/api/auth/permissions/route.ts`

This endpoint returns the user's current permissions based on their role and any custom permissions assigned to them. It's used by the AccessControl component to protect UI elements.

**Example Response:**
```json
{
  "success": true,
  "permissions": ["view_inventory", "manage_inventory", "view_users", "create_users"],
  "role": "admin"
}
```

## UI Components

### 1. `RoleSelector` Component (`/app/components/RoleSelector.tsx`)

A reusable component for selecting user roles, which dynamically fetches and displays only the roles that the current user is allowed to assign.

**Usage:**
```jsx
import RoleSelector from '@/components/RoleSelector';

<RoleSelector 
  value={selectedRole}
  onChange={handleRoleChange}
  disabled={loading}
  error={errors.role}
/>
```

**Props:**
- `value`: The currently selected role
- `onChange`: Function to call when a role is selected
- `disabled`: Whether the selector is disabled
- `required`: Whether a selection is required
- `className`: Additional CSS classes
- `label`: Custom label text
- `hideLabel`: Whether to hide the label
- `defaultOption`: Text for the default option
- `error`: Error message to display

### 2. `RoleBasedLoginForm` Component (`/app/components/RoleBasedLoginForm.tsx`)

A login form component with role-based information display, helping users understand the different roles in the system.

**Usage:**
```jsx
import RoleBasedLoginForm from '@/components/RoleBasedLoginForm';

<RoleBasedLoginForm 
  onLogin={handleLogin}
  loading={loading}
  error={error}
/>
```

**Props:**
- `onLogin`: Function to call when the form is submitted with (email, password, rememberMe)
- `loading`: Whether the form is in a loading state
- `error`: Error message to display

### 3. `UserCreationForm` Component (`/app/components/UserCreationForm.tsx`)

A form for creating new users with appropriate roles and permissions.

**Usage:**
```jsx
import UserCreationForm from '@/components/UserCreationForm';

<UserCreationForm />
```

This component:
- Validates user input
- Shows only appropriate roles for selection
- Sets default data visibility
- Handles the API call to create the user
- Manages form submission state

### 4. `AccessControl` Component (Existing but important)

A component that protects UI elements based on user permissions.

**Usage:**
```jsx
import AccessControl from '@/components/AccessControl';

<AccessControl 
  permissions={['create_users']}
  fallback={<AccessDeniedMessage />}
  redirectTo="/dashboard"
>
  <ProtectedComponent />
</AccessControl>
```

**Props:**
- `permissions`: Array of permission strings required to access the content
- `fallback`: Component to render if the user doesn't have permission
- `redirectTo`: URL to redirect to if no fallback is provided
- `children`: Content to render if the user has permission

## Pages

### 1. Staff Creation Page (`/app/staff/new/page.tsx`)

A page for creating new staff members with role-based permissions. This page:
- Uses the AccessControl component to check for the CREATE_USERS permission
- Shows an access denied message if the user doesn't have permission
- Uses the UserCreationForm component for creating the user

## Integration with Existing Code

### User Model

The existing User model (`/app/models/user.ts`) already contains:
- Role definitions
- Permission definitions
- Role-permission mappings
- Methods for checking permissions
- Methods for checking data access
- Methods for checking user management permissions

### Middleware

The middleware (`/middleware.ts`) handles:
- Checking for authenticated paths
- Verifying user tokens
- Redirecting unauthenticated users to the login page

## Usage Guide

### Creating a Protected Page

```jsx
import AccessControl from '@/components/AccessControl';

// Define permissions locally to avoid import issues
const PERMISSIONS = {
  VIEW_INVENTORY: 'view_inventory'
};

export default function InventoryPage() {
  return (
    <AccessControl
      permissions={[PERMISSIONS.VIEW_INVENTORY]}
      fallback={<AccessDeniedMessage />}
      redirectTo="/dashboard"
    >
      <div>
        {/* Protected content */}
      </div>
    </AccessControl>
  );
}
```

### Creating Users with Different Roles

1. Navigate to `/staff/new`
2. Fill out the user creation form
3. Select an appropriate role based on your own role level
4. Set the data visibility
5. Submit the form

### Implementing Role-Based UI

Use the AccessControl component to conditionally render UI elements:

```jsx
<div>
  {/* Always visible content */}
  
  <AccessControl permissions={['manage_inventory']}>
    <button>Add Inventory Item</button>
  </AccessControl>
  
  <AccessControl permissions={['view_reports']}>
    <ReportsSection />
  </AccessControl>
</div>
```

## Troubleshooting

1. **User can't create accounts with certain roles:**
   - Check the user's own role level
   - Only users with higher roles can create users with lower roles

2. **AccessControl component not working:**
   - Check that the permissions endpoint is returning the correct permissions
   - Verify that the permission strings match exactly

3. **Role selector not showing roles:**
   - Check that the roles endpoint is being called correctly
   - Verify that the current user has the CREATE_USERS permission 