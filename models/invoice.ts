import mongoose from 'mongoose';

interface InvoiceDocument extends mongoose.Document {
  reference: string;
  date: Date;
  party: mongoose.Types.ObjectId;
  partyName: string;
  purchase?: mongoose.Types.ObjectId;
  purchaseReference?: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  status: 'pending' | 'received' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
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
  due: number;
  toJSON(): any;
  toObject(): any;
}

interface InvoiceModel extends mongoose.Model<InvoiceDocument> {
  generateReference(): Promise<string>;
}

const InvoiceSchema = new mongoose.Schema({
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
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true,
  },
  partyName: {
    type: String,
    required: true,
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
  taxRate: {
    type: Number,
    required: false,
    default: 0,
  },
  taxAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  discountAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  paidAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  dueAmount: {
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

// Virtual for due amount calculation
InvoiceSchema.virtual('due').get(function() {
  return this.total - this.paidAmount;
});

// Pre-save hook to calculate totals
InvoiceSchema.pre('save', function(next) {
  const invoiceDoc = this as unknown as InvoiceDocument;
  
  // Calculate item totals if not already set
  invoiceDoc.items.forEach((item) => {
    if (!item.total) {
      item.total = item.quantity * item.price;
    }
  });
  
  // Calculate subtotal
  invoiceDoc.subtotal = invoiceDoc.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate final total (including tax if applicable)
  invoiceDoc.total = invoiceDoc.subtotal + (invoiceDoc.taxAmount || 0);
  
  next();
});

// Function to generate unique invoice reference
InvoiceSchema.statics.generateReference = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `INV-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema); 