'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Extend the Session type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface AccessControlProps {
  permissions?: string[];
  roles?: string[];  // Added support for role-based access
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;  // For multiple permissions/roles, require all or any
}

const AccessControl = ({ 
  permissions = [], 
  roles = [],
  children, 
  fallback = null, 
  requireAll = false 
}: AccessControlProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // If authentication is still loading, wait
        if (status === 'loading') {
          return;
        }

        // If not authenticated, deny access
        if (status === 'unauthenticated') {
          console.log('User is not authenticated');
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // If no permissions or roles are specified, allow access
        if (permissions.length === 0 && roles.length === 0) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Get user role from session
        const userRole = (session?.user as ExtendedUser)?.role || '';
        
        // Log detailed session information
        console.log('Session details:', {
          sessionExists: !!session,
          userExists: !!session?.user,
          userRole: userRole,
          requiredRoles: roles,
          roleMatch: roles.some(role => userRole.toLowerCase() === role.toLowerCase())
        });
        
        // Always grant access to owner and store admin users - try case-insensitive match
        if (userRole.toLowerCase() === 'owner' || userRole.toLowerCase() === 'store_admin') {
          console.log(`User is ${userRole}, granting access`);
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Fetch detailed permissions from API
        const response = await fetch('/api/auth/permissions');
        
        if (!response.ok) {
          console.error('Failed to fetch user permissions:', response.status, response.statusText);
          setHasAccess(false);
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (!data.success) {
          console.error('Failed to get user permissions:', data.error);
          setHasAccess(false);
          setLoading(false);
          return;
        }
        
        const userPermissions = data.permissions || [];
        
        // Debug log
        console.log('AccessControl check:', {
          requiredPermissions: permissions,
          requiredRoles: roles,
          userPermissions: userPermissions.length > 10 ? `${userPermissions.length} permissions` : userPermissions,
          userRole
        });
        
        // Check permissions if specified
        let hasPermission = true;
        if (permissions.length > 0) {
          hasPermission = requireAll
            ? permissions.every(permission => userPermissions.includes(permission))
            : permissions.some(permission => userPermissions.includes(permission));
        }
        
        // Check roles if specified - case insensitive comparison
        let hasRole = true;
        if (roles.length > 0) {
          hasRole = roles.some(role => 
            role.toLowerCase() === userRole.toLowerCase()
          );
        }
        
        // Final access is determined by both permission and role checks
        const access = (roles.length === 0 || hasRole) && (permissions.length === 0 || hasPermission);
        
        console.log('Access decision:', { 
          hasPermission, 
          hasRole, 
          finalAccess: access
        });
        
        setHasAccess(access);
        
        // If access is denied and no fallback is provided, redirect to dashboard
        if (!access && !fallback) {
          router.push('/dashboard?access=denied');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [permissions, roles, requireAll, fallback, router, session, status]);

  // While loading, return null or a loading indicator
  if (loading) {
    return null;
  }

  // Render children only if user has access
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default AccessControl; 