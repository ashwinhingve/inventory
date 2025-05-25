'use client';

import { useEffect, useState } from 'react';
import { ArrowLeftIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Product } from '@/types';
import toast from 'react-hot-toast';
import PageWrapper from '../../../../../components/PageWrapper';

export default function EditStockItemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [id, setId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    buyingPrice: '',
    sellingPrice: '',
    quantity: '',
    lowStockThreshold: '',
    barcode: '',
    store: '',
    supplier: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = ['Category 1', 'Category 2', 'Category 3'];
  
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
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        description: product.description || '',
        buyingPrice: product.buyingPrice?.toString() || '',
        sellingPrice: product.sellingPrice?.toString() || '',
        quantity: product.quantity?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '',
        barcode: product.barcode || '',
        store: product.store || '',
        supplier: product.supplier || ''
      });
    }
  }, [product]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // ... existing code ...
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Image upload logic here
  }
  
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
  
  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
            <p className="mt-2 text-sm text-gray-700">
              Update the details of your inventory item.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/inventory/stock"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Stock List
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Basic Information */}
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Item Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="sm:col-span-2">
                  <label htmlFor="buyingPrice" className="block text-sm font-medium text-gray-700">
                    Purchase Price *
                  </label>
                  <div className="mt-1">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="buyingPrice"
                        id="buyingPrice"
                        required
                        min="0"
                        step="0.01"
                        value={formData.buyingPrice}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
                    Selling Price *
                  </label>
                  <div className="mt-1">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        name="sellingPrice"
                        id="sellingPrice"
                        required
                        min="0"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div className="sm:col-span-2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Current Stock *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                    Minimum Stock Level
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="lowStockThreshold"
                      id="lowStockThreshold"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-6">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <Link
                  href="/inventory/stock"
                  className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}