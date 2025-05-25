'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
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
import { useSession } from 'next-auth/react';
import ClientAuthProvider from '@/components/ClientAuthProvider';

// Extend the Session type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

// Define permissions
const PERMISSIONS = {
  // User/Staff permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
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
}

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function StaffManagementPage() {
  const { isLoading, setLoading } = useStore();
  const { data: session, status } = useSession();
  
  // Check if user is admin directly
  const isAdmin = (session?.user as ExtendedUser)?.role === 'admin';
  
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [limit] = useState(10);

  // Available roles
  const [roles, setRoles] = useState<string[]>(['all']);
  
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      // Add pagination
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      const response = await fetch(`/api/staff?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch staff members');
      }
      
      setFilteredStaff(data.users);
      setRoles(['all', ...data.roles]);
      setTotalPages(data.pagination.pages);
      setTotalStaff(data.pagination.total);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        console.error('Error fetching staff:', errorObj);
        toast.error('Failed to load staff data: ' + errorObj.message);
      } else {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff data');
      }
    } finally {
      setLoading(false);
    }
  }, [setLoading, searchTerm, roleFilter, statusFilter, currentPage, limit]);
  
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);
  
  const handleDeleteStaff = async (id: string) => {
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
      fetchStaff(); // Refresh the staff list
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        console.error('Error deleting staff member:', errorObj);
        toast.error('Failed to delete staff member: ' + errorObj.message);
      } else {
        console.error('Error deleting staff member:', error);
        toast.error('Failed to delete staff member');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
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
      fetchStaff(); // Refresh the staff list
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        console.error('Error updating staff status:', errorObj);
        toast.error('Failed to update staff status: ' + errorObj.message);
      } else {
        console.error('Error updating staff status:', error);
        toast.error('Failed to update staff status');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reset the password for ${name}? They will receive an email with instructions.`)) {
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
        toast.success(`Password reset for ${name}. Temporary password: ${data.tempPassword}`);
      } else {
        toast.success(`Password reset link sent to ${name}`);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        console.error('Error resetting password:', errorObj);
        toast.error('Failed to reset password: ' + errorObj.message);
      } else {
        console.error('Error resetting password:', error);
        toast.error('Failed to reset password');
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
  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
            You don&apos;t have permission to access the staff management page.
            Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
  
  // If loading session, show loading state
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  // If admin, allow access directly
  if (isAdmin) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
            </div>
            <Link
              href="/staff/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Staff
            </Link>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <p>Staff management functionality available for admin users.</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Otherwise use AccessControl for permission check
  return (
    <ClientAuthProvider requireAuth={true}>
      <Layout>
        <AccessControl 
          permissions={[PERMISSIONS.VIEW_USERS]}
          roles={['admin']} 
          fallback={<NoPermissionFallback />}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
              </div>
              <AccessControl 
                permissions={[PERMISSIONS.CREATE_USERS]}
                roles={['admin']}
              >
                <Link
                  href="/staff/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Staff
                </Link>
              </AccessControl>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-1/2">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentPage(1);
                            fetchStaff();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="sm:w-1/4">
                    <label htmlFor="roleFilter" className="sr-only">Role</label>
                    <select
                      id="roleFilter"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                        setTimeout(() => fetchStaff(), 0);
                      }}
                    >
                      <option value="all">All Roles</option>
                      {roles.filter(role => role !== 'all').map(role => (
                        <option key={role} value={role}>{formatRole(role)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:w-1/4">
                    <label htmlFor="statusFilter" className="sr-only">Status</label>
                    <select
                      id="statusFilter"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                        setTimeout(() => fetchStaff(), 0);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="sm:w-auto">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => {
                        setCurrentPage(1);
                        fetchStaff();
                      }}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          No staff members found.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((member) => (
                        <tr key={member._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                                {member.phone && <div className="text-sm text-gray-500">{member.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {formatRole(member.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {member.lastActive ? formatDate(member.lastActive) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(member.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                href={`/staff/${member._id}/view`}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View Details"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                              <AccessControl permissions={[PERMISSIONS.EDIT_USERS]}>
                                <Link
                                  href={`/staff/${member._id}/edit`}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </Link>
                                <button
                                  onClick={() => handleResetPassword(member._id, member.name)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Reset Password"
                                >
                                  <KeyIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(member._id, member.isActive)}
                                  className={`${member.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                  title={member.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {member.isActive ? (
                                    <XCircleIcon className="h-5 w-5" />
                                  ) : (
                                    <CheckCircleIcon className="h-5 w-5" />
                                  )}
                                </button>
                              </AccessControl>
                              <AccessControl permissions={[PERMISSIONS.DELETE_USERS]}>
                                <button
                                  onClick={() => handleDeleteStaff(member._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </AccessControl>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          setTimeout(() => fetchStaff(), 0);
                        }
                      }}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          setTimeout(() => fetchStaff(), 0);
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * limit, totalStaff)}
                        </span>{' '}
                        of <span className="font-medium">{totalStaff}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => {
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                              setTimeout(() => fetchStaff(), 0);
                            }
                          }}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setCurrentPage(pageNum);
                                setTimeout(() => fetchStaff(), 0);
                              }}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => {
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                              setTimeout(() => fetchStaff(), 0);
                            }
                          }}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AccessControl>
      </Layout>
    </ClientAuthProvider>
  );
} 