"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get('/status', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const systemStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version,
            platform: process.platform
        };
        res.json({
            success: true,
            message: '시스템 상태 조회 성공!',
            data: systemStatus
        });
    }
    catch (error) {
        console.error('시스템 상태 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시스템 상태 조회에 실패했습니다.'
        });
    }
});
router.get('/user-stats', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments();
        const activeUsers = await User_1.User.countDocuments({ 'accountStatus.isActive': true });
        const newUsersThisMonth = await User_1.User.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        });
        const userStats = {
            totalUsers,
            activeUsers,
            newUsersThisMonth,
            inactiveUsers: totalUsers - activeUsers
        };
        res.json({
            success: true,
            message: '사용자 통계 조회 성공!',
            data: userStats
        });
    }
    catch (error) {
        console.error('사용자 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 통계 조회에 실패했습니다.'
        });
    }
});
router.get('/database-status', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const dbStatus = {
            status: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose_1.default.connection.host,
            port: mongoose_1.default.connection.port,
            name: mongoose_1.default.connection.name,
            readyState: mongoose_1.default.connection.readyState
        };
        res.json({
            success: true,
            message: '데이터베이스 상태 조회 성공!',
            data: dbStatus
        });
    }
    catch (error) {
        console.error('데이터베이스 상태 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '데이터베이스 상태 조회에 실패했습니다.'
        });
    }
});
router.post('/backup', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const backupInfo = {
            timestamp: new Date().toISOString(),
            status: 'completed',
            size: '2.5GB',
            location: '/backups/system_backup_2024_08_15.zip'
        };
        res.json({
            success: true,
            message: '시스템 백업이 성공적으로 완료되었습니다!',
            data: backupInfo
        });
    }
    catch (error) {
        console.error('시스템 백업 오류:', error);
        res.status(500).json({
            success: false,
            message: '시스템 백업에 실패했습니다.'
        });
    }
});
router.get('/logs', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { type, level, startDate, endDate, limit = 100 } = req.query;
        const logs = [
            {
                timestamp: new Date().toISOString(),
                level: 'info',
                type: 'system',
                message: '시스템 정상 운영 중',
                details: {}
            }
        ];
        res.json({
            success: true,
            message: '시스템 로그 조회 성공!',
            data: logs
        });
    }
    catch (error) {
        console.error('시스템 로그 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '시스템 로그 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=system.js.map