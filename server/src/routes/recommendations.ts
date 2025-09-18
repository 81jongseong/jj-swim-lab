/**
 * @file 추천 시스템 API 라우트
 * @description AI 기반 개인화 추천을 관리하는 API
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Recommendation } from '../models/Recommendation';
import { LearningProgress } from '../models/LearningProgress';
import { TeachingMethod } from '../models/TeachingMethod';
import { User } from '../models/User';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// 추천 목록 조회
router.get('/', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { type, priority, status } = req.query;

    let query: any = { 
      studentId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const recommendations = await Recommendation.find(query)
      .populate('teachingMethodId', 'name description category level steps tips')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('❌ 추천 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 추천 생성 (AI 알고리즘)
router.post('/generate', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;

    // 기존 활성 추천 삭제
    await Recommendation.deleteMany({ studentId, status: 'active' });

    // 학생의 학습 진도 조회
    const progressData = await LearningProgress.find({ studentId })
      .populate('teachingMethodId', 'name description category level steps tips');

    // 모든 강습법 조회
    const allMethods = await TeachingMethod.find({ isActive: true });

    const recommendations = [];

    // 1. 다음 학습 추천 (진행 중인 강습법 완료)
    const inProgressMethods = progressData.filter(p => p.progress > 0 && p.progress < 100);
    for (const progress of inProgressMethods) {
      const method = progress.teachingMethodId as any;
      recommendations.push({
        studentId,
        type: 'next_lesson',
        title: `${method.name} 완료하기`,
        description: `${method.name}의 나머지 단계를 완료하여 다음 레벨로 진행하세요.`,
        teachingMethodId: method._id,
        reason: '진행 중인 강습법을 완료하면 더 체계적인 학습이 가능합니다.',
        priority: 'high',
        estimatedTime: method.steps.length * 10,
        difficulty: 'medium'
      });
    }

    // 2. 복습 추천 (완료된 강습법 중 오래된 것)
    const completedMethods = progressData.filter(p => p.progress === 100);
    for (const progress of completedMethods) {
      const method = progress.teachingMethodId as any;
      const daysSinceLastStudy = Math.floor((Date.now() - progress.lastStudied.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastStudy > 7) {
        recommendations.push({
          studentId,
          type: 'review',
          title: `${method.name} 복습하기`,
          description: `${method.name}을 복습하여 기억을 되살리고 실력을 유지하세요.`,
          teachingMethodId: method._id,
          reason: `${daysSinceLastStudy}일 전에 학습한 내용을 복습하면 장기 기억에 도움이 됩니다.`,
          priority: 'medium',
          estimatedTime: method.steps.length * 5,
          difficulty: 'easy'
        });
      }
    }

    // 3. 도전 추천 (다음 레벨 강습법)
    const userLevel = getUserLevel(progressData);
    const nextLevelMethods = allMethods.filter(m => {
      const methodLevel = m.level;
      const userLevelValue = userLevel === 'beginner' ? 0 : userLevel === 'intermediate' ? 1 : 2;
      const methodLevelValue = methodLevel === 'beginner' ? 0 : methodLevel === 'intermediate' ? 1 : 2;
      return methodLevelValue === userLevelValue + 1;
    });

    for (const method of nextLevelMethods.slice(0, 3)) {
      recommendations.push({
        studentId,
        type: 'challenge',
        title: `${method.name} 도전하기`,
        description: `${method.name}을 통해 다음 레벨로 도전해보세요.`,
        teachingMethodId: method._id,
        reason: '현재 레벨을 완료했으니 다음 단계로 도전할 때입니다.',
        priority: 'medium',
        estimatedTime: method.steps.length * 15,
        difficulty: 'hard'
      });
    }

    // 4. 기초 강화 추천 (약한 영역)
    const weakAreas = getWeakAreas(progressData);
    for (const area of weakAreas) {
      const areaMethods = allMethods.filter(m => m.category === area && m.level === 'beginner');
      if (areaMethods.length > 0) {
        const method = areaMethods[0];
        recommendations.push({
          studentId,
          type: 'foundation',
          title: `${area} 기초 강화`,
          description: `${area} 영역의 기초를 다시 한번 다져보세요.`,
          teachingMethodId: method._id,
          reason: `${area} 영역에서 부족한 부분이 있어 기초 강화가 필요합니다.`,
          priority: 'high',
          estimatedTime: method.steps.length * 12,
          difficulty: 'medium'
        });
      }
    }

    // 추천 저장
    const savedRecommendations = await Recommendation.insertMany(recommendations);

    res.json({
      success: true,
      data: savedRecommendations,
      message: `${savedRecommendations.length}개의 추천이 생성되었습니다.`
    });
  } catch (error) {
    console.error('❌ 추천 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 생성 중 오류가 발생했습니다.'
    });
  }
});

// 추천 완료 처리
router.put('/:recommendationId/complete', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { recommendationId } = req.params;

    const recommendation = await Recommendation.findOne({
      _id: recommendationId,
      studentId,
      status: 'active'
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '추천을 찾을 수 없습니다.'
      });
    }

    recommendation.status = 'completed';
    recommendation.completedAt = new Date();
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
      message: '추천이 완료되었습니다.'
    });
  } catch (error) {
    console.error('❌ 추천 완료 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 완료 처리 중 오류가 발생했습니다.'
    });
  }
});

// 추천 거부 처리
router.put('/:recommendationId/dismiss', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { recommendationId } = req.params;

    const recommendation = await Recommendation.findOne({
      _id: recommendationId,
      studentId,
      status: 'active'
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '추천을 찾을 수 없습니다.'
      });
    }

    recommendation.status = 'dismissed';
    recommendation.dismissedAt = new Date();
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
      message: '추천이 거부되었습니다.'
    });
  } catch (error) {
    console.error('❌ 추천 거부 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '추천 거부 처리 중 오류가 발생했습니다.'
    });
  }
});

// 학습 분석 조회
router.get('/analysis', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;

    const progressData = await LearningProgress.find({ studentId })
      .populate('teachingMethodId', 'name description category level steps tips');

    // 약한 영역 분석
    const weakAreas = getWeakAreas(progressData);
    
    // 강한 영역 분석
    const categoryProgress: { [key: string]: number[] } = {};
    progressData.forEach(p => {
      const method = p.teachingMethodId as any;
      if (method && method.category) {
        if (!categoryProgress[method.category]) {
          categoryProgress[method.category] = [];
        }
        categoryProgress[method.category].push(p.progress);
      }
    });

    const strongAreas = Object.entries(categoryProgress)
      .filter(([category, progresses]) => {
        const averageProgress = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
        return averageProgress >= 70 && !weakAreas.includes(category);
      })
      .map(([category]) => category);

    // 학습 패턴 분석
    const learningPatterns = {
      preferredTime: getPreferredLearningTime(progressData),
      averageSessionLength: getAverageSessionLength(progressData),
      difficultyPreference: getDifficultyPreference(progressData),
      categoryPreference: getCategoryPreference(progressData)
    };

    res.json({
      success: true,
      data: {
        weakAreas,
        strongAreas,
        learningPatterns,
        totalMethods: progressData.length,
        completedMethods: progressData.filter(p => p.progress === 100).length,
        averageProgress: progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length
      }
    });
  } catch (error) {
    console.error('❌ 학습 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학습 분석 조회 중 오류가 발생했습니다.'
    });
  }
});

// 헬퍼 함수들
function getUserLevel(progressData: any[]): string {
  const completedMethods = progressData.filter(p => p.progress === 100);
  if (completedMethods.length === 0) return 'beginner';
  
  const completedLevels = completedMethods.map(p => {
    const method = p.teachingMethodId;
    return method?.level;
  });
  
  if (completedLevels.includes('advanced')) return 'advanced';
  if (completedLevels.includes('intermediate')) return 'intermediate';
  return 'beginner';
}

function getWeakAreas(progressData: any[]): string[] {
  const categoryProgress: { [key: string]: number[] } = {};
  
  progressData.forEach(p => {
    const method = p.teachingMethodId;
    if (method && method.category) {
      if (!categoryProgress[method.category]) {
        categoryProgress[method.category] = [];
      }
      categoryProgress[method.category].push(p.progress);
    }
  });
  
  const weakAreas: string[] = [];
  Object.entries(categoryProgress).forEach(([category, progresses]) => {
    const averageProgress = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
    if (averageProgress < 50) {
      weakAreas.push(category);
    }
  });
  
  return weakAreas;
}

function getPreferredLearningTime(progressData: any[]): string {
  // 시간대별 학습 패턴 분석 (임시 구현)
  return '오후 2-4시';
}

function getAverageSessionLength(progressData: any[]): number {
  const totalStudyTime = progressData.reduce((sum, p) => sum + p.studyTime, 0);
  return progressData.length > 0 ? Math.round(totalStudyTime / progressData.length) : 0;
}

function getDifficultyPreference(progressData: any[]): string {
  const difficulties = progressData.map(p => p.difficulty);
  const difficultyCounts = difficulties.reduce((acc, diff) => {
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as any);
  
  return Object.keys(difficultyCounts).reduce((a, b) => 
    difficultyCounts[a] > difficultyCounts[b] ? a : b
  );
}

function getCategoryPreference(progressData: any[]): string[] {
  const categories = progressData.map(p => p.teachingMethodId?.category).filter(Boolean);
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as any);
  
  return Object.entries(categoryCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([category]) => category);
}

export default router;
