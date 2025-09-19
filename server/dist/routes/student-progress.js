"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/class/:classId', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor', 'centerAdmin']), async (req, res) => {
    try {
        const { classId } = req.params;
        const mockProgress = [
            {
                _id: 'progress1',
                studentId: 'student1',
                studentName: '김학생',
                checklistId: 'checklist1',
                completedItems: ['item1'],
                totalItems: 3,
                progressPercentage: 33,
                lastUpdated: new Date()
            },
            {
                _id: 'progress2',
                studentId: 'student2',
                studentName: '이학생',
                checklistId: 'checklist1',
                completedItems: ['item1', 'item2'],
                totalItems: 3,
                progressPercentage: 67,
                lastUpdated: new Date()
            }
        ];
        (0, logger_1.logInfo)('학생 진행도 조회', { classId, studentCount: mockProgress.length });
        res.json({
            success: true,
            data: mockProgress
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