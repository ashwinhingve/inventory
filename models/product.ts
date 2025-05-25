import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please provide a SKU'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Please provide a buying price'],
    min: 0,
  },
  sellingPrice: {
    type: Number, 
    required: [true, 'Please provide a selling price'],
    min: 0,
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    required: [true, 'Please provide low stock threshold'],
    min: 0,
    default: 10,
  },
  barcode: {
    type: String,
    trim: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
}, {
  timestamps: true,
});

// Add virtual for profit margin
ProductSchema.virtual('profitMargin').get(function() {
  if (this.buyingPrice === 0) return 0;
  return ((this.sellingPrice - this.buyingPrice) / this.buyingPrice) * 100;
});

// Add virtual for low stock status
ProductSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Set toJSON option to include virtuals
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema); 