'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AccessControlProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * AccessControl component for handling permission-based access control
 * 
 * @param children - The content to render if user has permission
 * @param permissions - Array of permission strings that grant access
 * @param roles - Array of role strings that grant access
 * @param fallback - Optional content to render if user doesn't have permission (instead of redirecting)
 * @param redirectTo - Optional path to redirect to if user doesn't have permission
 */
export default function AccessControl({
  children,
  permissions = [],
  roles = [],
  fallback,
  redirectTo = '/dashboard'
}: AccessControlProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // If not authenticated, don't have access
      if (status === 'unauthenticated') {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // If still loading session, wait
      if (status === 'loading') {
        return;
      }

      // If no permissions or roles required, grant access
      if (permissions.length === 0 && roles.length === 0) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user role matches any required roles
        if (roles.length > 0 && session?.user?.role) {
          const userRole = session.user.role as string;
          
          // Owner and Store Admin have full access
          if (userRole === 'owner' || userRole === 'store_admin') {
            setHasAccess(true);
            setIsLoading(false);
            return;
          }
          
          if (roles.includes(userRole)) {
            setHasAccess(true);
            setIsLoading(false);
            return;
          }
        }

        // If role check failed or no roles specified, check permissions
        if (permissions.length > 0) {
          // Fetch user permissions from API
          const response = await fetch('/api/auth/permissions');
          
          if (!response.ok) {
            throw new Error('Failed to fetch permissions');
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to fetch permissions');
          }
          
          // Check if user has any of the required permissions
          const userPermissions = data.permissions || [];
          const hasAnyPermission = permissions.some(permission => 
            userPermissions.includes(permission)
          );
          
          setHasAccess(hasAnyPermission);
        } else {
          // If we got here, it means we have role requirements but the user's role doesn't match
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [permissions, roles, status, session]);

  // Show nothing while checking permissions
  if (isLoading) {
    return null;
  }

  // Redirect if no access and no fallback
  if (!hasAccess && !fallback && redirectTo) {
    if (typeof window !== 'undefined') {
      router.push(redirectTo);
    }
    return null;
  }

  // Show fallback if no access and fallback provided
  if (!hasAccess && fallback) {
    return <>{fallback}</>;
  }

  // Show children if has access
  return <>{children}</>;
} 