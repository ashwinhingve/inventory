'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Product } from '@/types';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

export default function NewSalesReturnPage() {
  const router = useRouter();
  const { fetchProducts, products, isLoading, setLoading } = useStore();
  
  // State for return form
  const [returnData, setReturnData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    customer: '',
    notes: '',
    reason: 'Damaged',
    status: 'pending',
    invoice: '',
    products: [{ 
      product: '', 
      quantity: 1, 
      price: 0 
    }],
    total: 0
  });
  
  // Get products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  // Calculate total when products change
  useEffect(() => {
    const total = returnData.products.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    setReturnData(prev => ({ ...prev, total }));
  }, [returnData.products]);
  
  // Handle adding a new product row
  const handleAddProduct = () => {
    setReturnData(prev => ({
      ...prev,
      products: [...prev.products, { product: '', quantity: 1, price: 0 }]
    }));
  };
  
  // Handle removing a product row
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...returnData.products];
    updatedProducts.splice(index, 1);
    
    setReturnData(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };
  
  // Handle product selection change
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (!selectedProduct) return;
    
    const updatedProducts = [...returnData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: productId,
      price: selectedProduct.sellingPrice
    };
    
    setReturnData(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle changing quantity
  const handleQuantityChange = (index: number, value: number) => {
    if (value < 1) return;
    
    const updatedProducts = [...returnData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: value
    };
    
    setReturnData(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle price change
  const handlePriceChange = (index: number, value: number) => {
    if (value < 0) return;
    
    const updatedProducts = [...returnData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      price: value
    };
    
    setReturnData(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle general input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReturnData(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit the return
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!returnData.customer.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    if (returnData.products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    const hasInvalidProduct = returnData.products.some(item => !item.product);
    if (hasInvalidProduct) {
      toast.error('Please select a product for all rows');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare transaction data
      // const transactionData = {
      //   type: 'return',
      //   date: new Date(returnData.date),
      //   products: returnData.products,
      //   party: returnData.customer,
      //   total: returnData.total,
      //   notes: `Reason: ${returnData.reason}. ${returnData.notes}`,
      //   status: returnData.status,
      //   returnReason: returnData.reason,
      //   reference: returnData.invoice
      // };
      
      // In a real application, we would send data to API
      // For demonstration purposes, we'll just show a success message
      
      // Simulate API call
      setTimeout(() => {
        toast.success('Return created successfully');
        router.push('/sales/return');
        setLoading(false);
      }, 1000);
      
      // Actual API call would look like this:
      /*
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create return');
      }
      
      toast.success('Return created successfully');
      router.push('/sales/return');
      */
      
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create return');
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/sales/return"
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Return</h1>
              <p className="text-sm text-gray-500 mt-1">Process returned items from customers</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {/* Return Header */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={returnData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={returnData.customer}
                  onChange={handleChange}
                  placeholder="Customer name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700">Original Invoice (Optional)</label>
                <input
                  type="text"
                  id="invoice"
                  name="invoice"
                  value={returnData.invoice}
                  onChange={handleChange}
                  placeholder="Invoice number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Return Reason</label>
                <select
                  id="reason"
                  name="reason"
                  value={returnData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="Damaged">Damaged</option>
                  <option value="Wrong Item">Wrong Item</option>
                  <option value="Not as Described">Not as Described</option>
                  <option value="Defective">Defective</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  value={returnData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Return Products */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Products</h3>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="relative px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnData.products.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      <select
                        value={item.product}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product: Product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ₹{product.sellingPrice}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                        required
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handlePriceChange(index, parseFloat(e.target.value))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                        required
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 text-right font-medium">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      {returnData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="px-3 py-4">
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Product
                    </button>
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={3} className="px-3 py-4 text-right text-base font-medium text-gray-900">Total:</td>
                  <td className="px-3 py-4 text-right text-base font-medium text-gray-900">₹{returnData.total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Notes and Submit */}
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={returnData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the return (optional)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link
                href="/sales/return"
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Process Return'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 