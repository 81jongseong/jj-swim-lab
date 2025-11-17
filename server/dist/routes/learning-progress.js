"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const LearningProgress_1 = require("../models/LearningProgress");
const TeachingMethod_1 = require("../models/TeachingMethod");
const User_1 = require("../models/User");
const Booking_1 = require("../models/Booking");
const Course_1 = require("../models/Course");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { category, level, status } = req.query;
        const query = { studentId };
        if (category && category !== 'all') {
            const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ category });
            const methodIds = teachingMethods.map(m => m._id);
            query.teachingMethodId = { $in: methodIds };
        }
        if (level && level !== 'all') {
            const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ level });
            const methodIds = teachingMethods.map(m => m._id);
            if (query.teachingMethodId) {
                query.teachingMethodId = { $in: query.teachingMethodId.$in.filter((id) => methodIds.includes(id)) };
            }
            else {
                query.teachingMethodId = { $in: methodIds };
            }
        }
        if (status === 'completed') {
            query.progress = 100;
        }
        else if (status === 'in_progress') {
            query.progress = { $gt: 0, $lt: 100 };
        }
        else if (status === 'not_started') {
            query.progress = 0;
        }
        const progressData = await LearningProgress_1.LearningProgress.find(query)
            .populate('teachingMethodId', 'name description category level steps tips')
            .sort({ updatedAt: -1 });
        res.json({
            success: true,
            data: progressData
        });
    }
    catch (error) {
        console.error('❌ 학습 진도 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학습 진도 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:teachingMethodId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { teachingMethodId } = req.params;
        const progress = await LearningProgress_1.LearningProgress.findOne({
            studentId,
            teachingMethodId
        }).populate('teachingMethodId', 'name description category level steps tips');
        if (!progress) {
            const teachingMethod = await TeachingMethod_1.TeachingMethod.findById(teachingMethodId);
            if (!teachingMethod) {
                return res.status(404).json({
                    success: false,
                    message: '강습법을 찾을 수 없습니다.'
                });
            }
            const newProgress = new LearningProgress_1.LearningProgress({
                studentId,
                teachingMethodId,
                completedSteps: [],
                totalSteps: teachingMethod.steps.length,
                progress: 0,
                lastStudied: new Date()
            });
            await newProgress.save();
            await newProgress.populate('teachingMethodId', 'name description category level steps tips');
            return res.json({
                success: true,
                data: newProgress
            });
        }
        res.json({
            success: true,
            data: progress
        });
    }
    catch (error) {
        console.error('❌ 강습법 진도 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습법 진도 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:teachingMethodId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { teachingMethodId } = req.params;
        const { completedSteps, notes, rating, studyTime } = req.body;
        const teachingMethod = await TeachingMethod_1.TeachingMethod.findById(teachingMethodId);
        if (!teachingMethod) {
            return res.status(404).json({
                success: false,
                message: '강습법을 찾을 수 없습니다.'
            });
        }
        let progress = await LearningProgress_1.LearningProgress.findOne({
            studentId,
            teachingMethodId
        });
        if (!progress) {
            progress = new LearningProgress_1.LearningProgress({
                studentId,
                teachingMethodId,
                completedSteps: completedSteps || [],
                totalSteps: teachingMethod.steps.length,
                progress: 0,
                lastStudied: new Date()
            });
        }
        else {
            progress.completedSteps = completedSteps || progress.completedSteps;
            progress.lastStudied = new Date();
        }
        if (notes !== undefined)
            progress.notes = notes;
        if (rating !== undefined)
            progress.rating = rating;
        if (studyTime !== undefined)
            progress.studyTime += studyTime;
        await progress.save();
        await progress.populate('teachingMethodId', 'name description category level steps tips');
        res.json({
            success: true,
            data: progress
        });
    }
    catch (error) {
        console.error('❌ 학습 진도 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '학습 진도 업데이트 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const stats = await LearningProgress_1.LearningProgress.aggregate([
            { $match: { studentId: new mongoose_1.default.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    totalMethods: { $sum: 1 },
                    completedMethods: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } },
                    inProgressMethods: { $sum: { $cond: [{ $and: [{ $gt: ['$progress', 0] }, { $lt: ['$progress', 100] }] }, 1, 0] } },
                    averageProgress: { $avg: '$progress' },
                    totalStudyTime: { $sum: '$studyTime' }
                }
            }
        ]);
        const result = stats[0] || {
            totalMethods: 0,
            completedMethods: 0,
            inProgressMethods: 0,
            averageProgress: 0,
            totalStudyTime: 0
        };
        const recentProgress = await LearningProgress_1.LearningProgress.find({
            studentId,
            lastStudied: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ lastStudied: -1 });
        let studyStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const hasStudyOnDate = recentProgress.some(p => {
                const studyDate = new Date(p.lastStudied);
                studyDate.setHours(0, 0, 0, 0);
                return studyDate.getTime() === checkDate.getTime();
            });
            if (hasStudyOnDate) {
                studyStreak++;
            }
            else {
                break;
            }
        }
        res.json({
            success: true,
            data: {
                ...result,
                studyStreak,
                averageProgress: Math.round(result.averageProgress * 100) / 100
            }
        });
    }
    catch (error) {
        console.error('❌ 학습 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학습 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/by-category', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const categoryStats = await LearningProgress_1.LearningProgress.aggregate([
            { $match: { studentId: new mongoose_1.default.Types.ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'teachingmethods',
                    localField: 'teachingMethodId',
                    foreignField: '_id',
                    as: 'teachingMethod'
                }
            },
            { $unwind: '$teachingMethod' },
            {
                $group: {
                    _id: '$teachingMethod.category',
                    totalMethods: { $sum: 1 },
                    completedMethods: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } },
                    averageProgress: { $avg: '$progress' },
                    totalStudyTime: { $sum: '$studyTime' }
                }
            },
            { $sort: { averageProgress: -1 } }
        ]);
        res.json({
            success: true,
            data: categoryStats
        });
    }
    catch (error) {
        console.error('❌ 카테고리별 진도 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '카테고리별 진도 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor/students', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const instructorId = req.user.id;
        const { studentId, category, level } = req.query;
        const instructorObjectId = mongoose_1.default.Types.ObjectId.isValid(instructorId)
            ? new mongoose_1.default.Types.ObjectId(instructorId)
            : null;
        const studentMatchConditions = [
            { 'instructorInfo.assignedInstructor': instructorId },
            { 'studentInfo.instructorId': instructorId },
            { 'studentInfo.assignedInstructor': instructorId },
            { 'studentInfo.assignedInstructors': instructorId },
            { 'studentInfo.assignedInstructors.instructor': instructorId },
            { 'studentInfo.assignedInstructors.instructorId': instructorId },
            { assignedInstructor: instructorId }
        ];
        if (instructorObjectId) {
            studentMatchConditions.push({ 'instructorInfo.assignedInstructor': instructorObjectId }, { 'studentInfo.instructorId': instructorObjectId }, { 'studentInfo.assignedInstructor': instructorObjectId }, { 'studentInfo.assignedInstructors': instructorObjectId }, { 'studentInfo.assignedInstructors.instructor': instructorObjectId }, { 'studentInfo.assignedInstructors.instructorId': instructorObjectId }, { assignedInstructor: instructorObjectId });
        }
        const students = await User_1.User.find({
            userType: 'student',
            $or: studentMatchConditions
        });
        const studentDocs = [...students];
        if (instructorObjectId) {
            const additionalStudentIds = new Set();
            const bookingStudentIds = await Booking_1.Booking.distinct('studentId', {
                instructorId: instructorObjectId
            });
            bookingStudentIds
                .filter((id) => id)
                .forEach((id) => additionalStudentIds.add(id.toString()));
            const instructorCourses = await Course_1.Course.find({
                $or: [
                    { instructorId: instructorObjectId },
                    { instructor: instructorObjectId }
                ]
            })
                .select('enrolledStudents studentIds students')
                .lean();
            instructorCourses.forEach((course) => {
                const enrolled = course?.enrolledStudents || [];
                enrolled.forEach((entry) => {
                    if (entry?.student) {
                        const id = entry.student._id || entry.student;
                        if (id)
                            additionalStudentIds.add(id.toString());
                    }
                });
                const studentIds = course?.studentIds || course?.students || [];
                studentIds.forEach((id) => {
                    if (id)
                        additionalStudentIds.add(id.toString());
                });
            });
            const existingIds = new Set(studentDocs.map((doc) => doc._id.toString()));
            const missingIds = Array.from(additionalStudentIds).filter((id) => !existingIds.has(id));
            if (missingIds.length > 0) {
                const extraStudents = await User_1.User.find({
                    userType: 'student',
                    _id: { $in: missingIds }
                });
                studentDocs.push(...extraStudents);
            }
        }
        if (!studentDocs || studentDocs.length === 0) {
            console.warn('⚠️ 담당 학생 없음', {
                instructorId,
                matchConditions: studentMatchConditions
            });
        }
        if (studentId) {
            const progress = await LearningProgress_1.LearningProgress.find({ studentId })
                .populate('teachingMethodId', 'name description category level steps tips')
                .populate('studentId', 'name email');
            return res.json({
                success: true,
                data: progress
            });
        }
        const studentIds = studentDocs.map(s => s._id);
        const query = { studentId: { $in: studentIds } };
        if (category && category !== 'all') {
            const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ category });
            const methodIds = teachingMethods.map(m => m._id);
            query.teachingMethodId = { $in: methodIds };
        }
        if (level && level !== 'all') {
            const teachingMethods = await TeachingMethod_1.TeachingMethod.find({ level });
            const methodIds = teachingMethods.map(m => m._id);
            if (query.teachingMethodId) {
                query.teachingMethodId = { $in: query.teachingMethodId.$in.filter((id) => methodIds.includes(id)) };
            }
            else {
                query.teachingMethodId = { $in: methodIds };
            }
        }
        const progressData = await LearningProgress_1.LearningProgress.find(query)
            .populate('teachingMethodId', 'name description category level steps tips')
            .populate('studentId', 'name email')
            .sort({ updatedAt: -1 });
        const studentSummaries = studentDocs.map(student => ({
            _id: student._id,
            name: student.name,
            email: student.email,
            centerId: student.centerId,
            studentInfo: student.studentInfo,
            instructorInfo: student.instructorInfo
        }));
        res.json({
            success: true,
            students: studentSummaries,
            data: progressData
        });
    }
    catch (error) {
        console.error('❌ 강사용 학생 진도 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 진도 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=learning-progress.js.map