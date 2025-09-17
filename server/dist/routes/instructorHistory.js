"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const instructorHistoryService_1 = require("../services/instructorHistoryService");
const InstructorHistory_1 = require("../models/InstructorHistory");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const historyService = instructorHistoryService_1.InstructorHistoryService.getInstance();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 또는 PDF 파일만 업로드 가능합니다.'));
        }
    }
});
router.post('/work-history', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { instructorId, centerId, position, startDate, workType, responsibilities } = req.body;
        const createdBy = req.user?.userId;
        if (!instructorId || !centerId || !position || !startDate || !workType) {
            return res.status(400).json({
                success: false,
                error: '필수 정보가 누락되었습니다.'
            });
        }
        const newHistory = await historyService.addWorkHistory({
            instructorId,
            centerId,
            position,
            startDate: new Date(startDate),
            workType,
            responsibilities: responsibilities || []
        }, createdBy);
        res.json({
            success: true,
            data: {
                history: newHistory,
                message: '근무 이력이 성공적으로 추가되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('근무 이력 추가 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '근무 이력 추가 중 오류가 발생했습니다.'
        });
    }
});
router.post('/certification', auth_1.authMiddleware, upload.single('document'), async (req, res) => {
    try {
        const { instructorId, certificationType, certificationName, certificationNumber, issuingOrganization, issueDate, expiryDate } = req.body;
        const document = req.file;
        const currentUserId = req.user?.userId;
        if (instructorId !== currentUserId && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.'
            });
        }
        if (!instructorId || !certificationType || !certificationName || !certificationNumber || !issuingOrganization || !issueDate) {
            return res.status(400).json({
                success: false,
                error: '필수 정보가 누락되었습니다.'
            });
        }
        const documentUrl = document ? `/uploads/certifications/${document.filename}` : undefined;
        const certification = await historyService.addCertification({
            instructorId,
            certificationType,
            certificationName,
            certificationNumber,
            issuingOrganization,
            issueDate: new Date(issueDate),
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            documentUrl
        });
        res.json({
            success: true,
            data: {
                certification,
                message: '자격증이 성공적으로 등록되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('자격증 등록 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '자격증 등록 중 오류가 발생했습니다.'
        });
    }
});
router.put('/certification/:id/verify', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const verifiedBy = req.user?.userId;
        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: '유효하지 않은 검증 상태입니다.'
            });
        }
        const certification = await historyService.verifyCertification(id, verifiedBy, status, notes);
        res.json({
            success: true,
            data: {
                certification,
                message: '자격증 검증이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('자격증 검증 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '자격증 검증 중 오류가 발생했습니다.'
        });
    }
});
router.get('/center/:centerId/instructors', auth_1.authMiddleware, auth_1.requireCenterAdmin, async (req, res) => {
    try {
        const { centerId } = req.params;
        const { certificationType, verificationStatus, isExpired, issuingOrganization } = req.query;
        const filters = {};
        if (certificationType)
            filters.certificationType = certificationType;
        if (verificationStatus)
            filters.verificationStatus = verificationStatus;
        if (isExpired !== undefined)
            filters.isExpired = isExpired === 'true';
        if (issuingOrganization)
            filters.issuingOrganization = issuingOrganization;
        const instructors = await historyService.searchInstructorsByCenterAndCertification(centerId, filters);
        res.json({
            success: true,
            data: {
                instructors,
                filters: filters,
                total: instructors.length,
                message: '센터별 강사 검색이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터별 강사 검색 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '센터별 강사 검색 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor/:instructorId/complete', auth_1.authMiddleware, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const currentUserId = req.user?.userId;
        if (instructorId !== currentUserId && req.user?.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.'
            });
        }
        const completeHistory = await historyService.getInstructorCompleteHistory(instructorId);
        res.json({
            success: true,
            data: {
                ...completeHistory,
                message: '강사 전체 이력 조회가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 이력 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '강사 이력 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/center/:centerId/dashboard', auth_1.authMiddleware, auth_1.requireCenterAdmin, async (req, res) => {
    try {
        const { centerId } = req.params;
        const dashboard = await historyService.getCenterInstructorDashboard(centerId);
        res.json({
            success: true,
            data: {
                ...dashboard,
                message: '센터 강사 현황 대시보드 조회가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 대시보드 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '센터 대시보드 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/certifications/expiring', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const expiringCerts = await historyService.getExpiringCertifications(Number(days));
        res.json({
            success: true,
            data: {
                certifications: expiringCerts,
                alertDays: Number(days),
                total: expiringCerts.length,
                message: '만료 예정 자격증 조회가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('만료 예정 자격증 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '만료 예정 자격증 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/certification/:id/auto-verify', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const verificationResult = await historyService.autoVerifyCertification(id);
        res.json({
            success: true,
            data: {
                ...verificationResult,
                message: '자격증 자동 검증이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('자격증 자동 검증 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '자격증 자동 검증 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructor/:instructorId/verify-integrity', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const integrityCheck = await historyService.verifyHistoryIntegrity(instructorId);
        res.json({
            success: true,
            data: {
                ...integrityCheck,
                message: '이력 무결성 검증이 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('이력 무결성 검증 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '이력 무결성 검증 중 오류가 발생했습니다.'
        });
    }
});
router.get('/certification-types', auth_1.authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                certificationTypes: InstructorHistory_1.CERTIFICATION_TYPES,
                message: '자격증 타입 조회가 완료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('자격증 타입 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '자격증 타입 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/work-history/:historyId/end', auth_1.authMiddleware, auth_1.requireAdmin, async (req, res) => {
    try {
        const { historyId } = req.params;
        const { endDate, achievements } = req.body;
        const currentHistory = await InstructorHistory_1.InstructorWorkHistory.findById(historyId);
        if (!currentHistory) {
            return res.status(404).json({
                success: false,
                error: '근무 이력을 찾을 수 없습니다.'
            });
        }
        await historyService.endCurrentWorkHistory(currentHistory.instructorId.toString(), currentHistory.centerId.toString());
        res.json({
            success: true,
            data: {
                message: '근무 이력이 종료되었습니다.'
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('근무 이력 종료 API 오류:', error);
        res.status(500).json({
            success: false,
            error: '근무 이력 종료 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=instructorHistory.js.map