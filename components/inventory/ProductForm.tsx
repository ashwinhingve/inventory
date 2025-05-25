import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/storeContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { stores, suppliers, fetchStores, fetchSuppliers } = useStore();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    description: '',
    buyingPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    lowStockThreshold: 10,
    barcode: '',
    store: '',
    supplier: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch stores and suppliers if needed
  useEffect(() => {
    if (stores.length === 0) {
      fetchStores();
    }
    
    if (suppliers.length === 0) {
      fetchSuppliers();
    }
  }, [stores.length, suppliers.length, fetchStores, fetchSuppliers]);
  
  // Set form data if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description || '',
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        lowStockThreshold: product.lowStockThreshold,
        barcode: product.barcode || '',
        store: product.store || '',
        supplier: product.supplier || '',
      });
    }
  }, [isEditing, product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (['buyingPrice', 'sellingPrice', 'quantity', 'lowStockThreshold'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const validateForm = () => {
    // Required fields
    const requiredFields = ['name', 'sku', 'category', 'buyingPrice', 'sellingPrice'];
    for (const field of requiredFields) {
      if (!formData[field as keyof Product]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Numeric fields should be positive
    const numericFields = ['buyingPrice', 'sellingPrice', 'quantity', 'lowStockThreshold'];
    for (const field of numericFields) {
      const value = formData[field as keyof Product] as number;
      if (value !== undefined && value < 0) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} must be a positive number`);
        return false;
      }
    }
    
    // Ensure quantity is provided and is a number
    if (formData.quantity === undefined || formData.quantity === null) {
      formData.quantity = 0;
    }
    
    // Ensure lowStockThreshold is provided and is a number
    if (formData.lowStockThreshold === undefined || formData.lowStockThreshold === null) {
      formData.lowStockThreshold = 10;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create a copy of formData for submission
      const submissionData = { ...formData };
      
      // Ensure proper handling of empty references
      if (!submissionData.store || submissionData.store === '') {
        delete submissionData.store;
      }
      
      if (!submissionData.supplier || submissionData.supplier === '') {
        delete submissionData.supplier;
      }
      
      const url = isEditing ? `/api/products/${product?._id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      router.push('/inventory/stock');
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate random SKU
  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const sku = `${prefix}${randomNum}`;
    
    setFormData(prev => ({
      ...prev,
      sku,
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-md p-6">
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU (Stock Keeping Unit) *
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              readOnly={isEditing} // SKU should not be editable when updating
            />
            {!isEditing && (
              <button
                type="button"
                onClick={generateSKU}
                className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-200"
              >
                Generate
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barcode
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buying Price *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="buyingPrice"
              value={formData.buyingPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Low Stock Threshold
          </label>
          <input
            type="number"
            name="lowStockThreshold"
            value={formData.lowStockThreshold}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store
          </label>
          <select
            name="store"
            value={formData.store}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier
          </label>
          <select
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}