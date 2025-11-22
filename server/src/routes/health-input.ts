/**
 * 🏥 JJ Swim Lab - 건강정보 입력 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 사용자의 건강정보를 입력하고 저장하는 API
 * - 체크리스트 데이터를 불러오는 API
 * - 건강정보 기반 운동 프로그램 생성 지원
 * 
 * 🔄 **주요 기능**
 * - 건강정보 입력 및 저장
 * - 체크리스트 조회 및 불러오기
 * - 건강정보 검증 및 정규화
 * - 개인정보 보호 및 권한 관리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (건강정보 저장)
 * - Checklist 모델과 연동 (체크리스트 조회)
 * - 인증 미들웨어와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js
 * - Mongoose
 * - 인증 미들웨어 (authMiddleware)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 개인정보 보호법 준수
 * 2. 건강정보의 정확성 검증
 * 3. 권한별 접근 제어
 * 4. 데이터 암호화 및 보안
 * 5. 입력값 검증 및 정규화
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 건강정보 입력 API 구현
 * - 2024-12-19: 체크리스트 불러오기 기능 추가
 * - 2024-12-19: 데이터 검증 및 보안 강화
 */

import express, { Request, Response } from 'express';
import { User } from '../models/User';
import { Checklist } from '../models/Checklist';
import { authMiddleware } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 인터페이스 정의
interface AuthRequest extends Request {
  user?: any;
}

/**
 * 건강정보 저장
 * POST /api/health/input
 */
