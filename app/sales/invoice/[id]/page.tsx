 'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define interfaces for Invoice and InvoiceProduct
interface InvoiceProduct {
  product: string | { 
    _id: string;
    name: string; 
  };
  quantity: number;
  price: number;
}

interface Invoice {
  _id: string;
  invoiceNumber?: string;
  date: string;
  dueDate?: string;
  party: string;
  notes?: string;
  products: InvoiceProduct[];
  total: number;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { setLoading } = useStore();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);
  const [error, setError] = useState('');
  
  // Get invoice data on component mount
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setIsLoadingInvoice(true);
        const response = await fetch(`/api/transactions/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice data');
      } finally {
        setIsLoadingInvoice(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  // Handle delete invoice
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete invoice');
        }
        
        toast.success('Invoice deleted successfully');
        router.push('/sales/invoice');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete invoice');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle print invoice
  const handlePrint = () => {
    window.print();
  };
  
  // Get status color class
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoadingInvoice) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="ml-2 text-gray-600">Loading invoice...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !invoice) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <p>{error || 'Invoice not found'}</p>
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href="/sales/invoice"
              className="mr-4 p-2 rounded-full hover:bg-gray-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice {id}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {invoice.date && format(new Date(invoice.date), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <Link
              href={`/sales/invoice/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <Link
              href={`/sales/invoice/${id}/duplicate`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Duplicate
            </Link>
            <Link
              href={`/sales/invoice/${id}/download`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
        
        {/* Printable Invoice */}
        <div className="bg-white shadow rounded-lg p-6" id="printable-invoice">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
              <p className="text-gray-600 mt-1">#{id}</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold">Your Company</h3>
              <p className="text-gray-600">123 Business Street</p>
              <p className="text-gray-600">City, State 12345</p>
              <p className="text-gray-600">Phone: (123) 456-7890</p>
              <p className="text-gray-600">Email: info@yourcompany.com</p>
            </div>
          </div>
          
          <div className="border-t border-b border-gray-200 py-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Bill To:</h4>
                <p className="font-medium">{invoice.party || 'Customer Name'}</p>
                <p className="text-gray-600">Customer Address</p>
                <p className="text-gray-600">City, State 12345</p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Invoice Date:</h4>
                  <p>{invoice.date && format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Payment Status:</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.paymentStatus)}`}>
                    {invoice.paymentStatus ? invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1) : 'Unpaid'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method:</h4>
                  <p>{invoice.paymentMethod ? invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <table className="min-w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 font-medium text-gray-900">Product</th>
                <th className="text-right py-3 font-medium text-gray-900">Quantity</th>
                <th className="text-right py-3 font-medium text-gray-900">Price</th>
                <th className="text-right py-3 font-medium text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products && invoice.products.map((item: InvoiceProduct, index: number) => {
                const product = typeof item.product === 'object' ? item.product : { name: 'Product' };
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">{product.name}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right font-medium">Subtotal:</td>
                <td className="py-3 text-right font-medium">₹{invoice.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="py-3 text-right font-medium">Tax (0%):</td>
                <td className="py-3 text-right font-medium">₹0.00</td>
              </tr>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="py-3 text-right font-medium text-lg">Total:</td>
                <td className="py-3 text-right font-bold text-lg">₹{invoice.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">Notes:</h4>
            <p className="text-gray-600">{invoice.notes || 'No additional notes provided.'}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-8 text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
} 