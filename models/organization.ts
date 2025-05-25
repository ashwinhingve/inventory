import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface OrganizationDocument extends mongoose.Document {
  name: string;
  description?: string;
  active: boolean;
  slug: string;
  logo?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    default: () => uuidv4().substring(0, 8),
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  active: {
    type: Boolean,
    default: true
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contact: {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: String,
    website: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ createdBy: 1 });
OrganizationSchema.index({ active: 1 });

const Organization = mongoose.models.Organization as mongoose.Model<OrganizationDocument> || 
  mongoose.model<OrganizationDocument>('Organization', OrganizationSchema);

export default Organization; 