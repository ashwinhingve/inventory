'use client';

import { useState, useEffect } from 'react';

// Define roles locally to avoid import issues
const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
  hideLabel?: boolean;
  defaultOption?: string;
  error?: string;
}

export default function RoleSelector({
  value,
  onChange,
  disabled = false,
  required = true,
  className = '',
  label = 'Role',
  hideLabel = false,
  defaultOption = 'Select a role',
  error
}: RoleSelectorProps) {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Role display names for better UX
  const roleDisplayNames = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.STAFF]: 'Staff Member'
  };

  useEffect(() => {
    const fetchAvailableRoles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/roles');
        
        if (!response.ok) {
          throw new Error('Failed to fetch available roles');
        }
        
        const data = await response.json();
        
        if (data.success && data.roles) {
          setAvailableRoles(data.roles);
        } else {
          setFetchError(data.error || 'Failed to load roles');
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        setFetchError('Unable to load roles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableRoles();
  }, []);

  return (
    <div className="form-control w-full">
      {!hideLabel && (
        <label className="label">
          <span className="label-text font-medium text-gray-700">{label} {required && <span className="text-red-600">*</span>}</span>
        </label>
      )}
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        required={required}
        className={`select select-bordered w-full text-gray-800 ${error ? 'select-error border-red-500' : 'border-gray-300'} ${className} focus:ring-2 focus:ring-blue-600 focus:border-blue-600`}
      >
        <option value="" className="text-gray-500">{loading ? 'Loading roles...' : defaultOption}</option>
        
        {availableRoles.map(role => (
          <option key={role} value={role} className="text-gray-800">
            {roleDisplayNames[role as keyof typeof roleDisplayNames] || role}
          </option>
        ))}
      </select>
      
      {(error || fetchError) && (
        <label className="label">
          <span className="label-text-alt text-red-600 font-medium">{error || fetchError}</span>
        </label>
      )}
    </div>
  );
} 