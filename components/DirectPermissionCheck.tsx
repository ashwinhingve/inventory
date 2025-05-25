'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface DirectPermissionCheckProps {
  permission: string;
  children: ReactNode;
}

export default function DirectPermissionCheck({ permission, children }: DirectPermissionCheckProps) {
  const { status } = useSession();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (status !== 'authenticated') {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      try {
        // Call the permissions API directly
        const response = await fetch('/api/auth/permissions');
        
        // Check for non-200 response status
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned error ${response.status}: ${errorText}`);
          setError(`Server returned ${response.status} ${response.statusText}. This may be due to a server error or network issue.`);
          setHasPermission(false);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();

        console.log(`DirectPermissionCheck: Checking for permission '${permission}'`, data);
        
        if (data.success) {
          // If user is owner or store_admin, always grant access
          if (data.isOwner || data.isStoreAdmin) {
            console.log('User is owner or store_admin, granting access');
            setHasPermission(true);
          } else {
            // Otherwise check specific permission
            const hasRequiredPermission = data.permissions.includes(permission);
            console.log(`Permission check result: ${hasRequiredPermission}`);
            setHasPermission(hasRequiredPermission);
          }
        } else {
          setError('Failed to fetch permissions');
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        setError('Failed to check permission');
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [permission, status]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return hasPermission ? <>{children}</> : null;
} 