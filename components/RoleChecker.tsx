'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface PermissionData {
  success: boolean;
  role?: string;
  isStoreAdmin?: boolean;
  permissions?: string[];
  error?: string;
}

interface SessionUser {
  name?: string;
  email?: string;
  role?: string;
}

export default function RoleChecker() {
  const { data: session, status } = useSession();
  const [permissionData, setPermissionData] = useState<PermissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        console.log('Fetching permissions data...');
        const response = await fetch('/api/auth/permissions');
        
        setResponseStatus(response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API returned error ${response.status}: ${errorText}`);
          setError(`Server returned ${response.status} ${response.statusText}`);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('Permissions data received:', data);
        
        if (!data.success) {
          setError(data.error || 'API returned unsuccessful response');
          setIsLoading(false);
          return;
        }
        
        setPermissionData(data);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        const err = error as Error; 
        setError(err.message || 'Failed to fetch permissions data');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkPermissions();
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return <div className="p-2 bg-gray-100 rounded mb-4">Loading user info...</div>;
  }

  if (status !== 'authenticated') {
    return <div className="p-2 bg-red-100 rounded mb-4">Not authenticated</div>;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-md mb-4 border border-blue-200 text-gray-800">
      <h3 className="font-medium text-lg mb-2 text-blue-800">User Permission Debug</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="font-semibold">Session Status:</div>
        <div>{status}</div>
        
        <div className="font-semibold">User:</div>
        <div>{session?.user?.name || 'Unknown'}</div>
        
        <div className="font-semibold">Email:</div>
        <div>{session?.user?.email || 'Unknown'}</div>
        
        <div className="font-semibold">Session Role:</div>
        <div className="font-medium">{(session?.user as SessionUser)?.role || 'None'}</div>
        
        {permissionData && (
          <>
            <div className="font-semibold">API Role:</div>
            <div className="font-medium">{permissionData.role || 'None'}</div>
            
            <div className="font-semibold">Is Store Admin:</div>
            <div className={permissionData.isStoreAdmin ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {permissionData.isStoreAdmin ? 'Yes' : 'No'}
            </div>
            
            <div className="font-semibold">Permissions Count:</div>
            <div>{permissionData.permissions?.length || 0}</div>
            
            <div className="font-semibold">Can Create Users:</div>
            <div className={permissionData.permissions?.includes('create_users') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {permissionData.permissions?.includes('create_users') ? 'Yes' : 'No'}
            </div>
            
            {!permissionData.permissions?.includes('create_users') && permissionData.role === 'store_admin' && (
              <div className="col-span-2 mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                Warning: You have the Store Admin role but lack the create_users permission. This is unexpected.
              </div>
            )}
          </>
        )}
        
        {error && (
          <div className="col-span-2 mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-800">
            <p className="font-medium mb-1">Error: {error}</p>
            <p className="text-sm">Response Status: {responseStatus || 'N/A'}</p>
            <p className="text-sm mt-2">
              This could be due to a network issue, invalid session, or server-side error. 
              Try refreshing the page or logging out and back in.
            </p>
          </div>
        )}
        
        {!permissionData && !error && (
          <div className="col-span-2 mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
            No permission data was returned from the API.
          </div>
        )}
      </div>
    </div>
  );
} 