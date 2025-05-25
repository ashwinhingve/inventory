'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DocumentChartBarIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  TruckIcon,
  SquaresPlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define report interfaces
interface Report {
  id: number;
  name: string;
  type: string;
  date: string;
  path: string;
}

interface ReportLink {
  name: string;
  path: string;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  reports: ReportLink[];
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'sales',
    name: 'Sales Reports',
    description: 'View sales data by product, customer, time period, and more',
    icon: CurrencyDollarIcon,
    reports: [
      { name: 'Sales Summary', path: '/reports/sales/summary' },
      { name: 'Sales by Product', path: '/reports/sales/by-product' },
      { name: 'Sales by Customer', path: '/reports/sales/by-customer' },
      { name: 'Sales by Payment Method', path: '/reports/sales/by-payment' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory Reports',
    description: 'Track stock levels, movements, and valuation',
    icon: SquaresPlusIcon,
    reports: [
      { name: 'Inventory Valuation', path: '/reports/inventory/valuation' },
      { name: 'Stock Movement', path: '/reports/inventory/movement' },
      { name: 'Low Stock Items', path: '/reports/inventory/low-stock' },
      { name: 'Inventory Aging', path: '/reports/inventory/aging' }
    ]
  },
  {
    id: 'purchases',
    name: 'Purchase Reports',
    description: 'Analyze purchase orders, suppliers, and procurement costs',
    icon: TruckIcon,
    reports: [
      { name: 'Purchase Summary', path: '/reports/purchases/summary' },
      { name: 'Purchases by Supplier', path: '/reports/purchases/by-supplier' },
      { name: 'Purchase Order Status', path: '/reports/purchases/order-status' }
    ]
  },
  {
    id: 'financial',
    name: 'Financial Reports',
    description: 'Review profit & loss, expenses, and financial performance',
    icon: ChartBarIcon,
    reports: [
      { name: 'Profit & Loss', path: '/reports/financial/profit-loss' },
      { name: 'Expense Summary', path: '/reports/financial/expenses' },
      { name: 'Cash Flow', path: '/reports/financial/cash-flow' }
    ]
  },
  {
    id: 'analytics',
    name: 'Business Analytics',
    description: 'Get insights through advanced data analytics and visualizations',
    icon: ChartPieIcon,
    reports: [
      { name: 'Sales Trends', path: '/reports/analytics/sales-trends' },
      { name: 'Product Performance', path: '/reports/analytics/product-performance' },
      { name: 'Customer Insights', path: '/reports/analytics/customer-insights' }
    ]
  }
];

export default function ReportsPage() {
  const { isLoading, setLoading } = useStore();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  
  useEffect(() => {
    const fetchRecentReports = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch data from your API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Mock recent reports
        const mockRecentReports: Report[] = [
          { 
            id: 1, 
            name: 'Monthly Sales Summary', 
            type: 'Sales', 
            date: '2023-07-01', 
            path: '/reports/sales/summary' 
          },
          { 
            id: 2, 
            name: 'Inventory Valuation', 
            type: 'Inventory', 
            date: '2023-07-05', 
            path: '/reports/inventory/valuation' 
          },
          { 
            id: 3, 
            name: 'Quarterly Expense Report', 
            type: 'Financial', 
            date: '2023-07-10', 
            path: '/reports/financial/expenses' 
          }
        ];
        
        setRecentReports(mockRecentReports);
      } catch (error) {
        console.error('Error fetching recent reports:', error);
        toast.error('Failed to load recent reports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentReports();
  }, [setLoading]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <button
            onClick={() => toast.success('Report downloaded successfully')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
        
        {/* Recent Reports */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : recentReports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Generate a report to see it appear here.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                        <Link href={report.path}>
                          {report.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            href={report.path}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => toast.success('Report downloaded successfully')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REPORT_TYPES.map((type) => (
            <div key={type.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center">
                <type.icon className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">{type.name}</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">{type.description}</p>
                <div className="space-y-2">
                  {type.reports.map((report) => (
                    <Link
                      key={report.path}
                      href={report.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      {report.name}
      </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
    </Layout>
  );
}