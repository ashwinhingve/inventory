import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define user roles according to new requirements
export const ROLES = {
  OWNER: 'owner',
  STORE_ADMIN: 'store_admin',
  SALES_OPERATOR: 'sales_operator',
  SALES_PURCHASE_OPERATOR: 'sales_purchase_operator',
};

// Define permissions
export const PERMISSIONS = {
  // User/Staff permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Dashboard permission
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Parties permission
  VIEW_PARTIES: 'view_parties',
  MANAGE_PARTIES: 'manage_parties',
  
  // Entries permission
  VIEW_ALL_ENTRIES: 'view_all_entries',
  
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  
  // Stock permissions
  VIEW_STOCK: 'view_stock',
  MANAGE_STOCK: 'manage_stock',
  
  // Items permissions
  VIEW_ITEMS: 'view_items',
  MANAGE_ITEMS: 'manage_items',
  
  // Barcode permissions
  VIEW_BARCODE: 'view_barcode',
  MANAGE_BARCODE: 'manage_barcode',
  
  // Stores permissions
  VIEW_STORES: 'view_stores',
  MANAGE_STORES: 'manage_stores',
  
  // Sales permissions
  VIEW_SALES: 'view_sales',
  CREATE_SALES: 'create_sales',
  EDIT_SALES: 'edit_sales',
  DELETE_SALES: 'delete_sales',
  
  // Sales Invoice permissions
  VIEW_SALES_INVOICE: 'view_sales_invoice',
  MANAGE_SALES_INVOICE: 'manage_sales_invoice',
  
  // Sales Return permissions
  VIEW_SALES_RETURN: 'view_sales_return',
  MANAGE_SALES_RETURN: 'manage_sales_return',
  
  // Sales Payment In permissions
  VIEW_SALES_PAYMENT_IN: 'view_sales_payment_in',
  MANAGE_SALES_PAYMENT_IN: 'manage_sales_payment_in',
  
  // Sales Orders permissions
  VIEW_SALES_ORDERS: 'view_sales_orders',
  MANAGE_SALES_ORDERS: 'manage_sales_orders',
  
  // Sales Quotes permissions
  VIEW_SALES_QUOTES: 'view_sales_quotes',
  MANAGE_SALES_QUOTES: 'manage_sales_quotes',
  
  // Purchase permissions
  VIEW_PURCHASES: 'view_purchases',
  CREATE_PURCHASES: 'create_purchases',
  EDIT_PURCHASES: 'edit_purchases',
  DELETE_PURCHASES: 'delete_purchases',
  
  // Purchase Invoice permissions
  VIEW_PURCHASE_INVOICE: 'view_purchase_invoice',
  MANAGE_PURCHASE_INVOICE: 'manage_purchase_invoice',
  
  // Purchase Return permissions
  VIEW_PURCHASE_RETURN: 'view_purchase_return',
  MANAGE_PURCHASE_RETURN: 'manage_purchase_return',
  
  // Purchase Orders permissions
  VIEW_PURCHASE_ORDERS: 'view_purchase_orders',
  MANAGE_PURCHASE_ORDERS: 'manage_purchase_orders',
  
  // Purchase Payment Out permissions
  VIEW_PURCHASE_PAYMENT_OUT: 'view_purchase_payment_out',
  MANAGE_PURCHASE_PAYMENT_OUT: 'manage_purchase_payment_out',
  
  // Accounting permissions
  VIEW_ACCOUNTING: 'view_accounting',
  MANAGE_ACCOUNTING: 'manage_accounting',
  
  // Expense permissions
  VIEW_EXPENSES: 'view_expenses',
  MANAGE_EXPENSES: 'manage_expenses',
  
  // Cash Bank permissions
  VIEW_CASH_BANK: 'view_cash_bank',
  MANAGE_CASH_BANK: 'manage_cash_bank',
  
  // Reports permissions
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORTS: 'generate_reports',
  
  // Help permissions
  VIEW_HELP: 'view_help',
  
  // Settings permissions
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
};

// Define the User document interface
interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
  organization: mongoose.Types.ObjectId;
  store?: mongoose.Types.ObjectId;
  isActive: boolean;
  dataVisibility: 'own' | 'store' | 'admin_group' | 'all';
  adminId?: mongoose.Types.ObjectId;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define methods interface
interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  hasPermission(permission: string): boolean;
  canAccessData(adminId: string): boolean;
  canManageStaff(): boolean;
}

// Create a type that combines IUser and IUserMethods
type UserDocument = mongoose.Document & IUser & IUserMethods;

// Define the model type properly for Next.js 15 + Mongoose
type UserModel = mongoose.Model<UserDocument> & {
  // Add any static methods here if needed
};

const UserSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password should be at least 6 characters']
  },
  role: {
    type: String,
    enum: {
      values: Object.values(ROLES),
      message: 'Invalid role. Role must be one of: ' + Object.values(ROLES).join(', ')
    },
    default: ROLES.OWNER
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dataVisibility: {
    type: String,
    enum: ['own', 'store', 'admin_group', 'all'],
    default: 'own'
  },
  // For admin users, this indicates the admin who created them
  // For regular users, this indicates which admin's data they can access
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = new Date();
});

