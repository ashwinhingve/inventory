"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import Layout from "@/components/ui/Layout";
import Link from "next/link";
import { toast } from "react-hot-toast";

// Define Payment interface
interface Payment {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  invoiceId: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Define API response interface
interface DeletePaymentResponse {
  success: boolean;
}

// Mock function to fetch a payment by ID
const fetchPayment = async (id: string): Promise<Payment> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  // Return mock data
  return {
    id: id,
    date: "2023-11-15",
    customerId: "cust123",
    customerName: "Acme Corporation",
    amount: 1250.00,
    paymentMethod: "bank_transfer",
    reference: "PMT-2023-001",
    invoiceId: "INV-2023-001",
    notes: "Quarterly payment for services rendered",
    status: "completed",
    createdAt: "2023-11-15T10:30:00Z",
    updatedAt: "2023-11-15T10:30:00Z"
  };
};

// Mock function to delete a payment
const deletePayment = async (id: string): Promise<DeletePaymentResponse> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  console.log("Deleting payment", id);
  return { success: true };
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to get human-readable payment method name
const getPaymentMethodName = (methodId: string) => {
  const methods: Record<string, string> = {
    cash: "Cash",
    credit_card: "Credit Card",
    bank_transfer: "Bank Transfer",
    check: "Check",
    paypal: "PayPal"
  };
  
  return methods[methodId] || methodId;
};

// Helper function to get status badge class
const getStatusBadgeClass = (status: string) => {
  const classes = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800"
  } as Record<string, string>;
  
  return classes[status] || "bg-gray-100 text-gray-800";
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // Get the payment ID from the URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1]; // Get the ID from the URL
    setPaymentId(id);
    
    // Fetch payment data
    fetchPayment(id)
      .then(data => {
        setPayment(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching payment:", err);
        setError("Failed to load payment details");
        setIsLoading(false);
      });
  }, []);

  // Handle payment deletion
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const result = await deletePayment(paymentId);
      
      if (result.success) {
        toast.success("Payment deleted successfully");
        router.push("/sales/payment-in");
      } else {
        throw new Error("Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment");
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/sales/payment-in"
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Payment Details</h1>
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/sales/payment-in/${paymentId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <TrashIcon className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : payment ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Status Badge */}
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment {payment.reference}
              </h3>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>

            <div className="border-t border-gray-200">
              <dl>
                {/* Amount */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                    {formatCurrency(payment.amount)}
                  </dd>
                </div>

                {/* Date */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(payment.date)}
                  </dd>
                </div>

                {/* Customer */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <Link 
                      href={`/customers/${payment.customerId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {payment.customerName}
                    </Link>
                  </dd>
                </div>

                {/* Payment Method */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {getPaymentMethodName(payment.paymentMethod)}
                  </dd>
                </div>

                {/* Reference */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reference</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {payment.reference || "—"}
                  </dd>
                </div>

                {/* Invoice */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Invoice</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {payment.invoiceId ? (
                      <Link 
                        href={`/sales/invoice/${payment.invoiceId}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        {payment.invoiceId}
                      </Link>
                    ) : "—"}
                  </dd>
                </div>

                {/* Notes */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {payment.notes || "—"}
                  </dd>
                </div>

                {/* Metadata */}
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(payment.createdAt)}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {formatDate(payment.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
} 