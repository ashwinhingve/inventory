'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Mock data
const customers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', address: '123 Main St, Anytown, USA' },
  { id: '2', name: 'Alice Johnson', email: 'alice@example.com', address: '456 Oak Ave, Somewhere, USA' },
  { id: '3', name: 'Robert Brown', email: 'robert@example.com', address: '789 Pine Rd, Elsewhere, USA' },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', address: '321 Cedar Ln, Nowhere, USA' },
];

const products = [
  { id: '1', name: 'Laptop', sku: 'TECH-001', price: 1200, tax: 10, description: 'High-performance laptop' },
  { id: '2', name: 'Smartphone', sku: 'TECH-002', price: 800, tax: 10, description: 'Latest model smartphone' },
  { id: '3', name: 'Headphones', sku: 'TECH-003', price: 150, tax: 10, description: 'Noise-cancelling headphones' },
  { id: '4', name: 'Tablet', sku: 'TECH-004', price: 500, tax: 10, description: '10-inch tablet' },
];

type QuoteItem = {
  id: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
};

type Quotation = {
  customer: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  quoteNumber: string;
  date: string;
  expiryDate: string;
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  terms: string;
};

export default function NewQuotationPage() {
  const router = useRouter();
  const { isLoading, setLoading } = useStore();
  
  const initialQuoteItem: QuoteItem = {
    id: '1',
    productId: '',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    discount: 0,
    subtotal: 0,
    total: 0
  };
  
  const [quotation, setQuotation] = useState<Quotation>({
    customer: '',
    quoteNumber: `QOT-${10000 + Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [initialQuoteItem],
    subtotal: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    notes: '',
    terms: 'This quotation is valid for 30 days from the date of issue.'
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Handle customer change
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCustomer = customers.find(c => c.id === e.target.value);
    
    setQuotation({
      ...quotation,
      customer: e.target.value,
      customerName: selectedCustomer?.name || '',
      customerEmail: selectedCustomer?.email || '',
      customerAddress: selectedCustomer?.address || ''
    });
  };
  
  // Handle product selection
  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProduct = products.find(p => p.id === e.target.value);
    
    if (!selectedProduct) return;
    
    const updatedItems = [...quotation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: e.target.value,
      name: selectedProduct.name,
      description: selectedProduct.description,
      unitPrice: selectedProduct.price,
      tax: selectedProduct.tax
    };
    
    // Update totals
    calculateItemTotals(updatedItems, index);
    
    setQuotation({
      ...quotation,
      items: updatedItems
    });
  };
  
  // Handle item input changes
  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updatedItems = [...quotation.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Update totals
    calculateItemTotals(updatedItems, index);
    
    setQuotation({
      ...quotation,
      items: updatedItems
    });
  };
  
  // Calculate totals for an item
  const calculateItemTotals = (items: QuoteItem[], index: number) => {
    const item = items[index];
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const taxRate = Number(item.tax);
    const discount = Number(item.discount);
    
    // Calculate subtotal (before tax)
    const subtotal = quantity * unitPrice;
    // Calculate discount amount
    const discountAmount = subtotal * (discount / 100);
    // Calculate tax amount on discounted subtotal
    const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
    // Calculate total (subtotal - discount + tax)
    const total = subtotal - discountAmount + taxAmount;
    
    items[index].subtotal = subtotal;
    items[index].total = total;
    
    // Update quote totals
    updateQuotationTotals(items);
  };
  
  // Update quotation totals based on items
  const updateQuotationTotals = (items: QuoteItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    const taxAmount = items.reduce((sum, item) => {
      const discountedSubtotal = item.subtotal * (1 - (Number(item.discount) / 100));
      return sum + (discountedSubtotal * (Number(item.tax) / 100));
    }, 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.subtotal * (Number(item.discount) / 100)), 0);
    const total = subtotal - discountAmount + taxAmount;
    
    setQuotation(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discount: discountAmount,
      total
    }));
  };
  
  // Add new item
  const addItem = () => {
    const newItem: QuoteItem = {
      id: `${Date.now()}`,
      productId: '',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      discount: 0,
      subtotal: 0,
      total: 0
    };
    
    setQuotation({
      ...quotation,
      items: [...quotation.items, newItem]
    });
  };
  
  // Remove item
  const removeItem = (index: number) => {
    if (quotation.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    
    const updatedItems = quotation.items.filter((_, i) => i !== index);
    setQuotation({
      ...quotation,
      items: updatedItems
    });
    
    // Update totals
    updateQuotationTotals(updatedItems);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!quotation.customer) {
      newErrors.customer = 'Customer is required';
    }
    
    if (!quotation.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!quotation.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }
    
    // Validate items
    quotation.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_price`] = 'Price must be greater than 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, you'd make an API call to save the quotation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      toast.success('Quotation created successfully');
      router.push('/sales/quotes');
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error('Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/sales/quotes"
              className="mr-4 p-2 rounded-md hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">New Quotation</h1>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => router.push('/sales/quotes')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Quotation</>
              )}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quote Information */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quotation Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="customer"
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${errors.customer ? 'border-red-500' : ''}`}
                    value={quotation.customer}
                    onChange={handleCustomerChange}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {errors.customer && (
                    <p className="mt-1 text-sm text-red-500">{errors.customer}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="quoteNumber" className="block text-sm font-medium text-gray-700">
                    Quote Number
                  </label>
                  <input
                    type="text"
                    id="quoteNumber"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={quotation.quoteNumber}
                    readOnly
                  />
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      className={`block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.date ? 'border-red-500' : ''}`}
                      value={quotation.date}
                      onChange={(e) => setQuotation({...quotation, date: e.target.value})}
                    />
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="expiryDate"
                      className={`block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.expiryDate ? 'border-red-500' : ''}`}
                      value={quotation.expiryDate}
                      onChange={(e) => setQuotation({...quotation, expiryDate: e.target.value})}
                    />
                  </div>
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount (%)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotation.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`item_${index}_product`] ? 'border-red-500' : ''}`}
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e)}
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}_product`] && (
                          <p className="mt-1 text-sm text-red-500">{errors[`item_${index}_product`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`item_${index}_quantity`] ? 'border-red-500' : ''}`}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-sm text-red-500">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors[`item_${index}_price`] ? 'border-red-500' : ''}`}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                        />
                        {errors[`item_${index}_price`] && (
                          <p className="mt-1 text-sm text-red-500">{errors[`item_${index}_price`]}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item.tax}
                          onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex flex-col items-end">
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(quotation.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(quotation.discount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes and Terms */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notes and Terms</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Notes for the customer"
                    value={quotation.notes}
                    onChange={(e) => setQuotation({...quotation, notes: e.target.value})}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  These notes will be displayed on the quotation.
                </p>
              </div>
              
              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                  Terms and Conditions
                </label>
                <div className="mt-1">
                  <textarea
                    id="terms"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Terms and conditions"
                    value={quotation.terms}
                    onChange={(e) => setQuotation({...quotation, terms: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/sales/quotes')}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save Quotation</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 