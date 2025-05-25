import { Metadata } from 'next';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import UserCreationForm from '@/components/UserCreationForm';
import RoleChecker from '@/components/RoleChecker';
import Layout from '@/components/ui/Layout';
import DirectPermissionCheck from '@/components/DirectPermissionCheck';

// Define permissions locally for consistent use
const PERMISSIONS = {
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  VIEW_USERS: 'view_users'
};

export const metadata: Metadata = {
  title: 'Create New Staff User',
  description: 'Create a new staff member with appropriate role and permissions',
};

export default function CreateStaffPage() {
  return (
    <Layout>
      <div className="container mx-auto">
        {/* Back button */}
        <div className="flex items-center mb-6">
          <Link 
            href="/staff" 
            className="flex items-center text-blue-700 hover:text-blue-900 font-medium transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            <span>Back to Staff List</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Staff User</h1>
          <p className="text-gray-800 mb-8 font-medium">
            Add a new user to the system with role-based permissions
          </p>

          <RoleChecker />
          
          <DirectPermissionCheck permission={PERMISSIONS.CREATE_USERS}>
            <UserCreationForm />
          </DirectPermissionCheck>
        </div>
      </div>
    </Layout>
  );
} 