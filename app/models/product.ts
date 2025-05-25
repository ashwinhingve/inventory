import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Buying price is required'],
    min: [0, 'Buying price must be a positive number']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price must be a positive number']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    required: [true, 'Low stock threshold is required'],
    default: 10,
    min: [0, 'Low stock threshold must be a positive number']
  },
  // User ownership - who created this product
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  // Store this product belongs to
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store ID is required']
  },
  // Organization this product belongs to
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required'],
    index: true
  },
  // Optional supplier reference
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  // Additional fields for tracking
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Product images
  images: [{
    url: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // Product tax rate
  taxRate: {
    type: Number,
    default: 0
  },
  // Product variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  // Product metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Create compound unique index for SKU within an organization
ProductSchema.index({ sku: 1, organization: 1 }, { unique: true });

// Create indexes for faster queries
ProductSchema.index({ userId: 1 });
ProductSchema.index({ storeId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });

// Add a virtual for profit margin calculation
ProductSchema.virtual('profitMargin').get(function() {
  if (!this.buyingPrice || this.buyingPrice === 0) return 0;
  const margin = ((this.sellingPrice - this.buyingPrice) / this.buyingPrice) * 100;
  return parseFloat(margin.toFixed(2));
});

// Add a virtual for stock value
ProductSchema.virtual('stockValue').get(function() {
  return this.buyingPrice * this.quantity;
});

// Add a virtual for sales value
ProductSchema.virtual('salesValue').get(function() {
  return this.sellingPrice * this.quantity;
});

// Add method to check if product is low on stock
ProductSchema.methods.isLowStock = function() {
  return this.quantity <= this.lowStockThreshold;
};

export default mongoose.models.Product || mongoose.model('Product', ProductSchema); 