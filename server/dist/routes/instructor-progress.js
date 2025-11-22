"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const auth_1 = require("../middleware/auth");
const InstructorProgress_1 = require("../models/InstructorProgress");
const Checklist_1 = require("../models/Checklist");
const StudentProgress_1 = require("../models/StudentProgress");
const ClassChecklist_1 = require("../models/ClassChecklist");
const TeachingMethod_1 = require("../models/TeachingMethod");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const aggregateLevelChecklist = async (studentId, studentLevel) => {
    const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
    const reverseLevelMap = {
        '초급': 'beginner',
        '중급': 'intermediate',
        '고급': 'advanced'
    };
    const currentLevelEnglish = reverseLevelMap[studentLevel] || 'beginner';
    const nextLevelEnglish = currentLevelEnglish === 'beginner' ? 'intermediate' :
        currentLevelEnglish === 'intermediate' ? 'advanced' : 'advanced';
    const teachingMethods = await TeachingMethod_1.TeachingMethod.find({
        isActive: true,
        level: { $in: [currentLevelEnglish, nextLevelEnglish] },
        $or: [
            { createdByRole: 'superAdmin' },
            { createdByRole: { $exists: false } },
            { createdByRole: null }
        ]
    }).sort({ order: 1, createdAt: 1 });
    const individualChecklists = await Checklist_1.Checklist.find({
        studentId: studentObjectId,
        status: { $in: ['active', 'completed'] }
    }).lean();
    const studentProgressRecords = await StudentProgress_1.StudentProgress.find({
        studentId: studentObjectId,
        status: { $in: ['active', 'completed'] }
    }).populate('classChecklistId').lean();
    const completedItemsMap = new Map();
    individualChecklists.forEach((checklist) => {
        checklist.items?.forEach((item) => {
            if (item.isCompleted && item.teachingMethodId && item.stepName) {
                const key = `${item.teachingMethodId.toString()}-${item.stepName}`;
                const existing = completedItemsMap.get(key);
                if (!existing || !existing.completedAt || (item.completedAt && new Date(item.completedAt) > new Date(existing.completedAt))) {
                    completedItemsMap.set(key, {
                        completedAt: item.completedAt ? new Date(item.completedAt) : new Date(),
                        checked: true
                    });
                }
            }
        });
    });
    for (const progress of studentProgressRecords) {
        const classChecklist = progress.classChecklistId;
        if (!classChecklist)
            continue;
        const classChecklistData = await ClassChecklist_1.ClassChecklist.findById(classChecklist._id || classChecklist).lean();
        if (!classChecklistData)
            continue;
        (progress.items || []).forEach((item) => {
            if (item.isCompleted && item.stepName) {
                const classItem = (classChecklistData.items || []).find((ci) => ci.stepName === item.stepName || ci.stepOrder === item.stepOrder);
                if (classItem && classItem.teachingMethodId) {
                    const key = `${classItem.teachingMethodId.toString()}-${item.stepName}`;
                    const existing = completedItemsMap.get(key);
                    if (!existing || !existing.completedAt || (item.completedAt && new Date(item.completedAt) > new Date(existing.completedAt))) {
                        completedItemsMap.set(key, {
                            completedAt: item.completedAt ? new Date(item.completedAt) : new Date(),
                            checked: true
                        });
                    }
                }
            }
        });
    }
    const levelChecklist = [];
    const usedSlugs = new Set();
    teachingMethods.forEach((method) => {
        const checklistItems = Array.isArray(method.checklist) ? method.checklist : [];
        checklistItems.forEach((item, index) => {
            const slug = `${method._id.toString()}-${item}-${index}`;
            if (usedSlugs.has(slug))
                return;
            usedSlugs.add(slug);
            const key = `${method._id.toString()}-${item}`;
            const completedInfo = completedItemsMap.get(key);
            const methodLevel = method.level === 'beginner' ? 'beginner' :
                method.level === 'intermediate' ? 'intermediate' :
                    method.level === 'advanced' ? 'advanced' : 'beginner';
            const category = method.category?.includes('stroke') ? 'stroke' :
                method.category?.includes('endurance') ? 'endurance' :
                    method.category?.includes('safety') ? 'safety' : 'technique';
            levelChecklist.push({
                itemId: slug,
                label: item,
                description: method.name ? `${method.name} · ${method.description || '핵심 체크포인트'}` : method.description,
                category,
                level: methodLevel,
                checked: completedInfo?.checked || false,
                checkedAt: completedInfo?.completedAt || null,
                sourceMethodId: method._id.toString(),
                sourceMethodName: method.name || null
            });
        });
    });
    return levelChecklist.slice(0, 100);
};
router.get('/student/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { studentId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
        }
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        const student = await User_1.User.findById(studentObjectId).lean();
        const studentLevel = student?.studentInfo?.currentLevel || student?.studentInfo?.swimmingLevel || '초급';
        const progress = await InstructorProgress_1.InstructorProgress.findOne({
            instructorId: new mongoose_1.Types.ObjectId(instructorId),
            studentId: studentObjectId
        }).lean();
        const levelChecklist = await aggregateLevelChecklist(studentObjectId, studentLevel);
        const result = progress ? {
            ...progress,
            levelChecklist
        } : {
            instructorId: new mongoose_1.Types.ObjectId(instructorId),
            studentId: studentObjectId,
            levelChecklist,
            sessions: [],
            notes: [],
            homework: []
        };
        res.json({ success: true, data: result });
    }
    catch (error) {
        (0, logger_1.logError)('진행 관리 조회 실패', error);
        res.status(500).json({ success: false, message: '진행 관리 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
});
router.post('/student/:studentId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user?.id;
        const { studentId } = req.params;
        const { courseName, sessions = [], notes = [], homework = [] } = req.body || {};
        if (!mongoose_1.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
        }
        const instructorObjectId = new mongoose_1.Types.ObjectId(instructorId);
        const studentObjectId = new mongoose_1.Types.ObjectId(studentId);
        const normalizedSessions = Array.isArray(sessions)
            ? sessions.map((session) => ({
                sessionId: session.sessionId,
                sessionDate: session.sessionDate ? new Date(session.sessionDate) : new Date(),
                startTime: session.startTime,
                endTime: session.endTime,
                activity: session.activity,
                location: session.location,
                sessionType: session.sessionType || 'group',
                courseName: session.courseName,
                status: session.status || 'absent'
            }))
            : [];
        const normalizedNotes = Array.isArray(notes)
            ? notes.map((note) => ({
                noteId: note.noteId,
                sessionId: note.sessionId,
                content: note.content,
                authorName: note.authorName,
                createdAt: note.createdAt ? new Date(note.createdAt) : new Date()
            }))
            : [];
        const normalizedHomework = Array.isArray(homework)
            ? homework.map((task) => ({
                taskId: task.taskId,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
                createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                completed: Boolean(task.completed),
                completedAt: task.completedAt ? new Date(task.completedAt) : null
            }))
            : [];
        const updated = await InstructorProgress_1.InstructorProgress.findOneAndUpdate({ instructorId: instructorObjectId, studentId: studentObjectId }, {
            instructorId: instructorObjectId,
            studentId: studentObjectId,
            courseName,
            sessions: normalizedSessions,
            notes: normalizedNotes,
            homework: normalizedHomework
        }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
        const student = await User_1.User.findById(studentObjectId).lean();
        const studentLevel = student?.studentInfo?.currentLevel || student?.studentInfo?.swimmingLevel || '초급';
        const aggregatedLevelChecklist = await aggregateLevelChecklist(studentObjectId, studentLevel);
        res.json({
            success: true,
            data: {
                ...updated,
                levelChecklist: aggregatedLevelChecklist
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('진행 관리 저장 실패', error);
        res.status(500).json({ success: false, message: '진행 관리 데이터를 저장하는 중 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=instructor-progress.js.map