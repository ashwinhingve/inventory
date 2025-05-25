'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';

// Define SalesReturn interface
interface SalesReturn {
  _id: string;
  reference: string;
  date: string;
  customerName: string;
  invoice?: string;
  invoiceNumber?: string;
  itemCount: number;
  total: number;
  status: string;
}

export default function SalesReturnsPage() {
  const { isLoading, setLoading } = useStore();
  
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);
  const [limit] = useState(10);
  
  // Wrap fetchReturns in useCallback and update useEffect to depend on fetchReturns.
  const fetchReturns = useCallback(async () => {
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
      
      if (dateFilter !== 'all') {
        params.append('date', dateFilter);
      }
      
      params.append('sortBy', sortField);
      params.append('sortOrder', sortDirection);
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      // Make API request
      const response = await fetch(`/api/sales/returns?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sales returns');
      }
      
      const data = await response.json();
      setReturns(data.returns || []);
      setTotalReturns(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: unknown) {
      console.error('Error fetching sales returns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load sales returns: ${errorMessage}`);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter, sortField, sortDirection, currentPage, limit, setLoading]);
  
  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);
  
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
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-600" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-700" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-700" />;
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
  
  // Handle delete return
  const handleDeleteReturn = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sales return? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/returns/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sales return');
      }
      
      toast.success('Sales return deleted successfully');
      // Refresh the returns list
      fetchReturns();
    } catch (error: unknown) {
      console.error('Error deleting sales return:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete sales return: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sales Returns</h1>
          <Link
            href="/sales/return/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Return
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/3">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-800 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    placeholder="Search by reference or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="md:w-1/4">
                <label htmlFor="statusFilter" className="sr-only">Status</label>
                <select
                  id="statusFilter"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="md:w-1/6">
                <label htmlFor="date-from" className="sr-only">From Date</label>
                <input
                  type="date"
                  id="date-from"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
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
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('reference')}
                  >
                    <div className="flex items-center">
                      Reference {getSortIcon('reference')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer {getSortIcon('customerName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center">
                      Invoice {getSortIcon('invoiceNumber')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('itemCount')}
                  >
                    <div className="flex items-center">
                      Items {getSortIcon('itemCount')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total {getSortIcon('total')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-700">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-700"></div>
                      </div>
                      <p className="mt-2 text-sm font-medium">Loading returns...</p>
                    </td>
                  </tr>
                ) : returns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-700 font-medium">
                      No returns found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  returns.map((salesReturn) => (
                    <tr key={salesReturn._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          <Link href={`/sales/return/${salesReturn._id}`} className="hover:text-blue-700">
                            {salesReturn.reference}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(salesReturn.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{salesReturn.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {salesReturn.invoiceNumber ? (
                          <div className="text-sm font-medium text-gray-900">
                            <Link href={`/sales/invoice/${salesReturn.invoice}`} className="hover:text-blue-700">
                              {salesReturn.invoiceNumber}
                            </Link>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{salesReturn.itemCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(salesReturn.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          salesReturn.status === 'completed' ? 'bg-green-100 text-green-800' :
                          salesReturn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {salesReturn.status.charAt(0).toUpperCase() + salesReturn.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/sales/return/${salesReturn._id}`}
                            className="text-gray-700 hover:text-blue-700"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/sales/return/${salesReturn._id}/edit`}
                            className="text-gray-700 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteReturn(salesReturn._id)}
                            className="text-gray-700 hover:text-red-700"
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
          
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalReturns}
              itemsPerPage={limit}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 