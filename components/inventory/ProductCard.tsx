import { Product } from '@/types';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const isLowStock = product.quantity <= product.lowStockThreshold;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          
          <div className="flex space-x-2">
            <Link
              href={`/inventory/products/${product._id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <EyeIcon className="h-5 w-5" />
            </Link>
            <Link
              href={`/inventory/products/${product._id}/edit`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <PencilIcon className="h-5 w-5" />
            </Link>
            <button
              onClick={() => onDelete(product._id || '')}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-600">Category: {product.category}</p>
          <div className="mt-2 flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Buying Price</p>
              <p className="text-sm font-semibold">₹{product.buyingPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Selling Price</p>
              <p className="text-sm font-semibold">₹{product.sellingPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Profit</p>
              <p className="text-sm font-semibold text-green-600">
                ₹{(product.sellingPrice - product.buyingPrice).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-2 flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isLowStock 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isLowStock ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{product.quantity}</span>
              {' units available'}
            </p>
          </div>
          
          {product.barcode && (
            <div className="text-xs text-gray-500">
              Barcode: {product.barcode}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 