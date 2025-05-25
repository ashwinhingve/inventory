'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  PencilIcon,
  DocumentTextIcon,
  TrashIcon,
  PrinterIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define interfaces for quotation data
interface QuotationItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  subtotal: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Quotation {
  id: string;
  quoteNumber: string;
  date: string;
  expiryDate: string;
  customer: Customer;
  items: QuotationItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string;
  terms: string;
  status: string;
}

// Mock data for quotation
const mockQuotation: Quotation = {
  id: '1',
  quoteNumber: 'QOT-10045',
  date: '2023-10-15',
  expiryDate: '2023-11-14',
  customer: {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567'
  },
  items: [
    {
      id: '1',
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
  terms: 'This quotation is valid for 30 days from the date of issue.',
  status: 'pending' // pending, accepted, rejected, expired, converted
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading, setLoading } = useStore();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  useEffect(() => {
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        // In a real app, you'd make an API call to fetch the quotation
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setQuotation(mockQuotation);
      } catch (error) {
        console.error('Error fetching quotation:', error);
        toast.error('Failed to load quotation details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuotation();
  }, [params.id, setLoading]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Handle delete quotation
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // In a real app, you'd make an API call to delete the quotation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      toast.success('Quotation deleted successfully');
      router.push('/sales/quotes');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle convert to invoice
  const handleConvertToInvoice = async () => {
    if (!window.confirm('Are you sure you want to convert this quotation to an invoice?')) {
      return;
    }
    
    setIsConverting(true);
    try {
      // In a real app, you'd make an API call to convert the quotation
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      toast.success('Quotation converted to invoice successfully');
      router.push('/sales/invoice'); // Redirect to the newly created invoice
    } catch (error) {
      console.error('Error converting quotation:', error);
      toast.error('Failed to convert quotation to invoice');
    } finally {
      setIsConverting(false);
    }
  };
  
  // Handle print quotation
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download PDF
  const handleDownloadPDF = () => {
    // Implementation for downloading PDF
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'accepted':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'expired':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'converted':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize`}>
        {status}
      </span>
    );
  };
  
  if (isLoading || !quotation) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center">
            <Link
              href="/sales/quotes"
              className="mr-4 p-2 rounded-md hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-heading">
                {quotation.quoteNumber}
                <StatusBadge status={quotation.status} />
              </h1>
              <p className="text-sm text-tertiary">
                Created on {formatDate(quotation.date)} • 
                Expires on {formatDate(quotation.expiryDate)}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-semibold rounded-md text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </button>
            <Link
              href={`/sales/quotes/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semibold rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              type="button"
              onClick={handleConvertToInvoice}
              disabled={isConverting || quotation.status === 'converted'}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <>
                  <div className="h-4 w-4 mr-1 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Convert to Invoice
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 mr-1 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden print:shadow-none">
          {/* Quotation header */}
          <div className="p-6 border-b border-gray-200 print:p-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold text-heading">QUOTATION</h2>
                <p className="text-tertiary mt-1">#{quotation.quoteNumber}</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-heading">Your Company Name</h3>
                <p className="text-tertiary">123 Company Street</p>
                <p className="text-tertiary">Business City, ST 12345</p>
                <p className="text-tertiary">contact@yourcompany.com</p>
              </div>
            </div>
          </div>
          
          {/* Customer info */}
          <div className="p-6 border-b border-gray-200 print:p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase">Bill To</h3>
                <p className="mt-1 text-subtitle">{quotation.customer.name}</p>
                <p className="text-tertiary">{quotation.customer.address}</p>
                <p className="text-tertiary">{quotation.customer.email}</p>
                <p className="text-tertiary">{quotation.customer.phone}</p>
              </div>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-muted w-32">Quote Number:</span>
                    <span className="text-subtitle ml-4">{quotation.quoteNumber}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-muted w-32">Quote Date:</span>
                    <span className="text-subtitle ml-4">{formatDate(quotation.date)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-muted w-32">Expiry Date:</span>
                    <span className="text-subtitle ml-4">{formatDate(quotation.expiryDate)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold text-muted w-32">Status:</span>
                    <span className="ml-4">
                      <StatusBadge status={quotation.status} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Items table */}
          <div className="overflow-x-auto border-b border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tax
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotation.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-body">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-tertiary">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-tertiary">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-tertiary">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-tertiary">
                      {formatCurrency(item.tax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-body">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Totals */}
          <div className="p-6 border-t border-gray-200 print:p-4">
            <div className="flex justify-end">
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Subtotal:</span>
                  <span className="text-sm font-medium text-body">{formatCurrency(quotation.subtotal)}</span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-tertiary">Discount:</span>
                    <span className="text-sm font-medium text-body">-{formatCurrency(quotation.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-tertiary">Tax:</span>
                  <span className="text-sm font-medium text-body">{formatCurrency(quotation.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-heading">Total:</span>
                  <span className="text-base font-bold text-heading">{formatCurrency(quotation.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes and Terms */}
          <div className="p-6 border-t border-gray-200 print:p-4">
            <div className="space-y-4">
              {quotation.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Notes</h3>
                  <p className="mt-1 text-sm text-tertiary whitespace-pre-wrap">{quotation.notes}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase">Terms & Conditions</h3>
                <p className="mt-1 text-sm text-tertiary whitespace-pre-wrap">
                  {quotation.terms || `1. This quotation is valid for 30 days from the date of issue.
2. Payment terms: 50% advance, 50% upon delivery.
3. Delivery timeline: 2-3 weeks from order confirmation.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 