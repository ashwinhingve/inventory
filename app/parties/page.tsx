'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import Layout from '@/components/ui/Layout';
import { toast } from 'react-hot-toast';

interface Party {
  _id: string;
  name: string;
  mobileNumber: string;
  openingBalance: number;
  balanceType: 'Payable' | 'Receivable';
}

interface Totals {
  payable: number;
  receivable: number;
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [totals, setTotals] = useState<Totals>({ payable: 0, receivable: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterOption, setFilterOption] = useState('showAll');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const router = useRouter();

  const fetchParties = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (activeTab !== 'all') params.append('filter', activeTab);
      if (filterOption !== 'showAll') params.append('filter', filterOption);
      params.append('sortBy', 'name');
      params.append('sortOrder', 'asc');
      params.append('page', '1');
      params.append('limit', '10');

      const response = await axios.get(`/api/parties?${params.toString()}`);
      setParties(response.data.parties);
      setTotals(response.data.totals);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab, filterOption]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterApply = () => {
    fetchParties();
    setShowFilterDropdown(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const navigateToAddParty = () => {
    router.push('/parties/add');
  };

  const navigateToBulkImport = () => {
    router.push('/parties/bulk-import');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Parties</h1>
        </div>
        
        {/* Totals Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500">Total Payable</div>
            <div className="text-2xl font-bold text-red-500">₹ {totals.payable}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-500">Total Receivable</div>
            <div className="text-2xl font-bold text-green-500">₹ {totals.receivable}</div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search party Name"
              className="border rounded-md p-2 pl-10 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <button
                className="border rounded-md p-2 flex items-center gap-2 bg-white hover:bg-gray-50"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <FaFilter className="text-gray-500" /> Filter: {filterOption === 'showAll' ? 'Show All Parties' : 
                            filterOption === 'showZeroBalance' ? 'Show Only Zero Balance Parties' : 
                            'Hide Zero Balance Parties'}
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg z-10 w-64">
                  <div className="p-3">
                    <div className="mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="filter"
                          checked={filterOption === 'showAll'}
                          onChange={() => setFilterOption('showAll')}
                        />
                        Show All Parties
                      </label>
                    </div>
                    <div className="mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="filter"
                          checked={filterOption === 'showZeroBalance'}
                          onChange={() => setFilterOption('showZeroBalance')}
                        />
                        Show Only Zero Balance Parties
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="filter"
                          checked={filterOption === 'hideZeroBalance'}
                          onChange={() => setFilterOption('hideZeroBalance')}
                        />
                        Hide Zero Balance Parties
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <button 
                        className="text-gray-500 mr-2"
                        onClick={() => setShowFilterDropdown(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="text-blue-600 font-semibold"
                        onClick={handleFilterApply}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button
              className="border border-blue-600 text-blue-600 rounded-md p-2 hover:bg-blue-50"
              onClick={navigateToBulkImport}
            >
              Add Bulk Parties
            </button>
            
            <button
              className="bg-blue-600 text-white rounded-md p-2 flex items-center gap-2 hover:bg-blue-700"
              onClick={navigateToAddParty}
            >
              <FaPlus /> Add Party
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b mb-4">
          <ul className="flex">
            <li className={`mr-6 pb-2 ${activeTab === 'all' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
              <button onClick={() => handleTabChange('all')} className="text-gray-700 hover:text-blue-600">All Parties</button>
            </li>
            <li className={`mr-6 pb-2 ${activeTab === 'payable' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
              <button onClick={() => handleTabChange('payable')} className="text-gray-700 hover:text-blue-600">Payable Parties</button>
            </li>
            <li className={`mr-6 pb-2 ${activeTab === 'receivable' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}>
              <button onClick={() => handleTabChange('receivable')} className="text-gray-700 hover:text-blue-600">Receivable Parties</button>
            </li>
          </ul>
        </div>
        
        {/* Party Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : parties.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">No parties found</td>
                </tr>
              ) : (
                parties.map((party) => (
                  <tr key={party._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/parties/${party._id}`} className="text-blue-600 hover:underline font-medium">
                        {party.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{party.mobileNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${party.balanceType === 'Receivable' ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        ₹ {party.openingBalance}
                        <span className="text-gray-500 font-normal ml-1">
                          ({party.balanceType === 'Receivable' ? 'Receivable' : 'Payable'})
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}