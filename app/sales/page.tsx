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
  TrashIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define Sale interface
interface Sale {
  _id: string;
  reference: string;
  date: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export default function SalesPage() {
  const { isLoading, setLoading } = useStore();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalSales, setTotalSales] = useState(0);
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
  
  // Fetch sales from API
  const fetchSales = useCallback(async () => {
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
      const response = await fetch(`/api/sales?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sales');
      }
      
      const data = await response.json();
      setSales(data.sales || []);
      setTotalSales(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: unknown) {
      console.error('Error fetching sales:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load sales: ${errorMessage}`);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateFilter, sortField, sortDirection, currentPage, itemsPerPage, setLoading]);
  
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  
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
  
  // Handle delete sale
  const handleDeleteSale = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sale');
      }
      
      toast.success('Sale deleted successfully');
      // Refresh the sales list
      fetchSales();
    } catch (error: unknown) {
      console.error('Error deleting sale:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete sale: ${errorMessage}`);
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
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
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <Link
            href="/sales/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Sale
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-2/3">
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
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="sm:w-1/3">
                <label htmlFor="statusFilter" className="sr-only">Status</label>
                <select
                  id="statusFilter"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
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
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center">
                      Payment {getSortIcon('paymentStatus')}
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
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-700">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-700"></div>
                      </div>
                      <p className="mt-2 text-sm font-medium">Loading sales...</p>
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-700 font-medium">
                      No sales found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          <Link href={`/sales/${sale._id}`} className="hover:text-blue-700">
                            {sale.reference}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(sale.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{sale.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusBadgeClass(sale.status)}`}>
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusBadgeClass(sale.paymentStatus)}`}>
                          {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/sales/${sale._id}`}
                            className="text-gray-700 hover:text-blue-700"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/sales/${sale._id}/edit`}
                            className="text-gray-700 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteSale(sale._id)}
                            className="text-gray-700 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/sales/${sale._id}/generate-invoice`}
                            className="text-gray-700 hover:text-blue-700"
                            title="Generate Invoice"
                          >
                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {sales.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalSales)} of {totalSales} sales
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