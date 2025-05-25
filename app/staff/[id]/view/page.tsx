'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
import AccessControl from '@/components/AccessControl';
import GoBack from '@/components/GoBack';
import { useParams } from 'next/navigation';

// Define permissions
const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
};

// Define roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
};

// Define staff interface
interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function ViewStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { isLoading, setLoading } = useStore();
  
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [confirmDelete, setConfirmDelete] = useState(false);
  // const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Fetch role from permissions endpoint
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const response = await fetch('/api/auth/permissions');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Role is fetched but not used, so we can remove this effect
          }
        }
      } catch (error) {
        console.error('Error fetching current user role:', error);
      }
    };
    
    fetchCurrentUserRole();
  }, []);
  
  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/users/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setStaff(data.user);
        } else {
          setError(data.error || 'Failed to fetch user data');
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
          const errorObj = error as ErrorResponse;
          setError(errorObj.message || 'An error occurred while fetching staff details');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUser();
    }
  }, [id, setLoading]);
  
  const handleToggleStatus = async () => {
    if (!staff) return;
    
    if (!confirm(`Are you sure you want to ${staff.isActive ? 'deactivate' : 'activate'} this account?`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !staff.isActive
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update staff status');
      }
      
      toast.success('Staff status updated successfully');
      setStaff(data.user);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        setError(errorObj.message || 'An error occurred while updating staff details');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!staff) return;
    
    if (!confirm(`Are you sure you want to reset the password for ${staff.name}? They will receive an email with instructions.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/${id}/reset-password`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      // Display the temporary password in development mode
      if (data.tempPassword) {
        toast.success(`Password reset for ${staff.name}. Temporary password: ${data.tempPassword}`);
      } else {
        toast.success(`Password reset link sent to ${staff.name}`);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        setError(errorObj.message || 'An error occurred while resetting password');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteStaff = async () => {
    if (!staff) return;
    
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete staff member');
      }
      
      toast.success('Staff member deleted successfully');
      router.push('/staff');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        setError(errorObj.message || 'An error occurred while deleting staff member');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format role for display
  // const formatRole = (role: string) => {
  //   return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  // };
  
  // Helper function to get the role badge color
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case ROLES.SUPER_ADMIN:
        return 'bg-purple-100 text-purple-800';
      case ROLES.ADMIN:
        return 'bg-red-100 text-red-800';
      case ROLES.MANAGER:
        return 'bg-blue-100 text-blue-800';
      case ROLES.STAFF:
        return 'bg-green-100 text-green-800';
      case ROLES.VIEWER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to format role display name
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.ADMIN:
        return 'Administrator';
      case ROLES.MANAGER:
        return 'Manager';
      case ROLES.STAFF:
        return 'Staff';
      case ROLES.VIEWER:
        return 'Viewer';
      default:
        return role;
    }
  };
  
  // No-permission UI fallback
  const NoPermissionFallback = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You don&apos;t have permission to view staff details.
            Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <Layout>
      <AccessControl 
        permissions={[PERMISSIONS.VIEW_USERS]}
        fallback={<NoPermissionFallback />}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GoBack label="Back to Staff List" />
              <h1 className="text-2xl font-bold text-gray-900">Staff Details</h1>
            </div>
            
            {staff && (
              <div className="flex space-x-2">
                <AccessControl permissions={[PERMISSIONS.EDIT_USERS]}>
                  <Link
                    href={`/staff/${id}/edit`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleResetPassword}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Reset Password
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      staff.isActive 
                        ? 'border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 focus:ring-orange-500' 
                        : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-500'
                    }`}
                  >
                    {staff.isActive ? (
                      <>
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </button>
                </AccessControl>
                <AccessControl permissions={[PERMISSIONS.DELETE_USERS]}>
                  <button
                    onClick={handleDeleteStaff}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </AccessControl>
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : staff ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {staff.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {staff.email}
                  </p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(staff.role)}`}>
                        {getRoleDisplayName(staff.role)}
                      </span>
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {staff.phone || 'Not specified'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {staff.lastActive ? formatDate(staff.lastActive) : 'Never'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(staff.createdAt)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(staff.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">Staff member not found</p>
            </div>
          )}
        </div>
      </AccessControl>
    </Layout>
  );
} 