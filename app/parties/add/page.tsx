'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';

interface PartyFormData {
  name: string;
  type: 'customer' | 'supplier' | 'both';
  email: string;
  phone: string;
  address: string;
  gstin: string;
  pan: string;
  openingBalance: string;
  balanceType: 'receivable' | 'payable';
  notes: string;
}

export default function AddPartyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PartyFormData>({
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
    openingBalance: '0',
    balanceType: 'receivable',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create party');
      }

      toast.success('Party created successfully');
      router.push('/parties');
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link href="/parties" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Party</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.gstin}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PAN</label>
                <input
                  type="text"
                  name="pan"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.pan}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Billing Address</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Opening Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  name="openingBalance"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.openingBalance}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="balanceType"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.balanceType}
                  onChange={handleInputChange}
                >
                  <option value="receivable">Receivable</option>
                  <option value="payable">Payable</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/parties')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Party'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 