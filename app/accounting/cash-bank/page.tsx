'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
import Layout from '@/components/ui/Layout';

// Define Transaction interface
interface Transaction {
  _id: string;
  date: string;
  description: string;
  type: string;
  category: string;
  amount: number;
  account: string;
  reference: string;
  notes: string;
  [key: string]: string | number | Date; // Include Date type for future-proofing
}

// Define Summary data interface
interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function CashBankPage() {
  const { isLoading, setLoading } = useStore();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Summary data
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: '',
    end: ''
  });
  
  // Available accounts (normally fetched from API)
  const [accounts] = useState<string[]>(['all', 'Cash', 'Bank Account', 'Savings', 'Credit Card']);
  
  // Fetch transactions data from API (mocked for demonstration)
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockTransactions: Transaction[] = [
        {
          _id: '1',
          date: '2023-05-15',
          description: 'Sales Revenue',
          type: 'income',
          category: 'Sales',
          amount: 5000,
          account: 'Bank Account',
          reference: 'INV-2023-001',
          notes: 'Monthly sales revenue'
        },
        {
          _id: '2',
          date: '2023-05-10',
          description: 'Office Rent',
          type: 'expense',
          category: 'Rent',
          amount: 1200,
          account: 'Bank Account',
          reference: 'RENT-2023-05',
          notes: 'Monthly office rent'
        },
        {
          _id: '3',
          date: '2023-05-08',
          description: 'Transfer to Savings',
          type: 'transfer',
          category: 'Transfer',
          amount: 1000,
          account: 'Bank Account',
          reference: 'TRF-2023-001',
          notes: 'Monthly savings transfer'
        },
        {
          _id: '4',
          date: '2023-05-05',
          description: 'Client Payment',
          type: 'income',
          category: 'Consulting',
          amount: 2500,
          account: 'Bank Account',
          reference: 'PMT-2023-001',
          notes: 'Project completion payment'
        },
        {
          _id: '5',
          date: '2023-05-03',
          description: 'Office Supplies',
          type: 'expense',
          category: 'Supplies',
          amount: 350,
          account: 'Credit Card',
          reference: 'EXP-2023-001',
          notes: 'Monthly office supplies'
        },
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      
      // Calculate summary
      const totalIncome = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setSummary({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions data');
    } finally {
      setLoading(false);
    }
  }, [setLoading]);
  
  // Apply filters to transactions
  const applyFilters = useCallback(() => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchLower) ||
        tx.category.toLowerCase().includes(searchLower) ||
        tx.reference.toLowerCase().includes(searchLower) ||
        tx.account.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    // Apply account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(tx => tx.account === accountFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter.start) {
      filtered = filtered.filter(tx => tx.date >= dateRangeFilter.start);
    }
    
    if (dateRangeFilter.end) {
      filtered = filtered.filter(tx => tx.date <= dateRangeFilter.end);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // For numeric values
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, accountFilter, dateRangeFilter, sortField, sortDirection]);
  
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  
  // Filter transactions when filter values change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);
  
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
      return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-4 h-4 text-blue-600" />
      : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
  };
  
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction? This cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove from local state
      const updatedTransactions = transactions.filter(tx => tx._id !== id);
      setTransactions(updatedTransactions);
      
      // Recalculate summary
      const totalIncome = updatedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setSummary({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });
      
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const getTypeBadgeClass = (type: string) => {
    switch(type) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expense':
        return 'bg-red-100 text-red-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get amount text class
  const getAmountClass = (amount: number) => {
    return amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cash & Bank Management</h1>
          <div className="flex space-x-2">
            <Link
              href="/accounting/cash-bank/income/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              New Income
            </Link>
            <Link
              href="/accounting/cash-bank/expense/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              New Expense
            </Link>
            <Link
              href="/accounting/cash-bank/transfer/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Transfer
            </Link>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <ArrowUpIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Income</h2>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalIncome)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <ArrowDownIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Total Expenses</h2>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalExpense)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${summary.balance >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {summary.balance >= 0 ? (
                  <PlusIcon className="h-6 w-6" />
                ) : (
                  <MinusIcon className="h-6 w-6" />
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">Balance</h2>
                <p className={`text-2xl font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(summary.balance))}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="w-full bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/3">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search transactions..."
                    />
                  </div>
                </div>
                
                <div className="sm:w-1/6">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                
                <div className="sm:w-1/4">
                  <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select
                    id="account"
                    name="account"
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {accounts.map((account, index) => (
                      <option key={index} value={account}>{account === 'all' ? 'All Accounts' : account}</option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:w-1/6">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dateRangeFilter.start}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, start: e.target.value})}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="sm:w-1/6">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dateRangeFilter.end}
                    onChange={(e) => setDateRangeFilter({...dateRangeFilter, end: e.target.value})}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
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
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {getSortIcon('date')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Description</span>
                        {getSortIcon('description')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {getSortIcon('type')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {getSortIcon('category')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('account')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Account</span>
                        {getSortIcon('account')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        {getSortIcon('amount')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(transaction.type)}`}>
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.account}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={getAmountClass(transaction.amount)}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link
                              href={`/accounting/cash-bank/${transaction.type}/${transaction._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              className="text-red-600 hover:text-red-900"
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
      </div>
    </Layout>
  );
} 