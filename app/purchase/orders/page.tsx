'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
import Layout from '@/components/ui/Layout';

// Define Purchase interface
interface Purchase {
  _id: string;
  reference: string;
  date: string;
  supplier: string;
  supplierName: string;
  total: number;
  status: string;
  paymentStatus: string;
}

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function PurchaseOrdersPage() {
  const { isLoading, setLoading } = useStore();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Fetch purchase orders from API
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (dateFilter.startDate) {
        params.append('startDate', dateFilter.startDate);
      }
      
      if (dateFilter.endDate) {
        params.append('endDate', dateFilter.endDate);
      }
      
      params.append('sortBy', sortField);
      params.append('sortOrder', sortDirection);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      // Make API request
      const response = await fetch(`/api/purchases?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch purchases');
      }
      
      const data = await response.json();
      setPurchases(data.purchases || []);
      setTotalPurchases(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        toast.error(errorObj.message || 'An error occurred while fetching purchase orders');
      } else {
        toast.error('An unexpected error occurred');
      }
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortField, sortDirection, statusFilter, dateFilter, searchTerm, itemsPerPage, setLoading]);
  
  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);
  
  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-600" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
  };
  
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle delete purchase
  const handleDeletePurchase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete purchase');
      }
      
      toast.success('Purchase order deleted successfully');
      // Refresh the purchases list
      fetchPurchases();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        toast.error(errorObj.message || 'An error occurred while deleting purchase order');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Get payment status badge class
  const getPaymentStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get order status badge class
  const getOrderStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <Link
            href="/purchase/orders/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-2/3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by reference or supplier..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="sm:w-1/3">
                <label htmlFor="statusFilter" className="sr-only">Status Filter</label>
                <select
                  id="statusFilter"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="received">Received</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">From</label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateFilter.startDate}
                  onChange={(e) => {
                    setDateFilter({...dateFilter, startDate: e.target.value});
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="sm:w-1/2">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">To</label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateFilter.endDate}
                  onChange={(e) => {
                    setDateFilter({...dateFilter, endDate: e.target.value});
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('reference')}
                  >
                    <div className="flex items-center">
                      Reference
                      <span className="ml-1">{getSortIcon('reference')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <span className="ml-1">{getSortIcon('date')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('supplierName')}
                  >
                    <div className="flex items-center">
                      Supplier
                      <span className="ml-1">{getSortIcon('supplierName')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      <span className="ml-1">{getSortIcon('total')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <span className="ml-1">{getSortIcon('status')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center">
                      Payment
                      <span className="ml-1">{getSortIcon('paymentStatus')}</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link href={`/purchase/orders/${purchase._id}`}>
                          {purchase.reference}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(purchase.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.supplierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(purchase.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(purchase.status)}`}>
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(purchase.paymentStatus)}`}>
                          {purchase.paymentStatus.charAt(0).toUpperCase() + purchase.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link href={`/purchase/orders/${purchase._id}`} className="text-gray-600 hover:text-gray-900">
                            <EyeIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <Link href={`/purchase/orders/edit/${purchase._id}`} className="text-indigo-600 hover:text-indigo-900">
                            <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => handleDeletePurchase(purchase._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {purchases.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalPurchases)} of {totalPurchases} purchases
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 