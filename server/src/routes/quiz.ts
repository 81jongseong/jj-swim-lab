import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';

interface AuthenticatedRequest extends express.Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

const router: express.Router = express.Router();

// 모든 퀴즈 조회 (권한에 따라 필터링)
router.get('/', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = { isActive: true };

    // 권한에 따른 필터링
    if (req.user?.userType === 'student') {
      // 학생은 자신에게 할당된 퀴즈만 볼 수 있음
      query.assignedTo = req.user._id;
    } else if (req.user?.userType === 'instructor') {
      // 강사는 자신이 만든 퀴즈와 센터 퀴즈만 볼 수 있음
      query.$or = [
        { createdBy: req.user._id },
        { centerId: req.user.centerId }
      ];
    } else if (req.user?.userType === 'centerAdmin') {
      // 센터 관리자는 자신의 센터 퀴즈만 볼 수 있음
      query.centerId = req.user.centerId;
    }
    // superAdmin은 모든 퀴즈를 볼 수 있음

    // 필터링
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search as string };
    }

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      message: '퀴즈 목록 조회 성공!',
      data: quizzes,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('퀴즈 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 목록 조회에 실패했습니다.'
    });
  }
});

// 퀴즈 시도 기록 조회
router.get('/attempts/user', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { page = 1, limit = 10, quizId, passed } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    let query: any = { userId: req.user._id };

    // 필터링
    if (quizId) query.quizId = quizId;
    if (passed !== undefined) query.passed = passed === 'true';

    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'title category')
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await QuizAttempt.countDocuments(query);

    res.json({
      success: true,
      message: '퀴즈 시도 기록 조회 성공!',
      data: attempts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('퀴즈 시도 기록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 시도 기록 조회에 실패했습니다.'
    });
  }
});

// 특정 퀴즈 조회
router.get('/:id', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user?.userType === 'student' && !quiz.assignedTo?.some(user => user._id.toString() === req.user?._id.toString())) {
      return res.status(403).json({
        success: false,
        message: '이 퀴즈에 접근할 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '퀴즈 조회 성공!',
      data: quiz
    });
  } catch (error) {
    console.error('퀴즈 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 조회에 실패했습니다.'
    });
  }
});

// 새 퀴즈 생성 (강사, 센터 관리자, 슈퍼 관리자만)
router.post('/', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const {
      title,
      description,
      category,
      difficulty,
      type,
      questions,
      timeLimit,
      passingScore,
      maxAttempts,
      tags,
      assignedTo
    } = req.body;

    // 필수 필드 검증
    if (!title || !description || !category || !type || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }

    // 문제 유형별 검증
    for (const question of questions) {
      if (question.type === 'multiple-choice') {
        if (!question.options || question.options.length !== 4) {
          return res.status(400).json({
            success: false,
            message: '4지선다 문제는 정확히 4개의 선택지를 가져야 합니다.'
          });
        }
        if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= 4) {
          return res.status(400).json({
            success: false,
            message: '4지선다 문제의 정답은 0-3 사이의 인덱스여야 합니다.'
          });
        }
      } else if (question.type === 'essay') {
        if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
          return res.status(400).json({
            success: false,
            message: '주관식 문제의 정답을 입력해주세요.'
          });
        }
      }
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty: difficulty || 'beginner',
      type,
      questions,
      timeLimit,
      passingScore: passingScore || 70,
      maxAttempts: maxAttempts || 3,
      tags: tags || [],
      createdBy: req.user._id,
      assignedTo: assignedTo || []
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: '퀴즈가 성공적으로 생성되었습니다!',
      data: quiz
    });
  } catch (error) {
    console.error('퀴즈 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 생성에 실패했습니다.'
    });
  }
});

// 퀴즈 수정 (생성자 또는 슈퍼 관리자만)
router.put('/:id', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user.userType !== 'superAdmin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '이 퀴즈를 수정할 권한이 없습니다.'
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: '퀴즈가 성공적으로 수정되었습니다!',
      data: updatedQuiz
    });
  } catch (error) {
    console.error('퀴즈 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 수정에 실패했습니다.'
    });
  }
});

// 퀴즈 삭제 (생성자 또는 슈퍼 관리자만)
router.delete('/:id', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: '퀴즈를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user.userType !== 'superAdmin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '이 퀴즈를 삭제할 권한이 없습니다.'
      });
    }

    // 소프트 삭제
    quiz.isActive = false;
    await quiz.save();

    res.json({
      success: true,
      message: '퀴즈가 성공적으로 삭제되었습니다!'
    });
  } catch (error) {
    console.error('퀴즈 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 삭제에 실패했습니다.'
    });
  }
});

// 퀴즈 통계
router.get('/stats/overview', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    let query: any = {};

    // 권한에 따른 필터링
    if (req.user.userType === 'instructor') {
      query.createdBy = req.user._id;
    } else if (req.user.userType === 'centerAdmin') {
      query.centerId = req.user.centerId;
    }

    const stats = await Quiz.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          activeQuizzes: { $sum: { $cond: ['$isActive', 1, 0] } },
          multipleChoiceQuizzes: { $sum: { $cond: [{ $eq: ['$type', 'multiple-choice'] }, 1, 0] } },
          essayQuizzes: { $sum: { $cond: [{ $eq: ['$type', 'essay'] }, 1, 0] } },
          avgQuestions: { $avg: { $size: '$questions' } },
          avgTimeLimit: { $avg: '$timeLimit' }
        }
      }
    ]);

    const categoryStats = await Quiz.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const difficultyStats = await Quiz.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      message: '퀴즈 통계 조회 성공!',
      data: {
        overview: stats[0] || {
          totalQuizzes: 0,
          activeQuizzes: 0,
          multipleChoiceQuizzes: 0,
          essayQuizzes: 0,
          avgQuestions: 0,
          avgTimeLimit: 0
        },
        categoryStats,
        difficultyStats
      }
    });
  } catch (error) {
    console.error('퀴즈 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 통계 조회에 실패했습니다.'
    });
  }
});

// 퀴즈 복사
router.post('/:id/copy', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: '사용자 인증이 필요합니다.'
      });
    }

    const originalQuiz = await Quiz.findById(req.params.id);

    if (!originalQuiz) {
      return res.status(404).json({
        success: false,
        message: '원본 퀴즈를 찾을 수 없습니다.'
      });
    }

    const copiedQuiz = new Quiz({
      ...originalQuiz.toObject(),
      _id: undefined,
      title: `${originalQuiz.title} (복사본)`,
      createdBy: req.user._id,
      assignedTo: [],
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await copiedQuiz.save();

    res.status(201).json({
      success: true,
      message: '퀴즈가 성공적으로 복사되었습니다!',
      data: copiedQuiz
    });
  } catch (error) {
    console.error('퀴즈 복사 실패:', error);
    res.status(500).json({
      success: false,
      message: '퀴즈 복사에 실패했습니다.'
    });
  }
});

export default router; 