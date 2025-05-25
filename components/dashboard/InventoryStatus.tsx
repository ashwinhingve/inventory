'use client';

import { useState, useEffect } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  threshold: number;
  category: string;
}

export default function InventoryStatus() {
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        setIsLoading(true);
        
        // Get token for authentication
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('/api/inventory/low-stock', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const data = await response.json();
        setLowStockItems(data.products);
        setError(null);
      } catch (err) {
        setError('Unable to load inventory status');
        console.error('Error fetching low stock items:', err);
        setLowStockItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  // For demo purposes, show some sample data if API is not implemented
  const sampleItems: Product[] = [
    {
      id: '1',
      name: 'Widget XL',
      sku: 'WDG-001',
      quantity: 5,
      threshold: 10,
      category: 'Hardware'
    },
    {
      id: '2',
      name: 'Blue Paint',
      sku: 'PNT-002',
      quantity: 2,
      threshold: 8,
      category: 'Supplies'
    },
    {
      id: '3',
      name: 'LED Bulbs',
      sku: 'LTS-003',
      quantity: 0,
      threshold: 15,
      category: 'Electrical'
    }
  ];

  const displayItems = lowStockItems.length > 0 ? lowStockItems : sampleItems;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
          </div>
          <Link 
            href="/inventory/low-stock" 
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            View all
          </Link>
        </div>
      </div>
      
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Low Stock Items</h3>
                <p className="mt-1 text-sm text-gray-700">All inventory items are above their threshold levels.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Item
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Threshold
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayItems.length > 0 ? (
                      displayItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              <Link href={`/inventory/product/${item.id}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </div>
                            <div className="text-xs text-gray-600">{item.sku}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {item.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className={`text-sm font-semibold ${
                              item.quantity === 0 
                                ? 'text-red-600' 
                                : item.quantity <= item.threshold / 2
                                  ? 'text-orange-600'
                                  : 'text-yellow-600'
                            }`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                            {item.threshold}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-sm text-center text-gray-700 font-medium">
                          No low stock items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 