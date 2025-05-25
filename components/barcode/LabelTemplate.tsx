import React from 'react';
import BarcodeRenderer from './BarcodeRenderer';
import Image from 'next/image';

export type LabelSize = 'small' | 'medium' | 'large';
export type LabelType = 'simple' | 'detailed' | 'price' | 'inventory';

interface LabelTemplateProps {
  product: {
    _id: string;
    sku: string;
    name: string;
    barcode: string;
    price?: number;
    category?: string;
    unit?: string;
  };
  size: LabelSize;
  type: LabelType;
  barcodeFormat: 'barcode' | 'qrcode' | 'datamatrix' | 'code128';
  showPrice?: boolean;
  showSKU?: boolean;
  customText?: string;
  logo?: string;
}

const LabelTemplate: React.FC<LabelTemplateProps> = ({
  product,
  size,
  type,
  barcodeFormat,
  showPrice = true,
  showSKU = true,
  customText,
  logo,
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-32 h-20 text-[8px]';
      case 'medium':
        return 'w-48 h-32 text-xs';
      case 'large':
        return 'w-64 h-48 text-sm';
      default:
        return 'w-48 h-32 text-xs';
    }
  };

  const getTypeLayout = () => {
    switch (type) {
      case 'simple':
        return (
          <div className="flex flex-col items-center justify-between h-full p-2">
            {showSKU && <div className="font-semibold">{product.sku}</div>}
            <div className="font-bold truncate w-full text-center">{product.name}</div>
            <BarcodeRenderer 
              value={product.barcode}
              size={size}
              format={barcodeFormat}
              showText={true}
            />
          </div>
        );
      case 'detailed':
        return (
          <div className="flex flex-col justify-between h-full p-2">
            <div className="flex justify-between items-start">
              {logo && (
                <div className="w-1/4">
                  <Image
                    src={logo}
                    alt="Logo"
                    width={100}
                    height={50}
                    className="max-h-12 object-contain"
                  />
                </div>
              )}
              <div className={`${logo ? 'w-3/4 pl-2' : 'w-full'}`}>
                {showSKU && <div className="font-semibold">SKU: {product.sku}</div>}
                <div className="font-bold truncate">{product.name}</div>
                {product.category && (
                  <div className="truncate">Category: {product.category}</div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div className="flex-1">
                {product.unit && (
                  <div>Unit: {product.unit}</div>
                )}
                {showPrice && product.price !== undefined && (
                  <div className="font-bold">
                    Price: ₹{product.price.toFixed(2)}
                  </div>
                )}
                {customText && (
                  <div className="text-gray-600 italic truncate">{customText}</div>
                )}
              </div>
              <BarcodeRenderer 
                value={product.barcode}
                size={size}
                format={barcodeFormat}
                showText={true}
              />
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="flex flex-col items-center justify-between h-full p-2">
            <div className="w-full">
              {showSKU && <div className="font-semibold text-center">{product.sku}</div>}
              <div className="font-bold truncate w-full text-center">{product.name}</div>
            </div>
            
            <BarcodeRenderer 
              value={product.barcode}
              size={size}
              format={barcodeFormat}
              showText={false}
            />
            
            {showPrice && product.price !== undefined && (
              <div className={`font-bold ${size === 'large' ? 'text-xl' : size === 'medium' ? 'text-lg' : 'text-base'}`}>
                ₹{product.price.toFixed(2)}
              </div>
            )}
          </div>
        );
      case 'inventory':
        return (
          <div className="flex flex-col h-full p-2">
            <div className="mb-1">
              {showSKU && <div className="font-semibold">{product.sku}</div>}
              <div className="font-bold truncate w-full">{product.name}</div>
            </div>
            
            <div className="flex justify-between items-center flex-1">
              <div className="flex flex-col">
                {product.category && (
                  <div className="truncate text-gray-700">Cat: {product.category}</div>
                )}
                {product.unit && (
                  <div className="truncate text-gray-700">Unit: {product.unit}</div>
                )}
                {showPrice && product.price !== undefined && (
                  <div className="font-bold">
                    ₹{product.price.toFixed(2)}
                  </div>
                )}
              </div>
              
              <BarcodeRenderer 
                value={product.barcode}
                size={size}
                format={barcodeFormat}
                showText={true}
              />
            </div>
            
            {customText && (
              <div className="text-gray-600 italic truncate text-center mt-1">{customText}</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border border-gray-300 rounded bg-white overflow-hidden ${getSizeClass()}`}>
      {getTypeLayout()}
    </div>
  );
};

export default LabelTemplate; 