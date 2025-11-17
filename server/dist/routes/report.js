"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Report_1 = require("../models/Report");
const AdminReport_1 = require("../models/AdminReport");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const reports = await Report_1.Report.find({}).populate('centerId');
        res.json({
            success: true,
            data: { reports },
            count: reports.length
        });
    }
    catch {
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.get('/admin', auth_1.authMiddleware, async (req, res) => {
    try {
        const { limit = 50, status, type } = req.query;
        const filter = {};
        if (status && status !== 'all')
            filter.status = status;
        if (type && type !== 'all')
            filter.type = type;
        const reports = await AdminReport_1.AdminReport.find(filter)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('centerId', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
        res.json({
            success: true,
            data: { reports },
            count: reports.length
        });
    }
    catch (error) {
        console.error('관리자 리포트 조회 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.post('/admin', auth_1.authMiddleware, async (req, res) => {
    try {
        const { title, description, type, status = 'open', priority = 'medium', category, tags = [], centerId } = req.body;
        const adminReport = new AdminReport_1.AdminReport({
            title,
            description,
            type,
            status,
            priority,
            reportedBy: req.user._id,
            category,
            tags,
            ...(centerId && { centerId })
        });
        await adminReport.save();
        res.json({
            success: true,
            data: adminReport,
            message: '관리자 리포트가 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('관리자 리포트 생성 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.put('/admin/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const adminReport = await AdminReport_1.AdminReport.findByIdAndUpdate(id, updateData, { new: true }).populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('centerId', 'name');
        if (!adminReport) {
            return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
        }
        res.json({
            success: true,
            data: adminReport,
            message: '관리자 리포트가 성공적으로 수정되었습니다.'
        });
    }
    catch (error) {
        console.error('관리자 리포트 수정 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.patch('/admin/:id/status', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminReport = await AdminReport_1.AdminReport.findByIdAndUpdate(id, { status, ...(status === 'resolved' && { resolvedAt: new Date() }) }, { new: true });
        if (!adminReport) {
            return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
        }
        res.json({
            success: true,
            data: adminReport,
            message: '리포트 상태가 성공적으로 업데이트되었습니다.'
        });
    }
    catch (error) {
        console.error('리포트 상태 업데이트 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.delete('/admin/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const adminReport = await AdminReport_1.AdminReport.findByIdAndDelete(id);
        if (!adminReport) {
            return res.status(404).json({ success: false, message: '리포트를 찾을 수 없습니다.' });
        }
        res.json({
            success: true,
            message: '관리자 리포트가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('관리자 리포트 삭제 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { period, totalStudents, totalRevenue, totalClasses, averageRating, newStudents, retentionRate, centerId } = req.body;
        const report = new Report_1.Report({
            period,
            totalStudents,
            totalRevenue,
            totalClasses,
            averageRating,
            newStudents,
            retentionRate,
            centerId
        });
        await report.save();
        res.json({
            success: true,
            data: report,
            message: '센터 리포트가 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('센터 리포트 생성 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=report.js.map