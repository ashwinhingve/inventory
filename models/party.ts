import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Party name is required'],
    trim: true,
  },
  mobileNumber: {
    type: String,
    trim: true,
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  balanceType: {
    type: String,
    enum: ['Payable', 'Receivable'],
    default: 'Receivable',
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  panNumber: {
    type: String,
    trim: true,
  },
  billingAddress: {
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
  },
  shippingAddress: {
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
  },
  sameShippingAddress: {
    type: Boolean,
    default: true,
  },
  bankDetails: {
    accountHolderName: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Virtual for current balance calculation
PartySchema.virtual('currentBalance').get(function() {
  return this.openingBalance;
});

// Virtual for balance display
PartySchema.virtual('balanceDisplay').get(function() {
  return {
    amount: Math.abs(this.openingBalance),
    type: this.balanceType,
  };
});

// Set toJSON option to include virtuals
PartySchema.set('toJSON', { virtuals: true });
PartySchema.set('toObject', { virtuals: true });

export default mongoose.models.Party || mongoose.model('Party', PartySchema); 