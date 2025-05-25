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
} from '@heroicons/react/24/outline';

import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';

// Define Expense interface
interface Expense {
  _id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  notes?: string;
  [key: string]: string | number | undefined; // For dynamic field access during sorting
}

export default function ExpenseListPage() {
  const router = useRouter();
  const { isLoading, setLoading } = useStore();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  
  // Categories list
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch expenses from API with pagination, filtering and sorting
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      
      if (dateRangeFilter.start) {
        params.append('startDate', dateRangeFilter.start);
      }
      
      if (dateRangeFilter.end) {
        params.append('endDate', dateRangeFilter.end);
      }
      
      // Add sorting parameters
      params.append('sort', sortField);
      params.append('order', sortDirection);
      
      // Add pagination
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      const response = await fetch(`/api/expenses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch expenses');
      }
      
      setExpenses(data.expenses);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.pages);
      
      // Set categories list with 'all&apos; option
      if (data.categories && data.categories.length) {
        setCategories(['all', ...data.categories]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      const err = error as Error; 
      toast.error(`Failed to load expenses: ${err.message}`);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, searchTerm, categoryFilter, dateRangeFilter, sortField, sortDirection, currentPage, itemsPerPage]);
  
  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-600" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
  };
  
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed with status: ${res.status}`);
      }
      
      toast.success('Expense deleted successfully');
      fetchExpenses();
      router.refresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
      const err = error as Error;
      toast.error(`Failed to delete expense: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter form submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on filter change
    fetchExpenses();
  };
  
  // Calculate total expenses
  const totalExpensesAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Expenses</h1>
          <Link
            href="/accounting/expense/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Expense
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-3/4 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-4">
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
                      placeholder="Search by ID, description, category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-1/4">
                  <label htmlFor="categoryFilter" className="sr-only">Category</label>
                  <select
                    id="categoryFilter"
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:w-1/4 flex flex-col space-y-2">
                  <div>
                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-700">From</label>
                    <input
                      type="date"
                      id="startDate"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      value={dateRangeFilter.start}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, start: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-700">To</label>
                    <input
                      type="date"
                      id="endDate"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                      value={dateRangeFilter.end}
                      onChange={(e) => setDateRangeFilter({...dateRangeFilter, end: e.target.value})}
                    />
                  </div>
                </div>
                <div className="sm:w-auto self-end pb-1">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Filter
                  </button>
                </div>
              </form>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('_id')}
                    >
                      <div className="flex items-center">
                        ID
                        <span className="ml-1">{getSortIcon('_id')}</span>
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
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        <span className="ml-1">{getSortIcon('category')}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Description
                        <span className="ml-1">{getSortIcon('description')}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        Amount
                        <span className="ml-1">{getSortIcon('amount')}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('paymentMethod')}
                    >
                      <div className="flex items-center">
                        Payment Method
                        <span className="ml-1">{getSortIcon('paymentMethod')}</span>
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
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No expenses found. Try adjusting your filters or add new expenses.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                          <Link href={`/accounting/expense/${expense._id}`}>
                            {expense._id.toString().substring(0, 8)}...
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {expense.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            <Link
                              href={`/accounting/expense/${expense._id}`}
                              className="text-gray-600 hover:text-gray-900"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link
                              href={`/accounting/expense/${expense._id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteExpense(expense._id)}
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
            
            {/* Pagination */}
            {totalItems > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} expenses
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
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-1/4 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Total Expenses:</span>
                  <span className="font-semibold">${totalExpensesAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Records Found:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <Link
                    href="/accounting/expense/report"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate Report
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/accounting/expense/new"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add New Expense
                </Link>
                <Link
                  href="/accounting/expense/categories"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Categories
                </Link>
                <Link
                  href="/accounting/expense/import"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Import Expenses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 