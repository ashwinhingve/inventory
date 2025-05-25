'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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

// Mock quotation for edit
const mockQuotation = {
  id: '1',
  customer: '1',
  customerName: 'John Smith',
  customerEmail: 'john@example.com',
  customerAddress: '123 Main St, Anytown, USA',
  quoteNumber: 'QOT-10045',
  date: '2023-10-15',
  expiryDate: '2023-11-14',
  items: [
    {
      id: '1',
      productId: '1',
      name: 'Laptop',
      description: 'High-performance laptop',
      quantity: 2,
      unitPrice: 1200,
      tax: 10,
      discount: 5,
      subtotal: 2400,
      total: 2508
    },
    {
      id: '2',
      productId: '2',
      name: 'Smartphone',
      description: 'Latest model smartphone',
      quantity: 1,
      unitPrice: 800,
      tax: 10,
      discount: 0,
      subtotal: 800,
      total: 880
    }
  ],
  subtotal: 3200,
  taxAmount: 308,
  discount: 120,
  total: 3388,
  notes: 'Please review the quotation and let us know if you have any questions.',
  terms: 'This quotation is valid for 30 days from the date of issue.'
};

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
  id?: string;
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

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
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
    quoteNumber: '',
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

  // Fetch quotation data
  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        // In a real app, you'd fetch data from your API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setQuotation(mockQuotation);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        toast.error('Failed to load quotation data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuotation();
  }, [params.id, setLoading]);
  
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
      return; // Don't remove the last item
    }
    
    const updatedItems = quotation.items.filter((_, i) => i !== index);
    setQuotation({
      ...quotation,
      items: updatedItems
    });
    
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
      newErrors.customer = 'Please select a customer';
    }
    
    if (!quotation.quoteNumber) {
      newErrors.quoteNumber = 'Quote number is required';
    }
    
    if (!quotation.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!quotation.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }
    
    quotation.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item-${index}-product`] = 'Product is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item-${index}-unitPrice`] = 'Unit price must be greater than 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, you'd make an API call to update the quotation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      toast.success('Quotation updated successfully');
      router.push(`/sales/quotes/${params.id}`);
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center space-x-4">
          <Link 
            href={`/sales/quotes/${params.id}`}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Quotation</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer and Quote Details */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quote Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                  Customer*
                </label>
                <select
                  id="customer"
                  name="customer"
                  value={quotation.customer}
                  onChange={handleCustomerChange}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${errors.customer ? 'border-red-500' : ''}`}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer}</p>}
              </div>
              
              <div>
                <label htmlFor="quoteNumber" className="block text-sm font-medium text-gray-700">
                  Quote Number*
                </label>
                <input
                  type="text"
                  id="quoteNumber"
                  name="quoteNumber"
                  value={quotation.quoteNumber}
                  onChange={e => setQuotation({...quotation, quoteNumber: e.target.value})}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors.quoteNumber ? 'border-red-500' : ''}`}
                />
                {errors.quoteNumber && <p className="mt-1 text-xs text-red-500">{errors.quoteNumber}</p>}
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={quotation.date}
                    onChange={e => setQuotation({...quotation, date: e.target.value})}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${errors.date ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>
              
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={quotation.expiryDate}
                    onChange={e => setQuotation({...quotation, expiryDate: e.target.value})}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${errors.expiryDate ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.expiryDate && <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>}
              </div>
            </div>
          </div>
          
          {/* Quote Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Quote Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {quotation.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Item #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700">
                        Product*
                      </label>
                      <select
                        id={`product-${index}`}
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, e)}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${errors[`item-${index}-product`] ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                      {errors[`item-${index}-product`] && <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-product`]}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                        Quantity*
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        value={item.quantity}
                        min="1"
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors[`item-${index}-quantity`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`item-${index}-quantity`] && <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-quantity`]}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700">
                        Unit Price*
                      </label>
                      <input
                        type="number"
                        id={`unitPrice-${index}`}
                        value={item.unitPrice}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${errors[`item-${index}-unitPrice`] ? 'border-red-500' : ''}`}
                      />
                      {errors[`item-${index}-unitPrice`] && <p className="mt-1 text-xs text-red-500">{errors[`item-${index}-unitPrice`]}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor={`tax-${index}`} className="block text-sm font-medium text-gray-700">
                        Tax (%)
                      </label>
                      <input
                        type="number"
                        id={`tax-${index}`}
                        value={item.tax}
                        min="0"
                        max="100"
                        onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`discount-${index}`} className="block text-sm font-medium text-gray-700">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        id={`discount-${index}`}
                        value={item.discount}
                        min="0"
                        max="100"
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Subtotal</span>
                      <span className="block mt-1 text-sm text-gray-900">{formatCurrency(item.subtotal)}</span>
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-700">Total</span>
                      <span className="block mt-1 text-sm text-gray-900">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-medium text-gray-900">{formatCurrency(quotation.subtotal)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Discount</span>
                  <span className="text-lg font-medium text-gray-900">{formatCurrency(quotation.discount)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Tax</span>
                  <span className="text-lg font-medium text-gray-900">{formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-medium text-blue-600">{formatCurrency(quotation.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={quotation.notes}
                  onChange={(e) => setQuotation({...quotation, notes: e.target.value})}
                  placeholder="Any additional notes for the customer"
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
              <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                  Terms and Conditions
                </label>
                <textarea
                  id="terms"
                  name="terms"
                  rows={4}
                  value={quotation.terms}
                  onChange={(e) => setQuotation({...quotation, terms: e.target.value})}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                ></textarea>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Link
              href={`/sales/quotes/${params.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Quotation'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 