'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials] = useState({
    email: 'owner@example.com',
    password: 'defaultOwnerPassword'
  });

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set up system');
      }

      setSuccess(true);
      // Show success message for 3 seconds then redirect to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            System Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create the default owner account
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {success ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Default owner account created successfully! Redirecting to login...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      This will create the default owner account with the following credentials:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-yellow-700">
                      <li><strong>Email:</strong> {credentials.email}</li>
                      <li><strong>Password:</strong> {credentials.password}</li>
                    </ul>
                    <p className="text-sm text-yellow-700 mt-2">
                      <strong>Important:</strong> Remember to change these details immediately after logging in!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSetup}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Create Owner Account'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Already set up? Go to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 