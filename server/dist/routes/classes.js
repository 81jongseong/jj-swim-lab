"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
        }
        const mockClasses = [
            {
                _id: 'class1',
                name: '초급반 A',
                level: '초급',
                type: 'group',
                instructor: userId,
                maxStudents: 8,
                currentStudents: 6,
                schedule: '월,수,금 18:00-19:00',
                centerId: 'center001'
            },
            {
                _id: 'class2',
                name: '중급반 B',
                level: '중급',
                type: 'group',
                instructor: userId,
                maxStudents: 6,
                currentStudents: 4,
                schedule: '화,목 19:00-20:00',
                centerId: 'center001'
            },
            {
                _id: 'class3',
                name: '개인레슨 - 김학생',
                level: '초급',
                type: 'individual',
                instructor: userId,
                maxStudents: 1,
                currentStudents: 1,
                schedule: '토 14:00-15:00',
                centerId: 'center001'
            }
        ];
        (0, logger_1.logInfo)('반 목록 조회', { userId, classCount: mockClasses.length });
        res.json({
            success: true,
            data: mockClasses
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 목록 조회 실패', error);
        res.status(500).json({ error: '반 목록을 불러오는데 실패했습니다.' });
    }
});
router.get('/:classId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const mockClass = {
            _id: classId,
            name: '초급반 A',
            level: '초급',
            type: 'group',
            instructor: req.user?._id,
            maxStudents: 8,
            currentStudents: 6,
            schedule: '월,수,금 18:00-19:00',
            centerId: 'center001',
            students: [
                { _id: 'student1', name: '김학생', email: 'kim@example.com' },
                { _id: 'student2', name: '이학생', email: 'lee@example.com' }
            ]
        };
        (0, logger_1.logInfo)('반 상세 정보 조회', { classId });
        res.json({
            success: true,
            data: mockClass
        });
    }
    catch (error) {
        (0, logger_1.logError)('반 상세 정보 조회 실패', error);
        res.status(500).json({ error: '반 정보를 불러오는데 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=classes.js.map