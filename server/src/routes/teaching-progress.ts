/**
 * 📚 JJ Swim Lab - 강습법 체크리스트 진행 상황 관리 API
 * 
 * 📋 **API 목적**
 * - 회원별 강습법 체크리스트 진행 상황 관리
 * - 체크리스트 단계 완료/미완료 토글
 * - 다음 강습법 자동 추천
 * - 레벨별 진행률 추적
 * 
 * 🔄 **주요 기능**
 * 1. GET /api/teaching-progress/:userId - 회원의 모든 강습법 진행 상황 조회
 * 2. POST /api/teaching-progress/:userId/method/:methodId/step - 단계 완료/미완료 토글
 * 3. GET /api/teaching-progress/:userId/next-recommendation - 다음 강습법 추천
 * 4. GET /api/teaching-progress/:userId/summary - 레벨별 진행률 요약
 * 
 * 🗄️ **데이터 연동**
 * - User 모델 (swimmingProfile.teachingProgress)
 * - TeachingMethod 모델 (강습법 정보)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express 4.21.2
 * - Mongoose 7.8.7
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 강사/본인만 진행 상황 수정 가능
 * 2. 단계 완료 시 completionRate 자동 계산
 * 3. 모든 단계 완료 시 masteryLevel 자동 상향
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-07
 * - 상태: ✅ 완성
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

// Models - default export 아님
const User = require('../models/User').default;
const TeachingMethod = require('../models/TeachingMethod').default;

// Middleware
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/teaching-progress/:userId
 * 회원의 모든 강습법 진행 상황 조회
 */
