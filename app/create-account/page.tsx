'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the sign up page
    router.replace('/api/auth/signup');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to signup page...</p>
      </div>
    </div>
  );
} 