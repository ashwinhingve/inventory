'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ProductSelectorProps {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  onAddNew?: (productName: string) => Promise<string | null>;
  className?: string;
  placeholder?: string;
}

export default function ProductSelector({
  products,
  value,
  onChange,
  onAddNew,
  className = '',
  placeholder = "Search or type to create product..."
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Find the selected product name for display
  const selectedProduct = products.find(p => p._id === value);
  
  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products.slice(0, 10)); // Show first 10 by default
      setShowCreateOption(false);
      return;
    }
    
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(lowercasedTerm) ||
      product.sku.toLowerCase().includes(lowercasedTerm) ||
      (product.barcode && product.barcode.toLowerCase().includes(lowercasedTerm))
    );
    
    setFilteredProducts(filtered.slice(0, 10)); // Limit to 10 results for performance
    
    // Show create option if no exact match and search term is not empty
    const hasExactMatch = filtered.some(p => 
      p.name.toLowerCase() === lowercasedTerm || 
      p.sku.toLowerCase() === lowercasedTerm
    );
    setShowCreateOption(!hasExactMatch && searchTerm.trim().length > 0);
  }, [searchTerm, products]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  // Handle product selection
  const handleSelectProduct = (productId: string) => {
    onChange(productId);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  // Handle creating a new product
  const handleCreateProduct = async () => {
    if (onAddNew && searchTerm.trim()) {
      const result = await onAddNew(searchTerm.trim());
      if (result) {
        onChange(result);
        setIsOpen(false);
      }
    }
  };
  
  // Open dropdown and focus input on click
  const handleWrapperClick = () => {
    setIsOpen(true);
  };
  
  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showCreateOption) {
      e.preventDefault();
      handleCreateProduct();
    }
  };
  
  return (
    <div 
      ref={wrapperRef} 
      className={`relative ${className}`}
      onClick={handleWrapperClick}
    >
      <div className="flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedProduct ? selectedProduct.name : placeholder}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {filteredProducts.length > 0 || showCreateOption ? (
            <ul className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <li
                  key={product._id}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 ${
                    product._id === value ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSelectProduct(product._id!)}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="ml-2 text-right">
                      <p className="text-sm font-medium text-gray-900">₹{product.sellingPrice}</p>
                      <p className="text-xs text-gray-500">{product.quantity} in stock</p>
                    </div>
                  </div>
                </li>
              ))}
              
              {showCreateOption && (
                <li
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 bg-blue-50"
                  onClick={handleCreateProduct}
                >
                  <div className="flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Create new product:</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        
                        &quot;{searchTerm}&quot;</p>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-700">
              No products found
              {onAddNew && (
                <button
                  type="button"
                  className="ml-2 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew('');
                  }}
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add New
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Hidden input for form submission */}
      <input type="hidden" value={value || ''} />
    </div>
  );
} 