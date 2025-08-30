import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopProduct', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
});

const shopOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','cancelled','refunded'], default: 'pending' },
  notes: { type: String, default: '' },
}, { timestamps: true });

shopOrderSchema.index({ user: 1, createdAt: -1 });

export const ShopOrder = mongoose.model('ShopOrder', shopOrderSchema);









































