import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a supplier name'],
    trim: true,
    unique: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema); 