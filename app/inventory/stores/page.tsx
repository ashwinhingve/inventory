'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define Store interface
interface Store {
  _id: string;
  name: string;
  location: string;
  manager: string;
  contact: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StoresListPage() {
  const { isLoading, setLoading } = useStore();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stores');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stores');
      }
      
      setStores(data.stores || []);
      setFilteredStores(data.stores || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      const err = error as Error; 
      toast.error(`Failed to load stores data: ${err.message || 'Unknown error'}`);
      // Set defaults to prevent UI issues
      setStores([]);
      setFilteredStores([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);
  
  // Handle search and filters
  useEffect(() => {
    const filtered = stores.filter(store => {
      const matchesSearch = searchTerm === '' || 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.location && store.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.manager && store.manager.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.contact && store.contact.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && store.isActive !== false) || 
        (statusFilter === 'inactive' && store.isActive === false);
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredStores(filtered);
  }, [stores, searchTerm, statusFilter]);
  
  const handleDeleteStore = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete store');
      }
      
      await fetchStores();
      toast.success('Store deleted successfully');
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error('Failed to delete store');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update store status');
      }
      
      await fetchStores();
      toast.success('Store status updated successfully');
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Stores</h1>
          <Link
            href="/inventory/stores/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Store
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-3/4">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by name, location, manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="sm:w-1/4">
                <label htmlFor="statusFilter" className="sr-only">Status</label>
                <select
                  id="statusFilter"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No stores found.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link href={`/inventory/stores/${store._id}`}>
                          {store.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.manager || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.contact || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          store.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {store.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/inventory/stores/${store._id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/inventory/stores/edit/${store._id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(store._id, !!store.isActive)}
                            className={`${
                              store.isActive !== false ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                            title={store.isActive !== false ? 'Deactivate' : 'Activate'}
                          >
                            {store.isActive !== false ? (
                              <XCircleIcon className="h-5 w-5" />
                            ) : (
                              <CheckCircleIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteStore(store._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 