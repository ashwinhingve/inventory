import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define all possible permissions in the system
export const PERMISSIONS = {
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  MANAGE_INVENTORY: 'manage_inventory',
  
  // Stock permissions
  VIEW_STOCK: 'view_stock',
  ADJUST_STOCK: 'adjust_stock',
  
  // Product permissions
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Supplier permissions
  VIEW_SUPPLIERS: 'view_suppliers',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  
  // Sales permissions
  VIEW_SALES: 'view_sales',
  CREATE_SALES: 'create_sales',
  MANAGE_SALES: 'manage_sales',
  
  // Quotes/Invoices permissions
  VIEW_QUOTES: 'view_quotes',
  MANAGE_QUOTES: 'manage_quotes',
  VIEW_INVOICES: 'view_invoices',
  MANAGE_INVOICES: 'manage_invoices',
  
  // Finance permissions
  VIEW_FINANCES: 'view_finances',
  MANAGE_FINANCES: 'manage_finances',
  
  // Expense permissions
  VIEW_EXPENSES: 'view_expenses',
  CREATE_EXPENSES: 'create_expenses',
  MANAGE_EXPENSES: 'manage_expenses',
  
  // Reports permissions
  VIEW_REPORTS: 'view_reports',
  
  // User/Staff permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // System settings
  MANAGE_SETTINGS: 'manage_settings',
};

// Define user roles - simplified to just Admin and Staff
export const ROLES = {
  ADMIN: 'admin',        // Admin with full system access
  STAFF: 'staff',        // Regular staff with limited permissions
};

// Define role-based permissions
// For each role, list all the permissions they have by default
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admins have all permissions
  
  [ROLES.STAFF]: [
    // Inventory permissions
    PERMISSIONS.VIEW_INVENTORY,
    
    // Stock permissions
    PERMISSIONS.VIEW_STOCK,
    PERMISSIONS.ADJUST_STOCK,
    
    // Product permissions
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    
    // Supplier permissions
    PERMISSIONS.VIEW_SUPPLIERS,
    
    // Sales permissions
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.CREATE_SALES,
    
    // Quotes/Invoices permissions
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.VIEW_INVOICES,
    
    // Finance permissions (limited)
    PERMISSIONS.VIEW_FINANCES,
    
    // Expense permissions
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.CREATE_EXPENSES,
    
    // Reports permissions (limited)
    PERMISSIONS.VIEW_REPORTS,
  ],
};

interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;  // Add explicit _id type
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  customPermissions: string[];
  isActive: boolean;
  lastActive?: Date;
  assignedStores: mongoose.Types.ObjectId[];
  defaultStore?: mongoose.Types.ObjectId;
  dataVisibility: 'own' | 'store' | 'admin_group' | 'all';
  createdBy?: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  managedStaff: mongoose.Types.ObjectId[];
  managementPath: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verified: boolean;
  verificationToken?: string;
  verificationExpire?: Date;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  allPermissions: string[];
  comparePassword(enteredPassword: string): Promise<boolean>;
  canAccessData(dataOwnerId: string, dataStoreId: string, dataAdminId: string, dataOrganizationId: string): boolean;
  canManageUser(targetUserId: string): Promise<boolean>;
  hasPermission(permission: string): boolean;
}

