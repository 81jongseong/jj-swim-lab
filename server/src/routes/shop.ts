import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct } from '../models/Product';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// 인증된 요청 인터페이스
interface AuthRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

// 주문 목록 조회 (관리자용)
router.get('/orders', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
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
    
    // Order 모델 import 필요
    const Order = require('../models/Order').default;
    
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

// 상품 목록 조회 (공개)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      subCategory,
      search, 
      minPrice, 
      maxPrice,
      status = 'active',
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // 필터 조건 구성
    const filter: any = { status: status };
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // 정렬 설정
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(filter)
      .populate('centerId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '상품 목록을 불러오는데 실패했습니다.' 
    });
  }
});

// 상품 상세 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 'orders'는 상품 ID가 아니므로 제외
    if (id === 'orders') {
      return res.status(404).json({
        success: false,
        error: '해당 엔드포인트를 찾을 수 없습니다.'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 상품 ID입니다.'
      });
    }
    
    const product = await Product.findOne({ 
      _id: id, 
      status: { $in: ['active', 'out_of_stock'] } 
    }).populate('centerId', 'name');
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        error: '상품을 찾을 수 없습니다.' 
      });
    }
    
    res.json({ 
      success: true,
      product 
    });
  } catch (error) {
    console.error('상품 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '상품 정보를 불러오는데 실패했습니다.' 
    });
  }
});

// 관리자용 상품 목록 조회
router.get('/admin/products', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      category, 
      subCategory,
      search, 
      status,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const user = req.user!;
    const skip = (Number(page) - 1) * Number(limit);
    
    // 필터 조건 구성
    const filter: any = {};
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    // 정렬 설정
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(filter)
      .populate('centerId', 'name')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('관리자 상품 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '상품 목록을 불러오는데 실패했습니다.' 
    });
  }
});

// 상품 생성
router.post('/admin/products', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      brand,
      sku,
      stock,
      minStock,
      maxStock,
      images,
      tags,
      specifications,
      isDigital,
      isPhysical,
      shippingRequired
    } = req.body;
    
    // 필수 필드 검증
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: '상품명, 설명, 가격, 카테고리는 필수입니다.'
      });
    }
    
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상이어야 합니다.'
      });
    }
    
    // SKU 중복 확인
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다.'
        });
      }
    }
    
    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      subCategory,
      brand,
      sku,
      stock: stock || 0,
      minStock: minStock || 0,
      maxStock: maxStock || 1000,
      images: images || [],
      tags: tags || [],
      specifications: specifications || {},
      isDigital: isDigital || false,
      isPhysical: isPhysical !== false,
      shippingRequired: shippingRequired !== false,
      centerId: user.centerId,
      createdBy: user._id
    });
    
    await product.save();
    
    // 생성된 상품을 다시 조회하여 반환
    const savedProduct = await Product.findById(product._id)
      .populate('centerId', 'name')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: '상품이 성공적으로 생성되었습니다.',
      product: savedProduct
    });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 생성 중 오류가 발생했습니다.'
    });
  }
});

// 상품 수정
router.put('/admin/products/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const product = await Product.findOne(filter);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    // 업데이트할 필드만 수정
    const allowedFields = [
      'name', 'description', 'price', 'originalPrice', 'category', 'subCategory',
      'brand', 'sku', 'stock', 'minStock', 'maxStock', 'status', 'images',
      'tags', 'specifications', 'isDigital', 'isPhysical', 'shippingRequired'
    ];
    const updateFields: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });
    
    // SKU 중복 확인 (변경된 경우)
    if (updateFields.sku && updateFields.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: updateFields.sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 SKU입니다.'
        });
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('centerId', 'name')
     .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: '상품이 성공적으로 수정되었습니다.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('상품 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 수정 중 오류가 발생했습니다.'
    });
  }
});

// 상품 삭제
router.delete('/admin/products/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const product = await Product.findOne(filter);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    // 상품 상태를 중단으로 변경 (실제 삭제 대신)
    product.status = 'discontinued';
    await product.save();
    
    res.json({
      success: true,
      message: '상품이 성공적으로 중단되었습니다.'
    });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 상품 상태 업데이트
router.patch('/admin/products/:id/status', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.'
      });
    }
    
    const validStatuses = ['active', 'inactive', 'out_of_stock', 'discontinued'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 상태입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const product = await Product.findOne(filter);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.'
      });
    }
    
    product.status = status;
    await product.save();
    
    res.json({
      success: true,
      message: '상품 상태가 성공적으로 업데이트되었습니다.',
      product
    });
  } catch (error) {
    console.error('상품 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 상품 통계
router.get('/admin/stats', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
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
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      discontinuedProducts,
      lowStockProducts
    ] = await Promise.all([
      Product.countDocuments(filter),
      Product.countDocuments({ ...filter, status: 'active' }),
      Product.countDocuments({ ...filter, status: 'inactive' }),
      Product.countDocuments({ ...filter, status: 'out_of_stock' }),
      Product.countDocuments({ ...filter, status: 'discontinued' }),
      Product.countDocuments({ 
        ...filter, 
        $expr: { $lte: ['$stock', '$minStock'] },
        status: { $in: ['active', 'inactive'] }
      })
    ]);
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStockProducts,
        discontinuedProducts,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('상품 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '상품 통계를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 카테고리 목록 조회
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category', { status: 'active' });
    const subCategories = await Product.distinct('subCategory', { 
      status: 'active',
      subCategory: { $exists: true, $ne: null }
    });
    
    res.json({
      success: true,
      categories: categories.sort(),
      subCategories: subCategories.sort()
    });
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '카테고리 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

export default router;