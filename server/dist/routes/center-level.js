"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CenterLevel_1 = require("../models/CenterLevel");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const defaultLevels = [
            {
                _id: 'default-beginner',
                name: 'beginner',
                displayName: '초급',
                order: 1,
                description: '기본 동작을 익히는 단계',
                color: 'green',
                isActive: true
            },
            {
                _id: 'default-intermediate',
                name: 'intermediate',
                displayName: '중급',
                order: 2,
                description: '다양한 수영법을 배우는 단계',
                color: 'yellow',
                isActive: true
            },
            {
                _id: 'default-advanced',
                name: 'advanced',
                displayName: '상급',
                order: 3,
                description: '고급 기술을 연마하는 단계',
                color: 'red',
                isActive: true
            }
        ];
        res.json({
            success: true,
            data: defaultLevels
        });
    }
    catch (error) {
        console.error('센터 레벨 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '센터 레벨 조회에 실패했습니다.'
        });
    }
});
router.get('/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { centerId } = req.params;
        let centerLevel = await CenterLevel_1.CenterLevel.findOne({ centerId });
        if (!centerLevel) {
            centerLevel = new CenterLevel_1.CenterLevel({
                centerId,
                levels: [
                    { name: '기초', order: 1, description: '수영을 처음 배우는 단계', color: 'blue' },
                    { name: '초급', order: 2, description: '기본 동작을 익히는 단계', color: 'green' },
                    { name: '중급', order: 3, description: '다양한 수영법을 배우는 단계', color: 'yellow' },
                    { name: '상급', order: 4, description: '고급 기술을 연마하는 단계', color: 'orange' },
                    { name: '마스터', order: 5, description: '완벽한 수영 기술을 갖춘 단계', color: 'red' }
                ]
            });
            await centerLevel.save();
        }
        res.json(centerLevel);
    }
    catch (error) {
        console.error('센터 레벨 조회 실패:', error);
        res.status(500).json({ error: '센터 레벨 조회에 실패했습니다.' });
    }
});
router.put('/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { centerId } = req.params;
        const { levels } = req.body;
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }
        if (!Array.isArray(levels) || levels.length === 0) {
            return res.status(400).json({ error: '레벨 정보가 올바르지 않습니다.' });
        }
        const sortedLevels = levels.sort((a, b) => a.order - b.order);
        for (let i = 0; i < sortedLevels.length; i++) {
            if (sortedLevels[i].order !== i + 1) {
                return res.status(400).json({ error: '레벨 순서가 올바르지 않습니다.' });
            }
        }
        const centerLevel = await CenterLevel_1.CenterLevel.findOneAndUpdate({ centerId }, {
            levels: sortedLevels,
            isActive: true
        }, {
            new: true,
            upsert: true
        });
        res.json(centerLevel);
    }
    catch (error) {
        console.error('센터 레벨 업데이트 실패:', error);
        res.status(500).json({ error: '센터 레벨 업데이트에 실패했습니다.' });
    }
});
router.delete('/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { centerId } = req.params;
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '권한이 없습니다.' });
        }
        await CenterLevel_1.CenterLevel.findOneAndUpdate({ centerId }, { isActive: false });
        res.json({ message: '센터 레벨이 비활성화되었습니다.' });
    }
    catch (error) {
        console.error('센터 레벨 삭제 실패:', error);
        res.status(500).json({ error: '센터 레벨 삭제에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=center-level.js.map