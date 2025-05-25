'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface StoreFormData {
  name: string;
  location: string;
  pincode: string;
  state: string;
  contact: string;
}

export default function NewStorePage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    location: '',
    pincode: '',
    state: '',
    contact: ''
  });
  
  const [errors, setErrors] = useState<Partial<StoreFormData>>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name as keyof StoreFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<StoreFormData> = {};
    
    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Store Name is required';
    }
    
    // Validate pincode format if provided
    if (formData.pincode && !/^\d{5,6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 5-6 digits';
    }
    
    // Validate contact format if provided
    if (formData.contact && !/^[\d\s\-+()]{7,15}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid contact number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          pincode: formData.pincode,
          state: formData.state,
          contact: formData.contact,
          isActive: true
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create store');
      }
      
      toast.success('Store created successfully');
      router.push('/inventory/stores');
    } catch (error) {
      console.error('Error creating store:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create store');
      toast.error('Failed to create store');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/inventory/stores"
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add Store</h1>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {formError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter store name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Address
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter store address"
                />
              </div>
              
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter pincode"
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter state"
                />
              </div>
              
              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter contact number"
                />
                {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <Link
                href="/inventory/stores"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Store'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 