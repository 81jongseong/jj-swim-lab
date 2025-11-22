"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TeachingMethod_1 = require("../models/TeachingMethod");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/update-levels', async (req, res) => {
    try {
        console.log('🔄 강습법 레벨 일괄 변경 시작...');
        const levelMapping = {
            'beginner': '초급',
            'intermediate': '중급',
            'advanced': '상급',
            'expert': '상급',
            '고급': '상급',
            '전문가': '상급'
        };
        const results = [];
        for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
            const result = await TeachingMethod_1.TeachingMethod.updateMany({ level: oldLevel }, { $set: { level: newLevel, updatedAt: new Date() } });
            if (result.modifiedCount > 0) {
                console.log(`✅ "${oldLevel}" → "${newLevel}": ${result.modifiedCount}개 업데이트`);
                results.push({
                    from: oldLevel,
                    to: newLevel,
                    count: result.modifiedCount
                });
            }
            else {
                console.log(`ℹ️ "${oldLevel}": 변경할 데이터 없음`);
            }
        }
        const levelStats = await TeachingMethod_1.TeachingMethod.aggregate([
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('📊 최종 레벨 통계:', levelStats);
        res.json({
            success: true,
            message: '레벨 변경이 완료되었습니다!',
            results: results,
            finalStats: levelStats
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 레벨 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '레벨 변경에 실패했습니다.',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=update-levels.js.map