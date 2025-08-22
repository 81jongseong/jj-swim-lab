import mongoose, { Document, Schema } from 'mongoose';

export interface ICenterInfo extends Document {
  centerId: string;
  name: string;
  shortDescription: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  facilities: string[];
  features: string[];
  images: {
    mainImage?: string;
    gallery: string[];
  };
  instructors: Array<{
    name: string;
    specialty: string;
    experience: string;
    image?: string;
  }>;
  courses: Array<{
    name: string;
    description: string;
    level: string;
    duration: string;
    price: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CenterInfoSchema = new Schema<ICenterInfo>({
  centerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  businessHours: {
    monday: { type: String, required: true },
    tuesday: { type: String, required: true },
    wednesday: { type: String, required: true },
    thursday: { type: String, required: true },
    friday: { type: String, required: true },
    saturday: { type: String, required: true },
    sunday: { type: String, required: true }
  },
  facilities: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  images: {
    mainImage: { type: String, trim: true },
    gallery: [{ type: String, trim: true }]
  },
  instructors: [{
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    image: { type: String, trim: true }
  }],
  courses: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model<ICenterInfo>('CenterInfo', CenterInfoSchema);
