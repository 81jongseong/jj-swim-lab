import mongoose from 'mongoose';

const shopProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'KRW' },
  category: { type: String, default: 'general' },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

shopProductSchema.index({ name: 'text', description: 'text', category: 1 });

export const ShopProduct = mongoose.model('ShopProduct', shopProductSchema);











































