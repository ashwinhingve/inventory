"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/ui/Layout";
import Link from "next/link";
import { toast } from "react-hot-toast";

// Define payment interfaces
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
}

interface PaymentFormData {
  date: string;
  customerId: string;
  customerName: string;
  amount: string;
  paymentMethod: string;
  reference: string;
  invoiceId: string;
  notes: string;
  status: string;
}

interface UpdatePaymentResponse {
  success: boolean;
}

// Payment methods
const paymentMethods = [
  { id: "cash", name: "Cash" },
  { id: "credit_card", name: "Credit Card" },
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "check", name: "Check" },
  { id: "paypal", name: "PayPal" },
];

// Payment statuses
const paymentStatuses = [
  { id: "completed", name: "Completed" },
  { id: "pending", name: "Pending" },
  { id: "failed", name: "Failed" },
];

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
    status: "completed"
  };
};

// Mock function to update a payment
const updatePayment = async (id: string, data: PaymentFormData): Promise<UpdatePaymentResponse> => {
  // In a real app, this would be an API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  console.log("Updating payment", id, data);
  return { success: true };
};

export default function EditPaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    date: "",
    customerId: "",
    customerName: "",
    amount: "",
    paymentMethod: "",
    reference: "",
    invoiceId: "",
    notes: "",
    status: ""
  });

  // Get the payment ID from the URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // Get the ID from the URL
    setPaymentId(id);
    
    // Fetch payment data
    fetchPayment(id)
      .then(payment => {
        setFormData({
          date: payment.date,
          customerId: payment.customerId,
          customerName: payment.customerName,
          amount: payment.amount.toString(),
          paymentMethod: payment.paymentMethod,
          reference: payment.reference,
          invoiceId: payment.invoiceId,
          notes: payment.notes || "",
          status: payment.status
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching payment:", err);
        setError("Failed to load payment details");
        setIsLoading(false);
      });
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.date) return toast.error("Date is required");
    if (!formData.customerName) return toast.error("Customer is required");
    if (!formData.amount || isNaN(Number(formData.amount))) return toast.error("Valid amount is required");
    if (!formData.paymentMethod) return toast.error("Payment method is required");
    if (!formData.status) return toast.error("Status is required");
    
    try {
      setIsSubmitting(true);
      
      // Convert amount to number
      const processedData = {
        ...formData,
        amount: formData.amount
      };
      
      // Submit form data
      const result = await updatePayment(paymentId, processedData);
      
      if (result.success) {
        toast.success("Payment updated successfully");
        router.push(`/sales/payment-in/${paymentId}`);
      } else {
        throw new Error("Failed to update payment");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            href={`/sales/payment-in/${paymentId}`}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Payment</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Customer */}
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer*
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount*
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method*
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference */}
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Invoice ID */}
              <div>
                <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice ID
                </label>
                <input
                  type="text"
                  id="invoiceId"
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a status</option>
                  {paymentStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href={`/sales/payment-in/${paymentId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
} 