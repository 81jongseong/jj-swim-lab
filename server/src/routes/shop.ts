import * as express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { ShopProduct } from '../models/ShopProduct';
import { ShopOrder } from '../models/ShopOrder';

const router: express.Router = express.Router();

// 상품 목록 조회
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    const products = await ShopProduct.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await ShopProduct.countDocuments(filter);
    
    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: '상품 목록을 불러오는데 실패했습니다.' });
  }
});

// 상품 상세 조회
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const product = await ShopProduct.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: '상품 정보를 불러오는데 실패했습니다.' });
  }
});

// 상품 생성 (관리자만)
router.post('/', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const product = new ShopProduct(req.body);
    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: '상품 생성에 실패했습니다.' });
  }
});

// 상품 수정 (관리자만)
router.put('/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const updated = await ShopProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    res.json({ product: updated });
  } catch (error) {
    res.status(500).json({ error: '상품 수정에 실패했습니다.' });
  }
});

// 상품 비활성화/활성화 (관리자만)
router.patch('/:id/toggle', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const product = await ShopProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    product.isActive = !product.isActive;
    await product.save();
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: '상품 상태 변경에 실패했습니다.' });
  }
});

// 내 주문 목록
router.get('/orders/my', auth, async (req: any, res: express.Response) => {
  try {
    const orders = await ShopOrder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: '주문 목록 조회에 실패했습니다.' });
  }
});

// 주문 생성
router.post('/orders', auth, async (req: any, res: express.Response) => {
  try {
    const { items, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '주문할 상품이 필요합니다.' });
    }
    
    let total = 0;
    const normalized = [];
    
    for (const item of items) {
      const product = await ShopProduct.findById(item.productId);
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
    
    const order = await ShopOrder.create({
      user: req.user._id,
      items: normalized,
      totalAmount: total,
      notes
    });
    
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ error: '주문 생성에 실패했습니다.' });
  }
});

// 주문 결제 처리 (관리자만)
router.post('/orders/:id/pay', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const order = await ShopOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    order.status = 'paid';
    await order.save();
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: '결제 처리에 실패했습니다.' });
  }
});

// 주문 목록 조회 (관리자만)
router.get('/orders', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    
    const filter: any = {};
    if (status) filter.status = status;
    
    const orders = await ShopOrder.find(filter)
      .populate('user', 'name userId')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await ShopOrder.countDocuments(filter);
    
    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: '주문 목록 조회에 실패했습니다.' });
  }
});

// 주문 상태 변경 (관리자만)
router.patch('/orders/:id/status', auth, requireRole(['superAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({ error: '유효하지 않은 상태입니다.' });
    }
    
    const order = await ShopOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    
    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: '주문 상태 변경에 실패했습니다.' });
  }
});

export default router;



