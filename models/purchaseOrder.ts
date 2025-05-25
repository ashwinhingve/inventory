import mongoose from 'mongoose';

const PurchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Purchase order number is required'],
    unique: true,
    trim: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required'],
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax must be a positive number'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total must be a positive number'],
    },
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal must be a positive number'],
  },
  taxTotal: {
    type: Number,
    required: [true, 'Tax total is required'],
    default: 0,
    min: [0, 'Tax total must be a positive number'],
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total must be a positive number'],
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Draft', 'Sent', 'Received', 'Cancelled', 'Completed'],
    default: 'Draft',
  },
  paymentTerms: {
    type: String,
    trim: true,
  },
  shippingMethod: {
    type: String,
    trim: true,
  },
  receivedBy: {
    type: String,
    trim: true,
  },
  receivedDate: {
    type: Date,
  },
  attachments: [{
    fileName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema); 