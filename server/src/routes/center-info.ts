import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { CenterInfo } from '../models/CenterInfo';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();

// Multer 설정 - 이미지 업로드용
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/center-images/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// 센터 정보 조회 (게스트용)
router.get('/public/:centerId', async (req: Request, res: Response) => {
  try {
    const { centerId } = req.params;
    const centerInfo = await CenterInfo.findOne({ centerId });
    
    if (!centerInfo) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: centerInfo
    });
  } catch (error) {
    console.error('센터 정보 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// 센터 정보 조회 (센터 관리자용)
router.get('/admin/list', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    
    let centerInfo;
    if (user.userType === 'centerAdmin') {
      // 센터 관리자는 자신의 센터 정보만 조회
      centerInfo = await CenterInfo.findOne({ centerId: user.centerId || 'jjswim-main' });
    } else {
      // 최고 관리자는 모든 센터 정보 조회
      centerInfo = await CenterInfo.find();
    }
    
    if (!centerInfo) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: centerInfo
    });
  } catch (error) {
    console.error('센터 정보 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// 센터 정보 생성
router.post('/', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: Request, res: Response) => {
  try {
    const { user } = req as any;
    const centerData = req.body;

    // 센터 관리자는 자신의 센터만 생성 가능
    if (user.userType === 'centerAdmin') {
      centerData.centerId = user.centerId || 'jjswim-main';
    }

    const centerInfo = new CenterInfo(centerData);
    await centerInfo.save();

    res.status(201).json({
      success: true,
      message: '센터 정보가 성공적으로 생성되었습니다.',
      data: centerInfo
    });
  } catch (error) {
    console.error('센터 정보 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 생성 중 오류가 발생했습니다.'
    });
  }
});

// 센터 정보 수정
router.put('/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user } = req as any;
    const updateData = req.body;

    const centerInfo = await CenterInfo.findById(id);
    if (!centerInfo) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 자신의 센터만 수정 가능
    if (user.userType === 'centerAdmin' && centerInfo.centerId !== user.centerId) {
      return res.status(403).json({
        success: false,
        message: '수정 권한이 없습니다.'
      });
    }

    const updatedCenterInfo = await CenterInfo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 수정되었습니다.',
      data: updatedCenterInfo
    });
  } catch (error) {
    console.error('센터 정보 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 수정 중 오류가 발생했습니다.'
    });
  }
});

// 센터 정보 삭제
router.delete('/:id', auth, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const centerInfo = await CenterInfo.findByIdAndDelete(id);
    if (!centerInfo) {
      return res.status(404).json({
        success: false,
        message: '센터 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '센터 정보가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('센터 정보 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터 정보 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 이미지 업로드
router.post('/upload-image', auth, requireRole(['centerAdmin', 'superAdmin']), upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '이미지 파일이 업로드되지 않았습니다.'
      });
    }

    const imageUrl = `/uploads/center-images/${req.file.filename}`;

    res.json({
      success: true,
      message: '이미지 업로드가 성공했습니다.',
      data: { imageUrl }
    });
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다.'
    });
  }
});

export default router;

