"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
ProductSchema.pre('save', async function (next) {
    if (this.isNew && !this.sku) {
        const count = await mongoose_1.default.model('Product').countDocuments();
        const categoryPrefix = this.category.substring(0, 3).toUpperCase();
        const sequence = (count + 1).toString().padStart(4, '0');
        this.sku = `${categoryPrefix}${sequence}`;
    }
    next();
});
ProductSchema.pre('save', function (next) {
    if (this.isModified('stock')) {
        if (this.stock <= 0) {
            this.status = 'out_of_stock';
        }
        else if (this.stock <= this.minStock) {
            this.status = 'active';
        }
        else if (this.status === 'out_of_stock' && this.stock > 0) {
            this.status = 'active';
        }
    }
    next();
});
ProductSchema.index({ sku: 1 });
ProductSchema.index({ centerId: 1, status: 1 });
ProductSchema.index({ category: 1, subCategory: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=Product.js.map