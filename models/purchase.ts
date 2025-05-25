import mongoose from 'mongoose';

interface PurchaseDocument extends mongoose.Document {
  reference: string;
  date: Date;
  supplier?: mongoose.Types.ObjectId;
  supplierName: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount?: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  paymentHistory?: Array<{
    date: Date;
    amount: number;
    method: 'cash' | 'bank' | 'credit_card' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }>;
  itemCount: number;
  toJSON(): any;
  toObject(): any;
}

interface PurchaseModel extends mongoose.Model<PurchaseDocument> {
  generateReference(): Promise<string>;
}

const PurchaseSchema = new mongoose.Schema({
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
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  taxAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid',
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  notes: {
    type: String,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  paymentHistory: [{
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: true,
      enum: ['cash', 'bank', 'credit_card', 'check', 'other'],
    },
    reference: String,
    notes: String,
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item count
PurchaseSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Pre-save hook to calculate totals
PurchaseSchema.pre('save', function(next) {
  const purchaseDoc = this as unknown as PurchaseDocument;
  
  // Calculate item totals if not already set
  purchaseDoc.items.forEach((item) => {
    if (!item.total) {
      item.total = item.quantity * item.price;
    }
  });
  
  // Calculate subtotal
  purchaseDoc.subtotal = purchaseDoc.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate final total (including tax if applicable)
  purchaseDoc.total = purchaseDoc.subtotal + (purchaseDoc.taxAmount || 0);
  
  next();
});

// Function to generate unique purchase reference
PurchaseSchema.statics.generateReference = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `PO-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.Purchase as PurchaseModel || mongoose.model<PurchaseDocument, PurchaseModel>('Purchase', PurchaseSchema);
export type { PurchaseModel }; 