"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backupService_1 = require("../services/backupService");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/summary', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const summary = backupService_1.backupService.getStatus();
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        (0, logger_1.logError)('백업 요약 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '백업 요약 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/manual', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('💾 수동 백업 실행 요청');
        const success = await backupService_1.backupService.triggerManualBackup();
        if (success) {
            res.json({
                success: true,
                message: '백업이 성공적으로 완료되었습니다.',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: '백업 실행에 실패했습니다.'
            });
        }
    }
    catch (error) {
        (0, logger_1.logError)('수동 백업 실행 오류', error);
        res.status(500).json({
            success: false,
            message: '백업 실행 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=backup.js.map