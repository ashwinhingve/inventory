'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/storeContext';
import Layout from '@/components/ui/Layout';
import { 
  BellIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, setLoading } = useStore();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // setNotifications(data.notifications);
      
      // Mock data for demonstration
      const mockData: Notification[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Low Stock Alert',
          message: 'Product "Wireless Keyboard" is running low on stock. Current quantity: 5 units.',
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          read: false
        },
        {
          id: '2',
          type: 'success',
          title: 'Order Completed',
          message: 'Order #1234 has been successfully processed and marked as completed.',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          read: true
        },
        {
          id: '3',
          type: 'info',
          title: 'New Feature Available',
          message: 'A new reporting dashboard is now available. Check it out in the Reports section.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: false
        },
        {
          id: '4',
          type: 'error',
          title: 'Payment Failed',
          message: 'Payment for invoice #INV-5678 has failed. Please check payment details.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: false
        },
        {
          id: '5',
          type: 'info',
          title: 'Maintenance Scheduled',
          message: 'System maintenance is scheduled for Sunday, 2:00 AM - 4:00 AM EST.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          read: true
        }
      ];
      
      setNotifications(mockData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchNotifications();
    }
  }, [isLoggedIn, router, fetchNotifications]);
  
  const markAsRead = async (id: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      
      // Update locally
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // await fetch('/api/notifications/read-all', { method: 'PUT' });
      
      // Update locally
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteNotification = async (id: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      
      // Remove locally
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };
  
  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'unread' && notification.read) {
      return false;
    }
    
    if (selectedType !== 'all' && notification.type !== selectedType) {
      return false;
    }
    
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your system notifications
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark All as Read
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-3 text-sm font-medium ${
                  selectedTab === 'all'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('all')}
              >
                All Notifications
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium flex items-center ${
                  selectedTab === 'unread'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('unread')}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by: </span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedTab === 'unread' 
                  ? 'You have no unread notifications.' 
                  : 'You have no notifications at this time.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex ml-4 space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
} 