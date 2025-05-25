"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import Link from "next/link";
import Spinner from "@/app/components/Spinner";

// Define types
interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
  active: boolean;
  managerId?: string;
  managerName?: string;
}

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

const OrganizationMembersPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch('/api/auth/permissions');
        if (!res.ok) throw new Error('Failed to fetch permissions');
        const data = await res.json();
        setCurrentUserRole(data.role);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError('Failed to load permissions');
      }
    };

    fetchPermissions();
  }, []);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`/api/organizations/${id}/members`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch members: ${res.status}`);
        }
        
        const data = await res.json();
        setMembers(data.members);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load organization members');
        toast.error('Failed to load organization members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [id]);

  // Handle member deletion
  const handleDeleteMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the organization?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${id}/members/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete member');
      }

      // Remove member from state
      setMembers(members.filter(member => member.id !== userId));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete member');
    }
  };

  // Generate role badge with appropriate color
  const getRoleBadge = (role: string) => {
    const classes = {
      base: "px-2 py-1 rounded-full text-xs font-semibold",
      SUPER_ADMIN: "bg-purple-100 text-purple-800",
      ADMIN: "bg-red-100 text-red-800",
      MANAGER: "bg-blue-100 text-blue-800",
      STAFF: "bg-green-100 text-green-800",
      VIEWER: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`${classes.base} ${classes[role as keyof typeof classes] || classes.VIEWER}`}>
        {role}
      </span>
    );
  };

  // Render status badge
  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organization Members</h1>
        <AccessControl 
          requiredPermissions={["CREATE_USERS"]}
          memberRoleToCheck=""
          currentUserRole={currentUserRole}
        >
          <Link 
            href={`/organizations/${id}/members/new`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaUserPlus /> Add Member
          </Link>
        </AccessControl>
      </div>

      {members.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center">
          <p className="text-gray-500">No members found in this organization.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {member.managerName || 'None'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <AccessControl 
                        requiredPermissions={["EDIT_USERS"]} 
                        memberRoleToCheck={member.role} 
                        currentUserRole={currentUserRole}
                      >
                        <button
                          onClick={() => router.push(`/organizations/${id}/members/${member.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label="Edit"
                        >
                          <FaEdit />
                        </button>
                      </AccessControl>
                      
                      <AccessControl 
                        requiredPermissions={["DELETE_USERS"]} 
                        memberRoleToCheck={member.role}
                        currentUserRole={currentUserRole}
                      >
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Delete"
                        >
                          <FaTrash />
                        </button>
                      </AccessControl>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrganizationMembersPage; 