'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function SignupPage() {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: 'Default Organization',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  
  const router = useRouter();
  
  // Check if admin already exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        
        if (data.success && data.adminExists) {
          setAdminExists(true);
        }
      } catch (error) {
        console.error('Error checking for admin:', error);
      }
    };
    
    checkAdminExists();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };
  
  const validatePassword = (password: string): boolean => {
    // At least 8 characters, including one uppercase, one lowercase, and one number
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError('');
    
    // Validate form
    if (!formValues.name || !formValues.email || !formValues.password || !formValues.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    // Check password strength
    if (!validatePassword(formValues.password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }
    
    // Check passwords match
    if (formValues.password !== formValues.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Ensure organization name is set
      const orgName = formValues.organizationName.trim() || 'Default Organization';
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          password: formValues.password,
          organizationName: orgName,
          role: 'store_admin', // First user is always store_admin
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        
        // Clear form
        setFormValues({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          organizationName: '',
        });
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // If admin already exists, show a redirect message
  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <ShieldCheckIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Already Exists</h1>
            <p className="text-gray-600 mb-6">
              An administrator account has already been created for this system.
            </p>
            <Link href="/login">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Admin Account</h1>
          <p className="text-gray-600 mt-1">
            Set up the first administrator account for your inventory system
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-sm text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-3 bg-green-50 text-sm text-green-700 rounded-md border border-green-200">
            Admin account created successfully! Redirecting to login page...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formValues.name}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="John Doe"
                disabled={loading || success}
              />
            </div>
          </div>
          
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
                value={formValues.email}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
                disabled={loading || success}
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
                value={formValues.password}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
                disabled={loading || success}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase, and number.
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formValues.confirmPassword}
                onChange={handleChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
                disabled={loading || success}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formValues.organizationName}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Your Company"
              disabled={loading || success}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">You will be created as an Administrator</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 pl-7">
              As an administrator, you will have full access to the system and can create staff accounts.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              (loading || success) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Creating Account...
              </>
            ) : success ? (
              "Account Created!"
            ) : (
              "Create Admin Account"
            )}
          </button>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 