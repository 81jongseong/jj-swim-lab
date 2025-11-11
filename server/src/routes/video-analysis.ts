/**
 * 🎥 JJ Swim Lab - 영상 분석 기준 관리 API
 * 
 * 📋 **API 목적**
 * - 영상 분석 알고리즘 기준 생성 및 관리
 * - 강사와 함께 커스터마이징 가능한 평가 기준
 * - 영상 분석 결과 저장 및 조회
 * - AI 평가 시스템과의 연동
 */

import express, { Response } from 'express';
import { VideoAnalysisCriteria, VideoAnalysisResult } from '../models/VideoAnalysisCriteria';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// 영상 분석 기준 조회
router.get('/criteria', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { technique, analysisType, isActive } = req.query;
    
    const query: any = {};
    
    if (technique) query.technique = technique;
    if (analysisType) query.analysisType = analysisType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const criteria = await VideoAnalysisCriteria.find(query)
      .populate('createdBy', 'name email')
      .sort({ technique: 1, analysisType: 1, weight: -1 });

    res.json({
      success: true,
      data: criteria
    });

  } catch (error) {
    console.error('영상 분석 기준 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 조회 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 기준 생성
router.post('/criteria', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const criteriaData = {
      ...req.body,
      createdBy: req.user._id,
      lastModified: new Date()
    };

    const criteria = new VideoAnalysisCriteria(criteriaData);
    await criteria.save();

    res.json({
      success: true,
      data: criteria,
      message: '영상 분석 기준이 성공적으로 생성되었습니다.'
    });

  } catch (error) {
    console.error('영상 분석 기준 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 생성 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 기준 수정
router.put('/criteria/:id', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModified: new Date()
    };

    const criteria = await VideoAnalysisCriteria.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: '기준을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: criteria,
      message: '영상 분석 기준이 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    console.error('영상 분석 기준 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 수정 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 기준 삭제
router.delete('/criteria/:id', authMiddleware, requireRole(['superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const criteria = await VideoAnalysisCriteria.findByIdAndDelete(id);

    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: '기준을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '영상 분석 기준이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('영상 분석 기준 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 기준 활성화/비활성화
router.patch('/criteria/:id/toggle', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const criteria = await VideoAnalysisCriteria.findById(id);
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: '기준을 찾을 수 없습니다.'
      });
    }

    criteria.isActive = !criteria.isActive;
    criteria.updatedAt = new Date();
    await criteria.save();

    res.json({
      success: true,
      data: criteria,
      message: `기준이 ${criteria.isActive ? '활성화' : '비활성화'}되었습니다.`
    });

  } catch (error) {
    console.error('영상 분석 기준 토글 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 결과 저장
router.post('/result', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const resultData = {
      ...req.body,
      studentId: req.body.studentId || req.user._id
    };

    const result = new VideoAnalysisResult(resultData);
    await result.save();

    res.json({
      success: true,
      data: result,
      message: '영상 분석 결과가 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('영상 분석 결과 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '결과 저장 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 결과 조회
router.get('/result', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId, technique, limit = 10, offset = 0 } = req.query;
    
    const query: any = {};
    
    // 권한에 따른 데이터 접근 제한
    if (req.user.userType === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.userType === 'instructor') {
      query.studentId = studentId || req.user._id;
    } else if (req.user.userType === 'centerAdmin') {
      query.studentId = studentId;
    }
    
    if (technique) {
      query.technique = technique;
    }

    const results = await VideoAnalysisResult.find(query)
      .sort({ analysisDate: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .populate('studentId', 'name email');

    const total = await VideoAnalysisResult.countDocuments(query);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        }
      }
    });

  } catch (error) {
    console.error('영상 분석 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '결과 조회 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 결과 상세 조회
router.get('/result/:id', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await VideoAnalysisResult.findById(id)
      .populate('studentId', 'name email studentInfo');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: '분석 결과를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user.userType === 'student' && result.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('영상 분석 결과 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '결과 조회 중 오류가 발생했습니다.'
    });
  }
});

// 영상 분석 기준 템플릿 생성 (기본값)
router.post('/criteria/template', authMiddleware, requireRole(['superAdmin']), async (req: any, res: Response) => {
  try {
    const { technique } = req.body;
    
    if (!technique) {
      return res.status(400).json({
        success: false,
        message: '수영 기법을 지정해주세요.'
      });
    }

    // 기본 영상 분석 기준 템플릿
    const defaultCriteria = [
      {
        technique,
        analysisType: 'posture',
        criteriaName: '몸통 정렬',
        description: '수영 중 몸통의 수평 정렬 상태를 평가합니다.',
        weight: 0.3,
        thresholds: {
          excellent: 90,
          good: 75,
          average: 60,
          poor: 45
        },
        analysisMethod: {
          algorithm: 'pose_estimation',
          parameters: {
            keyPoints: ['shoulder', 'hip', 'knee', 'ankle'],
            tolerance: 5,
            frameRate: 30
          },
          confidence: 0.85
        },
        feedback: {
          excellent: ['완벽한 몸통 정렬을 유지하고 있습니다'],
          good: ['대체로 좋은 몸통 정렬을 보입니다'],
          average: ['몸통 정렬에 약간의 개선이 필요합니다'],
          poor: ['몸통 정렬을 크게 개선해야 합니다']
        },
        recommendations: {
          improvement: ['코어 근력 강화', '수평 자세 연습'],
          exercises: ['플랭크', '사이드 플랭크', '수평 자세 유지 연습'],
          focusAreas: ['코어 근력', '자세 인식']
        },
        isActive: true,
        createdBy: req.user._id
      },
      {
        technique,
        analysisType: 'movement',
        criteriaName: '팔 스트로크',
        description: '팔 스트로크의 기술적 정확성을 평가합니다.',
        weight: 0.4,
        thresholds: {
          excellent: 90,
          good: 75,
          average: 60,
          poor: 45
        },
        analysisMethod: {
          algorithm: 'motion_analysis',
          parameters: {
            keyPoints: ['shoulder', 'elbow', 'wrist'],
            strokePhase: ['catch', 'pull', 'push', 'recovery'],
            frameRate: 30
          },
          confidence: 0.8
        },
        feedback: {
          excellent: ['매우 정확한 팔 스트로크를 보입니다'],
          good: ['좋은 팔 스트로크 기술을 보입니다'],
          average: ['팔 스트로크에 개선이 필요합니다'],
          poor: ['팔 스트로크를 크게 개선해야 합니다']
        },
        recommendations: {
          improvement: ['스트로크 기술 연습', '풀링 동작 강화'],
          exercises: ['풀링 연습', '스트로크 드릴', '저항 훈련'],
          focusAreas: ['스트로크 기술', '풀링 파워']
        },
        isActive: true,
        createdBy: req.user._id
      }
    ];

    const createdCriteria = await VideoAnalysisCriteria.insertMany(defaultCriteria);

    res.json({
      success: true,
      data: createdCriteria,
      message: `${technique} 기법의 기본 영상 분석 기준이 생성되었습니다.`
    });

  } catch (error) {
    console.error('영상 분석 기준 템플릿 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '기준 템플릿 생성 중 오류가 발생했습니다.'
    });
  }
});

export default router;

