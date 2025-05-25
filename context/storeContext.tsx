"use client"
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AlertType, DashboardStats, Product, Store, Supplier } from '@/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface StoreContextType {
  // User state
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Store state
  currentStore: string;
  setCurrentStore: (store: string) => void;
  
  // Loading state
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  
  // Alert state
  alert: AlertType | null;
  setAlert: (alert: AlertType | null) => void;
  
  // Dashboard stats
  dashboardStats: DashboardStats;
  fetchDashboardStats: (options?: { period?: string; storeId?: string }) => Promise<void>;
  
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  fetchProducts: (params?: Record<string, string>) => Promise<void>;
  
  // Stores
  stores: Store[];
  fetchStores: () => Promise<void>;
  
  // Suppliers
  suppliers: Supplier[];
  fetchSuppliers: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalProducts: 0,
  lowStockProducts: 0,
  totalSales: 0,
  totalPurchases: 0,
  monthlyRevenue: 0
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Store state
  const [currentStore, setCurrentStore] = useState('MyStore');
  
  // Loading state
  const [isLoading, setLoading] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState<AlertType | null>(null);
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultStats);
  
  // Products
  const [products, setProducts] = useState<Product[]>([]);
  
  // Stores
  const [stores, setStores] = useState<Store[]>([]);
  
  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Authentication check - only runs once on initial load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Immediately check for token
        const token = localStorage.getItem('token');
        const hasLoggedOut = localStorage.getItem('loggedOut') === 'true';
        const isLoginPage = window.location.pathname === '/login';
        
        // Handle logout state
        if (hasLoggedOut) {
          setIsLoggedIn(false);
          return;
        }
        
        // If we have a token, assume logged in and verify
        if (token) {
          setIsLoggedIn(true);
          
          // No need to verify the token on the login page
          if (isLoginPage) {
            return;
          }
          
          // Verify token validity on non-login pages
          try {
            const response = await fetch('/api/auth/verify', {
              headers: { 'Authorization': `Bearer ${token}` },
              // Include credentials to send cookies too
              credentials: 'include'
            });
            
            if (!response.ok) {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              
              // Only redirect to login if not already there
              if (!isLoginPage) {
                window.location.replace('/login');
              }
            }
          } catch (error) {
            console.error("StoreContext: Token verification error:", error);
            // Don't clear token on network errors to prevent logout during connectivity issues
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("StoreContext: Error in checkAuthState:", error);
        setIsLoggedIn(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      checkAuthState();
      
      // Add event listener for storage changes to handle multi-tab authentication
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'token' && !e.newValue) {
          // Token was removed in another tab
          setIsLoggedIn(false);
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        } else if (e.key === 'token' && e.newValue) {
          // Token was added in another tab
          setIsLoggedIn(true);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);
  
  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }
      
      console.log('Login API response successful, setting token');
      
      // Store token in local storage
      localStorage.setItem('token', data.token);
      
      // Clear the logged out flag
      localStorage.removeItem('loggedOut');
      
      // Update logged in state
      setIsLoggedIn(true);
      
      // Reset any redirect flags to allow clean navigation
      sessionStorage.removeItem('redirectAttempted');
      sessionStorage.removeItem('storeContextInit');
      
      // Show success message
      toast.success('Login successful!');
      
      // Return data instead of redirecting here - let the login page handle redirection
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing token to be safe
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      
      // Show error alert
      setAlert({
        id: Date.now().toString(),
        type: 'error',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      });
      
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Invalid credentials'));
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear token and state
      localStorage.removeItem('token');
      
      // Set a flag to prevent automatic re-login
      localStorage.setItem('loggedOut', 'true');
      
      setIsLoggedIn(false);
      
      // Clear session storage flags
      sessionStorage.removeItem('redirectAttempted');
      sessionStorage.removeItem('storeContextInit');
      
      // Show success message
      toast.success('Logged out successfully!');
      
      // Navigate immediately
      console.log('Redirecting to login page');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  }, []);
  
  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async (options: { period?: string; storeId?: string } = {}) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.period) params.append('period', options.period);
      if (currentStore) params.append('storeId', currentStore);
      
      // Fetch dashboard stats from API
      const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update all dashboard-related state
        setDashboardStats({
          totalProducts: result.data.inventoryMetrics.totalItems || 0,
          lowStockProducts: result.data.inventoryMetrics.lowStockItems || 0,
          totalSales: result.data.businessMetrics.totalSales || 0,
          totalPurchases: result.data.businessMetrics.totalPurchases || 0,
          monthlyRevenue: result.data.businessMetrics.totalSales || 0
        });
        
        // You might want to add more state setters here as you expand the dashboard
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, [currentStore]);
  
  // Fetch products
  const fetchProducts = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      let url = '/api/products';
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        
        url += `?${queryParams.toString()}`;
      }
      
      console.log('Fetching products from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      console.log('Products API response:', data);
      
      if (data.success) {
        // Ensure we're setting the products array correctly
        const productsArray = Array.isArray(data.products) ? data.products : [];
        console.log(`Setting ${productsArray.length} products to state`);
        setProducts(productsArray);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products data. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch stores
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stores');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stores');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStores(data.stores || []);
      } else {
        throw new Error(data.error || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores data. Please try again later.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/suppliers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }
      
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setAlert({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to fetch suppliers'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  const contextValue: StoreContextType = {
    isLoggedIn,
    login,
    logout,
    currentStore,
    setCurrentStore,
    isLoading,
    setLoading,
    alert,
    setAlert,
    dashboardStats,
    fetchDashboardStats,
    products,
    setProducts,
    fetchProducts,
    stores,
    fetchStores,
    suppliers,
    fetchSuppliers
  };
  
  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  
  return context;
};