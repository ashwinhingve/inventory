import mongoose from 'mongoose';

interface QuoteDocument extends mongoose.Document {
  reference: string;
  date: Date;
  party: mongoose.Types.ObjectId;
  partyName: string;
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: Date;
  notes?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  itemCount: number;
  toJSON(): any;
  toObject(): any;
}

interface QuoteModel extends mongoose.Model<QuoteDocument> {
  generateReference(): Promise<string>;
}

const QuoteSchema = new mongoose.Schema({
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
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft',
  },
  validUntil: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
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
QuoteSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Pre-save hook to calculate totals
QuoteSchema.pre('save', function(next) {
  const quote = this as unknown as QuoteDocument;
  
  // Calculate item totals if not already set
  quote.items.forEach((item) => {
    if (!item.total) {
      item.total = item.quantity * item.price;
    }
  });
  
  // Calculate subtotal
  quote.subtotal = quote.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount if tax rate is provided
  if (quote.taxRate && quote.taxRate > 0) {
    quote.taxAmount = (quote.subtotal * quote.taxRate) / 100;
  } else {
    quote.taxAmount = 0;
  }
  
  // Calculate final total
  quote.total = quote.subtotal + quote.taxAmount - (quote.discountAmount || 0);
  
  next();
});

// Function to generate unique quote reference
QuoteSchema.statics.generateReference = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = await this.countDocuments();
  return `QT-${year}${month}${String(count + 1).padStart(4, '0')}`;
};

export default mongoose.models.Quote as QuoteModel || mongoose.model<QuoteDocument, QuoteModel>('Quote', QuoteSchema);
export type { QuoteModel }; 