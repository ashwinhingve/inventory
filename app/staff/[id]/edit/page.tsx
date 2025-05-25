'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/ui/Layout';
import StaffForm from '@/components/staff/StaffForm';
import AccessControl from '@/components/AccessControl';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Define permissions
const PERMISSIONS = {
  EDIT_USERS: 'edit_users',
};

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  
  // Resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);
  
  // No-permission UI fallback
  const NoPermissionFallback = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You don&apos;t have permission to edit staff members.
            Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  );
  
  // Loading state while params are being resolved
  if (!id) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <AccessControl 
        permissions={[PERMISSIONS.EDIT_USERS]}
        fallback={<NoPermissionFallback />}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Staff Member</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update staff account details, role and permissions
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <StaffForm staffId={id} isEditMode={true} />
            </div>
          </div>
        </div>
      </AccessControl>
    </Layout>
  );
}