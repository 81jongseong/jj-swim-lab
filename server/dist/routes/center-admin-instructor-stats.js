"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/instructors/stats', (req, res) => {
    console.log('🔍 강사 통계 조회 시작 (최소 버전)');
    res.json({
        success: true,
        message: '강사 통계 조회 성공',
        data: []
    });
});
exports.default = router;
//# sourceMappingURL=center-admin-instructor-stats.js.map