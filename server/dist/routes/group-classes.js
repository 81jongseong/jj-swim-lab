"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const GroupClass_1 = __importDefault(require("../models/GroupClass"));
const User_1 = require("../models/User");
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const currentUser = req.user;
        if (!['center_admin', 'instructor', 'admin'].includes(currentUser.userType)) {
            return res.status(403).json({
                success: false,
                message: '단체반 생성 권한이 없습니다.'
            });
        }
        const groupClass = new GroupClass_1.default({
            ...req.body,
            createdBy: currentUser._id
        });
        await groupClass.save();
        res.status(201).json({
            success: true,
            message: '단체반이 성공적으로 생성되었습니다.',
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 생성 오류:', error);
        next(error);
    }
});
router.get('/', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const currentUser = req.user;
        const { centerId, instructorId, status, level, page = 1, limit = 10 } = req.query;
        const query = {};
        if (currentUser.userType === 'center_admin' && currentUser.centerId) {
            query.centerId = currentUser.centerId;
        }
        else if (centerId) {
            query.centerId = centerId;
        }
        if (currentUser.userType === 'instructor') {
            query.instructorId = currentUser._id;
        }
        else if (instructorId) {
            query.instructorId = instructorId;
        }
        if (status) {
            query.status = status;
        }
        if (level) {
            query.level = level;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [groupClasses, total] = await Promise.all([
            GroupClass_1.default.find(query)
                .populate('centerId', 'name')
                .populate('instructorId', 'name email')
                .populate('students.userId', 'name email')
                .populate('programId', 'title')
                .sort({ 'period.startDate': -1 })
                .skip(skip)
                .limit(Number(limit)),
            GroupClass_1.default.countDocuments(query)
        ]);
        res.json({
            success: true,
            data: {
                groupClasses,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 목록 조회 오류:', error);
        next(error);
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const groupClass = await GroupClass_1.default.findById(id)
            .populate('centerId', 'name address')
            .populate('instructorId', 'name email phone')
            .populate('students.userId', 'name email phone')
            .populate('programId')
            .populate('createdBy', 'name');
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 조회 오류:', error);
        next(error);
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const groupClass = await GroupClass_1.default.findById(id);
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        if (currentUser.userType !== 'admin' &&
            groupClass.instructorId.toString() !== currentUser._id &&
            (currentUser.userType === 'center_admin' && groupClass.centerId.toString() !== currentUser.centerId)) {
            return res.status(403).json({
                success: false,
                message: '단체반 수정 권한이 없습니다.'
            });
        }
        delete req.body.students;
        delete req.body.createdBy;
        Object.assign(groupClass, req.body);
        await groupClass.save();
        res.json({
            success: true,
            message: '단체반 정보가 수정되었습니다.',
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 수정 오류:', error);
        next(error);
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const groupClass = await GroupClass_1.default.findById(id);
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        if (currentUser.userType !== 'admin' &&
            (currentUser.userType === 'center_admin' && groupClass.centerId.toString() !== currentUser.centerId)) {
            return res.status(403).json({
                success: false,
                message: '단체반 삭제 권한이 없습니다.'
            });
        }
        await GroupClass_1.default.findByIdAndDelete(id);
        res.json({
            success: true,
            message: '단체반이 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 삭제 오류:', error);
        next(error);
    }
});
router.post('/:id/students', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId가 필요합니다.'
            });
        }
        const groupClass = await GroupClass_1.default.findById(id);
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        const student = await User_1.User.findById(userId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: '학생을 찾을 수 없습니다.'
            });
        }
        await groupClass.addStudent(new mongoose_1.default.Types.ObjectId(userId));
        res.json({
            success: true,
            message: '학생이 추가되었습니다.',
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 추가 오류:', error);
        if (error.message === 'Class is full' || error.message === 'Student already enrolled') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
});
router.delete('/:id/students/:studentId', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id, studentId } = req.params;
        const groupClass = await GroupClass_1.default.findById(id);
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        await groupClass.removeStudent(new mongoose_1.default.Types.ObjectId(studentId));
        res.json({
            success: true,
            message: '학생이 제거되었습니다.',
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 제거 오류:', error);
        if (error.message === 'Student not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
});
router.put('/:id/students/:studentId/status', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id, studentId } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'completed', 'dropped'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태입니다.'
            });
        }
        const groupClass = await GroupClass_1.default.findById(id);
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        await groupClass.updateStudentStatus(new mongoose_1.default.Types.ObjectId(studentId), status);
        res.json({
            success: true,
            message: '학생 상태가 변경되었습니다.',
            data: groupClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('학생 상태 변경 오류:', error);
        if (error.message === 'Student not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
});
router.get('/:id/completion-rates', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const groupClass = await GroupClass_1.default.findById(id)
            .populate('students.userId', 'name email')
            .populate('programId');
        if (!groupClass) {
            return res.status(404).json({
                success: false,
                message: '단체반을 찾을 수 없습니다.'
            });
        }
        const completionRates = [];
        if (groupClass.programId) {
            for (const student of groupClass.students) {
                const program = await SwimProgram_1.default.findById(groupClass.programId)
                    .where('athleteId').equals(student.userId);
                if (program) {
                    const totalSessions = program.content.sessions.length;
                    const completedSessions = program.content.sessions.filter((s) => s.completion && s.completion.completionRate !== undefined).length;
                    const avgCompletionRate = completedSessions > 0
                        ? program.content.sessions
                            .filter((s) => s.completion && s.completion.completionRate !== undefined)
                            .reduce((sum, s) => sum + s.completion.completionRate, 0) / completedSessions
                        : 0;
                    completionRates.push({
                        studentId: student.userId._id,
                        studentName: student.userId.name,
                        totalSessions,
                        completedSessions,
                        avgCompletionRate: Math.round(avgCompletionRate)
                    });
                }
            }
        }
        const overallAvgCompletionRate = completionRates.length > 0
            ? completionRates.reduce((sum, s) => sum + s.avgCompletionRate, 0) / completionRates.length
            : 0;
        res.json({
            success: true,
            data: {
                groupClass: {
                    _id: groupClass._id,
                    className: groupClass.className,
                    level: groupClass.level
                },
                completionRates,
                overallAvgCompletionRate: Math.round(overallAvgCompletionRate)
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('완료율 조회 오류:', error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=group-classes.js.map