router.post('/input', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🏥 건강정보 저장 요청');

    const userId = (req as any).user._id;
    const healthData = req.body;

    // 필수 필드 검증
    if (!healthData) {
      return res.status(400).json({
        success: false,
        message: '건강정보 데이터가 필요합니다.'
      });
    }

    // 사용자 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // BMI 자동 계산
    let bmi = undefined;
    if (healthData.height && healthData.weight) {
      bmi = healthData.weight / Math.pow(healthData.height / 100, 2);
    }

    // BMI 기반 비만도 자동 분류
    let obesityStatus = 'normal';
    if (bmi) {
      if (bmi < 18.5) obesityStatus = 'underweight';
      else if (bmi < 23.0) obesityStatus = 'normal';
      else if (bmi < 25.0) obesityStatus = 'overweight';
      else obesityStatus = 'obese';
    }

    // 혈압 기반 고혈압 자동 분류
    let hypertensionStatus = 'normal';
    if (healthData.bloodPressure?.systolic && healthData.bloodPressure?.diastolic) {
      const { systolic, diastolic } = healthData.bloodPressure;
      if (systolic < 120 && diastolic < 80) hypertensionStatus = 'normal';
      else if (systolic < 130 && diastolic < 80) hypertensionStatus = 'elevated';
      else if (systolic < 140 || diastolic < 90) hypertensionStatus = 'stage1';
      else hypertensionStatus = 'stage2';
    }

    // 건강정보 업데이트 (healthProfile에 저장)
    (user as any).healthProfile = {
      age: healthData.age,
      gender: healthData.gender,
      height: healthData.height,
      weight: healthData.weight,
      bmi, // 자동 계산된 BMI
      bloodPressure: healthData.bloodPressure,
      obesityStatus, // 자동 분류된 비만도
      hypertensionStatus, // 자동 분류된 고혈압 단계
      chronicConditions: healthData.chronicConditions || [],
      allergies: healthData.allergies || [],
      medications: healthData.medications || [],
      emergencyContact: healthData.emergencyContact,
      specialConditions: healthData.specialConditions,
      lastUpdated: new Date()
    };

    await user.save();

    console.log('✅ 건강정보 저장 완료:', userId);
    console.log('  - BMI:', bmi?.toFixed(1), '→', obesityStatus);
    console.log('  - 혈압:', healthData.bloodPressure?.systolic, '/', healthData.bloodPressure?.diastolic, '→', hypertensionStatus);

    res.json({
      success: true,
      message: '건강정보가 성공적으로 저장되었습니다.',
      data: {
        userId: user._id,
        healthProfile: (user as any).healthProfile,
        autoClassification: {
          bmi: bmi?.toFixed(1),
          obesityStatus,
          hypertensionStatus
        }
      }
    });

  } catch (error) {
    logError('❌ 건강정보 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 체크리스트 불러오기
 * GET /api/health/checklist
 */
router.get('/checklist', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 체크리스트 불러오기 요청');

    const userId = (req as any).user._id;
    const userType = (req as any).user.userType;

    // 사용자별 체크리스트 조회
    let checklists = [];

    if (userType === 'instructor') {
      // 강사인 경우 자신이 담당한 체크리스트 조회
      checklists = await Checklist.find({ instructorId: userId })
        .populate('studentId', 'name email phone currentLevel')
        .populate('courseId', 'name level')
        .sort({ lastUpdated: -1 });
    } else if (userType === 'student') {
      // 학생인 경우 자신의 체크리스트 조회
      checklists = await Checklist.find({ studentId: userId })
        .populate('instructorId', 'name email')
        .populate('courseId', 'name level')
        .sort({ lastUpdated: -1 });
    } else if (userType === 'centerAdmin') {
      // 센터 관리자인 경우 센터의 모든 체크리스트 조회
      const managedCenters = (req as any).user.centerAdminInfo?.managedCenters || [];
      if (managedCenters.length > 0) {
        checklists = await Checklist.find()
          .populate('studentId', 'name email phone currentLevel')
          .populate('instructorId', 'name email')
          .populate('courseId', 'name level')
          .sort({ lastUpdated: -1 });
      }
    }

    console.log('✅ 체크리스트 조회 완료:', checklists.length, '개');

    res.json({
      success: true,
      message: '체크리스트를 성공적으로 불러왔습니다.',
      data: {
        checklists,
        totalCount: checklists.length,
        userType
      }
    });

  } catch (error) {
    logError('❌ 체크리스트 불러오기 오류:', error);
    res.status(500).json({
      success: false,
      message: '체크리스트를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 특정 체크리스트 상세 조회
 * GET /api/health/checklist/:checklistId
 */
router.get('/checklist/:checklistId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 체크리스트 상세 조회 요청');

    const { checklistId } = req.params;
    const userId = (req as any).user._id;
    const userType = (req as any).user.userType;

    const checklist = await Checklist.findById(checklistId)
      .populate('studentId', 'name email phone currentLevel')
      .populate('instructorId', 'name email')
      .populate('courseId', 'name level');

    if (!checklist) {
      return res.status(404).json({
        success: false,
        message: '체크리스트를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    const canAccess = 
      userType === 'superAdmin' ||
      checklist.studentId._id.toString() === userId.toString() ||
      checklist.instructorId._id.toString() === userId.toString() ||
      (userType === 'centerAdmin' && (req as any).user.centerAdminInfo?.managedCenters?.length > 0);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: '이 체크리스트에 접근할 권한이 없습니다.'
      });
    }

    console.log('✅ 체크리스트 상세 조회 완료:', checklistId);

    res.json({
      success: true,
      message: '체크리스트 상세 정보를 성공적으로 불러왔습니다.',
      data: checklist
    });

  } catch (error) {
    logError('❌ 체크리스트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '체크리스트 상세 정보를 불러오는데 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 건강정보 조회
 * GET /api/health/info
 */
router.get('/info', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🏥 건강정보 조회 요청');

    const userId = (req as any).user._id;

    const user = await User.findById(userId).select('healthInfo');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    console.log('✅ 건강정보 조회 완료:', userId);

    res.json({
      success: true,
      message: '건강정보를 성공적으로 조회했습니다.',
      data: {
        healthInfo: (user as any).healthInfo || {},
        lastUpdated: (user as any).healthInfo?.lastUpdated || null
      }
    });

  } catch (error) {
    logError('❌ 건강정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보를 조회하는데 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;

