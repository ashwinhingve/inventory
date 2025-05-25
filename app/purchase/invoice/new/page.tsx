'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';
import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';

// Define interfaces
interface Supplier {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  buyingPrice: number;
  category: string;
}

interface InvoiceItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function NewPurchaseInvoicePage() {
  const router = useRouter();
  const { isLoading, setLoading } = useStore();
  
  // Form data
  const [formData, setFormData] = useState({
    reference: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    supplierName: '',
    notes: '',
    taxRate: 0,
    discountAmount: 0,
    status: 'pending',
  });
  
  // Items in the invoice
  const [items, setItems] = useState<InvoiceItem[]>([]);
  
  // Available suppliers and products
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Calculated values
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    product: '',
    quantity: 1,
    price: 0,
  });
  
  // Load suppliers and products on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch('/api/suppliers');
        if (!suppliersResponse.ok) {
          throw new Error('Failed to fetch suppliers');
        }
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData.suppliers || []);
        
        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
        
        // Generate reference number
        const referenceResponse = await fetch('/api/invoices/generate-reference');
        if (referenceResponse.ok) {
          const referenceData = await referenceResponse.json();
          if (referenceData.reference) {
            setFormData(prev => ({ ...prev, reference: referenceData.reference }));
          }
        }
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'message' in error) {
          const errorObj = error as ErrorResponse;
          console.error('Error fetching data:', errorObj);
          toast.error(`Failed to load data: ${errorObj.message}`);
        } else {
          console.error('Error fetching data:', error);
          toast.error('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [setLoading]);
  
  // Calculate totals when items, tax rate, or discount changes
  useEffect(() => {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    setSubtotal(itemsSubtotal);
    
    const calculatedTaxAmount = (itemsSubtotal * formData.taxRate) / 100;
    setTaxAmount(calculatedTaxAmount);
    
    const calculatedTotal = itemsSubtotal + calculatedTaxAmount - formData.discountAmount;
    setTotal(Math.max(0, calculatedTotal));
  }, [items, formData.taxRate, formData.discountAmount]);
  
  // Handle input changes for form fields
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'supplier') {
      // When supplier changes, also update the supplier name
      const selectedSupplier = suppliers.find(s => s._id === value);
      setFormData({
        ...formData,
        [name]: value,
        supplierName: selectedSupplier ? selectedSupplier.name : '',
      });
    } else if (name === 'taxRate' || name === 'discountAmount') {
      // Convert to number for numerical fields
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  // Handle changes to the current item being added
  const handleItemChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'product') {
      // When product changes, set its default price
      const selectedProduct = products.find(p => p._id === value);
      setCurrentItem({
        ...currentItem,
        product: value,
        price: selectedProduct ? selectedProduct.buyingPrice : 0,
      });
    } else if (name === 'quantity' || name === 'price') {
      // Convert to number for numerical fields
      setCurrentItem({
        ...currentItem,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: value,
      });
    }
  };
  
  // Add an item to the invoice
  const addItem = () => {
    if (!currentItem.product || currentItem.quantity <= 0 || currentItem.price <= 0) {
      toast.error('Please select a product, quantity, and price');
      return;
    }
    
    const selectedProduct = products.find(p => p._id === currentItem.product);
    if (!selectedProduct) {
      toast.error('Selected product not found');
      return;
    }
    
    const newItem: InvoiceItem = {
      product: currentItem.product,
      name: selectedProduct.name,
      quantity: currentItem.quantity,
      price: currentItem.price,
      total: currentItem.quantity * currentItem.price,
    };
    
    setItems([...items, newItem]);
    
    // Reset current item
    setCurrentItem({
      product: '',
      quantity: 1,
      price: 0,
    });
  };
  
  // Remove an item from the invoice
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/purchases/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          taxAmount,
          total,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create invoice');
      }
      
      toast.success('Invoice created successfully');
      router.push('/purchase/invoice');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as ErrorResponse;
        console.error('Error creating invoice:', errorObj);
        toast.error(`Failed to create invoice: ${errorObj.message}`);
      } else {
        console.error('Error creating invoice:', error);
        toast.error('Failed to create invoice');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/purchase/invoice"
              className="mr-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Invoices
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Purchase Invoice</h1>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Invoice Information</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                  Invoice Number
                </label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                  Supplier
                </label>
                <select
                  id="supplier"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Invoice Items</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-7 mb-6">
                <div className="sm:col-span-3">
                  <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={currentItem.product}
                    onChange={handleItemChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    step="1"
                    value={currentItem.quantity}
                    onChange={handleItemChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={currentItem.price}
                    onChange={handleItemChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add
                  </button>
                </div>
              </div>
              
              {items.length > 0 ? (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items added yet. Add items using the form above.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">Invoice Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        id="taxRate"
                        name="taxRate"
                        min="0"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-700">
                        Discount Amount
                      </label>
                      <input
                        type="number"
                        id="discountAmount"
                        name="discountAmount"
                        min="0"
                        step="0.01"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-medium text-gray-500">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-medium text-gray-500">Tax ({formData.taxRate}%):</span>
                    <span className="text-gray-900">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm">
                    <span className="font-medium text-gray-500">Discount:</span>
                    <span className="text-gray-900">{formatCurrency(formData.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-200 mt-2 pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              href="/purchase/invoice"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 