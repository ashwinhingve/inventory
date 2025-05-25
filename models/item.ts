import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an item name'],
    trim: true,
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Please provide a purchase price'],
    default: 0,
  },
  mrp: {
    type: Number,
    required: [true, 'Please provide MRP'],
    default: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Please provide a selling price'],
    default: 0,
  },
  gstRate: {
    type: Number,
    required: [true, 'Please provide GST rate'],
    default: 0,
  },
  hsnCode: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  priceUnit: {
    type: String,
    required: [true, 'Please provide a price unit'],
    trim: true,
    default: 'Piece',
  },
  secondaryUnit: {
    type: String,
    trim: true,
  },
  lowStockAlert: {
    type: Number,
    default: 0,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Please provide a store'],
  },
  openingStock: {
    type: Number,
    default: 0,
  },
  openingStockDate: {
    type: Date,
    required: [true, 'Please provide opening stock date'],
  },
  location: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Add compound index for user-specific barcode uniqueness
ItemSchema.index({ barcode: 1, userId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Item || mongoose.model('Item', ItemSchema); 