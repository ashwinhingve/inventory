import mongoose from 'mongoose';

const PurchasePaymentSchema = new mongoose.Schema({
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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: false,
  },
  supplierName: {
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
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: false,
  },
  purchaseReference: {
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

// Create compound index for supplier + reference for faster lookups
PurchasePaymentSchema.index({ supplier: 1, reference: 1 });

// Create index for purchase lookups
PurchasePaymentSchema.index({ purchase: 1 });

// Function to generate unique reference number
PurchasePaymentSchema.statics.generateReference = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `PPT-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.PurchasePayment || mongoose.model('PurchasePayment', PurchasePaymentSchema); 