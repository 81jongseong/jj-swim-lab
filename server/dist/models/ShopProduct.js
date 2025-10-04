"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopProduct = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shopProductSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'KRW' },
    category: { type: String, default: 'general' },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
shopProductSchema.index({ name: 'text', description: 'text', category: 1 });
exports.ShopProduct = mongoose_1.default.models.ShopProduct || mongoose_1.default.model('ShopProduct', shopProductSchema);
//# sourceMappingURL=ShopProduct.js.map