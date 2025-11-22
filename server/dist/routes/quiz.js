"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Quiz_1 = require("../models/Quiz");
const QuizAttempt_1 = require("../models/QuizAttempt");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, difficulty, type, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = { isActive: true };
        if (req.user?.userType === 'student') {
            query.assignedTo = req.user._id;
        }
        else if (req.user?.userType === 'instructor') {
            query.$or = [
                { createdBy: req.user._id },
                { centerId: req.user.centerId }
            ];
        }
        else if (req.user?.userType === 'centerAdmin') {
            query.centerId = req.user.centerId;
        }
        if (category)
            query.category = category;
        if (difficulty)
            query.difficulty = difficulty;
        if (type)
            query.type = type;
        if (search) {
            query.$text = { $search: search };
        }
        const quizzes = await Quiz_1.Quiz.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Quiz_1.Quiz.countDocuments(query);
        res.json({
            success: true,
            message: '퀴즈 목록 조회 성공!',
            data: quizzes,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 목록 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 목록 조회에 실패했습니다.'
        });
    }
});
router.get('/attempts/user', auth_1.authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, quizId, passed } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const query = { userId: req.user._id };
        if (quizId)
            query.quizId = quizId;
        if (passed !== undefined)
            query.passed = passed === 'true';
        const attempts = await QuizAttempt_1.QuizAttempt.find(query)
            .populate('quizId', 'title category')
            .populate('userId', 'name email')
            .sort({ completedAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await QuizAttempt_1.QuizAttempt.countDocuments(query);
        res.json({
            success: true,
            message: '퀴즈 시도 기록 조회 성공!',
            data: attempts,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 시도 기록 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 시도 기록 조회에 실패했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const quiz = await Quiz_1.Quiz.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }
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
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 조회에 실패했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const { title, description, category, difficulty, type, questions, timeLimit, passingScore, maxAttempts, tags, assignedTo } = req.body;
        if (!title || !description || !category || !type) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }
        const questionList = questions || [];
        for (const question of questionList) {
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
            }
            else if (question.type === 'short-answer') {
                if (!question.correctAnswer || (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0)) {
                    return res.status(400).json({
                        success: false,
                        message: '단답형 문제의 정답 키워드를 입력해주세요.'
                    });
                }
            }
        }
        const quiz = new Quiz_1.Quiz({
            title,
            description,
            category,
            difficulty: difficulty || 'beginner',
            type,
            questions: questionList,
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
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 생성 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 생성에 실패했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const quiz = await Quiz_1.Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }
        if (req.user.userType === 'superAdmin') {
            (0, logger_1.logInfo)('superAdmin 권한으로 퀴즈 수정 진행', { quizId: req.params.id });
        }
        else {
            if (!quiz.createdBy || quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '이 퀴즈를 수정할 권한이 없습니다.'
                });
            }
        }
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        if (req.body.questions && Array.isArray(req.body.questions)) {
            updateData.questions = req.body.questions;
        }
        if (req.body.metadata !== undefined) {
            updateData.metadata = req.body.metadata;
        }
        (0, logger_1.logDebug)('퀴즈 수정 데이터', {
            id: req.params.id,
            hasQuestions: !!updateData.questions,
            questionsCount: updateData.questions?.length,
            firstQuestionHasMetadata: updateData.questions?.[0]?.conceptBlock || updateData.questions?.[0]?.originalExplanation || updateData.questions?.[0]?.metadata,
            hasMetadata: !!updateData.metadata
        });
        const updatedQuiz = await Quiz_1.Quiz.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json({
            success: true,
            message: '퀴즈가 성공적으로 수정되었습니다!',
            data: updatedQuiz
        });
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 수정 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 수정에 실패했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        (0, logger_1.logInfo)('퀴즈 삭제 요청', { quizId: req.params.id, userType: req.user?.userType });
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const quiz = await Quiz_1.Quiz.findById(req.params.id);
        if (!quiz) {
            (0, logger_1.logWarn)('퀴즈를 찾을 수 없음', { quizId: req.params.id });
            return res.status(404).json({
                success: false,
                message: '퀴즈를 찾을 수 없습니다.'
            });
        }
        (0, logger_1.logDebug)('퀴즈 정보', { title: quiz.title, createdBy: quiz.createdBy, isActive: quiz.isActive });
        if (req.user.userType === 'superAdmin') {
            (0, logger_1.logInfo)('superAdmin 권한으로 퀴즈 삭제 진행', { quizId: req.params.id });
        }
        else {
            if (!quiz.createdBy || quiz.createdBy.toString() !== req.user._id.toString()) {
                (0, logger_1.logWarn)('퀴즈 삭제 권한 없음', { requesterId: req.user._id, creatorId: quiz.createdBy });
                return res.status(403).json({
                    success: false,
                    message: '이 퀴즈를 삭제할 권한이 없습니다.'
                });
            }
        }
        try {
            quiz.isActive = false;
            const savedQuiz = await quiz.save();
            (0, logger_1.logInfo)('퀴즈 소프트 삭제 완료', { quizId: savedQuiz._id, title: savedQuiz.title });
            res.json({
                success: true,
                message: '퀴즈가 성공적으로 삭제되었습니다!'
            });
        }
        catch (saveError) {
            (0, logger_1.logError)('퀴즈 저장 실패', saveError);
            throw saveError;
        }
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 삭제 실패', error);
        res.status(500).json({
            success: false,
            message: `퀴즈 삭제에 실패했습니다: ${error.message}`
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const query = {};
        if (req.user.userType === 'instructor') {
            query.createdBy = req.user._id;
        }
        else if (req.user.userType === 'centerAdmin') {
            query.centerId = req.user.centerId;
        }
        const stats = await Quiz_1.Quiz.aggregate([
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
        const categoryStats = await Quiz_1.Quiz.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const difficultyStats = await Quiz_1.Quiz.aggregate([
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
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 통계 조회 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 통계 조회에 실패했습니다.'
        });
    }
});
router.post('/:id/copy', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: '사용자 인증이 필요합니다.'
            });
        }
        const originalQuiz = await Quiz_1.Quiz.findById(req.params.id);
        if (!originalQuiz) {
            return res.status(404).json({
                success: false,
                message: '원본 퀴즈를 찾을 수 없습니다.'
            });
        }
        const copiedQuiz = new Quiz_1.Quiz({
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
    }
    catch (error) {
        (0, logger_1.logError)('퀴즈 복사 실패', error);
        res.status(500).json({
            success: false,
            message: '퀴즈 복사에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=quiz.js.map