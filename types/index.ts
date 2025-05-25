export interface Product {
  _id?: string;
  name: string;
  sku: string;
  category: string;
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  barcode?: string;
  store?: string;
  supplier?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Supplier {
  _id?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Store {
  _id?: string;
  name: string;
  location?: string;
  manager?: string;
  contact?: string;
}

export interface Transaction {
  _id?: string;
  type: 'purchase' | 'sale' | 'return' | 'adjustment';
  date: Date;
  products: {
    product: string | Product;
    quantity: number;
    price: number;
  }[];
  party?: string;
  total: number;
  notes?: string;
  paymentStatus?: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff' | 'manager';
  isActive: boolean;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  children?: NavigationItem[];
  current?: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalPurchases: number;
  monthlyRevenue: number;
}

export interface AlertType {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
}

export interface Party {
  _id?: string;
  name: string;
  mobileNumber?: string;
  openingBalance?: number;
  balanceType: 'Payable' | 'Receivable';
  gstNumber?: string;
  panNumber?: string;
  billingAddress?: {
    address?: string;
    pincode?: string;
    state?: string;
  };
  shippingAddress?: {
    address?: string;
    pincode?: string;
    state?: string;
  };
  sameShippingAddress?: boolean;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
  };
  active?: boolean;
  currentBalance?: number;
  balanceDisplay?: {
    amount: number;
    type: 'Payable' | 'Receivable';
  };
}

export type PaymentMethod = 'cash' | 'bank' | 'credit_card' | 'check' | 'other';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type InvoiceStatus = 'draft' | 'pending' | 'completed' | 'cancelled';

export interface InvoiceItem {
  product: string | Product;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  prefix: string;
  serialNumber: string;
  date: Date;
  entryTime: string;
  party: string | Party;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  termsAndConditions?: string;
  paymentHistory?: Array<{
    date: Date;
    amount: number;
    method: PaymentMethod;
    notes?: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Error types
export interface ErrorResponse {
  error: string;
  message?: string;
  status?: number;
}

// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationData;
}

export interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  limit: number;
}

// Query types
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Common query filter types
export interface CommonFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
}

// Transaction error type
export interface TransactionError extends Error {
  code?: number | string;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
}

export interface Item {
  _id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  reorderLevel: number;
  taxRate: number;
  isActive: boolean;
  barcode?: string;
  price?: number;
  cost?: number;
  storeId?: string;
  createdAt?: string;
  updatedAt?: string;
} 