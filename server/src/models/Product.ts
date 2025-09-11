import mongoose, { Schema, Document } from 'mongoose';

// 상품 인터페이스
export interface IProduct extends Document {
  name: string; // 상품명
  description: string; // 상품 설명
  price: number; // 가격
  originalPrice?: number; // 원가 (할인 전 가격)
  category: string; // 카테고리
  subCategory?: string; // 하위 카테고리
  brand?: string; // 브랜드
  sku: string; // 상품 코드 (SKU)
  stock: number; // 재고 수량
  minStock: number; // 최소 재고 수량
  maxStock: number; // 최대 재고 수량
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued'; // 상품 상태
  images: string[]; // 상품 이미지 URLs
  tags: string[]; // 태그
  specifications: {
    weight?: number; // 무게 (kg)
    dimensions?: {
      length: number;
      width: number;
      height: number;
    }; // 치수 (cm)
    material?: string; // 재질
    color?: string; // 색상
    size?: string; // 사이즈
  }; // 상품 사양
  isDigital: boolean; // 디지털 상품 여부
  isPhysical: boolean; // 물리적 상품 여부
  shippingRequired: boolean; // 배송 필요 여부
  centerId: mongoose.Types.ObjectId; // 센터 ID
  createdBy: mongoose.Types.ObjectId; // 생성자
  createdAt: Date;
  updatedAt: Date;
}

// 상품 스키마
const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  category: { type: String, required: true, trim: true },
  subCategory: { type: String, trim: true },
  brand: { type: String, trim: true },
  sku: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    index: true
  },
  stock: { type: Number, required: true, min: 0, default: 0 },
  minStock: { type: Number, min: 0, default: 0 },
  maxStock: { type: Number, min: 0, default: 1000 },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  images: [{ type: String }],
  tags: [{ type: String }],
  specifications: {
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    material: { type: String },
    color: { type: String },
    size: { type: String }
  },
  isDigital: { type: Boolean, default: false },
  isPhysical: { type: Boolean, default: true },
  shippingRequired: { type: Boolean, default: true },
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

// SKU 자동 생성 미들웨어
ProductSchema.pre('save', async function(next) {
  if (this.isNew && !this.sku) {
    const count = await mongoose.model('Product').countDocuments();
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const sequence = (count + 1).toString().padStart(4, '0');
    
    this.sku = `${categoryPrefix}${sequence}`;
  }
  next();
});

// 재고 상태 자동 업데이트 미들웨어
ProductSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    if (this.stock <= 0) {
      this.status = 'out_of_stock';
    } else if (this.stock <= this.minStock) {
      this.status = 'active'; // 재고 부족이지만 판매 가능
    } else if (this.status === 'out_of_stock' && this.stock > 0) {
      this.status = 'active';
    }
  }
  next();
});

// 인덱스 설정
ProductSchema.index({ sku: 1 });
ProductSchema.index({ centerId: 1, status: 1 });
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);

