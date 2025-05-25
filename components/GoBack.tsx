'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface GoBackProps {
  className?: string;
  label?: string;
}

const GoBack = ({ className = '', label = 'Back' }: GoBackProps) => {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center text-gray-600 hover:text-gray-900 ${className}`}
    >
      <ArrowLeftIcon className="h-5 w-5 mr-1" />
      <span>{label}</span>
    </button>
  );
};

export default GoBack; 