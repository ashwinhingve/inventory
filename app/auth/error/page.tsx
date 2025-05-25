'use client';

import React from 'react';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-4">An authentication error has occurred. Please try signing in again.</p>
      <Link href="/login" className="text-blue-600 hover:underline">
        Return to Login
      </Link>
    </div>
  );
} 