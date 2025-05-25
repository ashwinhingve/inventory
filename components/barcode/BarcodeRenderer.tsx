import React from 'react';
import { QrCodeIcon } from '@heroicons/react/24/outline';

interface BarcodeRendererProps {
  value: string;
  size: 'small' | 'medium' | 'large';
  format: 'barcode' | 'qrcode' | 'datamatrix' | 'code128';
  showText?: boolean;
  className?: string;
}

const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  size,
  format,
  showText = true,
  className = '',
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'w-20 h-10';
      case 'medium':
        return 'w-28 h-14';
      case 'large':
        return 'w-36 h-20';
      default:
        return 'w-28 h-14';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 'text-[8px]';
      case 'medium':
        return 'text-xs';
      case 'large':
        return 'text-sm';
      default:
        return 'text-xs';
    }
  };

  const renderBarcode = () => {
    // Get dimensions based on size
    const dimensions = {
      small: { width: 80, height: 30 },
      medium: { width: 112, height: 40 },
      large: { width: 144, height: 56 },
    }[size];

    if (format === 'qrcode') {
      return (
        <div className="flex items-center justify-center bg-white p-1">
          <QrCodeIcon 
            className={`${size === 'small' ? 'h-8 w-8' : size === 'medium' ? 'h-12 w-12' : 'h-16 w-16'} text-black`} 
          />
        </div>
      );
    } else if (format === 'datamatrix') {
      // Simplified DataMatrix representation
      return (
        <div className="flex items-center justify-center bg-white p-1">
          <div className={`grid ${size === 'small' ? 'grid-cols-8' : size === 'medium' ? 'grid-cols-10' : 'grid-cols-12'} gap-[1px]`}>
            {Array.from({ length: size === 'small' ? 64 : size === 'medium' ? 100 : 144 }).map((_, i) => (
              <div 
                key={i}
                className={`${i % 3 === 0 || i % 7 === 0 ? 'bg-black' : 'bg-white'} 
                  ${size === 'small' ? 'w-1 h-1' : size === 'medium' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}
              />
            ))}
          </div>
        </div>
      );
    } else {
      // Code 128 or standard barcode
      // Create a deterministic pattern based on the value
      const valueSum = value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      
      return (
        <svg width={dimensions.width} height={dimensions.height} className="mx-auto bg-white">
          <rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="white" />
          {value.split('').map((char, i) => {
            const x = (i * (dimensions.width / value.length));
            const barWidth = dimensions.width / value.length * 0.8;
            // Create a deterministic pattern based on the character code
            const isBlack = (char.charCodeAt(0) + i + valueSum) % 3 !== 0;
            return (
              <rect 
                key={i} 
                x={x} 
                y="5" 
                width={barWidth} 
                height={dimensions.height - 10} 
                fill={isBlack ? "black" : "white"} 
              />
            );
          })}
        </svg>
      );
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex items-center justify-center ${getSizeClass()}`}>
        {renderBarcode()}
      </div>
      {showText && (
        <div className={`text-center ${getFontSize()} font-mono mt-1 truncate w-full`}>
          {value}
        </div>
      )}
    </div>
  );
};

export default BarcodeRenderer; 