'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Product } from '@/types';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define interface for invoice product item
interface InvoiceProductItem {
  product: string | { 
    _id: string; 
    name?: string;
    sku?: string;
    description?: string;
    sellingPrice?: number;
    quantity?: number;
  };
  quantity: number;
  price: number;
}

export default function DuplicateInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { fetchProducts, products, isLoading, setLoading } = useStore();
  
  // State for invoice form
  const [invoice, setInvoice] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    customer: '',
    notes: '',
    paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    paymentMethod: 'cash',
    products: [{ 
      product: '', 
      quantity: 1, 
      price: 0 
    }],
    total: 0
  });
  
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [error, setError] = useState('');
  
  // Get products and original invoice data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products
        await fetchProducts();
        
        // Load original invoice data
        const response = await fetch(`/api/transactions/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        
        const data = await response.json();
        
        // Set invoice data with current date (for the duplicate)
        setInvoice({
          date: format(new Date(), 'yyyy-MM-dd'), // Use current date for the duplicate
          customer: data.party || '',
          notes: data.notes || '',
          paymentStatus: 'unpaid', // Always start as unpaid for duplicate
          paymentMethod: data.paymentMethod || 'cash',
          products: data.products.map((item: InvoiceProductItem) => ({
            product: typeof item.product === 'object' ? item.product._id : item.product,
            quantity: item.quantity,
            price: item.price
          })),
          total: data.total
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load original invoice data');
      } finally {
        setIsLoadingInvoice(false);
      }
    };
    
    loadData();
  }, [id, fetchProducts]);
  
  // Calculate total when products change
  useEffect(() => {
    const total = invoice.products.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    setInvoice(prev => ({ ...prev, total }));
  }, [invoice.products]);
  
  // Handle adding a new product row
  const handleAddProduct = () => {
    setInvoice(prev => ({
      ...prev,
      products: [...prev.products, { product: '', quantity: 1, price: 0 }]
    }));
  };
  
  // Handle removing a product row
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...invoice.products];
    updatedProducts.splice(index, 1);
    
    setInvoice(prev => ({
      ...prev,
      products: updatedProducts
    }));
  };
  
  // Handle product selection change
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (!selectedProduct) return;
    
    const updatedProducts = [...invoice.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      product: productId,
      price: selectedProduct.sellingPrice
    };
    
    setInvoice(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle changing quantity
  const handleQuantityChange = (index: number, value: number) => {
    if (value < 1) return;
    
    const updatedProducts = [...invoice.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: value
    };
    
    setInvoice(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle price change
  const handlePriceChange = (index: number, value: number) => {
    if (value < 0) return;
    
    const updatedProducts = [...invoice.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      price: value
    };
    
    setInvoice(prev => ({ ...prev, products: updatedProducts }));
  };
  
  // Handle general input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit the new invoice
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!invoice.customer.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    if (invoice.products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    const hasInvalidProduct = invoice.products.some(item => !item.product);
    if (hasInvalidProduct) {
      toast.error('Please select a product for all rows');
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare transaction data
      const transactionData = {
        type: 'sale',
        date: new Date(invoice.date),
        products: invoice.products,
        party: invoice.customer,
        total: invoice.total,
        notes: invoice.notes,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod
      };
      
      // Send data to API to create a new transaction
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create duplicate invoice');
      }
      
      toast.success('Duplicate invoice created successfully');
      router.push('/sales/invoice');
    } catch (error) {
      console.error('Error creating duplicate invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create duplicate invoice');
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoadingInvoice) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="ml-2 text-gray-600">Loading invoice data...</p>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <p>{error}</p>
          <Link href="/sales/invoice" className="text-red-600 font-medium hover:text-red-800 mt-2 inline-block">
            Return to Invoices
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/sales/invoice"
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Duplicate Invoice</h1>
              <p className="text-sm text-gray-500 mt-1">Create a new invoice based on invoice #{id}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow divide-y divide-gray-200">
          {/* Invoice Header */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={invoice.date}
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
                  value={invoice.customer}
                  onChange={handleChange}
                  placeholder="Customer name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={invoice.paymentStatus}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partially Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={invoice.paymentMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Invoice Products */}
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
                {invoice.products.map((item, index) => (
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
                            {product.name} - ₹{product.sellingPrice} ({product.quantity} in stock)
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
                      {invoice.products.length > 1 && (
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
                  <td className="px-3 py-4 text-right text-base font-medium text-gray-900">₹{invoice.total.toFixed(2)}</td>
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
                value={invoice.notes}
                onChange={handleChange}
                placeholder="Additional notes (optional)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            
            <div className="flex justify-end pt-4">
              <Link
                href="/sales/invoice"
                className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Duplicate Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 