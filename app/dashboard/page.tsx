'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import { 
  CubeIcon, 
  CurrencyRupeeIcon, 
  ShoppingBagIcon,
  UserGroupIcon,
  BanknotesIcon,
  ScaleIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Sample data for sales & purchase trends chart
const trendData = [
  { date: '02 May', sales: 0, purchase: 0 },
  { date: '03 May', sales: 0, purchase: 0 },
  { date: '04 May', sales: 0, purchase: 0 },
  { date: '05 May', sales: 0, purchase: 0 },
  { date: '06 May', sales: 0, purchase: 0 },
  { date: '07 May', sales: 0, purchase: 0 },
  { date: '08 May', sales: 0, purchase: 0 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { 
    fetchDashboardStats,
    products,
    fetchProducts,
    isLoggedIn
  } = useStore();
  
  const [activeTabSales, setActiveTabSales] = useState<string>('items');
  const [activeTabPurchase, setActiveTabPurchase] = useState<string>('items');
   
  // Fetch dashboard stats with useCallback to prevent infinite render loop
  const fetchLowStockProducts = useCallback(() => {
    fetchProducts({ lowStock: 'true' });
  }, [fetchProducts]);
  
  useEffect(() => {
    // Fetch dashboard stats only once on component mount
    fetchDashboardStats();
    fetchLowStockProducts();
  }, [fetchDashboardStats, fetchLowStockProducts]);
  
  useEffect(() => {
    // This will only run when products change
  }, [products]);
  
  // Add this effect to handle authentication
  useEffect(() => {
    // Check for successful login flag first
    const loginSuccessful = localStorage.getItem('login_successful');
    const loginTimestamp = localStorage.getItem('login_timestamp');
    const now = Date.now();
    const loginIsRecent = loginTimestamp && (now - parseInt(loginTimestamp)) < 30000; // 30 seconds
    
    // If coming from successful login, trust that we're authenticated
    if (loginSuccessful === 'true' && loginIsRecent) {
      console.log('Dashboard - Login success flag detected, trusting authentication');
      return; // Skip the rest of the check
    }
    
    // Verify authentication is working
    console.log('Dashboard - StoreContext isLoggedIn:', isLoggedIn);
    
    // First check if we have a token
    const authToken = localStorage.getItem('token');
    if (authToken) {
      console.log('Dashboard - Auth token found');
      // Verify token with the API
      fetch('/api/auth/verify', {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Cache-Control': 'no-cache, no-store' 
        }
      })
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Invalid token');
      })
      .then(data => {
        console.log('Token verified successfully', data);
      })
      .catch(err => {
        console.error('Token verification failed, but not redirecting', err);
      });
      
      return; // We have a token, no need to redirect
    }
    
    // Only redirect if we're certain authentication failed (loading is complete)
    // and neither auth method is working
    if (!isLoggedIn && !authToken) {
      // Don't immediately redirect - wait a bit to see if token verification succeeds
      const timer = setTimeout(() => {
        // Check again if we've authenticated since we started the timer
        if (localStorage.getItem('token') || localStorage.getItem('login_successful') === 'true') {
          console.log('Authentication arrived after delay, not redirecting');
          return;
        }
        
        console.log('Dashboard - Not authenticated after delay, redirecting to login');
        toast.error('Please log in to access the dashboard');
        
        // Use window.location for more reliable redirect
        window.location.href = '/login';
      }, 1500); // Give time for authentication to complete
      
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, router]);
  
  // Business metrics
  const businessMetrics = [
    { label: 'Total Sales', value: '₹ 0.00' },
    { label: 'Total Purchase', value: '₹ 0.00' },
    { label: 'Total Expense', value: '₹ 0.00' },
    { label: 'Total Profit', value: '₹ 0.00' },
    { label: 'Total Payment Received', value: '₹ 0.00' },
    { label: 'Total Payment Paid', value: '₹ 0.00' },
    { label: 'Net Cash + Bank Flow', value: '₹ 0' },
  ];

  // Party metrics
  const partyMetrics = [
    { label: 'Total Receivable', value: '₹ 0.00' },
    { label: 'Total Payable', value: '₹ 0.00' },
  ];

  // Balance metrics
  const balanceMetrics = [
    { label: 'Total Cash + Bank Balance', value: '₹ 0.00' },
    { label: 'Total Cash Balance', value: '₹ 0.00' },
  ];

  // Inventory metrics
  const inventoryMetrics = [
    { label: 'Total Stock Value(Purchase)', value: '₹ 200000.00' },
    { label: 'Total Stock Value(Sales)', value: '₹ 220000.00' },
    { label: 'Total Items', value: '1' },
    { label: 'Low Stock Items', value: '0', color: 'text-red-500' },
    { label: 'Zero Stock Items', value: '0', color: 'text-red-500' },
    { label: 'Negative Stock Items', value: '0', color: 'text-red-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6 p-4">
        {/* First row of stats cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Business Overview */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Business Overview</h2>
              <span className="text-sm text-gray-500">Today</span>
            </div>
            <div className="space-y-2">
              {businessMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-medium text-gray-900">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Party Overview */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Party Overview</h2>
              <span className="text-sm text-gray-500">At Present</span>
            </div>
            <div className="space-y-2">
              {partyMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-medium text-gray-900">{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Balance Overview */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Balance Overview</h2>
                <span className="text-sm text-gray-500">At Present</span>
              </div>
              <div className="space-y-2">
                {balanceMetrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between items-center">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="font-medium text-gray-900">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sales & Purchase Trends */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sales & Purchase Trends</h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            
            <div className="flex items-center mb-2 justify-end space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs text-gray-600">Sales</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                <span className="text-xs text-gray-600">Purchase</span>
              </div>
            </div>
            
            <div className="h-60 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                <span>₹ 1</span>
                <span>₹ 0.6</span>
                <span>₹ 0.2</span>
                <span>₹ -0.2</span>
                <span>₹ -0.6</span>
                <span>₹ -1</span>
              </div>
              
              {/* Chart area */}
              <div className="pl-10 h-full flex flex-col">
                {/* Horizontal grid lines */}
                <div className="h-full w-full relative">
                  {[0, 20, 40, 60, 80, 100].map((pos) => (
                    <div 
                      key={pos} 
                      className="absolute border-t border-gray-200 w-full"
                      style={{ top: `${pos}%` }}
                    ></div>
                  ))}
                  
                  {/* Trend lines for sales (green) */}
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <polyline
                      points="0,50 14.3,50 28.6,50 42.9,50 57.1,50 71.4,50 85.7,50 100,50"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Points for sales */}
                    {trendData.map((point, i) => (
                      <circle 
                        key={i}
                        cx={`${i * (100 / (trendData.length - 1))}%`}
                        cy="50%"
                        r="4"
                        fill="#10B981"
                        className="transition-all duration-1000 ease-out"
                      />
                    ))}
                  </svg>
                </div>
                
                {/* X-axis dates */}
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  {trendData.map((point, i) => (
                    <span key={i}>{point.date.split(' ')[0]} May</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Second row of stats cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inventory Overview */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
              <span className="text-sm text-gray-500">At Present</span>
            </div>
            <div className="space-y-2">
              {inventoryMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className={`font-medium ${metric.color || 'text-gray-900'}`}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Top 5 Sales */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Sales</h2>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button 
                className={`mr-4 pb-2 px-1 text-sm font-medium ${activeTabSales === 'items' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabSales('items')}
              >
                Items
              </button>
              <button 
                className={`mr-4 pb-2 px-1 text-sm font-medium ${activeTabSales === 'customers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabSales('customers')}
              >
                Customers
              </button>
              <button 
                className={`pb-2 px-1 text-sm font-medium ${activeTabSales === 'dates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabSales('dates')}
              >
                Dates
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="h-48 flex items-center justify-center text-gray-500">
              No items found
            </div>
          </div>
          
          {/* Top 5 Purchase */}
          <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Purchase</h2>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button 
                className={`mr-4 pb-2 px-1 text-sm font-medium ${activeTabPurchase === 'items' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabPurchase('items')}
              >
                Items
              </button>
              <button 
                className={`mr-4 pb-2 px-1 text-sm font-medium ${activeTabPurchase === 'suppliers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabPurchase('suppliers')}
              >
                Suppliers
              </button>
              <button 
                className={`pb-2 px-1 text-sm font-medium ${activeTabPurchase === 'dates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTabPurchase('dates')}
              >
                Dates
              </button>
            </div>
            
            {/* Content based on active tab */}
            <div className="h-48 flex items-center justify-center text-gray-500">
              No items found
            </div>
          </div>
        </div>
        
        {/* Dashboard Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          <Link href="/inventory/stock/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CubeIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Item</span>
            </div>
          </Link>
          
          <Link href="/parties/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Party</span>
            </div>
          </Link>
          
          <Link href="/sales/invoice/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Sale</span>
            </div>
          </Link>
          
          <Link href="/purchase/invoice/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArchiveBoxIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Purchase</span>
            </div>
          </Link>
          
          <Link href="/accounting/expense/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CurrencyRupeeIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Expense</span>
            </div>
          </Link>
          
          <Link href="/sales/payment-in/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BanknotesIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Payment In</span>
            </div>
          </Link>
          
          <Link href="/purchase/payment-out/new" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <BanknotesIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Add Payment Out</span>
            </div>
          </Link>
          
          <Link href="/reports" className="relative group">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow transition-all">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ScaleIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Reports</span>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
} 