import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types';

interface AddItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: Array<{ product: Product; quantity: number }>) => void;
  products: Product[];
}

export default function AddItemsModal({ isOpen, onClose, onSave, products }: AddItemsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Array<{
    product: Product;
    quantity: number;
  }>>([]);
  const [showOnlyAdded, setShowOnlyAdded] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesAddedFilter = !showOnlyAdded || selectedItems.some(item => item.product._id === product._id);
    return matchesSearch && matchesCategory && matchesAddedFilter;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleQuantityChange = (product: Product, quantity: number) => {
    const newItems = [...selectedItems];
    const existingIndex = newItems.findIndex(item => item.product._id === product._id);

    if (existingIndex >= 0) {
      if (quantity <= 0) {
        newItems.splice(existingIndex, 1);
      } else {
        newItems[existingIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      newItems.push({ product, quantity });
    }

    setSelectedItems(newItems);
  };

  const totalAmount = selectedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.product.sellingPrice);
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Items</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 flex gap-4">
          <div className="w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="w-2/3">
            <input
              type="text"
              placeholder="Search item name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <button
            onClick={() => {/* TODO: Add new item */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add New Item
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Selling Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">Available Stock {product.quantity} Piece</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      max={product.quantity}
                      value={selectedItems.find(item => item.product._id === product._id)?.quantity || ''}
                      onChange={(e) => handleQuantityChange(product, parseInt(e.target.value) || 0)}
                      placeholder="Enter Quantity"
                      className="border border-gray-300 rounded-md p-2 w-32"
                    />
                    <span className="ml-2 text-gray-500">/Piece</span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <span>₹{product.sellingPrice}</span>
                      <span className="ml-2 text-gray-500">/Piece</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyAdded}
                onChange={(e) => setShowOnlyAdded(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Show only added items</span>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total Items: {selectedItems.length} | Total Amount: ₹{totalAmount.toFixed(2)}
            </div>
            <button
              onClick={() => onSave(selectedItems)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 