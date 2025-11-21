/**
 * @file 퀴즈 문제 자동 생성 API 라우트
 * @description 사용자가 제공한 정답 Pool, 오답 Pool을 기반으로 문제을 생성하는 API
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

/**
 * 📝 퀴즈 문제 자동 생성 API 라우트
 * 
 * 📋 **파일 목적**
 * - 사용자가 제공한 정답 Pool, 오답 Pool을 기반으로 문제 생성
 * - 같은 카테고리 문제를 하나의 퀴즈로 묶어서 저장
 * - 퀴즈 문제 메타데이터 관리 (conceptBlock, originalExplanation 등)
 * 
 * 🔄 **연동되는 모델**
 * - Quiz (퀴즈 모델)
 * - QuizQuestionGeneratorService (문제 생성 서비스)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 퀴즈 문제 자동 생성 API 구현
 * - 2025-01-19: 같은 카테고리 문제 묶기 기능 추가
 * - 2025-01-19: 메타데이터 저장 기능 추가
 */

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { QuizQuestionGeneratorService, QuestionPoolInput } from '../services/quizQuestionGeneratorService';
import { Quiz } from '../models/Quiz';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

interface AuthenticatedRequest extends express.Request {
  user?: {
    _id: string;
    userType: string;
  };
}

/**
 * Pool 데이터를 기반으로 문제 생성
 */
router.post('/generate', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      id,
      topic,
      conceptBlock,
      originalExplanation,
      correctPool,
      incorrectPool,
      typeVariants,
      optionCount,
      type
    } = req.body;

    if (!id || !topic || !correctPool || !incorrectPool) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (id, topic, correctPool, incorrectPool)'
      });
    }

    if (!Array.isArray(correctPool) || correctPool.length < 4) {
      return res.status(400).json({
        success: false,
        message: '정답 Pool은 최소 4개 이상의 배열이어야 합니다.'
      });
    }

    if (!Array.isArray(incorrectPool) || incorrectPool.length < 4) {
      return res.status(400).json({
        success: false,
        message: '오답 Pool은 최소 4개 이상의 배열이어야 합니다.'
      });
    }

    // incorrectPool이 객체 배열인 경우 문자열 배열로 변환 (서비스에서 처리)
    // 여기서는 검증만 수행

    const input: QuestionPoolInput = {
      id,
      topic,
      conceptBlock,
      originalExplanation,
      correctPool,
      incorrectPool,
      typeVariants,
      optionCount: optionCount || 4,
      type: type || '정답찾기'
    };

    const result = QuizQuestionGeneratorService.generateQuestionFromPools(input);

    res.json({
      success: true,
      message: '문제가 성공적으로 생성되었습니다.',
      data: result
    });
  } catch (error: any) {
    logError('문제 생성 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || '문제 생성 중 오류가 발생했습니다.',
      error: error.name || 'UNKNOWN_ERROR'
    });
  }
});

/**
 * 여러 문제 생성 (문제은행)
 */
router.post('/generate-multiple', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    const {
      id,
      topic,
      conceptBlock,
      originalExplanation,
      correctPool,
      incorrectPool,
      typeVariants,
      optionCount,
      type,
      count = 5
    } = req.body;

    if (!id || !topic || !correctPool || !incorrectPool) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (id, topic, correctPool, incorrectPool)'
      });
    }

    const input: QuestionPoolInput = {
      id,
      topic,
      conceptBlock,
      originalExplanation,
      correctPool,
      incorrectPool,
      typeVariants,
      optionCount: optionCount || 4,
      type: type || '정답찾기'
    };

    const results = QuizQuestionGeneratorService.generateMultipleQuestions(input, count);

    res.json({
      success: true,
      message: `${count}개의 문제가 성공적으로 생성되었습니다.`,
      data: results
    });
  } catch (error: any) {
    logError('문제 생성 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || '문제 생성 중 오류가 발생했습니다.',
      error: error.name || 'UNKNOWN_ERROR'
    });
  }
});

/**
 * 생성된 문제를 퀴즈로 저장
 * 같은 카테고리로 생성된 문제들을 하나의 퀴즈로 묶어서 저장
 */
