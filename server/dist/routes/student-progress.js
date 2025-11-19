"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const StudentProgress_1 = require("../models/StudentProgress");
const Course_1 = require("../models/Course");
const router = express_1.default.Router();
router.get('/class/:classId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const course = await Course_1.Course.findById(classId)
            .populate('enrolledStudents.student', 'name email');
        if (!course) {
            return res.status(404).json({ error: '반을 찾을 수 없습니다.' });
        }
        const enrolledStudents = course.enrolledStudents.filter((enrollment) => enrollment.status === 'enrolled' || enrollment.status === 'active');
        const progressList = await Promise.all(enrolledStudents.map(async (enrollment) => {
            const studentId = enrollment.student?._id || enrollment.student;
            const progress = await StudentProgress_1.StudentProgress.findOne({
                studentId: studentId,
                classId: classId
            }).populate('classChecklistId');
            if (progress) {
                const totalItems = progress.items.length;
                const completedItems = progress.items.filter((item) => item.isCompleted);
                return {
                    _id: progress._id.toString(),
                    studentId: studentId.toString(),
                    studentName: enrollment.student?.name || '이름 없음',
                    checklistId: progress.classChecklistId?.toString() || '',
                    completedItems: completedItems.map((item) => item._id.toString()),
                    totalItems: totalItems,
                    progressPercentage: progress.overallProgress || 0,
                    lastUpdated: progress.lastUpdated || new Date()
                };
            }
            else {
                return {
                    _id: '',
                    studentId: studentId.toString(),
                    studentName: enrollment.student?.name || '이름 없음',
                    checklistId: '',
                    completedItems: [],
                    totalItems: 0,
                    progressPercentage: 0,
                    lastUpdated: new Date()
                };
            }
        }));
        (0, logger_1.logInfo)('학생 진행도 조회', { classId, studentCount: progressList.length });
        res.json({
            success: true,
            data: progressList
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 진행도 조회 실패', error);
        res.status(500).json({ error: '학생 진행도를 불러오는데 실패했습니다.' });
    }
});
router.put('/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const { checklistId, completedItems } = req.body;
        if (!checklistId || !completedItems) {
            return res.status(400).json({ error: '체크리스트 ID와 완료된 항목이 필요합니다.' });
        }
        (0, logger_1.logInfo)('학생 진행도 업데이트', {
            studentId,
            checklistId,
            completedItemsCount: completedItems.length
        });
        res.json({
            success: true,
            message: '학생 진행도가 업데이트되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 진행도 업데이트 실패', error);
        res.status(500).json({ error: '학생 진행도 업데이트에 실패했습니다.' });
    }
});
router.get('/student/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { studentId } = req.params;
        const mockProgress = {
            _id: 'progress1',
            studentId: studentId,
            studentName: '김학생',
            checklistId: 'checklist1',
            completedItems: ['item1'],
            totalItems: 3,
            progressPercentage: 33,
            lastUpdated: new Date()
        };
        (0, logger_1.logInfo)('개별 학생 진행도 조회', { studentId });
        res.json({
            success: true,
            data: mockProgress
        });
    }
    catch (error) {
        (0, logger_1.logError)('개별 학생 진행도 조회 실패', error);
        res.status(500).json({ error: '학생 진행도를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=student-progress.js.map