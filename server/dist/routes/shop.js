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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const ShopProduct_1 = require("../models/ShopProduct");
const ShopOrder_1 = require("../models/ShopOrder");
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { isActive: true };
        if (category)
            filter.category = category;
        if (search)
            filter.name = { $regex: search, $options: 'i' };
        const products = await ShopProduct_1.ShopProduct.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await ShopProduct_1.ShopProduct.countDocuments(filter);
        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await ShopProduct_1.ShopProduct.findById(req.params.id);
        if (!product || !product.isActive) {
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ error: '상품 정보를 불러오는데 실패했습니다.' });
    }
});
router.post('/', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const product = new ShopProduct_1.ShopProduct(req.body);
        await product.save();
        res.status(201).json({ product });
    }
    catch (error) {
        res.status(500).json({ error: '상품 생성에 실패했습니다.' });
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const updated = await ShopProduct_1.ShopProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        res.json({ product: updated });
    }
    catch (error) {
        res.status(500).json({ error: '상품 수정에 실패했습니다.' });
    }
});
router.patch('/:id/toggle', auth_1.auth, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const product = await ShopProduct_1.ShopProduct.findById(req.params.id);
        if (!product)
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        product.isActive = !product.isActive;
        await product.save();
        res.json({ product });
    }
    catch (error) {
        res.status(500).json({ error: '상품 상태 변경에 실패했습니다.' });
    }
});
router.get('/orders/my', auth_1.auth, async (req, res) => {
    try {
        const orders = await ShopOrder_1.ShopOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    }
    catch (error) {
        res.status(500).json({ error: '주문 목록 조회에 실패했습니다.' });
    }
});
router.post('/orders', auth_1.auth, async (req, res) => {
    try {
        const { items, notes } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: '주문할 상품이 필요합니다.' });
        }
        let total = 0;
        const normalized = [];
        for (const item of items) {
            const product = await ShopProduct_1.ShopProduct.findById(item.productId);
            if (!product || !product.isActive) {
                return res.status(400).json({ error: '유효하지 않은 상품이 포함되어 있습니다.' });
            }
            const qty = Math.max(1, Number(item.qty || 1));
            total += product.price * qty;
            normalized.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                qty
            });
        }
        const order = await ShopOrder_1.ShopOrder.create({
            user: req.user._id,
            items: normalized,
            totalAmount: total,
            notes
        });
        res.status(201).json({ order });
    }
    catch (error) {
        res.status(500).json({ error: '주문 생성에 실패했습니다.' });
    }
});
router.post('/orders/:id/pay', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const order = await ShopOrder_1.ShopOrder.findById(req.params.id);
        if (!order)
            return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        order.status = 'paid';
        await order.save();
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ error: '결제 처리에 실패했습니다.' });
    }
});
router.get('/orders', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const filter = {};
        if (status)
            filter.status = status;
        const orders = await ShopOrder_1.ShopOrder.find(filter)
            .populate('user', 'name userId')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await ShopOrder_1.ShopOrder.countDocuments(filter);
        res.json({
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: '주문 목록 조회에 실패했습니다.' });
    }
});
router.patch('/orders/:id/status', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
            return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
        }
        const order = await ShopOrder_1.ShopOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order)
            return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        res.json({ order });
    }
    catch (error) {
        res.status(500).json({ error: '주문 상태 변경에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=shop.js.map