const UserSchema = new mongoose.Schema({
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
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.STAFF
  },
  // Custom permissions that override role-based permissions
  customPermissions: {
    type: [String],
    enum: Object.values(PERMISSIONS),
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: null
  },
  // User-specific store assignments
  assignedStores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  }],
  // Default store for this user
  defaultStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  // Data visibility settings
  dataVisibility: {
    type: String,
    enum: ['own', 'store', 'admin_group', 'all'],
    default: 'own', // By default, users can only see their own data
    description: 'Determines what data the user can view: own (only created by them), store (all within their assigned stores), admin_group (all within their admin hierarchy), or all (all data in organization)'
  },
  // Creator of the user - used for hierarchical data access
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Organization the user belongs to - critical for multi-tenant data isolation
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  // Admin domain - for hierarchical admin isolation
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: 'The admin user who manages this user (and their domain)'
  },
  // Staff members managed by this user (if admin/manager)
  managedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Management hierarchy path - for efficient hierarchical queries
  managementPath: {
    type: String,
    default: '',
    description: 'Comma-separated path of user IDs in the management hierarchy'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpire: Date,
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // Include virtuals in JSON
  toObject: { virtuals: true } // Include virtuals in objects
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update managementPath logic to handle simplified role hierarchy
UserSchema.pre('save', async function(this: UserDocument, next) {
  if (this.isNew || this.isModified('adminId')) {
    try {
      if (this.adminId) {
        const admin = await (this.constructor as mongoose.Model<UserDocument>).findById(this.adminId);
        if (admin && admin instanceof mongoose.Document) {
          // The management path is the admin's path plus the admin's ID
          this.managementPath = admin.managementPath 
            ? `${admin.managementPath},${admin._id}` 
            : admin._id.toString();
        }
      } else if (this.role === ROLES.ADMIN) {
        // Admins without an admin domain are top-level, path is just their own ID
        this.managementPath = this._id.toString();
      }
    } catch (err) {
      return next(err as mongoose.CallbackError);
    }
  }
  next();
});

// Virtual property to get all permissions for a user
UserSchema.virtual('allPermissions').get(function(this: UserDocument) {
  // Start with role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[this.role as keyof typeof ROLE_PERMISSIONS] || [];
  
  // Add custom permissions
  const allPermissions = new Set([...rolePermissions, ...this.customPermissions]);
  
  return Array.from(allPermissions);
});

// Method to check if user has a specific permission
UserSchema.methods.hasPermission = function(this: UserDocument, permission: string) {
  return this.allPermissions.includes(permission);
};

// Method to check if a user can access specific data
UserSchema.methods.canAccessData = function(
  this: UserDocument,
  dataOwnerId: string, 
  dataStoreId: string, 
  dataAdminId: string, 
  dataOrganizationId: string
) {
  // First check organization - this is the primary data isolation boundary
  if (this.organization.toString() !== dataOrganizationId.toString()) {
    return false;
  }
  
  // Super admins can access all data within their organization
  if (this.role === ROLES.ADMIN) {
    return true;
  }
  
  // Check based on visibility settings
  switch (this.dataVisibility) {
    case 'all':
      // Can see all data within their organization
      return true;
    case 'admin_group':
      // Check if user is in the same admin domain
      if (!dataAdminId) return false;
      
      // If this user is the admin domain owner
      if (this._id.toString() === dataAdminId.toString()) {
        return true;
      }
      
      // If this user is in the admin domain's management path
      if (this.managementPath && this.managementPath.includes(dataAdminId.toString())) {
        return true;
      }
      
      return false;
    case 'store':
      // Check if user is assigned to the store
      if (!dataStoreId) return false;
      return this.assignedStores.some((storeId: mongoose.Types.ObjectId) => storeId.toString() === dataStoreId.toString());
    case 'own':
    default:
      // User can only see their own data
      return this._id.toString() === dataOwnerId.toString();
  }
};

// Method to check if user can manage another user
UserSchema.methods.canManageUser = async function(this: UserDocument, targetUserId: string) {
  // Cannot manage yourself (for protection)
  if (this._id.toString() === targetUserId.toString()) {
    return true; // Allow self-management
  }
  
  // Get the target user
  const targetUser = await (this.constructor as mongoose.Model<UserDocument>).findById(targetUserId);
  if (!targetUser) {
    return false;
  }
  
  // Must be in same organization
  if (this.organization.toString() !== targetUser.organization.toString()) {
    return false;
  }
  
  // Admins can manage everyone
  if (this.role === ROLES.ADMIN) {
    return true;
  }
  
  // Staff cannot manage other users
  return false;
};

// Add index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ organization: 1 });
UserSchema.index({ adminId: 1 });
UserSchema.index({ managementPath: 1 });
UserSchema.index({ role: 1, organization: 1 });

// Create the model if it doesn't exist
const UserModel = mongoose.models.User as mongoose.Model<UserDocument> || mongoose.model<UserDocument>('User', UserSchema);
export default UserModel; 