'use client';

import { ReactNode, useEffect } from 'react';
import { useSession} from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ClientAuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function ClientAuthProvider({
  children,
  requireAuth = false
}: ClientAuthProviderProps) {
  const { status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // If authentication is required and user is not authenticated
    if (requireAuth && status === 'unauthenticated') {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // Save intended destination
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        // Redirect to login page
        router.push('/login');
      }
    }
  }, [requireAuth, status, router]);
  
  // Show loading state while checking authentication
  if (requireAuth && status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If we're requiring auth and the user is not authenticated, don't render children
  if (requireAuth && status === 'unauthenticated') {
    return null;
  }
  
  // Otherwise, render children
  return <>{children}</>;
} 