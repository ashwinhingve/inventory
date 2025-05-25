import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['purchase', 'sale', 'return', 'adjustment'],
    required: [true, 'Please provide transaction type'],
  },
  date: {
    type: Date,
    required: [true, 'Please provide transaction date'],
    default: Date.now,
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide product reference'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: 0,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: 0,
    },
  }],
  party: {
    type: String,
    trim: true,
  },
  total: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'unpaid'],
    default: 'unpaid',
  },
  paymentMethod: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema); 