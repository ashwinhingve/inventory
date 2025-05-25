'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const gstRates = [0, 5, 12, 18, 28];
const priceUnits = ['Piece', 'Box', 'Packet', 'Peti', 'Bottle', 'Kg', 'Gram', 'Dozen'];

interface Store {
  id: string;
  name: string;
  location: string;
}

interface Category {
  id: string;
  name: string;
}

export default function NewStockItemPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showSecondaryUnit, setShowSecondaryUnit] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    purchasePrice: '',
    mrp: '',
    sellingPrice: '',
    gstRate: '',
    hsnCode: '',
    category: '',
    barcode: '',
    priceUnit: 'Piece',
    secondaryUnit: '',
    lowStockAlert: '',
    storeId: '',
    openingStock: '0',
    openingStockDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    // Fetch stores and categories
    const fetchData = async () => {
      try {
        const [storesRes, categoriesRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/items?limit=1000')
        ]);
        
        const storesData = await storesRes.json();
        const categoriesData = await categoriesRes.json();
        
        if (storesData.success) {
          setStores(storesData.stores);
        }
        
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category' && value === 'new') {
      setShowNewCategory(true);
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory(e.target.value);
  };

  const saveNewCategory = () => {
    if (newCategory.trim() === '') {
      toast.error('Category name cannot be empty');
      return;
    }
    
    // Add new category to list
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCategory }]);
    
    // Set form data to use the new category
    setFormData(prev => ({ ...prev, category: newCategory }));
    
    // Reset new category input
    setNewCategory('');
    setShowNewCategory(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    setSelectedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;
    
    const formData = new FormData();
    formData.append('file', selectedImage);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }
      
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const generateBarcode = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, barcode: `${timestamp}${random}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      // Prepare the submission data
      const submissionData = {
        ...formData,
        ...(imageUrl && { imageUrl }),
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      toast.success('Item created successfully');
      router.push('/inventory/stock');
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleSaveAndNew = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      // Prepare the submission data
      const submissionData = {
        ...formData,
        ...(imageUrl && { imageUrl }),
      };

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create item');
      }

      toast.success('Item created successfully');
      // Clear form for new entry
      setFormData({
        name: '',
        purchasePrice: '',
        mrp: '',
        sellingPrice: '',
        gstRate: '',
        hsnCode: '',
        category: '',
        barcode: '',
        priceUnit: 'Piece',
        secondaryUnit: '',
        lowStockAlert: '',
        storeId: '',
        openingStock: '0',
        openingStockDate: new Date().toISOString().split('T')[0],
        location: '',
        description: '',
        imageUrl: '',
      });
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const err = error as Error; 
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Link href="/inventory/stock" className="flex items-center text-gray-800 hover:text-gray-600">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
        </Link>
        <h1 className="text-xl font-medium text-gray-900">Add Item</h1>
        <div className="flex-grow"></div>
        <div className="flex space-x-3">
          <button
            onClick={handleSaveAndNew}
            className="px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 font-medium"
          >
            Save & New
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Details */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800">
                Item name*
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter here"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-800">
                  Purchase Price
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    name="purchasePrice"
                    id="purchasePrice"
                    placeholder="Enter here"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <select
                    className="border border-gray-300 border-l-0 rounded-r-md bg-gray-50 py-2 px-3 text-gray-800"
                  >
                    <option>Without GST</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="mrp" className="block text-sm font-medium text-gray-800">
                  MRP
                </label>
                <input
                  type="text"
                  name="mrp"
                  id="mrp"
                  placeholder="Enter here"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-800">
                  Selling Price
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    name="sellingPrice"
                    id="sellingPrice"
                    placeholder="Enter here"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                  <select
                    className="border border-gray-300 border-l-0 rounded-r-md bg-gray-50 py-2 px-3 text-gray-800"
                  >
                    <option>Without GST</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-800">
                  Category
                </label>
                {showNewCategory ? (
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      name="newCategory"
                      id="newCategory"
                      placeholder="Enter new category"
                      value={newCategory}
                      onChange={handleNewCategoryChange}
                      className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={saveNewCategory}
                      className="border border-blue-500 border-l-0 rounded-r-md bg-blue-50 text-blue-600 font-medium py-2 px-3 hover:bg-blue-100"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="new">+ Enter New Item Category</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-800">
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsnCode"
                  id="hsnCode"
                  placeholder="Enter here"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="gstRate" className="block text-sm font-medium text-gray-800">
                  GST Rate
                </label>
                <select
                  name="gstRate"
                  id="gstRate"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select GST Rate</option>
                  {gstRates.map((rate) => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-800">
                Barcode (Item Code)
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  name="barcode"
                  id="barcode"
                  placeholder="Enter here"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="border border-indigo-500 border-l-0 rounded-r-md bg-white text-indigo-600 font-medium py-2 px-4 hover:bg-indigo-50"
                >
                  Auto Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="itemImage" className="block text-sm font-medium text-gray-800">
                  Item Image
                </label>
                <div className="mt-1 border border-gray-300 rounded-md p-4 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <Image
                        src={previewUrl} 
                        alt="Preview" 
                        className="mx-auto h-32 w-auto object-contain" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="block mt-1 text-sm">Upload</span>
                      </div>
                      <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="sr-only" 
                      />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-800">
                  Item Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={5}
                  placeholder="Write your description here..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Details */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-1/2 pr-2">
                <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-800">
                  Price Unit*
                </label>
                <select
                  name="priceUnit"
                  id="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  {priceUnits.map((unit) => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowSecondaryUnit(!showSecondaryUnit)}
                  className="mb-1 ml-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add Secondary Unit
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="lowStockAlert" className="block text-sm font-medium text-gray-800">
                Quantity for Low Stock Alert
              </label>
              <input
                type="text"
                name="lowStockAlert"
                id="lowStockAlert"
                placeholder="Enter here"
                value={formData.lowStockAlert}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-800">
                Select Store to Add Stock*
              </label>
              <select
                name="storeId"
                id="storeId"
                value={formData.storeId}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select store</option>
                {stores.map((store: Store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              <div className="mt-2 text-gray-800 font-medium">MyStore</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="openingStock" className="block text-sm font-medium text-gray-800">
                  Opening Stock*
                </label>
                <input
                  type="text"
                  name="openingStock"
                  id="openingStock"
                  placeholder="0"
                  value={formData.openingStock}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label htmlFor="openingStockDate" className="block text-sm font-medium text-gray-800">
                  Opening Stock Date*
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="date"
                    name="openingStockDate"
                    id="openingStockDate"
                    value={formData.openingStockDate}
                    onChange={handleInputChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-800">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                placeholder="Enter here"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 