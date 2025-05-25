'use client';

import { useState } from 'react';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

// Define roles for displaying in UI
const ROLES = {
  STORE_ADMIN: 'store_admin',
  SALES_OPERATOR: 'sales_operator',
  SALES_PURCHASE_OPERATOR: 'sales_purchase_operator',
};

// Role descriptions for better understanding
const ROLE_DESCRIPTIONS = {
  [ROLES.STORE_ADMIN]: 'Full system access with ability to manage all aspects of the application',
  [ROLES.SALES_OPERATOR]: 'Standard operational access for sales-related tasks',
  [ROLES.SALES_PURCHASE_OPERATOR]: 'Access to both sales and purchase operations',
};

interface LoginFormProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function RoleBasedLoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onLogin(email, password, rememberMe);
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch(role) {
      case ROLES.STORE_ADMIN:
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />;
      case ROLES.SALES_OPERATOR:
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case ROLES.SALES_PURCHASE_OPERATOR:
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  // Format role display name
  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case ROLES.STORE_ADMIN:
        return 'Store Administrator';
      case ROLES.SALES_OPERATOR:
        return 'Sales Operator';
      case ROLES.SALES_PURCHASE_OPERATOR:
        return 'Sales Purchase Operator';
      default:
        return role;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management Login</h1>
        <p className="text-gray-600 mt-1">
          Enter your credentials to access the dashboard
        </p>
        <button 
          onClick={() => setShowRoleInfo(!showRoleInfo)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          type="button"
        >
          {showRoleInfo ? 'Hide role information' : 'Learn about user roles'}
        </button>
      </div>

      {showRoleInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800">System Roles</h3>
          <p className="text-sm text-blue-700 mb-3">Your access level depends on your assigned role:</p>
          <div className="space-y-2">
            {Object.values(ROLES).map(role => (
              <div key={role} className="flex items-center p-2 rounded-md border border-blue-100 bg-white">
                <div className="flex-shrink-0">{getRoleIcon(role)}</div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">{getRoleDisplayName(role)}</h4>
                  <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-sm text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="username email"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
} 