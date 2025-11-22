"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const auth_1 = require("../middleware/auth");
const Progress_1 = require("../models/Progress");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Evaluation_1 = require("../models/Evaluation");
const Payment_1 = require("../models/Payment");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = express.Router();
router.get('/instructor/:instructorId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user._id.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: '자신의 학생 진도만 조회할 수 있습니다.'
            });
        }
        const progress = await Progress_1.Progress.find({ instructor: instructorId })
            .populate('student', 'name email')
            .populate('course', 'name description level')
            .sort({ updatedAt: -1 });
        res.json({
            success: true,
            message: '강사별 학생 진도 현황 조회 성공!',
            data: progress
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 진도 현황 조회 오류', error);
        res.status(500).json({ error: '진도 현황 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/checklist', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user._id.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: '자신의 학생 체크리스트만 조회할 수 있습니다.'
            });
        }
        const checklists = await Progress_1.Progress.find({
            instructor: instructorId,
            type: 'checklist'
        })
            .populate('student', 'name email')
            .populate('course', 'name')
            .sort({ dueDate: 1 });
        res.json({
            success: true,
            message: '강사별 학생 체크리스트 현황 조회 성공!',
            data: checklists
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 체크리스트 현황 조회 오류', error);
        res.status(500).json({ error: '체크리스트 현황 조회에 실패했습니다.' });
    }
});
router.put('/student/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, skills, notes, nextGoals, completedLessons } = req.body;
        const student = await User_1.User.findOne({
            _id: studentId,
            userType: 'student',
            'studentInfo.enrolledCourses': {
                $in: await Course_1.Course.find({ instructor: req.user._id }).select('_id')
            }
        });
        if (!student) {
            return res.status(403).json({
                success: false,
                message: '해당 학생을 담당하지 않습니다.'
            });
        }
        let progress = await Progress_1.Progress.findOne({
            student: studentId,
            course: courseId
        });
        if (!progress) {
            progress = new Progress_1.Progress({
                student: studentId,
                course: courseId,
                instructor: req.user._id
            });
        }
        if (skills)
            progress.skills = skills;
        if (notes)
            progress.notes = notes;
        if (nextGoals)
            progress.nextGoals = nextGoals;
        if (completedLessons)
            progress.completedLessons = completedLessons;
        progress.updatedBy = req.user._id;
        await progress.save();
        res.json({
            success: true,
            message: '학생 진도가 성공적으로 업데이트되었습니다!',
            data: progress
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 진도 업데이트 오류', error);
        res.status(500).json({
            success: false,
            message: '학생 진도 업데이트에 실패했습니다.'
        });
    }
});
router.post('/checklist/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, checklistItems, dueDate, priority } = req.body;
        const student = await User_1.User.findOne({
            _id: studentId,
            userType: 'student',
            'studentInfo.enrolledCourses': {
                $in: await Course_1.Course.find({ instructor: req.user._id }).select('_id')
            }
        });
        if (!student) {
            return res.status(403).json({
                success: false,
                message: '해당 학생을 담당하지 않습니다.'
            });
        }
        const checklist = new Progress_1.Progress({
            student: studentId,
            course: courseId,
            instructor: req.user._id,
            type: 'checklist',
            checklistItems: checklistItems || [],
            dueDate: dueDate ? new Date(dueDate) : undefined,
            priority: priority || 'medium',
            status: 'pending'
        });
        await checklist.save();
        res.json({
            success: true,
            message: '체크리스트가 성공적으로 생성되었습니다!',
            data: checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 생성 오류', error);
        res.status(500).json({
            success: false,
            message: '체크리스트 생성에 실패했습니다.'
        });
    }
});
router.post('/evaluation/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId, skills, attitude, comments } = req.body;
        const student = await User_1.User.findOne({
            _id: studentId,
            userType: 'student',
            'studentInfo.enrolledCourses': {
                $in: await Course_1.Course.find({ instructor: req.user._id }).select('_id')
            }
        });
        if (!student) {
            return res.status(403).json({
                success: false,
                message: '해당 학생을 담당하지 않습니다.'
            });
        }
        let evaluation = await Evaluation_1.Evaluation.findOne({
            student: studentId,
            course: courseId,
            instructor: req.user._id
        });
        if (!evaluation) {
            evaluation = new Evaluation_1.Evaluation({
                student: studentId,
                course: courseId,
                instructor: req.user._id
            });
        }
        if (skills)
            evaluation.skills = skills;
        if (attitude)
            evaluation.attitude = attitude;
        if (comments)
            evaluation.comments = comments;
        await evaluation.save();
        res.json({
            success: true,
            message: '학생 평가가 성공적으로 저장되었습니다!',
            data: evaluation
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 평가 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '학생 평가 저장에 실패했습니다.'
        });
    }
});
router.get('/instructor/:instructorId/stats', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user._id.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: '자신의 통계만 조회할 수 있습니다.'
            });
        }
        const recentProgress = await Progress_1.Progress.find({
            instructor: instructorId,
            updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).countDocuments();
        const checklists = await Progress_1.Progress.find({
            instructor: instructorId,
            type: 'checklist'
        }).countDocuments();
        const paymentStats = await Payment_1.Payment.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId) } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const evaluationStats = await Evaluation_1.Evaluation.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId) } },
            { $group: { _id: null, avgGrade: { $avg: '$overallRating' }, count: { $sum: 1 } } }
        ]);
        const progressStats = await Progress_1.Progress.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId) } },
            { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } }
        ]);
        res.json({
            success: true,
            message: '강사별 통계 조회 성공!',
            data: {
                recentProgress,
                checklists,
                paymentStats: paymentStats[0] || { total: 0, count: 0 },
                evaluationStats: evaluationStats[0] || { avgGrade: 0, count: 0 },
                progressStats: progressStats[0] || { total: 0, completed: 0 }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 통계 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
});
router.get('/schedule-optimization', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const scheduleAnalysis = {
            currentSchedule: {
                totalHours: 40,
                peakHours: 25,
                offPeakHours: 15,
                utilization: 85
            },
            optimization: {
                suggestedPeakHours: 30,
                suggestedOffPeakHours: 10,
                potentialEarningsIncrease: '25%',
                workLifeBalance: '개선됨'
            },
            recommendations: [
                '피크 타임 강습 참여 증가로 수익 극대화',
                '오프 피크 타임에 개인 강습 및 기술 연마',
                '주말 특별 프로그램 참여로 추가 수입 창출',
                '정기 휴식으로 지속 가능한 강습 품질 유지'
            ]
        };
        res.json({
            success: true,
            message: '강사 스케줄 최적화 분석 조회 성공!',
            data: scheduleAnalysis
        });
    }
    catch (error) {
        (0, logger_1.logError)('스케줄 최적화 분석 오류', error);
        res.status(500).json({
            success: false,
            message: '스케줄 최적화 분석에 실패했습니다.'
        });
    }
});
router.get('/my-progress', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const progress = await Progress_1.Progress.find({ student: req.user._id })
            .populate('course', 'name description level')
            .populate('instructor', 'name')
            .sort({ updatedAt: -1 });
        const evaluations = await Evaluation_1.Evaluation.find({ student: req.user._id })
            .populate('course', 'name')
            .populate('instructor', 'name')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            message: '진도 현황 조회 성공!',
            data: {
                progress,
                evaluations
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('진도 현황 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '진도 현황 조회에 실패했습니다.'
        });
    }
});
router.get('/my-checklist', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const checklists = await Progress_1.Progress.find({
            student: req.user._id,
            type: 'checklist'
        })
            .populate('course', 'name')
            .populate('instructor', 'name')
            .sort({ dueDate: 1 });
        res.json({
            success: true,
            message: '체크리스트 조회 성공!',
            data: checklists
        });
    }
    catch (error) {
        (0, logger_1.logError)('체크리스트 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '체크리스트 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=progress.js.map