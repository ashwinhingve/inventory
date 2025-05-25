'use client';

import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Activity {
  id: string;
  timestamp: Date;
  type: 'sale' | 'purchase' | 'inventory' | 'user';
  message: string;
  userRole: string;
  userId: string;
}

interface ActivityResponse {
  id: string;
  timestamp: string;
  type: 'sale' | 'purchase' | 'inventory' | 'user';
  message: string;
  userRole: string;
  userId: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        
        // Get token for authentication
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await fetch('/api/activity/recent', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch activity data');
        }
        
        const data = await response.json();
        
        // Parse dates from the API response
        const activitiesWithDates = data.activities.map((activity: ActivityResponse) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        
        setActivities(activitiesWithDates);
        setError(null);
      } catch (err) {
        setError('Unable to load recent activity');
        console.error('Error fetching activities:', err);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // For demo purposes, show some sample data if API is not implemented
  const sampleActivities: Activity[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'sale',
      message: 'New sale invoice #INV-001 created',
      userRole: 'admin',
      userId: 'user1'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      type: 'inventory',
      message: 'Inventory updated for product "Widget XYZ"',
      userRole: 'manager',
      userId: 'user2'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
      type: 'purchase',
      message: 'Purchase order #PO-042 received',
      userRole: 'admin',
      userId: 'user1'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : sampleActivities;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-100 text-green-800';
      case 'purchase': return 'bg-blue-100 text-blue-800';
      case 'inventory': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
      </div>
      
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {displayActivities.map((activity) => (
              <li key={activity.id} className="py-3">
                <div className="flex items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800">{activity.message}</p>
                    <div className="mt-1 flex items-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {format(activity.timestamp, 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {!isLoading && !error && (
        <div className="border-t border-gray-200 px-4 py-3">
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all activity
          </button>
        </div>
      )}
    </div>
  );
} 