router.post('/save-quiz', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!(req as any).user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const {
      generatedQuestion,
      generatedQuestions, // 여러 문제 배열 (선택사항)
      title,
      description,
      category,
      tags
      // difficulty는 사용하지 않음 (난이도는 항상 intermediate로 고정)
    } = req.body;

    // 여러 문제가 제공된 경우 (같은 카테고리로 묶어서 저장)
    if (generatedQuestions && Array.isArray(generatedQuestions) && generatedQuestions.length > 0) {
      if (!category) {
        return res.status(400).json({
          success: false,
          message: '카테고리가 필요합니다.'
        });
      }

      // 같은 카테고리로 생성된 기존 퀴즈 찾기 (제목과 무관하게 카테고리만으로 찾기)
      const normalizedCategory = category.trim();
      const existingQuiz = await Quiz.findOne({
        category: normalizedCategory,
        createdBy: (req as any).user._id,
        isActive: true
      }).sort({ createdAt: -1 });
      
      logDebug('기존 퀴즈 검색 (여러 문제)', {
        category: normalizedCategory,
        userId: (req as any).user._id,
        found: !!existingQuiz,
        existingQuizId: existingQuiz?._id,
        existingQuizTitle: existingQuiz?.title,
        existingQuestionCount: existingQuiz?.questions?.length
      });

      const questions = generatedQuestions.map((q: any) => ({
        question: q.question,
        type: 'multiple-choice' as const,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || q.solution || '',
        points: 1,
        // 추가 메타데이터 저장
        conceptBlock: q.conceptBlock,
        originalExplanation: q.originalExplanation,
        incorrectPoolDetails: q.incorrectPoolDetails,
        // 정답/오답 Pool 저장 (문제 생성 시 사용한 전체 Pool)
        correctPool: q.sourcePools?.correctPool || [],
        incorrectPool: q.sourcePools?.incorrectPool || [],
        metadata: q.metadata || {}
      }));

      if (existingQuiz) {
        // 기존 퀴즈에 문제 추가
        logInfo('기존 퀴즈에 문제 추가', { quizId: existingQuiz._id, questionCount: questions.length });
        existingQuiz.questions.push(...questions);
        existingQuiz.title = title || existingQuiz.title || `${normalizedCategory} 관련 문제 세트`;
        existingQuiz.description = description || existingQuiz.description || `${existingQuiz.questions.length}개의 문제가 포함된 세트입니다.`;
        if (tags && Array.isArray(tags)) {
          existingQuiz.tags = [...new Set([...existingQuiz.tags, ...tags])];
        }
        await existingQuiz.save();
        logInfo('퀴즈 저장 완료', { quizId: existingQuiz._id, totalQuestions: existingQuiz.questions.length });

        res.status(200).json({
          success: true,
          message: `${generatedQuestions.length}개의 문제가 기존 퀴즈에 추가되었습니다.`,
          data: {
            quiz: existingQuiz,
            addedCount: generatedQuestions.length
          }
        });
      } else {
        // 새 퀴즈 생성
        logInfo('새 퀴즈 생성', { category: normalizedCategory });
        const quiz = new Quiz({
          title: title || `${normalizedCategory} 관련 문제 세트`,
          description: description || `${generatedQuestions.length}개의 문제가 포함된 세트입니다.`,
          category: normalizedCategory,
          difficulty: 'intermediate', // 난이도는 항상 intermediate로 고정
          type: 'multiple-choice',
          questions,
          passingScore: 70,
          maxAttempts: 3,
          tags: tags || [category, '자동생성'],
          createdBy: (req as any).user._id,
          assignedTo: [],
          isActive: true
        });

        await quiz.save();

        res.status(201).json({
          success: true,
          message: `${generatedQuestions.length}개의 문제가 퀴즈로 저장되었습니다.`,
          data: {
            quiz,
            addedCount: generatedQuestions.length
          }
        });
      }
    } else if (generatedQuestion) {
      // 단일 문제 저장 (기존 로직)
      if (!category) {
        return res.status(400).json({
          success: false,
          message: '카테고리가 필요합니다.'
        });
      }

      // 같은 카테고리로 생성된 기존 퀴즈 찾기 (제목과 무관하게 카테고리만으로 찾기)
      const normalizedCategory = category.trim();
      const existingQuiz = await Quiz.findOne({
        category: normalizedCategory,
        createdBy: (req as any).user._id,
        isActive: true
      }).sort({ createdAt: -1 });
      
      logDebug('기존 퀴즈 검색 (단일 문제)', {
        category: normalizedCategory,
        userId: (req as any).user._id,
        found: !!existingQuiz,
        existingQuizId: existingQuiz?._id,
        existingQuizTitle: existingQuiz?.title,
        existingQuestionCount: existingQuiz?.questions?.length
      });

      const question = {
        question: generatedQuestion.question,
        type: 'multiple-choice' as const,
        options: generatedQuestion.options,
        correctAnswer: generatedQuestion.correctAnswer,
        explanation: generatedQuestion.explanation || generatedQuestion.solution || '',
        points: 1,
        // 추가 메타데이터 저장
        conceptBlock: generatedQuestion.conceptBlock,
        originalExplanation: generatedQuestion.originalExplanation,
        incorrectPoolDetails: generatedQuestion.incorrectPoolDetails,
        // 정답/오답 Pool 저장 (문제 생성 시 사용한 전체 Pool)
        correctPool: generatedQuestion.sourcePools?.correctPool || [],
        incorrectPool: generatedQuestion.sourcePools?.incorrectPool || [],
        metadata: generatedQuestion.metadata || {}
      };

      if (existingQuiz) {
        // 기존 퀴즈에 문제 추가
        logInfo('기존 퀴즈에 문제 추가', { quizId: existingQuiz._id });
        existingQuiz.questions.push(question);
        existingQuiz.title = title || existingQuiz.title;
        existingQuiz.description = description || existingQuiz.description || `${existingQuiz.questions.length}개의 문제가 포함된 세트입니다.`;
        if (tags && Array.isArray(tags)) {
          existingQuiz.tags = [...new Set([...existingQuiz.tags, ...tags])];
        }
        await existingQuiz.save();
        logInfo('퀴즈 저장 완료', { quizId: existingQuiz._id, totalQuestions: existingQuiz.questions.length });

        res.status(200).json({
          success: true,
          message: '문제가 기존 퀴즈에 추가되었습니다.',
          data: {
            quiz: existingQuiz,
            addedCount: 1
          }
        });
      } else {
        // 새 퀴즈 생성
        logInfo('새 퀴즈 생성', { category: normalizedCategory });
        const quiz = new Quiz({
          title: title || `${generatedQuestion.topic} 관련 문제`,
          description: description || `${generatedQuestion.topic}에 대한 자동 생성 문제입니다.`,
          category: normalizedCategory,
          difficulty: 'intermediate', // 난이도는 항상 intermediate로 고정
          type: 'multiple-choice',
          questions: [question],
          passingScore: 70,
          maxAttempts: 3,
          tags: tags || [generatedQuestion.topic, '자동생성'],
          createdBy: (req as any).user._id,
          assignedTo: [],
          isActive: true
        });

        await quiz.save();

        res.status(201).json({
          success: true,
          message: '문제가 퀴즈로 저장되었습니다.',
          data: {
            quiz,
            addedCount: 1
          }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: '저장할 문제가 없습니다.'
      });
    }
  } catch (error: any) {
    logError('퀴즈 저장 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || '퀴즈 저장 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 같은 카테고리로 생성된 여러 퀴즈를 하나로 합치기
 */
router.post('/merge-by-category', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!(req as any).user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: '카테고리가 필요합니다.'
      });
    }

    const normalizedCategory = category.trim();
    const userId = (req as any).user._id;

    // 같은 카테고리로 생성된 모든 퀴즈 찾기
    const quizzes = await Quiz.find({
      category: normalizedCategory,
      createdBy: userId,
      isActive: true
    }).sort({ createdAt: 1 }); // 가장 오래된 것부터

    if (quizzes.length <= 1) {
      return res.status(200).json({
        success: true,
        message: '합칠 퀴즈가 없습니다.',
        data: { merged: false, quizCount: quizzes.length }
      });
    }

    // 첫 번째 퀴즈를 기준으로 합치기
    const baseQuiz = quizzes[0];
    const otherQuizzes = quizzes.slice(1);

    // 모든 문제를 첫 번째 퀴즈에 추가
    for (const quiz of otherQuizzes) {
      baseQuiz.questions.push(...quiz.questions);
      if (quiz.tags && Array.isArray(quiz.tags)) {
        baseQuiz.tags = [...new Set([...baseQuiz.tags, ...quiz.tags])];
      }
    }

    // 제목과 설명 업데이트
    baseQuiz.title = `${normalizedCategory} 관련 문제 세트`;
    baseQuiz.description = `${baseQuiz.questions.length}개의 문제가 포함된 세트입니다.`;

    await baseQuiz.save();

    // 나머지 퀴즈들 비활성화
    const otherQuizIds = otherQuizzes.map(q => q._id);
    await Quiz.updateMany(
      { _id: { $in: otherQuizIds } },
      { isActive: false }
    );

    logInfo('퀴즈 합치기 완료', { category: normalizedCategory, mergedCount: quizzes.length });

    res.status(200).json({
      success: true,
      message: `${quizzes.length}개의 퀴즈가 하나로 합쳐졌습니다.`,
      data: {
        merged: true,
        baseQuizId: baseQuiz._id,
        mergedQuizIds: otherQuizIds,
        totalQuestions: baseQuiz.questions.length,
        quizCount: quizzes.length
      }
    });
  } catch (error: any) {
    logError('퀴즈 합치기 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || '퀴즈 합치기 중 오류가 발생했습니다.'
    });
  }
});

export default router;
