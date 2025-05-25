'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { Invoice, PaymentMethod, PaymentStatus, Product } from '@/types';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
 
import PartySelector from '@/components/PartySelector';
import AddItemsModal from '@/components/AddItemsModal';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { products } = useStore();
  const [isAddItemsModalOpen, setIsAddItemsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [invoice, setInvoice] = useState<Omit<Invoice, '_id' | 'invoiceNumber'>>({
    date: new Date(),
    entryTime: format(new Date(), 'HH:mm'),
    prefix: 'S',
    serialNumber: '1',
    party: '',
    items: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
    paidAmount: 0,
    dueAmount: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    notes: '',
    termsAndConditions: '',
    paymentHistory: []
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products')
        ]);

        if (!customersRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [customersData, productsData] = await Promise.all([
          customersRes.json(),
          productsRes.json()
        ]);

        // Store the data in your state or context if needed
        // For now, we'll just log it to show it's being used
        console.log('Fetched data:', { customersData, productsData });
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    const total = invoice.items.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    setInvoice(prev => ({ ...prev, total }));
  }, [invoice.items]);
  
  const handlePartySelect = (partyId: string) => {
    setInvoice(prev => ({ ...prev, party: partyId }));
  };
  
  const handleCreateParty = async (partyName: string) => {
    try {
      setLoading(true);
      toast.loading('Creating new party...');
      
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partyName,
          balanceType: 'Receivable',
          openingBalance: 0
        })
      });
      
      if (!response.ok) throw new Error('Failed to create party');
      const party = await response.json();
      
      toast.dismiss();
      toast.success('Party created successfully');
      return party._id;
    } catch {
      toast.dismiss();
      toast.error('Failed to create party');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddItems = (selectedItems: Array<{ product: Product; quantity: number }>) => {
    const newItems = selectedItems.map(item => {
      if (!item.product._id) {
        throw new Error('Product ID is required');
      }
      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.buyingPrice,
        total: item.quantity * item.product.buyingPrice,
        discount: 0
      };
    });

    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));

    setIsAddItemsModalOpen(false);
  };
  
  const handlePaidAmountChange = (amount: number, method: PaymentMethod) => {
    setInvoice(prev => {
      const dueAmount = prev.total - amount;
      const paymentStatus = amount >= prev.total ? 'paid' as PaymentStatus 
        : amount > 0 ? 'partial' as PaymentStatus 
        : 'unpaid' as PaymentStatus;
      return {
        ...prev,
        paidAmount: amount,
        dueAmount,
        paymentMethod: method,
        paymentStatus
      };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice.party) {
      toast.error('Please select a party');
      return;
    }
    
    if (!invoice.items.length) {
      toast.error('Please add at least one item');
      return;
    }
    
    try {
      setLoading(true);
      
      const partyResponse = await fetch(`/api/parties/${invoice.party}`);
      if (!partyResponse.ok) {
        throw new Error('Failed to fetch party details');
      }
      const party = await partyResponse.json();
      
      const invoiceData = {
        date: new Date(invoice.date),
        party: invoice.party,
        partyName: party.name,
        items: invoice.items,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        discountAmount: invoice.discountAmount,
        total: invoice.total,
        paidAmount: invoice.paidAmount,
        dueAmount: invoice.dueAmount,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        notes: invoice.notes,
        paymentHistory: invoice.paidAmount > 0 ? [{
          date: new Date(),
          amount: invoice.paidAmount,
          method: invoice.paymentMethod,
          notes: 'Initial payment'
        }] : []
      };
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }
      
      toast.success('Invoice created successfully');
      router.push('/sales');
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link href="/sales" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party<span className="text-red-500">*</span>
                </label>
                <PartySelector
                  selectedPartyId={typeof invoice.party === 'string' ? invoice.party : invoice.party._id}
                  onPartySelect={handlePartySelect}
                  onCreateParty={handleCreateParty}
                  placeholder="Select or create a party"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={format(invoice.date, 'yyyy-MM-dd')}
                  onChange={(e) => setInvoice(prev => ({ 
                    ...prev, 
                    date: new Date(e.target.value) 
                  }))}
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Items</h2>
                <button
                  type="button"
                  onClick={() => setIsAddItemsModalOpen(true)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                >
                  Select Item From Item List
                </button>
              </div>
            </div>

            <div className="p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item Name</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={typeof item.product === 'string' ? item.product : item.product._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{item.price}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">₹{invoice.subtotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          {/* Notes and Submit */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={invoice.paymentMethod}
                  onChange={(e) => setInvoice(prev => ({ 
                    ...prev, 
                    paymentMethod: e.target.value as PaymentMethod 
                  }))}
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Received Amount
                </label>
                <input
                  type="number"
                  name="receivedAmount"
                  value={invoice.paidAmount}
                  onChange={(e) => handlePaidAmountChange(Number(e.target.value), invoice.paymentMethod)}
                  className="border border-gray-300 rounded-md w-24 p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={invoice.notes}
                onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes here..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                name="termsAndConditions"
                value={invoice.termsAndConditions}
                onChange={(e) => setInvoice(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                rows={3}
                className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Terms & Conditions"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/sales"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>

      <AddItemsModal
        isOpen={isAddItemsModalOpen}
        onClose={() => setIsAddItemsModalOpen(false)}
        onSave={handleAddItems}
        products={products}
      />
    </Layout>
  );
}