'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import Layout from '@/components/ui/Layout';

interface ErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export default function BulkImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (
        selectedFile.type !== 'application/vnd.ms-excel' && 
        selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        setError('Please upload an Excel file (.xls or .xlsx)');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/api/parties/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadResults(response.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as ErrorResponse;
        setError(errorObj.message || 'An error occurred while importing parties');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const downloadSampleTemplate = () => {
    // In a real implementation, this would download a sample Excel template
    // For demo, we'll just redirect to a sample file URL
    window.open('/api/parties/sample-template', '_blank');
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Link href="/parties" className="mr-4 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Bulk Parties</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {uploadResults ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload Results</h2>
            
            <div className="mb-4">
              <p className="text-green-600 font-medium">Successfully imported: {uploadResults.success} parties</p>
              {uploadResults.failed > 0 && (
                <p className="text-red-600 font-medium">Failed to import: {uploadResults.failed} parties</p>
              )}
            </div>
            
            {uploadResults.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-gray-700">Errors:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <li key={index} className="text-red-600 text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setUploadResults(null);
                }}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload Another File
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/parties')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Parties List
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Upload Excel (.xlsx or .xls) File</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose File</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    {file ? (
                      <div className="text-center">
                        <DocumentTextIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="mb-1 font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-red-600 text-sm mt-3 hover:text-red-800 focus:outline-none"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <p className="mb-1 text-gray-700">Drag & drop your file here</p>
                        <p className="text-sm text-gray-500 mb-4">or</p>
                        <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
                          Browse Files
                          <input
                            type="file"
                            accept=".xls,.xlsx"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                    disabled={!file || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      'Upload and Process'
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">How to add bulk Party</h2>
              
              <ol className="list-decimal pl-5 space-y-3 text-gray-700">
                <li>
                  Download sample excel file
                  <button
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none inline-flex items-center gap-1 text-sm font-medium"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" /> download here
                  </button>
                </li>
                <li>Fill the data in the correct format & upload excel</li>
                <li>Review accepted items and save them</li>
              </ol>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2 text-gray-800">Required Columns:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Party Name <span className="text-red-500 font-medium">*</span></li>
                  <li>Mobile Number</li>
                  <li>Opening Balance</li>
                  <li>Balance Type (Receivable/Payable)</li>
                  <li>GST Number</li>
                  <li>PAN Number</li>
                  <li>Billing Address</li>
                  <li>State</li>
                </ul>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                <h3 className="font-medium mb-2 text-gray-800">Tips:</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                  <li>Make sure data is in the correct format</li>
                  <li>Don&apos;t change the column headers</li>
                  <li>For Balance Type, use &apos;Receivable&apos; or &apos;Payable&apos; only</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 