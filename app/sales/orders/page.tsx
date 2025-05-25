'use client';

import { useState, useEffect } from 'react';
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
 
  PrinterIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define Order interface
interface Order {
  _id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  total: number;
  status: string;
  expectedDate: string;
  itemCount: number;
  items: Array<{
    product: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export default function SalesOrdersPage() {
  const { isLoading, setLoading } = useStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Sorting
  const [sortField, setSortField] = useState<'orderNumber' | 'date' | 'customerName' | 'total' | 'status' | 'expectedDate' | 'itemCount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    from: '',
    to: ''
  });
  
  useEffect(() => {
    const fetchOrders = async () => {
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
        
        if (dateRangeFilter.from) {
          params.append('startDate', dateRangeFilter.from);
        }
        
        if (dateRangeFilter.to) {
          params.append('endDate', dateRangeFilter.to);
        }
        
        params.append('sortBy', sortField);
        params.append('sortOrder', sortDirection);
        
        // Fetch data from API
        const response = await fetch(`/api/sales/orders?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [setLoading, searchTerm, statusFilter, dateRangeFilter, sortField, sortDirection]);
  
  const handleSort = (field: 'orderNumber' | 'date' | 'customerName' | 'total' | 'status' | 'expectedDate' | 'itemCount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: 'orderNumber' | 'date' | 'customerName' | 'total' | 'status' | 'expectedDate' | 'itemCount') => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-600" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
  };
  
  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/sales/orders/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }
      
      // Update local state to remove the deleted order
      setOrders(orders.filter(order => order._id !== id));
      setFilteredOrders(filteredOrders.filter(order => order._id !== id));
      
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
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
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <Link
            href="/sales/orders/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-1/2">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search by order number or customer..."
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
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="sm:w-1/4 space-y-2">
                <div>
                  <label htmlFor="fromDate" className="block text-xs font-medium text-gray-700">From</label>
                  <input
                    type="date"
                    id="fromDate"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={dateRangeFilter.from}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, from: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="toDate" className="block text-xs font-medium text-gray-700">To</label>
                  <input
                    type="date"
                    id="toDate"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={dateRangeFilter.to}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, to: e.target.value})}
                  />
                </div>
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
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center">
                      Order #
                      <span className="ml-1">{getSortIcon('orderNumber')}</span>
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
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      <span className="ml-1">{getSortIcon('customerName')}</span>
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
                    onClick={() => handleSort('expectedDate')}
                  >
                    <div className="flex items-center">
                      Expected Date
                      <span className="ml-1">{getSortIcon('expectedDate')}</span>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('itemCount')}
                  >
                    <div className="flex items-center">
                      Items
                      <span className="ml-1">{getSortIcon('itemCount')}</span>
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
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link href={`/sales/orders/${order._id}`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.itemCount || order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            href={`/sales/orders/${order._id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/sales/orders/${order._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            disabled={order.status === 'Completed'}
                          >
                            <TrashIcon className={`h-5 w-5 ${order.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`} />
                          </button>
                          <Link
                            href={`/sales/orders/${order._id}/print`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Print"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
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
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
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