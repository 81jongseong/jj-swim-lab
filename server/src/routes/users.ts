import express from 'express';
import { User } from '../models/User';
import { auth, requireRole } from '../middleware/auth';

const router = express.Router();

// 전체 사용자 조회 (관리자용)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    let query: any = {};
    
    if (userType) {
      query.userType = userType;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    return res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('사용자 목록 조회 오류:', err);
    return res.status(500).json({ error: '사용자 목록을 불러오는 데 실패했습니다.' });
  }
});

// 특정 사용자 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    return res.json(user);
  } catch (err) {
    console.error('사용자 조회 오류:', err);
    return res.status(500).json({ error: '사용자 정보를 불러오는 데 실패했습니다.' });
  }
});

// 사용자 정보 업데이트
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, phone, address, userType, experience, certifications, specialties, centerName, centerAddress, centerPhone } = req.body;
    
    const updateData: any = { name, phone, address, userType };
    
    if (userType === 'instructor') {
      updateData.experience = experience;
      updateData.certifications = certifications;
      updateData.specialties = specialties;
    }
    
    if (userType === 'admin') {
      updateData.centerName = centerName;
      updateData.centerAddress = centerAddress;
      updateData.centerPhone = centerPhone;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    return res.json(user);
  } catch (err) {
    console.error('사용자 업데이트 오류:', err);
    return res.status(400).json({ error: '사용자 정보 업데이트에 실패했습니다.' });
  }
});

// 사용자 삭제 (관리자용)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    return res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('사용자 삭제 오류:', err);
    return res.status(500).json({ error: '사용자 삭제에 실패했습니다.' });
  }
});

export default router;
