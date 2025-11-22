/**
 * 강사 평가 기준 및 결과 관리 API
 * - 평가 기준 CRUD 작업
 * - 평가 데이터 수집 및 저장
 * - 평가 결과 조회 및 분석
 * - 평가 통계 및 리포트 생성
 * 
 * 연동 파일:
 * - InstructorEvaluationCriteria: 평가 기준 모델
 * - InstructorEvaluationResult: 평가 결과 모델
 * - User: 사용자 정보
 * - Center: 센터 정보
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import InstructorEvaluationCriteria from '../models/InstructorEvaluationCriteria';
import InstructorEvaluationResult from '../models/InstructorEvaluationResult';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

/**
 * 평가 기준 조회 API
 * GET /api/instructor-evaluation/criteria
 * - 센터별 또는 전체 평가 기준 조회
 * - 활성화된 기준만 조회 가능
 */
router.get('/criteria', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { centerId, includeInactive } = req.query;
    
    // 쿼리 조건 구성
    const query: any = {};
    
    // 센터별 필터링
    if (centerId) {
      query.centerId = centerId;
    } else {
      query.centerId = null; // 전체 센터 공통 기준
    }
    
    // 활성화 상태 필터링
    if (!includeInactive) {
      query.isActive = true;
    }
    
    // 평가 기준 조회
    const criteria = await InstructorEvaluationCriteria
      .find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('centerId', 'name address')
      .sort({ version: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: criteria,
      total: criteria.length
    });
    
  } catch (error) {
    logError('평가 기준 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 평가 기준 생성 API
 * POST /api/instructor-evaluation/criteria
 * - 새로운 평가 기준 생성
 * - 관리자 권한 필요
 */
router.post('/criteria', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // 권한 확인 (관리자만 생성 가능)
    if (!['superAdmin', 'centerAdmin'].includes(user.userType)) {
      return res.status(403).json({
        success: false,
        message: '평가 기준 생성 권한이 없습니다.'
      });
    }
    
    // 센터 관리자인 경우 자신의 센터로 제한
    let centerId = req.body.centerId;
    if (user.userType === 'centerAdmin') {
      centerId = user.centerId;
    }
    
    // 평가 기준 생성
    const criteriaData = {
      ...req.body,
      centerId,
      createdBy: user._id,
      updatedBy: user._id
    };
    
    const criteria = new InstructorEvaluationCriteria(criteriaData);
    await criteria.save();
    
    // 생성된 데이터 조회 (populate 포함)
    const savedCriteria = await InstructorEvaluationCriteria
      .findById(criteria._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('centerId', 'name address');
    
    res.status(201).json({
      success: true,
      message: '평가 기준이 성공적으로 생성되었습니다.',
      data: savedCriteria
    });
    
  } catch (error) {
    logError('평가 기준 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 평가 기준 수정 API
 * PUT /api/instructor-evaluation/criteria/:id
 * - 기존 평가 기준 수정
 * - 관리자 권한 필요
 */
router.put('/criteria/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    // 권한 확인
    if (!['superAdmin', 'centerAdmin'].includes(user.userType)) {
      return res.status(403).json({
        success: false,
        message: '평가 기준 수정 권한이 없습니다.'
      });
    }
    
    // 기존 평가 기준 조회
    const existingCriteria = await InstructorEvaluationCriteria.findById(id);
    if (!existingCriteria) {
      return res.status(404).json({
        success: false,
        message: '평가 기준을 찾을 수 없습니다.'
      });
    }
    
    // 센터 관리자인 경우 권한 확인
    if (user.userType === 'centerAdmin' && 
        existingCriteria.centerId?.toString() !== user.centerId?.toString()) {
      return res.status(403).json({
        success: false,
        message: '해당 평가 기준을 수정할 권한이 없습니다.'
      });
    }
    
    // 평가 기준 수정
    const updatedCriteria = await InstructorEvaluationCriteria
      .findByIdAndUpdate(
        id,
        {
          ...req.body,
          updatedBy: user._id
        },
        { new: true }
      )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('centerId', 'name address');
    
    res.json({
      success: true,
      message: '평가 기준이 성공적으로 수정되었습니다.',
      data: updatedCriteria
    });
    
  } catch (error) {
    logError('평가 기준 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 수정 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 평가 결과 조회 API
 * GET /api/instructor-evaluation/results
 * - 강사별 평가 결과 조회
 * - 기간별, 센터별 필터링 지원
 */
router.get('/results', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { 
      instructorId, 
      centerId, 
      year, 
      quarter, 
      status,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // 쿼리 조건 구성
    const query: any = {};
    
    // 권한별 필터링
    if (user.userType === 'centerAdmin') {
      query.centerId = user.centerId;
    } else if (user.userType === 'instructor') {
      query.instructorId = user._id;
    }
    
    // 추가 필터 적용
    if (instructorId) query.instructorId = instructorId;
    if (centerId && user.userType === 'superAdmin') query.centerId = centerId;
    if (year) query['evaluationPeriod.year'] = parseInt(year as string);
    if (quarter) query['evaluationPeriod.quarter'] = quarter;
    if (status) query.status = status;
    
    // 페이지네이션 설정
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    // 평가 결과 조회
    const results = await InstructorEvaluationResult
      .find(query)
      .populate('instructorId', 'name email level')
      .populate('centerId', 'name address')
      .populate('criteriaId', 'title version')
      .populate('createdBy', 'name email')
      .sort({ 'evaluationPeriod.year': -1, 'evaluationPeriod.quarter': -1 })
      .skip(skip)
      .limit(parseInt(limit as string));
    
    // 총 개수 조회
    const total = await InstructorEvaluationResult.countDocuments(query);
    
    res.json({
      success: true,
      data: results,
      pagination: {
        current: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    logError('평가 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 결과 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 평가 데이터 제출 API
 * POST /api/instructor-evaluation/submit
 * - 개별 평가자의 평가 데이터 제출
 * - 학생, 동료 강사, 관리자, 자기평가 지원
 */
router.post('/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { 
      instructorId, 
      evaluationResultId, 
      scores, 
      overallComment,
      recommendations,
      strengths,
      improvements,
      isAnonymous = false
    } = req.body;
    
    // 평가 결과 문서 조회 또는 생성
    const evaluationResult = await InstructorEvaluationResult.findById(evaluationResultId);
    
    if (!evaluationResult) {
      return res.status(404).json({
        success: false,
        message: '평가 결과를 찾을 수 없습니다.'
      });
    }
    
    // 평가자 유형 결정
    let evaluatorType: 'student' | 'peer' | 'management' | 'self';
    if (user._id.toString() === instructorId) {
      evaluatorType = 'self';
    } else if (user.userType === 'student') {
      evaluatorType = 'student';
    } else if (user.userType === 'instructor') {
      evaluatorType = 'peer';
    } else {
      evaluatorType = 'management';
    }
    
    // 기존 평가 확인 (중복 제출 방지)
    const existingAssessment = evaluationResult.assessments.find(
      assessment => assessment.evaluatorId.toString() === user._id.toString()
    );
    
    if (existingAssessment) {
      return res.status(400).json({
        success: false,
        message: '이미 평가를 완료하셨습니다.'
      });
    }
    
    // 새로운 평가 데이터 추가
    const newAssessment = {
      evaluatorId: user._id,
      evaluatorType,
      evaluatedAt: new Date(),
      scores,
      overallComment,
      recommendations,
      strengths,
      improvements,
      isAnonymous
    };
    
    evaluationResult.assessments.push(newAssessment);
    
    // 진행 상태 업데이트
    if (evaluationResult.status === 'draft') {
      evaluationResult.status = 'in_progress';
    }
    
    // 저장 (자동으로 점수 계산됨)
    await evaluationResult.save();
    
    res.json({
      success: true,
      message: '평가가 성공적으로 제출되었습니다.',
      data: {
        evaluationResultId: evaluationResult._id,
        assessmentId: newAssessment
      }
    });
    
  } catch (error) {
    logError('평가 제출 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 제출 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 평가 통계 조회 API
 * GET /api/instructor-evaluation/statistics
 * - 센터별, 기간별 평가 통계
 * - 등급 분포, 평균 점수 등
 */
router.get('/statistics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { centerId, year, quarter } = req.query;
    
    // 권한별 필터링
    const query: any = {};
    if (user.userType === 'centerAdmin') {
      query.centerId = user.centerId;
    } else if (centerId && user.userType === 'superAdmin') {
      query.centerId = centerId;
    }
    
    if (year) query['evaluationPeriod.year'] = parseInt(year as string);
    if (quarter) query['evaluationPeriod.quarter'] = quarter;
    
    // 기본 통계 조회
    const totalResults = await InstructorEvaluationResult.countDocuments(query);
    
    // 등급별 분포
    const gradeDistribution = await InstructorEvaluationResult.aggregate([
      { $match: query },
      { $group: { 
          _id: '$calculatedResults.grade',
          count: { $sum: 1 },
          avgScore: { $avg: '$calculatedResults.totalScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // 평균 점수
    const averageScore = await InstructorEvaluationResult.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          avgTotal: { $avg: '$calculatedResults.totalScore' },
          avgStudentFeedback: { $avg: '$calculatedResults.averageScores.studentFeedback' },
          avgTeachingSkill: { $avg: '$calculatedResults.averageScores.teachingSkill' },
          avgCommunication: { $avg: '$calculatedResults.averageScores.communication' },
          avgPunctuality: { $avg: '$calculatedResults.averageScores.punctuality' },
          avgImprovement: { $avg: '$calculatedResults.averageScores.improvement' },
          avgSafety: { $avg: '$calculatedResults.averageScores.safety' }
        }
      }
    ]);
    
    // 월별 트렌드 (최근 12개월)
    const monthlyTrend = await InstructorEvaluationResult.aggregate([
      { $match: query },
      { $group: {
          _id: {
            year: '$evaluationPeriod.year',
            quarter: '$evaluationPeriod.quarter'
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$calculatedResults.totalScore' }
        }
      },
      { $sort: { '_id.year': -1, '_id.quarter': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalResults,
        gradeDistribution,
        averageScores: averageScore[0] || {},
        monthlyTrend
      }
    });
    
  } catch (error) {
    logError('평가 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 통계 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 기본 평가 기준 생성 API
 * POST /api/instructor-evaluation/create-default-criteria
 * - 시스템 초기 설정용 기본 평가 기준 생성
 * - 슈퍼 관리자만 실행 가능
 */
router.post('/create-default-criteria', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // 슈퍼 관리자만 실행 가능
    if (user.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '기본 평가 기준 생성 권한이 없습니다.'
      });
    }
    
    // 기존 기본 평가 기준 확인
    const existingCriteria = await InstructorEvaluationCriteria.findOne({ 
      centerId: null,
      title: 'JJ 수영장 기본 강사 평가 기준'
    });
    
    if (existingCriteria) {
      return res.status(400).json({
        success: false,
        message: '기본 평가 기준이 이미 존재합니다.'
      });
    }
    
    // 기본 평가 기준 생성
    const defaultCriteria = new InstructorEvaluationCriteria({
      centerId: null, // 전체 센터 공통
      title: 'JJ 수영장 기본 강사 평가 기준',
      description: 'JJ 수영장의 표준 강사 평가 기준입니다. 모든 센터에서 공통으로 사용할 수 있습니다.',
      version: '1.0.0',
      isActive: true,
      createdBy: user._id,
      updatedBy: user._id
    });
    
    await defaultCriteria.save();
    
    res.status(201).json({
      success: true,
      message: '기본 평가 기준이 성공적으로 생성되었습니다.',
      data: defaultCriteria
    });
    
  } catch (error) {
    logError('기본 평가 기준 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '기본 평가 기준 생성 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;
