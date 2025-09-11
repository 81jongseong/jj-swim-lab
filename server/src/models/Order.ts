import mongoose, { Schema, Document } from 'mongoose';

// 주문 아이템 인터페이스
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number; // 단가
  totalPrice: number; // 총 가격 (quantity * price)
}

// 주문 인터페이스
export interface IOrder extends Document {
  orderNumber: string; // 주문 번호 (자동 생성)
  customerId: mongoose.Types.ObjectId; // 고객 ID
  customerName: string; // 고객명
  customerEmail: string; // 고객 이메일
  customerPhone?: string; // 고객 전화번호
  items: IOrderItem[]; // 주문 아이템들
  totalAmount: number; // 총 주문 금액
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // 주문 상태
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'; // 결제 상태
  paymentMethod?: 'card' | 'bank' | 'cash' | 'point'; // 결제 방법
  shippingAddress?: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }; // 배송 주소
  notes?: string; // 주문 메모
  centerId: mongoose.Types.ObjectId; // 센터 ID
  createdBy: mongoose.Types.ObjectId; // 주문 생성자
  createdAt: Date;
  updatedAt: Date;
}

// 주문 아이템 스키마
const OrderItemSchema = new Schema<IOrderItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

// 주문 스키마
const OrderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'bank', 'cash', 'point']
  },
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'South Korea' }
  },
  notes: { type: String },
  centerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Center', 
    required: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// 주문 번호 자동 생성 미들웨어
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = (count + 1).toString().padStart(4, '0');
    
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;
  }
  next();
});

// 총 금액 자동 계산 미들웨어
OrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalAmount = this.items.reduce((total, item) => {
      item.totalPrice = item.quantity * item.price;
      return total + item.totalPrice;
    }, 0);
  }
  next();
});

// 인덱스 설정
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ centerId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);

