import mongoose from 'mongoose';

interface PurchaseReturnDocument extends mongoose.Document {
  returnNumber: string;
  date: Date;
  supplier?: mongoose.Types.ObjectId;
  supplierName: string;
  purchase?: mongoose.Types.ObjectId;
  purchaseReference?: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    total: number;
    reason: 'Damaged Product' | 'Wrong Item' | 'Quality Issues' | 'Excess Quantity' | 'Other';
    notes?: string;
  }>;
  subtotal: number;
  taxAmount?: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  reason: string;
  notes?: string;
  refundStatus: 'Not Refunded' | 'Partially Refunded' | 'Fully Refunded';
  refundAmount: number;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  itemCount: number;
}

interface PurchaseReturnModel extends mongoose.Model<PurchaseReturnDocument> {
  generateReturnNumber(): Promise<string>;
}

const PurchaseReturnSchema = new mongoose.Schema({
  returnNumber: {
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
    },
    reason: {
      type: String,
      required: true,
      enum: ['Damaged Product', 'Wrong Item', 'Quality Issues', 'Excess Quantity', 'Other'],
    },
    notes: {
      type: String,
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
    enum: ['Pending', 'Approved', 'Completed', 'Rejected'],
    default: 'Pending',
  },
  reason: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  refundStatus: {
    type: String,
    enum: ['Not Refunded', 'Partially Refunded', 'Fully Refunded'],
    default: 'Not Refunded',
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for item count
PurchaseReturnSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Pre-save hook to calculate totals
PurchaseReturnSchema.pre('save', function(next) {
  const returnDoc = this as unknown as PurchaseReturnDocument;
  
  // Calculate item totals if not already set
  returnDoc.items.forEach((item) => {
    if (!item.total) {
      item.total = item.quantity * item.price;
    }
  });
  
  // Calculate subtotal
  returnDoc.subtotal = returnDoc.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate final total (including tax if applicable)
  returnDoc.total = returnDoc.subtotal + (returnDoc.taxAmount || 0);
  
  next();
});

// Function to generate unique return number
PurchaseReturnSchema.statics.generateReturnNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `PR-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.PurchaseReturn as PurchaseReturnModel || mongoose.model<PurchaseReturnDocument, PurchaseReturnModel>('PurchaseReturn', PurchaseReturnSchema);
export type { PurchaseReturnModel }; 