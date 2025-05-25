'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';
import { CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';

export default function AllEntriesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [showProfit, setShowProfit] = useState(false);

  // Date range - default to last 7 days
  const today = new Date();
  const [dateRange, setDateRange] = useState({
    start: format(subDays(today, 7), 'yyyy-MM-dd'),
    end: format(today, 'yyyy-MM-dd')
  });

  // Search term
  const [searchTerm, setSearchTerm] = useState('');

  // Active filter tab
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Here you would fetch entries data based on filters
    fetchEntries();
  }, [dateRange, activeTab]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      // This would be an actual API call in a real application
      // For now, we'll simulate a delay and set empty data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample data - in a real app, this would come from your API
      setTotalSales(0);
      setEntries([]);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to load entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleProfitVisibility = () => {
    setShowProfit(!showProfit);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Store name and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Entries</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all transaction entries</p>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">May Month&apos;s Sales</h2>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹ {totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">May Month&apos;s Profit</h2>
              <button onClick={toggleProfitVisibility} className="text-gray-500 hover:text-gray-700">
                <EyeIcon className="h-6 w-6" />
              </button>
            </div>
            {showProfit ? (
              <p className="text-3xl font-bold text-gray-900 mt-2">₹ 0.00</p>
            ) : (
              <p className="text-3xl font-bold text-gray-900 mt-2">View Profit</p>
            )}
          </div>
        </div>

        {/* Date range selector and search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center bg-white border border-gray-300 rounded-md p-2 text-gray-800">
            <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span className="font-medium">Last 7 Days - </span>
            <span className="font-medium">{format(new Date(dateRange.start), 'dd MMM yyyy')} to {format(new Date(dateRange.end), 'dd MMM yyyy')}</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-4 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTabChange('all')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => handleTabChange('sales')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'sales' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => handleTabChange('purchase')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'purchase' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Purchase
          </button>
          <button
            onClick={() => handleTabChange('sales-return')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'sales-return' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sales Return
          </button>
          <button
            onClick={() => handleTabChange('purchase-return')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'purchase-return' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Purchase Return
          </button>
          <button
            onClick={() => handleTabChange('to-receive')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'to-receive' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            To Receive
          </button>
          <button
            onClick={() => handleTabChange('to-pay')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'to-pay' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            To Pay
          </button>
          <button
            onClick={() => handleTabChange('store-in')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'store-in' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Store In
          </button>
          <button
            onClick={() => handleTabChange('store-out')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'store-out' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Store Out
          </button>
          <button
            onClick={() => handleTabChange('payment-in')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'payment-in' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Payment In
          </button>
          <button
            onClick={() => handleTabChange('payment-out')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'payment-out' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Payment Out
          </button>
          <button
            onClick={() => handleTabChange('expense')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'expense' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => handleTabChange('purchase-order')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'purchase-order' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Purchase Order
          </button>
          <button
            onClick={() => handleTabChange('sales-order')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'sales-order' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Sales Order
          </button>
          <button
            onClick={() => handleTabChange('quotation')}
            className={`rounded-full px-5 py-2 font-medium transition-colors ${
              activeTab === 'quotation' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Quotation
          </button>
        </div>

        {/* Entries list or empty state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : entries.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Party
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Entries would be mapped here */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-700 font-medium">No entry is added in the Last 7 Days. Change duration to view more added entries</p>
          </div>
        )}

        {/* Date picker for mobile (hidden by default) */}
        <div className="hidden">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date Range</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-800">From</label>
                  <input
                    type="date"
                    id="startDate"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-800">To</label>
                  <input
                    type="date"
                    id="endDate"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 