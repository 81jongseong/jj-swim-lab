/**
 * 👨‍🏫 JJ Swim Lab - 강사 이력관리 API 라우트
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authMiddleware, requireAdmin, requireCenterAdmin } from '../middleware/auth';
import { InstructorHistoryService } from '../services/instructorHistoryService';
import { CERTIFICATION_TYPES, InstructorWorkHistory } from '../models/InstructorHistory';
import { logInfo, logError } from '../utils/logger';

const router = Router();
const historyService = InstructorHistoryService.getInstance();

// 파일 업로드 설정 (자격증 문서용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('이미지 또는 PDF 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * POST /api/instructor-history/work-history
 * 새로운 근무 이력 추가 (불변성 보장)
 */
router.post('/work-history', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      instructorId,
      centerId,
      position,
      startDate,
      workType,
      responsibilities
    } = req.body;

    const createdBy = (req as any).user?.userId;

    if (!instructorId || !centerId || !position || !startDate || !workType) {
      return res.status(400).json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      });
    }

    const newHistory = await historyService.addWorkHistory({
      instructorId,
      centerId,
      position,
      startDate: new Date(startDate),
      workType,
      responsibilities: responsibilities || []
    }, createdBy);

    res.json({
      success: true,
      data: {
        history: newHistory,
        message: '근무 이력이 성공적으로 추가되었습니다.'
      }
    });

  } catch (error) {
    logError('근무 이력 추가 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '근무 이력 추가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/instructor-history/certification
 * 자격증 등록
 */
router.post('/certification', authMiddleware, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const {
      instructorId,
      certificationType,
      certificationName,
      certificationNumber,
      issuingOrganization,
      issueDate,
      expiryDate
    } = req.body;

    const document = req.file;
    const currentUserId = (req as any).user?.userId;

    // 본인 또는 관리자만 등록 가능
    if (instructorId !== currentUserId && (req as any).user?.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }

    if (!instructorId || !certificationType || !certificationName || !certificationNumber || !issuingOrganization || !issueDate) {
      return res.status(400).json({
        success: false,
        error: '필수 정보가 누락되었습니다.'
      });
    }

    // 문서 URL 생성 (실제 환경에서는 파일 저장 후 URL 반환)
    const documentUrl = document ? `/uploads/certifications/${document.filename}` : undefined;

    const certification = await historyService.addCertification({
      instructorId,
      certificationType,
      certificationName,
      certificationNumber,
      issuingOrganization,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      documentUrl
    });

    res.json({
      success: true,
      data: {
        certification,
        message: '자격증이 성공적으로 등록되었습니다.'
      }
    });

  } catch (error) {
    logError('자격증 등록 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '자격증 등록 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/instructor-history/certification/:id/verify
 * 자격증 검증
 */
router.put('/certification/:id/verify', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const verifiedBy = (req as any).user?.userId;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 검증 상태입니다.'
      });
    }

    const certification = await historyService.verifyCertification(id, verifiedBy, status, notes);

    res.json({
      success: true,
      data: {
        certification,
        message: '자격증 검증이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('자격증 검증 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '자격증 검증 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/center/:centerId/instructors
 * 센터별 강사 자격증 검색
 */
router.get('/center/:centerId/instructors', authMiddleware, requireCenterAdmin, async (req: Request, res: Response) => {
  try {
    const { centerId } = req.params;
    const { 
      certificationType, 
      verificationStatus, 
      isExpired, 
      issuingOrganization 
    } = req.query;

    const filters: any = {};
    if (certificationType) filters.certificationType = certificationType;
    if (verificationStatus) filters.verificationStatus = verificationStatus;
    if (isExpired !== undefined) filters.isExpired = isExpired === 'true';
    if (issuingOrganization) filters.issuingOrganization = issuingOrganization;

    const instructors = await historyService.searchInstructorsByCenterAndCertification(
      centerId,
      filters
    );

    res.json({
      success: true,
      data: {
        instructors,
        filters: filters,
        total: instructors.length,
        message: '센터별 강사 검색이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('센터별 강사 검색 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '센터별 강사 검색 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/instructor/:instructorId/complete
 * 강사별 전체 이력 조회
 */
router.get('/instructor/:instructorId/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const currentUserId = (req as any).user?.userId;

    // 본인 또는 관리자만 조회 가능
    if (instructorId !== currentUserId && (req as any).user?.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }

    const completeHistory = await historyService.getInstructorCompleteHistory(instructorId);

    res.json({
      success: true,
      data: {
        ...completeHistory,
        message: '강사 전체 이력 조회가 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('강사 이력 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '강사 이력 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/center/:centerId/dashboard
 * 센터별 강사 자격 현황 대시보드
 */
router.get('/center/:centerId/dashboard', authMiddleware, requireCenterAdmin, async (req: Request, res: Response) => {
  try {
    const { centerId } = req.params;

    const dashboard = await historyService.getCenterInstructorDashboard(centerId);

    res.json({
      success: true,
      data: {
        ...dashboard,
        message: '센터 강사 현황 대시보드 조회가 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('센터 대시보드 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '센터 대시보드 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/certifications/expiring
 * 만료 예정 자격증 조회
 */
router.get('/certifications/expiring', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const expiringCerts = await historyService.getExpiringCertifications(Number(days));

    res.json({
      success: true,
      data: {
        certifications: expiringCerts,
        alertDays: Number(days),
        total: expiringCerts.length,
        message: '만료 예정 자격증 조회가 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('만료 예정 자격증 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '만료 예정 자격증 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/instructor-history/certification/:id/auto-verify
 * 자격증 자동 검증
 */
router.post('/certification/:id/auto-verify', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const verificationResult = await historyService.autoVerifyCertification(id);

    res.json({
      success: true,
      data: {
        ...verificationResult,
        message: '자격증 자동 검증이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('자격증 자동 검증 API 오류:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '자격증 자동 검증 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/instructor/:instructorId/verify-integrity
 * 강사 이력 무결성 검증
 */
router.get('/instructor/:instructorId/verify-integrity', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;

    const integrityCheck = await historyService.verifyHistoryIntegrity(instructorId);

    res.json({
      success: true,
      data: {
        ...integrityCheck,
        message: '이력 무결성 검증이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('이력 무결성 검증 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '이력 무결성 검증 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/instructor-history/certification-types
 * 지원되는 자격증 타입 조회
 */
router.get('/certification-types', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        certificationTypes: CERTIFICATION_TYPES,
        message: '자격증 타입 조회가 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('자격증 타입 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '자격증 타입 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/instructor-history/work-history/:historyId/end
 * 근무 이력 종료 (새로운 이력 생성으로 처리)
 */
router.post('/work-history/:historyId/end', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { historyId } = req.params;
    const { endDate, achievements } = req.body;

    // 기존 이력 조회
    const currentHistory = await (InstructorWorkHistory as any).findById(historyId);
    if (!currentHistory) {
      return res.status(404).json({
        success: false,
        error: '근무 이력을 찾을 수 없습니다.'
      });
    }

    // 종료 처리 (새로운 이력 생성)
    await historyService.endCurrentWorkHistory(
      currentHistory.instructorId.toString(),
      currentHistory.centerId.toString()
    );

    res.json({
      success: true,
      data: {
        message: '근무 이력이 종료되었습니다.'
      }
    });

  } catch (error) {
    logError('근무 이력 종료 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '근무 이력 종료 중 오류가 발생했습니다.'
    });
  }
});

export default router;