router.get('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 권한 체크: 본인, 담당 강사, 또는 관리자만 조회 가능
    if (
      currentUser._id.toString() !== userId &&
      currentUser.userType !== 'superAdmin' &&
      currentUser.userType !== 'centerAdmin' &&
      !currentUser.instructorInfo
    ) {
      return res.status(403).json({ error: '진행 상황 조회 권한이 없습니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];

    return res.status(200).json({
      userId,
      userName: user.name,
      currentLevel: user.studentInfo?.currentLevel || 'beginner',
      teachingProgress
    });
  } catch (error: any) {
    console.error('진행 상황 조회 실패:', error);
    return res.status(500).json({ error: '진행 상황 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * POST /api/teaching-progress/:userId/method/:methodId/step
 * 특정 단계 완료/미완료 토글
 * 
 * Body: {
 *   stepId: string,
 *   completed: boolean,
 *   notes?: string
 * }
 */
router.post('/:userId/method/:methodId/step', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, methodId } = req.params;
    const { stepId, completed, notes } = req.body;
    const currentUser = (req as any).user;

    // 권한 체크: 본인, 담당 강사, 또는 관리자만 수정 가능
    if (
      currentUser._id.toString() !== userId &&
      currentUser.userType !== 'superAdmin' &&
      currentUser.userType !== 'centerAdmin' &&
      !currentUser.instructorInfo
    ) {
      return res.status(403).json({ error: '진행 상황 수정 권한이 없습니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // teachingProgress 초기화 (없으면)
    if (!user.studentInfo) {
      user.studentInfo = {} as any;
    }
    if (!user.studentInfo.swimmingProfile) {
      user.studentInfo.swimmingProfile = {};
    }
    if (!user.studentInfo.swimmingProfile.teachingProgress) {
      user.studentInfo.swimmingProfile.teachingProgress = [];
    }

    // 해당 강습법 찾기
    let progressEntry = user.studentInfo.swimmingProfile.teachingProgress.find(
      (p: any) => p.methodId.toString() === methodId
    );

    // 없으면 새로 생성
    if (!progressEntry) {
      const method = await TeachingMethod.findById(methodId);
      if (!method) {
        return res.status(404).json({ error: '강습법을 찾을 수 없습니다.' });
      }

      progressEntry = {
        methodId: new mongoose.Types.ObjectId(methodId),
        methodName: method.name,
        stroke: method.stroke,
        category: method.category,
        completedSteps: [],
        totalSteps: method.steps.length,
        completionRate: 0,
        masteryLevel: 'learning' as const,
        evaluatedBy: currentUser._id,
        evaluatedAt: new Date()
      };
      user.studentInfo.swimmingProfile.teachingProgress.push(progressEntry as any);
    }

    // 단계 완료/미완료 토글
    const stepIndex = (progressEntry as any).completedSteps.indexOf(stepId);
    if (completed && stepIndex === -1) {
      (progressEntry as any).completedSteps.push(stepId);
    } else if (!completed && stepIndex !== -1) {
      (progressEntry as any).completedSteps.splice(stepIndex, 1);
    }

    // completionRate 재계산
    (progressEntry as any).completionRate = Math.round(
      ((progressEntry as any).completedSteps.length / (progressEntry as any).totalSteps) * 100
    );

    // masteryLevel 자동 업데이트
    if ((progressEntry as any).completionRate === 100) {
      (progressEntry as any).masteryLevel = 'mastered';
    } else if ((progressEntry as any).completionRate >= 75) {
      (progressEntry as any).masteryLevel = 'proficient';
    } else if ((progressEntry as any).completionRate >= 30) {
      (progressEntry as any).masteryLevel = 'practicing';
    } else {
      (progressEntry as any).masteryLevel = 'learning';
    }

    // 메타 정보 업데이트
    (progressEntry as any).lastPracticed = new Date();
    (progressEntry as any).evaluatedBy = currentUser._id;
    (progressEntry as any).evaluatedAt = new Date();
    if (notes) {
      (progressEntry as any).notes = notes;
    }

    await user.save();

    return res.status(200).json({
      message: '진행 상황이 업데이트되었습니다.',
      progress: progressEntry
    });
  } catch (error: any) {
    console.error('진행 상황 업데이트 실패:', error);
    return res.status(500).json({ error: '진행 상황 업데이트에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/teaching-progress/:userId/next-recommendation
 * 다음 강습법 자동 추천
 * 
 * 추천 로직:
 * 1. 현재 레벨의 미완료/진행 중인 강습법 우선
 * 2. 선호 영법의 강습법 우선
 * 3. 완료율이 낮은 것부터 추천
 * 4. 마지막 연습 날짜가 오래된 것 우선
 */
router.get('/:userId/next-recommendation', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 권한 체크
    if (
      currentUser._id.toString() !== userId &&
      currentUser.userType !== 'superAdmin' &&
      currentUser.userType !== 'centerAdmin' &&
      !currentUser.instructorInfo
    ) {
      return res.status(403).json({ error: '추천 조회 권한이 없습니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const currentLevel = user.studentInfo?.currentLevel || 'beginner';
    const preferredStrokes = user.studentInfo?.swimmingProfile?.preferredStrokes || [];
    const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];

    // 현재 레벨에 맞는 모든 강습법 조회
    const allMethods = await TeachingMethod.find({
      targetLevel: { $in: [currentLevel, 'all'] },
      isActive: true
    }).sort({ order: 1 });

    // 진행 중인 강습법 찾기
    const inProgressMethods = teachingProgress.filter(
      (p: any) => p.completionRate < 100
    );

    // 아직 시작하지 않은 강습법 찾기
    const completedMethodIds = teachingProgress.map((p: any) => p.methodId.toString());
    const notStartedMethods = allMethods.filter(
      (m: any) => !completedMethodIds.includes(m._id.toString())
    );

    // 추천 우선순위
    const recommendations = [];

    // 1순위: 진행 중이고 선호 영법인 것
    const preferredInProgress = inProgressMethods.filter((p: any) =>
      preferredStrokes.includes(p.stroke)
    );
    if (preferredInProgress.length > 0) {
      recommendations.push({
        priority: 'high',
        reason: '선호 영법의 진행 중인 강습법',
        methods: preferredInProgress
      });
    }

    // 2순위: 진행 중인 것 (완료율 낮은 순)
    const otherInProgress = inProgressMethods
      .filter((p: any) => !preferredStrokes.includes(p.stroke))
      .sort((a: any, b: any) => a.completionRate - b.completionRate);
    if (otherInProgress.length > 0) {
      recommendations.push({
        priority: 'medium',
        reason: '진행 중인 강습법',
        methods: otherInProgress
      });
    }

    // 3순위: 아직 시작하지 않은 선호 영법
    const preferredNotStarted = notStartedMethods.filter((m: any) =>
      preferredStrokes.includes(m.stroke)
    );
    if (preferredNotStarted.length > 0) {
      recommendations.push({
        priority: 'medium',
        reason: '선호 영법의 새로운 강습법',
        methods: preferredNotStarted.map((m: any) => ({
          methodId: m._id,
          methodName: m.name,
          stroke: m.stroke,
          category: m.category,
          totalSteps: m.steps.length,
          completionRate: 0
        }))
      });
    }

    // 4순위: 아직 시작하지 않은 다른 강습법
    const otherNotStarted = notStartedMethods.filter((m: any) =>
      !preferredStrokes.includes(m.stroke)
    );
    if (otherNotStarted.length > 0) {
      recommendations.push({
        priority: 'low',
        reason: '새로운 강습법',
        methods: otherNotStarted.slice(0, 3).map((m: any) => ({
          methodId: m._id,
          methodName: m.name,
          stroke: m.stroke,
          category: m.category,
          totalSteps: m.steps.length,
          completionRate: 0
        }))
      });
    }

    return res.status(200).json({
      userId,
      userName: user.name,
      currentLevel,
      preferredStrokes,
      recommendations
    });
  } catch (error: any) {
    console.error('추천 조회 실패:', error);
    return res.status(500).json({ error: '추천 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/teaching-progress/:userId/summary
 * 레벨별 진행률 요약
 */
router.get('/:userId/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 권한 체크
    if (
      currentUser._id.toString() !== userId &&
      currentUser.userType !== 'superAdmin' &&
      currentUser.userType !== 'centerAdmin' &&
      !currentUser.instructorInfo
    ) {
      return res.status(403).json({ error: '요약 조회 권한이 없습니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const currentLevel = user.studentInfo?.currentLevel || 'beginner';
    const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];

    // 전체 통계
    const totalMethods = teachingProgress.length;
    const masteredMethods = teachingProgress.filter((p: any) => p.completionRate === 100).length;
    const inProgressMethods = teachingProgress.filter((p: any) => p.completionRate > 0 && p.completionRate < 100).length;
    const notStartedMethods = teachingProgress.filter((p: any) => p.completionRate === 0).length;

    // 영법별 통계
    const byStroke = teachingProgress.reduce((acc: any, p: any) => {
      if (!acc[p.stroke]) {
        acc[p.stroke] = {
          total: 0,
          mastered: 0,
          avgCompletion: 0
        };
      }
      acc[p.stroke].total++;
      if (p.completionRate === 100) acc[p.stroke].mastered++;
      acc[p.stroke].avgCompletion += p.completionRate;
      return acc;
    }, {});

    Object.keys(byStroke).forEach((stroke) => {
      byStroke[stroke].avgCompletion = Math.round(byStroke[stroke].avgCompletion / byStroke[stroke].total);
    });

    // 숙련도별 통계
    const byMastery = {
      learning: teachingProgress.filter((p: any) => p.masteryLevel === 'learning').length,
      practicing: teachingProgress.filter((p: any) => p.masteryLevel === 'practicing').length,
      proficient: teachingProgress.filter((p: any) => p.masteryLevel === 'proficient').length,
      mastered: teachingProgress.filter((p: any) => p.masteryLevel === 'mastered').length
    };

    // 전체 평균 완료율
    const avgCompletion = totalMethods > 0
      ? Math.round(teachingProgress.reduce((sum: number, p: any) => sum + p.completionRate, 0) / totalMethods)
      : 0;

    return res.status(200).json({
      userId,
      userName: user.name,
      currentLevel,
      summary: {
        totalMethods,
        masteredMethods,
        inProgressMethods,
        notStartedMethods,
        avgCompletion,
        byStroke,
        byMastery
      }
    });
  } catch (error: any) {
    console.error('요약 조회 실패:', error);
    return res.status(500).json({ error: '요약 조회에 실패했습니다.', details: error.message });
  }
});

export default router;

