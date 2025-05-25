import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  },
  customerName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Check', 'Online Payment', 'Other'],
  },
  status: {
    type: String,
    required: true,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed',
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: false,
  },
  invoiceNumber: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
});

// Create compound index for customer + reference for faster lookups
PaymentSchema.index({ customer: 1, reference: 1 });

// Create index for invoice lookups
PaymentSchema.index({ invoice: 1 });

// Function to generate unique reference number
PaymentSchema.statics.generateReference = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `PMT-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema); 