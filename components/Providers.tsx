'use client';

import { ReactNode, useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { StoreProvider } from '@/context/storeContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/app/components/ui/ThemeProvider';

// Create a bridge component that ensures NextAuth is initialized before StoreProvider
function AuthBridge({ children }: { children: ReactNode }) {
  const { status } = useSession();
  
  useEffect(() => {
    const isLoginPage = window.location.pathname === '/login';
    
    // Handle authentication state changes
    if (status === 'authenticated') {
      // If NextAuth is authenticated but we don't have a token, get one
      if (!localStorage.getItem('token')) {
        // Get a token from the API
        fetch('/api/auth/sync-token', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (data?.token) {
            // Store the token and clear any logged out flags
            localStorage.setItem('token', data.token);
            localStorage.removeItem('loggedOut');
            localStorage.removeItem('manual_logout');
            
            // Only reload if not on login page to prevent loops
            if (!isLoginPage) {
              window.location.reload();
            }
          }
        })
        .catch(error => {
          console.error('AuthBridge: Error syncing token:', error);
        });
      }
    } else if (status === 'unauthenticated' && !isLoginPage) {
      // If NextAuth says we're not authenticated but we have a token
      // (potentially stale token), check if we need to redirect to login
      const token = localStorage.getItem('token');
      if (token) {
        // Verify if the token is valid
        fetch('/api/auth/verify', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
          if (!response.ok) {
            // Invalid token, clear it and redirect to login
            localStorage.removeItem('token');
            window.location.replace('/login');
          }
        })
        .catch(() => {
          // Error verifying, clear and redirect
          localStorage.removeItem('token');
          window.location.replace('/login');
        });
      }
    }
  }, [status]);
  
  return (
    <StoreProvider>
      <ThemeProvider>
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </StoreProvider>
  );
}

export default function Providers({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthBridge>{children}</AuthBridge>
    </SessionProvider>
  );
} 