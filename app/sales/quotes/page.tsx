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
  TrashIcon,
  ArrowDownTrayIcon,
  
  PrinterIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define Quotation interface based on the MongoDB schema
interface Quote {
  _id: string;
  quoteNumber: string;
  customer: {
    _id: string;
    name: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  expiryDate: string;
}

export default function QuotesPage() {
  const { isLoading, setLoading } = useStore();
  
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({ from: '', to: '' });
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateRangeFilter.from) params.append('startDate', dateRangeFilter.from);
      if (dateRangeFilter.to) params.append('endDate', dateRangeFilter.to);
      params.append('sortBy', sortField);
      params.append('sortOrder', sortDirection);
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());

      const response = await fetch(`/api/sales/quotes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data.quotes || []);
      setTotalQuotes(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, dateRangeFilter, sortField, sortDirection, currentPage, itemsPerPage, setLoading]);
  
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);
  
  const handleSort = (field: string) => {
    // If clicking on the same field, toggle direction
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking on a new field, set as the sort field with asc direction
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
  
  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/quotes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete quotation');
      }
      
      toast.success('Quotation deleted successfully');
      // Refresh the quotations list
      fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete quotation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Declined':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'Converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => toast.success('Quotations exported successfully')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/sales/quotes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Quotation
            </Link>
          </div>
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
                    placeholder="Search by quote number or customer..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                  />
                </div>
              </div>
              
              <div className="md:w-1/4">
                <label htmlFor="statusFilter" className="sr-only">Status</label>
                <select
                  id="statusFilter"
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Declined">Declined</option>
                  <option value="Expired">Expired</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
              
              <div className="md:w-1/6">
                <label htmlFor="date-from" className="sr-only">From Date</label>
                <input
                  type="date"
                  id="date-from"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={dateRangeFilter.from}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, from: e.target.value }))}
                />
              </div>
              
              <div className="md:w-1/6">
                <label htmlFor="date-to" className="sr-only">To Date</label>
                <input
                  type="date"
                  id="date-to"
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                  value={dateRangeFilter.to}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, to: e.target.value }))}
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
                    onClick={() => handleSort('quoteNumber')}
                  >
                    <div className="flex items-center">
                      Quote # {getSortIcon('quoteNumber')}
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
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('expiryDate')}
                  >
                    <div className="flex items-center">
                      Expiry Date {getSortIcon('expiryDate')}
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
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total {getSortIcon('total')}
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
                      <p className="mt-2 text-sm font-medium">Loading quotations...</p>
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-700 font-medium">
                      No quotations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          <Link href={`/sales/quotes/${quote._id}`} className="hover:text-blue-700">
                            {quote.quoteNumber}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{quote.customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(quote.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(quote.expiryDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(quote.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/sales/quotes/${quote._id}`}
                            className="text-gray-700 hover:text-blue-700"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/sales/quotes/${quote._id}/edit`}
                            className="text-gray-700 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteQuotation(quote._id)}
                            className="text-gray-700 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-700 hover:text-blue-700"
                            title="Print"
                          >
                            <PrinterIcon className="h-5 w-5" />
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
          {!isLoading && quotes.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalQuotes)} of {totalQuotes} quotations
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