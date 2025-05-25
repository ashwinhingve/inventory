'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import toast from 'react-hot-toast';

// Define interfaces
interface Invoice {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

interface PaymentFormData {
  date: string;
  customer: string;
  amount: string;
  paymentMethod: string;
  reference: string;
  invoiceId: string;
  notes: string;
  status: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', name: 'Cash' },
  { id: 'bankTransfer', name: 'Bank Transfer' },
  { id: 'creditCard', name: 'Credit Card' },
  { id: 'check', name: 'Check' },
  { id: 'onlinePayment', name: 'Online Payment' },
];

// Mock invoices for selection
const mockInvoices: Invoice[] = [
  { id: 'INV-2023001', customer: 'Customer A', amount: 1200, date: '2023-05-15', status: 'unpaid' },
  { id: 'INV-2023002', customer: 'Customer B', amount: 3500, date: '2023-05-18', status: 'unpaid' },
  { id: 'INV-2023003', customer: 'Customer C', amount: 950, date: '2023-05-20', status: 'partial' },
  { id: 'INV-2023004', customer: 'Customer A', amount: 2100, date: '2023-05-22', status: 'unpaid' },
  { id: 'INV-2023005', customer: 'Customer D', amount: 1800, date: '2023-05-25', status: 'unpaid' },
];

export default function NewPaymentPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    date: new Date().toISOString().split('T')[0],
    customer: '',
    amount: '',
    paymentMethod: '',
    reference: '',
    invoiceId: '',
    notes: '',
    status: 'completed'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices] = useState<Invoice[]>(mockInvoices);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInvoiceSelect = (invoice: Invoice) => {
    setFormData(prev => ({ 
      ...prev, 
      invoiceId: invoice.id,
      customer: invoice.customer,
      amount: invoice.amount.toString()
    }));
    setShowInvoices(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date) {
      toast.error('Please select a payment date');
      return;
    }
    
    if (!formData.customer) {
      toast.error('Please enter a customer name');
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be a POST request to your API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Payment added successfully');
      router.push('/sales/payment-in');
    } catch (err) {
      console.error('Error adding payment:', err);
      toast.error('Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link
            href="/sales/payment-in"
            className="inline-flex items-center p-2 rounded hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Payment</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="relative">
                <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-1">
                  Related Invoice
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="invoiceId"
                    name="invoiceId"
                    value={formData.invoiceId}
                    onChange={handleChange}
                    onFocus={() => setShowInvoices(true)}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Select an invoice (optional)"
                    autoComplete="off"
                  />
                  {showInvoices && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md overflow-auto border border-gray-200">
                      <ul className="py-1 text-sm">
                        {invoices.map(invoice => (
                          <li
                            key={invoice.id}
                            className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                            onClick={() => handleInvoiceSelect(invoice)}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{invoice.id}</span>
                              <span>₹{invoice.amount}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-xs">
                              <span>{invoice.customer}</span>
                              <span>{invoice.date}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Selecting an invoice will auto-fill customer and amount details
                </p>
              </div>
              
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer*
                </label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount* (₹)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method*
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.name}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Check number, transaction ID, etc."
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any additional information about this payment"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3 border-t border-gray-200">
            <Link
              href="/sales/payment-in"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 