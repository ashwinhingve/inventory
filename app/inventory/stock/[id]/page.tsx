'use client';

import { useEffect, useState } from 'react';
// import Layout from '@/components/ui/Layout';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import toast from 'react-hot-toast';

// Extended product interface for additional fields
interface ExtendedProduct extends Product {
  gstRate?: number;
  hsnCode?: string;
  imageUrl?: string;
}

// Create PageWrapper component to fix Layout issue
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="container mx-auto px-4 py-8">{children}</div>
);

export default function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [id, setId] = useState<string>('');
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract params first
  useEffect(() => {
    async function extractParams() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    }
    extractParams();
  }, [params]);
  
  useEffect(() => {
    if (!id) return; // Wait for id to be set
    
    async function fetchProduct() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product. Please try again.');
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProduct();
  }, [id]);
  
  // const handleDelete = async () => {
  //   if (window.confirm('Are you sure you want to delete this product?')) {
  //     try {
  //       const response = await fetch(`/api/products/${id}`, {
  //         method: 'DELETE',
  //       });
        
  //       if (!response.ok) {
  //         throw new Error('Failed to delete product');
  //       }
        
  //       toast.success('Product deleted successfully');
  //       router.push('/inventory/stock');
  //     } catch (error) {
  //       console.error('Error deleting product:', error);
  //       toast.error('Failed to delete product');
  //     }
  //   }
  // };
  
  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading product details...</p>
        </div>
      </PageWrapper>
    );
  }
  
  if (error || !product) {
    return (
      <PageWrapper>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-500 mb-4">{error || 'Product not found'}</p>
          <Link
            href="/inventory/stock"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Stock
          </Link>
        </div>
      </PageWrapper>
    );
  }
  
  const isLowStock = product.quantity <= product.lowStockThreshold;
  
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
            <p className="mt-2 text-sm text-gray-700">
              View detailed information about this inventory item.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
            <Link
              href="/inventory/stock"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Stock List
            </Link>
            <Link
              href={`/inventory/stock/${id}/edit`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Item
            </Link>
          </div>           
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Item Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.description || 'No description provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.barcode || 'No barcode assigned'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Stock Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.quantity <= product.lowStockThreshold
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.quantity} units
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ml-2">
                            Low Stock
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Minimum Stock Level</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.lowStockThreshold} units</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Pricing and Tax Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
                      <dd className="mt-1 text-sm text-gray-900">₹{product.buyingPrice.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">MRP</dt>
                      <dd className="mt-1 text-sm text-gray-900">₹{product.sellingPrice.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Selling Price</dt>
                      <dd className="mt-1 text-sm text-gray-900">₹{product.sellingPrice.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Information</h3>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">GST Rate</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.gstRate || 'Not specified'}%</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">HSN Code</dt>
                      <dd className="mt-1 text-sm text-gray-900">{product.hsnCode || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Product Image */}
            {product.imageUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image</h3>
                <div className="mt-2">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={192}
                    height={192}
                    className="h-48 w-48 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Stock History */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stock History</h3>
              <div className="mt-2 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Date
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Type
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Quantity
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Reference
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {/* Mock stock history data */}
                          {[
                            {
                              id: '1',
                              date: '2023-04-15',
                              type: 'purchase',
                              quantity: 50,
                              reference: 'PO-12345'
                            },
                            {
                              id: '2',
                              date: '2023-04-18',
                              type: 'sale',
                              quantity: -10,
                              reference: 'SO-67890'
                            },
                            {
                              id: '3',
                              date: '2023-04-20',
                              type: 'adjustment',
                              quantity: -2,
                              reference: 'ADJ-54321'
                            },
                          ].map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                {item.date}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.type === 'purchase'
                                    ? 'bg-green-100 text-green-800'
                                    : item.type === 'sale'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm">
                                <span className={`font-medium ${
                                  item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {item.quantity > 0 ? '+' : ''}{item.quantity}
                                </span>  
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                {item.reference}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}