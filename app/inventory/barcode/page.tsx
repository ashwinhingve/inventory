'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  
  AdjustmentsHorizontalIcon,
  
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import { useStore } from '@/context/storeContext';
import toast from 'react-hot-toast';
// import BarcodeRenderer from '@/components/barcode/BarcodeRenderer';
import LabelTemplate, { LabelSize, LabelType } from '@/components/barcode/LabelTemplate';
import Layout from '@/components/ui/Layout';

interface Product {
  _id: string;
  sku: string;
  name: string;
  barcode: string;
  price?: number;
  category?: string;
  unit?: string;
  cost?: number;
  storeId?: string;
}

export default function BarcodeGeneratorPage() {
  const { isLoading, setLoading } = useStore();
  const printSectionRef = useRef<HTMLDivElement>(null);
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Template and format settings
  const [labelSize, setLabelSize] = useState<LabelSize>('medium');
  const [labelType, setLabelType] = useState<LabelType>('detailed');
  const [barcodeFormat, setBarcodeFormat] = useState<'barcode' | 'qrcode' | 'datamatrix' | 'code128'>('barcode');
  const [showPrice, setShowPrice] = useState(true);
  const [showSKU, setShowSKU] = useState(true);
  const [customText, setCustomText] = useState('');
  const [labelCount, setLabelCount] = useState(1);
  
  // Print layout settings
  const [perPage, setPerPage] = useState(8);
  const [labelPadding, setLabelPadding] = useState(10); // in pixels
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Logo settings
  const [useLogo, setUseLogo] = useState(false);
  // const [logoUrl, setLogoUrl] = useState('/your-company-logo.png'); // setLogoUrl is unused
  
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Handle product selection
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => product._id));
    }
  };
  
  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };
  
  // Generate or update barcode
  const handleGenerateBarcode = async (productId: string) => {
    setLoading(true);
    try {
      // Generate a random 13-digit barcode (EAN-13 format)
      const barcode = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
      
      const response = await fetch('/api/barcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: productId,
          barcode 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update barcode');
      }
      
      const data = await response.json();
      
      if (data.success) {
        fetchProducts();
        toast.success('Barcode generated successfully');
      } else {
        throw new Error(data.error || 'Failed to update barcode');
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      toast.error('Failed to generate barcode');
    } finally {
      setLoading(false);
    }
  };
  
  // Print functionality
  const handlePrint = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    
    const printContent = printSectionRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .barcode-container {
              display: flex;
              flex-wrap: wrap;
              gap: ${labelPadding}px;
              padding: ${labelPadding}px;
              justify-content: center;
            }
            @media print {
              @page {
                margin: 0.5cm;
                size: auto;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
    ${printContent}
  </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  // Copy to clipboard
  const handleCopy = () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    const selectedProductsData = selectedProducts
      .map(id => products.find(product => product._id === id))
      .filter((product): product is Product => !!product);
    
    const barcodeText = selectedProductsData
      .map(product => `${product.sku}: ${product.barcode}`)
      .join('\n');
    
    navigator.clipboard.writeText(barcodeText)
      .then(() => toast.success('Barcodes copied to clipboard'))
      .catch(err => {
        console.error('Failed to copy barcodes:', err);
        toast.error('Failed to copy barcodes to clipboard');
      });
  };
  
  // Export as PDF (in real implementation, this would use a library like jsPDF)
  // const handleExport = () => { /* ... */ }; // handleExport is unused
  
  // Get selected products data
  const getSelectedProductsData = () => {
    return selectedProducts
      .map(id => products.find(product => product._id === id))
      .filter((product): product is Product => !!product);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Barcode Generator</h1>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                disabled={selectedProducts.length === 0}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print Selected
              </button>
              <button
                onClick={handleCopy}
                disabled={selectedProducts.length === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection Panel */}
            <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col space-y-4">
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {Array.from(new Set(products.map(product => product.category))).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                      onChange={handleSelectAll}
                    />
                    <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                      {selectedProducts.length > 0 ? `Selected ${selectedProducts.length} products` : 'Select All'}
                    </label>
                  </div>
                  <div className="text-sm text-gray-500">
    {filteredProducts.length} products
  </div>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-96">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
    {searchTerm ? 'No products match your search.' : 'No products with barcodes found.'}
  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <li key={product._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleSelectProduct(product._id)}
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-blue-600">{product.name}</p>
                              <button
                                onClick={() => handleGenerateBarcode(product._id)}
                                className="text-gray-400 hover:text-gray-500"
                                title="Generate New Barcode"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            {product.barcode && (
                              <p className="text-xs font-mono mt-1 text-gray-500">
                                {product.barcode}
                              </p>
                            )}
                            {product.category && (
                              <p className="text-xs text-gray-500">{product.category}</p>
                            )}
                            {product.price !== undefined && (
                              <p className="text-sm font-semibold mt-1">₹{product.price.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Template Customization and Preview */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Label Settings</h2>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Size
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={labelSize}
                    onChange={(e) => setLabelSize(e.target.value as LabelSize)}
                  >
                    <option value="small">Small (32mm × 20mm)</option>
                    <option value="medium">Medium (48mm × 32mm)</option>
                    <option value="large">Large (64mm × 48mm)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label Type
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value as LabelType)}
                  >
                    <option value="simple">Simple</option>
                    <option value="detailed">Detailed</option>
                    <option value="price">Price Tag</option>
                    <option value="inventory">Inventory</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode Format
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={barcodeFormat}
                    onChange={(e) => setBarcodeFormat(e.target.value as 'barcode' | 'qrcode' | 'datamatrix' | 'code128')}
                  >
                    <option value="barcode">EAN-13</option>
                    <option value="code128">Code 128</option>
                    <option value="qrcode">QR Code</option>
                    <option value="datamatrix">Data Matrix</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Labels per Item
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={labelCount}
                    onChange={(e) => setLabelCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </div>
              </div>
              
              {showAdvancedOptions && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Options
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show-price"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={showPrice}
                          onChange={(e) => setShowPrice(e.target.checked)}
                        />
                        <label htmlFor="show-price" className="ml-2 text-sm text-gray-700">
                          Show Price
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="show-sku"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={showSKU}
                          onChange={(e) => setShowSKU(e.target.checked)}
                        />
                        <label htmlFor="show-sku" className="ml-2 text-sm text-gray-700">
                          Show SKU
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="use-logo"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={useLogo}
                          onChange={(e) => setUseLogo(e.target.checked)}
                        />
                        <label htmlFor="use-logo" className="ml-2 text-sm text-gray-700">
                          Include Logo
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="custom-text" className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Text
                    </label>
                    <input
                      type="text"
                      id="custom-text"
                      className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g. www.yourcompany.com"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Print Layout
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="per-page" className="block text-xs text-gray-500 mb-1">
                          Labels Per Page
                        </label>
                        <input
                          type="number"
                          id="per-page"
                          min="1"
                          max="100"
                          className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={perPage}
                          onChange={(e) => setPerPage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                        />
                      </div>
                      <div>
                        <label htmlFor="label-padding" className="block text-xs text-gray-500 mb-1">
                          Label Padding (px)
                        </label>
                        <input
                          type="number"
                          id="label-padding"
                          min="0"
                          max="50"
                          className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          value={labelPadding}
                          onChange={(e) => setLabelPadding(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                
                {selectedProducts.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 rounded-md">
                    <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Select products from the left panel to preview and print labels.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {getSelectedProductsData().slice(0, 4).map(product => (
                      <LabelTemplate
                        key={product._id}
                        product={product}
                        size={labelSize}
                        type={labelType}
                        barcodeFormat={barcodeFormat}
                        showPrice={showPrice}
                        showSKU={showSKU}
                        customText={customText}
                        logo={useLogo ? '/your-company-logo.png' : undefined}
                      />
                    ))}
                    {selectedProducts.length > 4 && (
                      <div className="col-span-2 text-center text-sm text-gray-500 mt-2">
    {selectedProducts.length - 4} more selected. All items will be included when printing.
  </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Hidden div for printing */}
          <div className="hidden">
            <div ref={printSectionRef} className="flex flex-wrap gap-2">
              {getSelectedProductsData().flatMap(product => (
                Array.from({ length: labelCount }).map((_, index) => (
                  <div key={`${product._id}-${index}`} style={{margin: `${labelPadding/2}px`}}>
                    <LabelTemplate
                      product={product}
                      size={labelSize}
                      type={labelType}
                      barcodeFormat={barcodeFormat}
                      showPrice={showPrice}
                      showSKU={showSKU}
                      customText={customText}
                      logo={useLogo ? '/your-company-logo.png' : undefined}
                    />
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 