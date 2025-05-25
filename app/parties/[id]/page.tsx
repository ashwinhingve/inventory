'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PartyData {
  name: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
  balanceType: 'Payable' | 'Receivable';
  openingBalance: number;
  gstNumber?: string;
  panNumber?: string;
  billingAddress?: {
    address: string;
    pincode: string;
    state: string;
  };
  shippingAddress?: {
    address: string;
    pincode: string;
    state: string;
  };
  sameShippingAddress?: boolean;
  bankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
}

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  const [id, setId] = useState<string | null>(null);
  const [party, setParty] = useState<PartyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Resolve params Promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    
    resolveParams();
  }, [params]);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchParty = async () => {
      try {
        const response = await axios.get(`/api/parties/${id}`);
        setParty(response.data);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err) {
          const errorObj = err as ErrorResponse;
          setError(errorObj.message || 'An error occurred while fetching party details');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParty();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!party) return;
    
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      const sectionKey = section as keyof PartyData;
      const sectionValue = party[sectionKey] as Record<string, unknown>;
      
      setParty({
        ...party,
        [sectionKey]: {
          ...sectionValue,
          [field]: value,
        },
      });
    } else {
      setParty({
        ...party,
        [name]: value,
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!party) return;
    
    const { name, checked } = e.target;
    setParty({
      ...party,
      [name]: checked,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party || !id) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Copy billing address to shipping if same address is checked
      const dataToSubmit = { ...party };
      
      // Convert opening balance to number
      dataToSubmit.openingBalance = Number(dataToSubmit.openingBalance);
      
      // If same shipping address, don't send duplicate data
      if (dataToSubmit.sameShippingAddress) {
        dataToSubmit.shippingAddress = dataToSubmit.billingAddress;
      }
      
      await axios.put(`/api/parties/${id}`, dataToSubmit);
      router.push('/parties');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as ErrorResponse;
        setError(errorObj.message || 'An error occurred while updating party details');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.delete(`/api/parties/${id}`);
      router.push('/parties');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as ErrorResponse;
        setError(errorObj.message || 'An error occurred while deleting party');
      } else {
        setError('An unexpected error occurred');
      }
      setIsDeleteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !id) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading party details...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!party) {
    return (
      <Layout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Party not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/parties" className="text-blue-600 hover:underline">
            Back to Parties
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6 justify-between">
          <div className="flex items-center">
            <Link href="/parties" className="mr-4 p-2 rounded-full hover:bg-gray-100">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Party</h1>
          </div>
          
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-600 hover:text-red-800 flex items-center gap-1 px-3 py-2 rounded-md hover:bg-red-50"
          >
            <TrashIcon className="h-5 w-5" /> Delete
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Personal Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Party Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobileNumber"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.mobileNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    name="openingBalance"
                    className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={party.openingBalance}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="balanceType"
                    className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={party.balanceType}
                    onChange={handleChange}
                  >
                    <option value="Receivable">To Receive</option>
                    <option value="Payable">To Pay</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">GST & PAN Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.gstNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.panNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Billing Address</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Address
              </label>
              <textarea
                name="billingAddress.address"
                className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                value={party.billingAddress?.address}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Pin code
                </label>
                <input
                  type="text"
                  name="billingAddress.pincode"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.billingAddress?.pincode}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing State
                </label>
                <input
                  type="text"
                  name="billingAddress.state"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.billingAddress?.state}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="sameShippingAddress"
                  checked={party.sameShippingAddress}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Shipping Address is same as Billing Address</span>
              </label>
            </div>
          </div>
          
          {!party.sameShippingAddress && (
            <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Shipping Address</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address
                </label>
                <textarea
                  name="shippingAddress.address"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.shippingAddress?.address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Pin code
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.pincode"
                    className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={party.shippingAddress?.pincode}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping State
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.state"
                    className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                    value={party.shippingAddress?.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Bank Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="bankDetails.accountHolderName"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.bankDetails?.accountHolderName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankDetails.bankName"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.bankDetails?.bankName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  name="bankDetails.accountNumber"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.bankDetails?.accountNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="bankDetails.ifscCode"
                  className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                  value={party.bankDetails?.ifscCode}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                name="bankDetails.branchName"
                className="border border-gray-300 rounded-md w-full p-2 focus:ring-blue-500 focus:border-blue-500"
                value={party.bankDetails?.branchName}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
        
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Delete Party</h3>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this party? This action cannot be undone.</p>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}