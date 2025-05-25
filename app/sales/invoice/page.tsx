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
import Pagination from '@/components/ui/Pagination';

// Define Invoice interface
interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  balance: number;
}

export default function SalesInvoiceListPage() {
  const { isLoading, setLoading } = useStore();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Sorting
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    from: '',
    to: ''
  });
  
  // Fetch invoices with all params
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortField,
        sortOrder: sortDirection,
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (dateRangeFilter.from) {
        params.append('fromDate', dateRangeFilter.from);
      }
      
      if (dateRangeFilter.to) {
        params.append('toDate', dateRangeFilter.to);
      }
      
      const response = await fetch(`/api/sales/invoices?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      
      setInvoices(data.invoices);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortField, sortDirection, statusFilter, dateRangeFilter, searchTerm, setLoading]);
  
  // Initial fetch and when filters change
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-600" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-700" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-700" />;
  };
  
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/invoices/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }
      
      // Refresh invoices
      fetchInvoices();
      toast.success('Invoice deleted successfully');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete invoice');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportInvoices = () => {
    // In a real implementation, this would generate a CSV or Excel file
    toast.success('Invoices exported successfully');
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'Partial':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sales Invoices</h1>
          <div className="flex space-x-2">
            <button
              onClick={handleExportInvoices}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/sales/invoice/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Invoice
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
                    placeholder="Search by invoice number or customer..."
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
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partial</option>
                  <option value="Overdue">Overdue</option>
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
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center">
                      Invoice # {getSortIcon('invoiceNumber')}
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
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      Due Date {getSortIcon('dueDate')}
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
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="flex items-center">
                      Balance {getSortIcon('balance')}
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
                      <p className="mt-2 text-sm font-medium">Loading invoices...</p>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-700 font-medium">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          <Link href={`/sales/invoice/${invoice._id}`} className="hover:text-blue-700">
                            {invoice.invoiceNumber}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-800">{invoice.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(invoice.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{formatDate(invoice.dueDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.total)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.balance)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/sales/invoice/${invoice._id}`}
                            className="text-gray-700 hover:text-blue-700"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link 
                            href={`/sales/invoice/${invoice._id}/edit`}
                            className="text-gray-700 hover:text-blue-700"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteInvoice(invoice._id)}
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
          
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
} 