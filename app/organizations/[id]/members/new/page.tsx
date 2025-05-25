"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Spinner from "@/app/components/Spinner";

// Define permissions
const CREATE_USERS = "CREATE_USERS";

// Define roles hierarchy
const SUPER_ADMIN = "SUPER_ADMIN";
const ADMIN = "ADMIN";
const MANAGER = "MANAGER";
const STAFF = "STAFF"; 
const VIEWER = "VIEWER";

interface AccessControlProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  memberRoleToCheck?: string;
  currentUserRole?: string;
}

const AccessControl: React.FC<AccessControlProps> = ({ 
  children, 
  requiredPermissions,
  memberRoleToCheck,
  currentUserRole 
}) => {
  const hasPermission = () => {
    if (!currentUserRole || !memberRoleToCheck) return false;
    return requiredPermissions.includes(currentUserRole);
  };

  return hasPermission() ? <>{children}</> : null;
};

const NewMemberPage = () => {
  const { id } = useParams();
  const router = useRouter();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [managerId, setManagerId] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Fetch permissions and data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch current user permissions
        const permissionsRes = await fetch('/api/auth/permissions');
        if (!permissionsRes.ok) throw new Error('Failed to fetch permissions');
        const permissionsData = await permissionsRes.json();
        setCurrentUserRole(permissionsData.role);
        
        // Determine available roles based on user's role
        let roles: string[] = [];
        switch(permissionsData.role) {
          case SUPER_ADMIN:
            roles = [SUPER_ADMIN, ADMIN, MANAGER, STAFF, VIEWER];
            break;
          case ADMIN:
            roles = [ADMIN, MANAGER, STAFF, VIEWER];
            break;
          case MANAGER:
            roles = [MANAGER, STAFF, VIEWER];
            break;
          default:
            roles = [];
        }
        setAvailableRoles(roles);
        
        // Fetch potential managers
        const managersRes = await fetch(`/api/organizations/${id}/managers`);
        if (!managersRes.ok) throw new Error('Failed to fetch managers');
        const managersData = await managersRes.json();
        setManagers(managersData.managers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = () => {
    if (!name || !email || !password || !role) {
      toast.error('Please fill all required fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/organizations/${id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
          role,
          managerId: managerId || undefined,
          organizationId: id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create member');
      }
      
      toast.success('Member added successfully');
      router.push(`/organizations/${id}/members`);
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AccessControl 
      requiredPermissions={[CREATE_USERS]} 
      memberRoleToCheck={role}
      currentUserRole={currentUserRole}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Add New Member</h1>
            <Link 
              href={`/organizations/${id}/members`}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Members
            </Link>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a role</option>
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            {(role === STAFF || role === VIEWER) && (
              <div className="mb-4">
                <label htmlFor="managerId" className="block text-gray-700 font-medium mb-2">
                  Manager
                </label>
                <select
                  id="managerId"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => router.push(`/organizations/${id}/members`)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? <Spinner size="sm" /> : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AccessControl>
  );
};

export default NewMemberPage; 