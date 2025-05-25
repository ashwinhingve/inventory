import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  taxId: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  paymentTerms: {
    type: String,
    trim: true,
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    trim: true,
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Virtual for formatted address
CustomerSchema.virtual('formattedAddress').get(function() {
  if (!this.address) {
    return '';
  }
  
  const { street, city, state, postalCode, country } = this.address;
  const parts = [street, city, state, postalCode, country].filter(Boolean);
  return parts.join(', ');
});

// Set toJSON option to include virtuals
CustomerSchema.set('toJSON', { virtuals: true });
CustomerSchema.set('toObject', { virtuals: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema); 