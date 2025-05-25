import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a store name'],
    trim: true,
    unique: true,
  },
  location: {
    type: String,
    trim: true,
  },
  manager: {
    type: String,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Store || mongoose.model('Store', StoreSchema); 