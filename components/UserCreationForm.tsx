'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Store {
  id: string;
  name: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  store: string;
  permissions: string[];
}

export default function UserCreationForm() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: '',
    store: '',
    permissions: []
  });

  // Fetch stores and roles on component mount
  useEffect(() => {
    const fetchStoresAndRoles = async () => {
      try {
        const [storesRes, rolesRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/roles')
        ]);

        if (!storesRes.ok || !rolesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [storesData, rolesData] = await Promise.all([
          storesRes.json(),
          rolesRes.json()
        ]);

        setStores(storesData.stores);
        setRoles(rolesData.roles);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      }
    };

    fetchStoresAndRoles();
  }, []);

  // Update permissions when store changes
  useEffect(() => {
    if (formData.store) {
      const fetchStorePermissions = async () => {
        try {
          const response = await fetch(`/api/stores/${formData.store}/permissions`);
          if (!response.ok) {
            throw new Error('Failed to fetch store permissions');
          }
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            permissions: data.permissions
          }));
        } catch (error) {
          console.error('Error fetching store permissions:', error);
          toast.error('Failed to load store permissions');
        }
      };

      fetchStorePermissions();
    }
  }, [formData.store]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      toast.success('User created successfully');
      router.push('/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">User Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role<span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store<span className="text-red-500">*</span>
            </label>
            <select
              name="store"
              value={formData.store}
              onChange={handleInputChange}
              required
              className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/users')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
} 