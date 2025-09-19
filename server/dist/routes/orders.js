"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, paymentStatus, customerName, orderNumber, startDate, endDate } = req.query;
        const user = req.user;
        const filter = {};
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (customerName) {
            filter.customerName = { $regex: customerName, $options: 'i' };
        }
        if (orderNumber) {
            filter.orderNumber = { $regex: orderNumber, $options: 'i' };
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const orders = await Order_1.default.find(filter)
            .populate('customerId', 'name email phone')
            .populate('centerId', 'name')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Order_1.default.countDocuments(filter);
        res.json({
            success: true,
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('주문 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문을 불러오는 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const order = await Order_1.default.findOne(filter)
            .populate('customerId', 'name email phone')
            .populate('centerId', 'name')
            .populate('createdBy', 'name email');
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            order
        });
    }
    catch (error) {
        console.error('주문 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문을 불러오는 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const user = req.user;
        const { customerId, customerName, customerEmail, customerPhone, items, paymentMethod, shippingAddress, notes } = req.body;
        if (!customerId || !customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: '고객 정보와 주문 아이템은 필수입니다.'
            });
        }
        for (const item of items) {
            if (!item.productId || !item.productName || !item.quantity || !item.price) {
                return res.status(400).json({
                    success: false,
                    message: '주문 아이템 정보가 올바르지 않습니다.'
                });
            }
            if (item.quantity <= 0 || item.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: '수량과 가격은 0보다 커야 합니다.'
                });
            }
        }
        const totalAmount = items.reduce((total, item) => {
            return total + (item.quantity * item.price);
        }, 0);
        const order = new Order_1.default({
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            items,
            totalAmount,
            paymentMethod,
            shippingAddress,
            notes,
            centerId: user.centerId,
            createdBy: user._id
        });
        await order.save();
        const savedOrder = await Order_1.default.findById(order._id)
            .populate('customerId', 'name email phone')
            .populate('centerId', 'name')
            .populate('createdBy', 'name email');
        res.status(201).json({
            success: true,
            message: '주문이 성공적으로 생성되었습니다.',
            order: savedOrder
        });
    }
    catch (error) {
        console.error('주문 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문 생성 중 오류가 발생했습니다.'
        });
    }
});
router.patch('/:id/status', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 주문 상태입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const order = await Order_1.default.findOne(filter);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }
        order.status = status;
        await order.save();
        res.json({
            success: true,
            message: '주문 상태가 성공적으로 업데이트되었습니다.',
            order
        });
    }
    catch (error) {
        console.error('주문 상태 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문 상태 업데이트 중 오류가 발생했습니다.'
        });
    }
});
router.patch('/:id/payment-status', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 결제 상태입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const order = await Order_1.default.findOne(filter);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }
        order.paymentStatus = paymentStatus;
        await order.save();
        res.json({
            success: true,
            message: '결제 상태가 성공적으로 업데이트되었습니다.',
            order
        });
    }
    catch (error) {
        console.error('결제 상태 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 상태 업데이트 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const updateData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const order = await Order_1.default.findOne(filter);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }
        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: '배송 중이거나 완료된 주문은 수정할 수 없습니다.'
            });
        }
        const allowedFields = [
            'customerName', 'customerEmail', 'customerPhone',
            'items', 'paymentMethod', 'shippingAddress', 'notes'
        ];
        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });
        const updatedOrder = await Order_1.default.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).populate('customerId', 'name email phone')
            .populate('centerId', 'name')
            .populate('createdBy', 'name email');
        res.json({
            success: true,
            message: '주문이 성공적으로 수정되었습니다.',
            order: updatedOrder
        });
    }
    catch (error) {
        console.error('주문 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['admin', 'centerAdmin', 'instructor']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const filter = { _id: id };
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        const order = await Order_1.default.findOne(filter);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }
        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                message: '배송 중이거나 완료된 주문은 삭제할 수 없습니다.'
            });
        }
        order.status = 'cancelled';
        await order.save();
        res.json({
            success: true,
            message: '주문이 성공적으로 취소되었습니다.'
        });
    }
    catch (error) {
        console.error('주문 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/summary', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { startDate, endDate } = req.query;
        const filter = {};
        if (user.userType !== 'admin' && user.centerId) {
            filter.centerId = user.centerId;
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const [totalOrders, pendingOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders, totalRevenue] = await Promise.all([
            Order_1.default.countDocuments(filter),
            Order_1.default.countDocuments({ ...filter, status: 'pending' }),
            Order_1.default.countDocuments({ ...filter, status: 'processing' }),
            Order_1.default.countDocuments({ ...filter, status: 'shipped' }),
            Order_1.default.countDocuments({ ...filter, status: 'delivered' }),
            Order_1.default.countDocuments({ ...filter, status: 'cancelled' }),
            Order_1.default.aggregate([
                { $match: { ...filter, status: { $in: ['delivered', 'shipped'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);
        res.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    }
    catch (error) {
        console.error('주문 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '주문 통계를 불러오는 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map