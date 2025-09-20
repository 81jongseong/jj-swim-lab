"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldPageVisits = exports.pageTrackingMiddleware = void 0;
const PageVisit_1 = require("../models/PageVisit");
const pageTrackingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', async () => {
        try {
            const responseTime = Date.now() - startTime;
            if (req.path.startsWith('/api/') || req.path.startsWith('/admin/') || req.path.startsWith('/dashboard')) {
                const pageVisit = new PageVisit_1.PageVisit({
                    userId: req.user?._id || undefined,
                    userType: req.user?.userType || 'guest',
                    path: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime,
                    ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
                    userAgent: req.get('User-Agent') || 'unknown',
                    referrer: req.get('Referer'),
                    visitTime: new Date(),
                    sessionId: req.sessionID
                });
                await pageVisit.save();
            }
        }
        catch (error) {
            console.warn('⚠️ 페이지 방문 로그 기록 실패:', error);
        }
    });
    next();
};
exports.pageTrackingMiddleware = pageTrackingMiddleware;
const cleanupOldPageVisits = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await PageVisit_1.PageVisit.deleteMany({
            visitTime: { $lt: thirtyDaysAgo }
        });
        if (result.deletedCount > 0) {
            console.log(`🗑️ 30일 이전 페이지 방문 로그 ${result.deletedCount}개 삭제`);
        }
    }
    catch (error) {
        console.error('페이지 방문 로그 정리 오류:', error);
    }
};
exports.cleanupOldPageVisits = cleanupOldPageVisits;
//# sourceMappingURL=pageTracking.js.map