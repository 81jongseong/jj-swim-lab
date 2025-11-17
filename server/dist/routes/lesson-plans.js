"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const LessonPlan_1 = require("../models/LessonPlan");
const TeachingMethod_1 = require("../models/TeachingMethod");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { status, date, studentId } = req.query;
        const query = { instructorId };
        if (status)
            query.status = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }
        if (studentId)
            query.students = studentId;
        const lessonPlans = await LessonPlan_1.LessonPlan.find(query)
            .populate('teachingMethods', 'name description category level')
            .populate('students', 'name email')
            .populate('centerId', 'name address')
            .sort({ date: 1, time: 1 });
        res.json({
            success: true,
            data: lessonPlans
        });
    }
    catch (error) {
        console.error('❌ 수업 계획 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 계획 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:planId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { planId } = req.params;
        const lessonPlan = await LessonPlan_1.LessonPlan.findOne({
            _id: planId,
            instructorId
        })
            .populate('teachingMethods', 'name description category level steps tips')
            .populate('students', 'name email')
            .populate('centerId', 'name address');
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: lessonPlan
        });
    }
    catch (error) {
        console.error('❌ 수업 계획 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 계획 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { title, description, teachingMethods, students, duration, date, time, location, objectives, materials, notes, centerId } = req.body;
        if (!title || !description || !duration || !date || !time || !location) {
            return res.status(400).json({
                success: false,
                message: '필수 정보를 모두 입력해주세요.'
            });
        }
        if (teachingMethods && teachingMethods.length > 0) {
            const methods = await TeachingMethod_1.TeachingMethod.find({ _id: { $in: teachingMethods } });
            if (methods.length !== teachingMethods.length) {
                return res.status(400).json({
                    success: false,
                    message: '일부 강습법을 찾을 수 없습니다.'
                });
            }
        }
        if (students && students.length > 0) {
            const studentUsers = await User_1.User.find({
                _id: { $in: students },
                userType: 'student'
            });
            if (studentUsers.length !== students.length) {
                return res.status(400).json({
                    success: false,
                    message: '일부 학생을 찾을 수 없습니다.'
                });
            }
        }
        const lessonPlan = new LessonPlan_1.LessonPlan({
            instructorId,
            centerId: centerId || req.user.centerId,
            title,
            description,
            teachingMethods: teachingMethods || [],
            students: students || [],
            duration,
            date: new Date(date),
            time,
            location,
            objectives: objectives || [],
            materials: materials || [],
            notes: notes || '',
            status: 'draft'
        });
        await lessonPlan.save();
        await lessonPlan.populate('teachingMethods', 'name description category level');
        await lessonPlan.populate('students', 'name email');
        res.status(201).json({
            success: true,
            data: lessonPlan,
            message: '수업 계획이 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 수업 계획 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 계획 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:planId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { planId } = req.params;
        const updateData = req.body;
        const lessonPlan = await LessonPlan_1.LessonPlan.findOne({
            _id: planId,
            instructorId
        });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        const allowedFields = [
            'title', 'description', 'teachingMethods', 'students',
            'duration', 'date', 'time', 'location', 'objectives',
            'materials', 'notes', 'status'
        ];
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                lessonPlan[field] = updateData[field];
            }
        }
        await lessonPlan.save();
        await lessonPlan.populate('teachingMethods', 'name description category level');
        await lessonPlan.populate('students', 'name email');
        res.json({
            success: true,
            data: lessonPlan,
            message: '수업 계획이 수정되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 수업 계획 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 계획 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:planId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { planId } = req.params;
        const lessonPlan = await LessonPlan_1.LessonPlan.findOne({
            _id: planId,
            instructorId
        });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        await LessonPlan_1.LessonPlan.findByIdAndDelete(planId);
        res.json({
            success: true,
            message: '수업 계획이 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 수업 계획 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 계획 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:planId/attendance', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { planId } = req.params;
        const { attendance } = req.body;
        const lessonPlan = await LessonPlan_1.LessonPlan.findOne({
            _id: planId,
            instructorId
        });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        lessonPlan.attendance = attendance;
        await lessonPlan.save();
        res.json({
            success: true,
            data: lessonPlan,
            message: '출석이 기록되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 출석 체크 오류:', error);
        res.status(500).json({
            success: false,
            message: '출석 체크 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:planId/feedback', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { planId } = req.params;
        const { feedback } = req.body;
        const lessonPlan = await LessonPlan_1.LessonPlan.findOne({
            _id: planId,
            instructorId
        });
        if (!lessonPlan) {
            return res.status(404).json({
                success: false,
                message: '수업 계획을 찾을 수 없습니다.'
            });
        }
        lessonPlan.feedback = feedback;
        await lessonPlan.save();
        res.json({
            success: true,
            data: lessonPlan,
            message: '피드백이 기록되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 수업 피드백 오류:', error);
        res.status(500).json({
            success: false,
            message: '수업 피드백 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/instructor', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const stats = await LessonPlan_1.LessonPlan.aggregate([
            { $match: { instructorId: new mongoose_1.default.Types.ObjectId(instructorId) } },
            {
                $group: {
                    _id: null,
                    totalPlans: { $sum: 1 },
                    completedPlans: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    scheduledPlans: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
                    draftPlans: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                    totalStudents: { $sum: { $size: '$students' } },
                    averageRating: { $avg: '$feedback.rating' }
                }
            }
        ]);
        const result = stats[0] || {
            totalPlans: 0,
            completedPlans: 0,
            scheduledPlans: 0,
            draftPlans: 0,
            totalStudents: 0,
            averageRating: 0
        };
        const assignedStudents = await User_1.User.countDocuments({
            userType: 'student',
            'instructorInfo.assignedInstructor': instructorId
        });
        res.json({
            success: true,
            data: {
                ...result,
                assignedStudents,
                averageRating: Math.round(result.averageRating * 100) / 100
            }
        });
    }
    catch (error) {
        console.error('❌ 강사 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강사 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/student/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { studentId } = req.params;
        const lessonPlans = await LessonPlan_1.LessonPlan.find({
            instructorId,
            students: studentId
        })
            .populate('teachingMethods', 'name description category level')
            .populate('students', 'name email')
            .sort({ date: 1, time: 1 });
        res.json({
            success: true,
            data: lessonPlans
        });
    }
    catch (error) {
        console.error('❌ 학생별 수업 계획 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생별 수업 계획 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=lesson-plans.js.map