import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Order date is required'],
    default: Date.now
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    productName: {
      type: String,
      required: [true, 'Product name is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Item total is required']
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  shippingAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  expectedDate: {
    type: Date
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }
}, {
  timestamps: true
});

// Virtual for number of items
OrderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Configure Mongoose to include virtuals when converting document to JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

// Pre-save hook to calculate totals
OrderSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.price;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount
  this.taxAmount = this.subtotal * (this.taxRate / 100);
  
  // Calculate final total
  this.total = this.subtotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema); 