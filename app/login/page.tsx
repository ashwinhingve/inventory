'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import RoleBasedLoginForm from '@/app/components/RoleBasedLoginForm';
import Link from 'next/link';

// Define roles
// const ROLES = {
//   STORE_ADMIN: 'store_admin',
//   SALES_OPERATOR: 'sales_operator',
//   SALES_PURCHASE_OPERATOR: 'sales_purchase_operator',
// };

// Extend the Session type to include role
interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

function LoginContent() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [showSignup, setShowSignup] = useState(false);
  const [manualLogout, setManualLogout] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Add a flag to prevent multiple redirects
  const [testCredentials] = useState({
    email: 'admin@admin.com',
    password: 'admin'
  });

  // const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get('from') || '/dashboard';
  const errorParam = searchParams?.get('error');

  // Use NextAuth session
  const { data: session, status } = useSession();

  // Handle successful redirect to dashboard
  const handleRedirectToDashboard = useCallback((redirectUrl = '/dashboard') => {
    if (isRedirecting) return; // Prevent multiple redirects

    setIsRedirecting(true);
    console.log('Redirecting to:', redirectUrl);

    // Store login success flag with timestamp to avoid future redirect loops
    localStorage.setItem('login_successful', 'true');
    localStorage.setItem('login_timestamp', Date.now().toString());

    // Use a more direct redirect approach with window.location.href
    try {
      // Force a hard navigation instead of client-side routing
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Redirect error:', error);
      // Fallback to basic href
      window.location.replace(redirectUrl);
    }
  }, [isRedirecting]);

  // Check for manual logout flag
  useEffect(() => {
    const logoutFlag = localStorage.getItem('manual_logout');
    if (logoutFlag === 'true') {
      setManualLogout(true);
      // We don't immediately remove the flag to ensure it persists through page refreshes
      // until a deliberate login attempt
    } else {
      setManualLogout(false);
    }
  }, []);

  // Auto-fill credentials for development environment
  const fillTestCredentials = () => {
    if (testCredentials) {
      // Get references to form inputs and auto-fill them to provide visual feedback
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;

      if (emailInput) emailInput.value = testCredentials.email;
      if (passwordInput) passwordInput.value = testCredentials.password;

      // Then trigger the login submission
      handleLogin(testCredentials.email, testCredentials.password);
    }
  };

  // Handle error from URL parameters
  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password. Please try again.');
          break;
        case 'SessionRequired':
          setError('You need to be signed in to access that page.');
          break;
        default:
          setError(`Authentication error: ${errorParam}`);
      }
    }
  }, [errorParam]);

  // Redirect if already authenticated, but respect manual logout
  useEffect(() => {
    // Don't do anything if manually logged out
    if (manualLogout) {
      return;
    }

    // If already redirecting, don't do anything else
    if (isRedirecting) {
      return;
    }

    // Check session state
    if (status === 'authenticated') {
      const redirectUrl = from ? decodeURIComponent(from) : '/dashboard';
      console.log('Already authenticated via session, redirecting to:', redirectUrl);
      handleRedirectToDashboard(redirectUrl);
      return;
    }

    // If not authenticated via session and not loading, check if we have user data
    if (status !== 'loading') {
      const userData = localStorage.getItem('user');
      if (userData) {
        // We have user data, which means login was successful
        // The cookie should handle authentication
        const redirectUrl = from ? decodeURIComponent(from) : '/dashboard';
        console.log('User data found, redirecting to:', redirectUrl);
        handleRedirectToDashboard(redirectUrl);
      }
    }
  }, [status, from, manualLogout, isRedirecting, handleRedirectToDashboard]);

  // Handle login submit
  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      // Clear any previous authentication state that might cause issues
      localStorage.removeItem('manual_logout');
      localStorage.removeItem('loggedOut');
      setManualLogout(false);

      setLoading(true);
      setError('');

      // First, try direct API login to get the token
      const apiResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || errorData.error || 'Login failed');
      }

      const apiData = await apiResponse.json();

      if (apiData.success && apiData.user) {
        // The server has already set the HTTP-only cookie
        // No need to store token in localStorage or set cookies manually

        // Store user info in localStorage for UI purposes only
        localStorage.setItem('user', JSON.stringify(apiData.user));

        // Use the destination from params or default to dashboard
        const redirectUrl = decodeURIComponent(from || '/dashboard');

        // Use our helper function to handle redirect
        handleRedirectToDashboard(redirectUrl);
      } else {
        throw new Error(apiData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const err = error as Error;
      setError(`An error occurred: ${err.message || 'Unknown error'}`);
      // Clear any user data in case of failure
      localStorage.removeItem('user');
      localStorage.removeItem('login_successful');
    } finally {
      setLoading(false);
    }
  };

  // If session is loading, show loading indicator
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated but manually logged out, show login form
  if (status === 'authenticated' && manualLogout) {
    // Force sign out if needed to clear the session state
    signIn('credentials', { redirect: false, email: '', password: '' });

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6 max-w-md w-full">
          <p className="text-blue-700 text-sm">
            You&apos;ve been logged out. Please log in again to continue.
          </p>
        </div>

        <RoleBasedLoginForm
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // If already authenticated and not redirecting yet, show loading
  if (status === 'authenticated' || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Login successful!</p>
          {session?.user && (session.user as ExtendedUser)?.role && (
            <div className="mt-2 mb-4">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {(session.user as ExtendedUser).role}
              </span>
            </div>
          )}
          <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Otherwise show the login form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <RoleBasedLoginForm
        onLogin={handleLogin}
        loading={loading}
        error={error}
      />

      <div className="mt-6 text-center">
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up here
          </Link>
        </p>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={fillTestCredentials}
            className="mt-4 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700"
          >
            Use Test Account
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
