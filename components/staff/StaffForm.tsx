import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useStore } from '@/context/storeContext';

interface StaffFormProps {
  staffId?: string;
  isEditMode?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

const StaffForm = ({ staffId, isEditMode = false }: StaffFormProps) => {
  const router = useRouter();
  const { setLoading } = useStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    role: 'viewer',
    isActive: true
  });
  
  const [roles, setRoles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/staff?limit=1');
        const data = await response.json();
        
        if (data.roles && Array.isArray(data.roles)) {
          setRoles(data.roles);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    
    const fetchStaffMember = async () => {
      if (!staffId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/staff/${staffId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch staff member');
        }
        
        // Update form with staff data
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'viewer',
          isActive: data.user.isActive || true
        });
      } catch (error) {
        console.error('Error fetching staff member:', error);
        const err = error as Error; 
        setError(err.message);
        toast.error('Failed to load staff data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
    if (isEditMode) {
      fetchStaffMember();
    }
  }, [staffId, isEditMode, setLoading]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.role) {
        throw new Error('Name, email, and role are required');
      }
      
      // Prepare API call
      const url = isEditMode
        ? `/api/staff/${staffId}`
        : '/api/staff';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save staff member');
      }
      
      // Show success message
      toast.success(isEditMode
        ? 'Staff member updated successfully'
        : 'Staff member created successfully'
      );
      
      // If this is a new user, show temp password
      if (!isEditMode && data.tempPassword) {
        toast.success(`Temporary password: ${data.tempPassword}`);
      }
      
      // Navigate back to staff list
      router.push('/staff');
    } catch (error) {
      console.error('Error saving staff member:', error);
      const err = error as Error; 
      setError(err.message);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Format role for display
  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {roles.length > 0 ? (
              roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))
            ) : (
              <>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="sales_associate">Sales Associate</option>
                <option value="cashier">Cashier</option>
                <option value="accountant">Accountant</option>
                <option value="viewer">Viewer</option>
              </>
            )}
          </select>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Active Account
        </label>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/staff')}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isEditMode ? 'Update Staff Member' : 'Create Staff Member'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm; 