import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// 인증된 요청 인터페이스
interface AuthRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

// 모든 주문 조회
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus, 
      customerName,
      orderNumber,
      startDate,
      endDate
    } = req.query;
    
    const user = req.user!;
    
    // 필터 조건 구성
    const filter: any = {};
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 쿼리 파라미터 필터링
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    if (orderNumber) {
      filter.orderNumber = { $regex: orderNumber, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('centerId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Order.countDocuments(filter);
    
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
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 주문 조회
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const order = await Order.findOne(filter)
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
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 주문 생성
router.post('/', authMiddleware, requireRole(['admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      paymentMethod,
      shippingAddress,
      notes
    } = req.body;
    
    // 필수 필드 검증
    if (!customerId || !customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '고객 정보와 주문 아이템은 필수입니다.'
      });
    }
    
    // 아이템 검증
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
    
    // 총 금액 계산
    const totalAmount = items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
    
    const order = new Order({
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
    
    // 생성된 주문을 다시 조회하여 반환
    const savedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email phone')
      .populate('centerId', 'name')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다.',
      order: savedOrder
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성 중 오류가 발생했습니다.'
    });
  }
});

// 주문 상태 업데이트
router.patch('/:id/status', authMiddleware, requireRole(['admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const order = await Order.findOne(filter);
    
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
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 결제 상태 업데이트
router.patch('/:id/payment-status', authMiddleware, requireRole(['admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const order = await Order.findOne(filter);
    
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
  } catch (error) {
    console.error('결제 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '결제 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 주문 수정
router.put('/:id', authMiddleware, requireRole(['admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 주문이 처리 중이거나 완료된 경우 수정 제한
    const order = await Order.findOne(filter);
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
    
    // 업데이트할 필드만 수정
    const allowedFields = [
      'customerName', 'customerEmail', 'customerPhone', 
      'items', 'paymentMethod', 'shippingAddress', 'notes'
    ];
    const updateFields: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email phone')
     .populate('centerId', 'name')
     .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: '주문이 성공적으로 수정되었습니다.',
      order: updatedOrder
    });
  } catch (error) {
    console.error('주문 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 수정 중 오류가 발생했습니다.'
    });
  }
});

// 주문 삭제 (취소)
router.delete('/:id', authMiddleware, requireRole(['admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const order = await Order.findOne(filter);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다.'
      });
    }
    
    // 배송 중이거나 완료된 주문은 삭제 불가
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: '배송 중이거나 완료된 주문은 삭제할 수 없습니다.'
      });
    }
    
    // 주문 상태를 취소로 변경
    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      message: '주문이 성공적으로 취소되었습니다.'
    });
  } catch (error) {
    console.error('주문 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 주문 통계
router.get('/stats/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { startDate, endDate } = req.query;
    
    const filter: any = {};
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 날짜 필터링
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.countDocuments({ ...filter, status: 'pending' }),
      Order.countDocuments({ ...filter, status: 'processing' }),
      Order.countDocuments({ ...filter, status: 'shipped' }),
      Order.countDocuments({ ...filter, status: 'delivered' }),
      Order.countDocuments({ ...filter, status: 'cancelled' }),
      Order.aggregate([
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
  } catch (error) {
    console.error('주문 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '주문 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

export default router;