// Match password method
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user has a specific permission
UserSchema.methods.hasPermission = function(permission: string): boolean {
  // Role-based permission mapping
  const rolePermissions = {
    // Owner has full access to everything
    [ROLES.OWNER]: Object.values(PERMISSIONS),
    
    // Store Admin permissions
    [ROLES.STORE_ADMIN]: [
      // Primary access permissions
      PERMISSIONS.VIEW_PARTIES, PERMISSIONS.MANAGE_PARTIES,
      PERMISSIONS.VIEW_ALL_ENTRIES,
      
      // Sales permissions
      PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES, PERMISSIONS.DELETE_SALES,
      PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
      PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
      PERMISSIONS.VIEW_SALES_PAYMENT_IN, PERMISSIONS.MANAGE_SALES_PAYMENT_IN,
      PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
      PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
      
      // Purchase permissions
      PERMISSIONS.VIEW_PURCHASES, PERMISSIONS.CREATE_PURCHASES, PERMISSIONS.EDIT_PURCHASES, PERMISSIONS.DELETE_PURCHASES,
      PERMISSIONS.VIEW_PURCHASE_INVOICE, PERMISSIONS.MANAGE_PURCHASE_INVOICE,
      PERMISSIONS.VIEW_PURCHASE_RETURN, PERMISSIONS.MANAGE_PURCHASE_RETURN,
      PERMISSIONS.VIEW_PURCHASE_ORDERS, PERMISSIONS.MANAGE_PURCHASE_ORDERS,
      PERMISSIONS.VIEW_PURCHASE_PAYMENT_OUT, PERMISSIONS.MANAGE_PURCHASE_PAYMENT_OUT,
      
      // Inventory permissions
      PERMISSIONS.VIEW_STOCK, PERMISSIONS.MANAGE_STOCK,
      PERMISSIONS.VIEW_ITEMS, PERMISSIONS.MANAGE_ITEMS,
      
      // Accounting permissions
      PERMISSIONS.VIEW_EXPENSES, PERMISSIONS.MANAGE_EXPENSES,
      
      // Help permissions
      PERMISSIONS.VIEW_HELP,
      
      // User permissions
      PERMISSIONS.VIEW_USERS, PERMISSIONS.CREATE_USERS, PERMISSIONS.EDIT_USERS, PERMISSIONS.DELETE_USERS,
    ],
    
    // Sales Operator permissions
    [ROLES.SALES_OPERATOR]: [
      // Primary access permissions
      PERMISSIONS.VIEW_ALL_ENTRIES,
      
      // Sales permissions
      PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES,
      PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
      PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
      PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
      PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
      
      // Inventory permissions
      PERMISSIONS.VIEW_STOCK,
      
      // Help permissions
      PERMISSIONS.VIEW_HELP,
    ],
    
    // Sales Purchase Operator permissions
    [ROLES.SALES_PURCHASE_OPERATOR]: [
      // Primary access permissions
      PERMISSIONS.VIEW_ALL_ENTRIES,
      
      // Sales permissions
      PERMISSIONS.VIEW_SALES, PERMISSIONS.CREATE_SALES, PERMISSIONS.EDIT_SALES,
      PERMISSIONS.VIEW_SALES_INVOICE, PERMISSIONS.MANAGE_SALES_INVOICE,
      PERMISSIONS.VIEW_SALES_RETURN, PERMISSIONS.MANAGE_SALES_RETURN,
      PERMISSIONS.VIEW_SALES_ORDERS, PERMISSIONS.MANAGE_SALES_ORDERS,
      PERMISSIONS.VIEW_SALES_QUOTES, PERMISSIONS.MANAGE_SALES_QUOTES,
      
      // Purchase permissions
      PERMISSIONS.VIEW_PURCHASES, PERMISSIONS.CREATE_PURCHASES, PERMISSIONS.EDIT_PURCHASES,
      PERMISSIONS.VIEW_PURCHASE_INVOICE, PERMISSIONS.MANAGE_PURCHASE_INVOICE,
      PERMISSIONS.VIEW_PURCHASE_RETURN, PERMISSIONS.MANAGE_PURCHASE_RETURN,
      PERMISSIONS.VIEW_PURCHASE_ORDERS, PERMISSIONS.MANAGE_PURCHASE_ORDERS,
      
      // Inventory permissions
      PERMISSIONS.VIEW_STOCK,
      
      // Help permissions
      PERMISSIONS.VIEW_HELP,
    ]
  };
  
  // Check if the user's role has the required permission
  return rolePermissions[this.role as keyof typeof rolePermissions]?.includes(permission) || false;
};

// Method to check if user can access specific data
UserSchema.methods.canAccessData = function(adminId: string): boolean {
  // Store Admins can only access their own data
  if (this.role === ROLES.STORE_ADMIN) {
    return this._id.toString() === adminId.toString();
  }
  
  // Other users can access data based on their assigned adminId
  return this.adminId?.toString() === adminId.toString();
};

// Method to check if a user can manage staff (create/edit/delete)
UserSchema.methods.canManageStaff = function(): boolean {
  return this.role === ROLES.STORE_ADMIN;
};

// Create and export the User model with proper typing for Next.js 15
const User = (mongoose.models.User as UserModel) || mongoose.model<UserDocument, UserModel>('User', UserSchema);

export default User;
export type { UserDocument, IUser, IUserMethods, UserModel };