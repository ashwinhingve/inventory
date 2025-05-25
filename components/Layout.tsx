'use client';

import { ReactNode } from 'react';
import { useStore } from '@/context/storeContext';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isLoggedIn, logout } = useStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Inventory</span>
              </div>
              
              {isLoggedIn && (
                <nav className="ml-6 flex space-x-4 items-center">
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/inventory/products"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Products
                  </Link>
                  <Link
                    href="/sales/invoice"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Sales
                  </Link>
                  <Link
                    href="/purchase/invoice"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Purchases
                  </Link>
                </nav>
              )}
            </div>
            
            {/* User menu */}
            {isLoggedIn ? (
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Inventory Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 