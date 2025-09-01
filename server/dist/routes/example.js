"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Class_1 = require("../models/Class");
const router = express_1.default.Router();
router.post('/classes', auth_1.auth, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin') {
            return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
        }
        const { name, center, instructor, course, level, maxStudents, schedule, startDate, endDate, description } = req.body;
        if (!name || !center || !instructor || !course || !level || !maxStudents || !schedule?.dayOfWeek || !schedule?.startTime || !schedule?.endTime || !startDate || !endDate) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const cls = new Class_1.Class({
            name,
            center,
            instructor,
            course,
            level,
            maxStudents,
            schedule,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            description: description || '',
        });
        await cls.save();
        return res.status(201).json({ message: '반이 생성되었습니다.', class: cls });
    }
    catch (error) {
        console.error('반 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/classes/:id/enroll', auth_1.auth, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin') {
            return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
        }
        const { studentId } = req.body;
        const cls = await Class_1.Class.findById(req.params.id);
        if (!cls)
            return res.status(404).json({ error: '반을 찾을 수 없습니다.' });
        const exists = cls.students.some(s => s.student?.toString() === studentId);
        if (!exists) {
            cls.students.push({ student: studentId, status: 'active', enrolledAt: new Date() });
            cls.currentStudents = (cls.currentStudents || 0) + 1;
            await cls.save();
        }
        return res.json({ message: '학생이 반에 등록되었습니다.', class: cls });
    }
    catch (error) {
        console.error('반 학생 등록 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=example.js.map