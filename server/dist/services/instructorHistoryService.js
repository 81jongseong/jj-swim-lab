"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructorHistoryService = void 0;
const InstructorHistory_1 = require("../models/InstructorHistory");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
class InstructorHistoryService {
    static getInstance() {
        if (!InstructorHistoryService.instance) {
            InstructorHistoryService.instance = new InstructorHistoryService();
        }
        return InstructorHistoryService.instance;
    }
    async addWorkHistory(historyData, createdBy) {
        try {
            await this.endCurrentWorkHistory(historyData.instructorId, historyData.centerId);
            const newHistory = await InstructorHistory_1.InstructorWorkHistory.createNewHistory(historyData, createdBy);
            (0, logger_1.logInfo)(`새로운 근무 이력 추가: 강사 ${historyData.instructorId}, 센터 ${historyData.centerId}`);
            return newHistory;
        }
        catch (error) {
            (0, logger_1.logError)('근무 이력 추가 실패:', error);
            throw new Error('근무 이력 추가 중 오류가 발생했습니다.');
        }
    }
    async endCurrentWorkHistory(instructorId, centerId) {
        try {
            const currentHistory = await InstructorHistory_1.InstructorWorkHistory.findOne({
                instructorId,
                centerId,
                isActive: true,
                endDate: null
            });
            if (currentHistory) {
                const endHistoryData = {
                    ...currentHistory.toObject(),
                    _id: undefined,
                    endDate: new Date(),
                    isActive: false,
                    hashValue: undefined
                };
                await InstructorHistory_1.InstructorWorkHistory.createNewHistory(endHistoryData, currentHistory.createdBy);
                (0, logger_1.logInfo)(`근무 이력 종료: 강사 ${instructorId}, 센터 ${centerId}`);
            }
        }
        catch (error) {
            (0, logger_1.logError)('근무 이력 종료 실패:', error);
            throw new Error('근무 이력 종료 중 오류가 발생했습니다.');
        }
    }
    async addCertification(certData) {
        try {
            const existingCert = await InstructorHistory_1.InstructorCertification.findOne({
                certificationNumber: certData.certificationNumber
            });
            if (existingCert) {
                throw new Error('이미 등록된 자격증 번호입니다.');
            }
            const certType = InstructorHistory_1.CERTIFICATION_TYPES[certData.certificationType];
            if (certType && !certType.issuingOrgs.includes(certData.issuingOrganization)) {
                throw new Error(`${certType.name} 자격증의 유효한 발급기관이 아닙니다.`);
            }
            if (!certData.expiryDate && certType?.validityPeriod) {
                const expiryDate = new Date(certData.issueDate);
                expiryDate.setFullYear(expiryDate.getFullYear() + certType.validityPeriod);
                certData.expiryDate = expiryDate;
            }
            let documentHash;
            if (certData.documentUrl) {
                documentHash = crypto_1.default.createHash('sha256')
                    .update(`${certData.certificationNumber}${certData.documentUrl}`)
                    .digest('hex');
            }
            const certification = new InstructorHistory_1.InstructorCertification({
                ...certData,
                documentHash,
                readonly: true
            });
            await certification.save();
            (0, logger_1.logInfo)(`새로운 자격증 등록: 강사 ${certData.instructorId}, 타입 ${certData.certificationType}`);
            return certification;
        }
        catch (error) {
            (0, logger_1.logError)('자격증 등록 실패:', error);
            throw error;
        }
    }
    async verifyCertification(certificationId, verifiedBy, status, notes) {
        try {
            const certification = await InstructorHistory_1.InstructorCertification.findByIdAndUpdate(certificationId, {
                $set: {
                    verificationStatus: status,
                    verifiedBy,
                    verifiedAt: new Date(),
                    verificationNotes: notes,
                    isValid: status === 'verified'
                }
            }, { new: true });
            if (!certification) {
                throw new Error('자격증을 찾을 수 없습니다.');
            }
            (0, logger_1.logInfo)(`자격증 검증 완료: ${certificationId}, 상태: ${status}`);
            return certification;
        }
        catch (error) {
            (0, logger_1.logError)('자격증 검증 실패:', error);
            throw error;
        }
    }
    async searchInstructorsByCenterAndCertification(centerId, filters = {}) {
        try {
            const results = await InstructorHistory_1.InstructorCertification.findByCenterAndType(centerId, filters.certificationType);
            let filteredResults = results;
            if (filters.verificationStatus) {
                filteredResults = filteredResults.filter((r) => r.verificationStatus === filters.verificationStatus);
            }
            if (filters.isExpired !== undefined) {
                filteredResults = filteredResults.filter((r) => r.isExpired === filters.isExpired);
            }
            if (filters.issuingOrganization) {
                filteredResults = filteredResults.filter((r) => r.issuingOrganization === filters.issuingOrganization);
            }
            return filteredResults;
        }
        catch (error) {
            (0, logger_1.logError)('센터별 강사 검색 실패:', error);
            throw new Error('강사 검색 중 오류가 발생했습니다.');
        }
    }
    async getInstructorCompleteHistory(instructorId) {
        try {
            const workHistory = await InstructorHistory_1.InstructorWorkHistory.find({ instructorId })
                .populate('centerId', 'name address phone')
                .populate('createdBy', 'name email')
                .sort({ startDate: -1 });
            const certifications = await InstructorHistory_1.InstructorCertification.find({ instructorId })
                .populate('verifiedBy', 'name email')
                .sort({ issueDate: -1 });
            const summary = {
                totalWorkPlaces: workHistory.length,
                currentWorkPlace: workHistory.find(h => h.isActive && !h.endDate),
                totalExperience: this.calculateTotalExperience(workHistory),
                validCertifications: certifications.filter(c => c.isValid && !c.isExpired()),
                expiringSoon: certifications.filter(c => c.shouldRenew()),
                certificationSummary: this.summarizeCertifications(certifications)
            };
            return {
                workHistory,
                certifications,
                summary
            };
        }
        catch (error) {
            (0, logger_1.logError)('강사 이력 조회 실패:', error);
            throw new Error('강사 이력 조회 중 오류가 발생했습니다.');
        }
    }
    async getExpiringCertifications(days = 30) {
        try {
            const alertDate = new Date();
            alertDate.setDate(alertDate.getDate() + days);
            const expiringCerts = await InstructorHistory_1.InstructorCertification.find({
                expiryDate: { $lte: alertDate, $gte: new Date() },
                isValid: true,
                verificationStatus: 'verified'
            })
                .populate('instructorId', 'name email phone')
                .sort({ expiryDate: 1 });
            return expiringCerts.map(cert => ({
                instructor: cert.instructorId,
                certification: {
                    type: cert.certificationType,
                    name: cert.certificationName,
                    number: cert.certificationNumber,
                    expiryDate: cert.expiryDate,
                    daysUntilExpiry: Math.ceil((cert.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                }
            }));
        }
        catch (error) {
            (0, logger_1.logError)('만료 예정 자격증 조회 실패:', error);
            throw new Error('만료 예정 자격증 조회 중 오류가 발생했습니다.');
        }
    }
    async verifyHistoryIntegrity(instructorId) {
        try {
            const histories = await InstructorHistory_1.InstructorWorkHistory.find({ instructorId })
                .sort({ createdAt: 1 });
            const issues = [];
            for (const history of histories) {
                if (!history.verifyIntegrity()) {
                    issues.push(`이력 ID ${history._id}: 해시 불일치 감지`);
                }
            }
            for (let i = 1; i < histories.length; i++) {
                if (histories[i].previousHash !== histories[i - 1].hashValue) {
                    issues.push(`이력 ID ${histories[i]._id}: 이전 이력과의 연결 해시 불일치`);
                }
            }
            for (const history of histories) {
                if (history.endDate && history.endDate <= history.startDate) {
                    issues.push(`이력 ID ${history._id}: 종료일이 시작일보다 빠름`);
                }
            }
            return {
                isValid: issues.length === 0,
                issues
            };
        }
        catch (error) {
            (0, logger_1.logError)('이력 무결성 검증 실패:', error);
            throw new Error('이력 무결성 검증 중 오류가 발생했습니다.');
        }
    }
    async autoVerifyCertification(certificationId) {
        try {
            const certification = await InstructorHistory_1.InstructorCertification.findById(certificationId);
            if (!certification) {
                throw new Error('자격증을 찾을 수 없습니다.');
            }
            const verificationResult = await this.simulateExternalVerification(certification);
            if (verificationResult.isValid) {
                await this.verifyCertification(certificationId, 'system', 'verified', '자동 검증 완료');
            }
            else {
                await this.verifyCertification(certificationId, 'system', 'rejected', verificationResult.reason);
            }
            return {
                success: verificationResult.isValid,
                verificationResult
            };
        }
        catch (error) {
            (0, logger_1.logError)('자격증 자동 검증 실패:', error);
            throw error;
        }
    }
    async getCenterInstructorDashboard(centerId) {
        try {
            const totalInstructors = await InstructorHistory_1.InstructorWorkHistory.distinct('instructorId', {
                centerId
            });
            const activeInstructors = await InstructorHistory_1.InstructorWorkHistory.countDocuments({
                centerId,
                isActive: true,
                endDate: null
            });
            const certificationStats = await this.getCertificationStatsByCenter(centerId);
            const expiringCerts = await this.getExpiringCertificationsByCenter(centerId);
            const complianceRate = await this.calculateCenterComplianceRate(centerId);
            return {
                totalInstructors: totalInstructors.length,
                activeInstructors,
                certificationStats,
                expiringCerts,
                complianceRate
            };
        }
        catch (error) {
            (0, logger_1.logError)('센터 강사 대시보드 조회 실패:', error);
            throw new Error('센터 대시보드 조회 중 오류가 발생했습니다.');
        }
    }
    async simulateExternalVerification(certification) {
        const certNumber = certification.certificationNumber;
        if (certification.certificationType === 'sports_instructor') {
            const pattern = /^SPT-\d{4}-\d{6}$/;
            if (!pattern.test(certNumber)) {
                return {
                    isValid: false,
                    reason: '생활체육지도사 자격증 번호 형식이 올바르지 않습니다.'
                };
            }
        }
        if (certification.certificationType === 'lifeguard') {
            const pattern = /^LG-\d{4}-\d{6}$/;
            if (!pattern.test(certNumber)) {
                return {
                    isValid: false,
                    reason: '인명구조원 자격증 번호 형식이 올바르지 않습니다.'
                };
            }
        }
        return {
            isValid: true,
            verifiedData: {
                verificationDate: new Date(),
                verificationMethod: 'api',
                externalId: `ext_${certNumber}`
            }
        };
    }
    calculateTotalExperience(workHistory) {
        let totalDays = 0;
        for (const history of workHistory) {
            const startDate = new Date(history.startDate);
            const endDate = history.endDate ? new Date(history.endDate) : new Date();
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDays += diffDays;
        }
        return Math.round(totalDays / 365 * 10) / 10;
    }
    summarizeCertifications(certifications) {
        const summary = {
            total: certifications.length,
            verified: 0,
            pending: 0,
            expired: 0,
            byType: {}
        };
        certifications.forEach(cert => {
            if (cert.verificationStatus === 'verified')
                summary.verified++;
            if (cert.verificationStatus === 'pending')
                summary.pending++;
            if (cert.isExpired())
                summary.expired++;
            if (!summary.byType[cert.certificationType]) {
                summary.byType[cert.certificationType] = 0;
            }
            summary.byType[cert.certificationType]++;
        });
        return summary;
    }
    async getCertificationStatsByCenter(centerId) {
        const pipeline = [
            {
                $lookup: {
                    from: 'instructor_work_histories',
                    localField: 'instructorId',
                    foreignField: 'instructorId',
                    as: 'workHistory'
                }
            },
            {
                $match: {
                    'workHistory': {
                        $elemMatch: {
                            centerId: new mongoose_1.default.Types.ObjectId(centerId),
                            isActive: true
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$certificationType',
                    total: { $sum: 1 },
                    verified: {
                        $sum: {
                            $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0]
                        }
                    },
                    expired: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$expiryDate', null] },
                                        { $lt: ['$expiryDate', new Date()] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];
        return InstructorHistory_1.InstructorCertification.aggregate(pipeline);
    }
    async getExpiringCertificationsByCenter(centerId, days = 30) {
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + days);
        const pipeline = [
            {
                $match: {
                    expiryDate: { $lte: alertDate, $gte: new Date() },
                    isValid: true,
                    verificationStatus: 'verified'
                }
            },
            {
                $lookup: {
                    from: 'instructor_work_histories',
                    localField: 'instructorId',
                    foreignField: 'instructorId',
                    as: 'workHistory'
                }
            },
            {
                $match: {
                    'workHistory': {
                        $elemMatch: {
                            centerId: new mongoose_1.default.Types.ObjectId(centerId),
                            isActive: true
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'instructorId',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            {
                $project: {
                    instructorName: { $arrayElemAt: ['$instructor.name', 0] },
                    instructorEmail: { $arrayElemAt: ['$instructor.email', 0] },
                    certificationType: 1,
                    certificationName: 1,
                    expiryDate: 1,
                    daysUntilExpiry: {
                        $ceil: {
                            $divide: [
                                { $subtract: ['$expiryDate', new Date()] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                }
            },
            {
                $sort: { expiryDate: 1 }
            }
        ];
        return InstructorHistory_1.InstructorCertification.aggregate(pipeline);
    }
    async calculateCenterComplianceRate(centerId) {
        try {
            const activeInstructors = await InstructorHistory_1.InstructorWorkHistory.distinct('instructorId', {
                centerId,
                isActive: true,
                endDate: null
            });
            if (activeInstructors.length === 0)
                return 100;
            let compliantInstructors = 0;
            for (const instructorId of activeInstructors) {
                const hasRequiredCerts = await this.hasAllRequiredCertifications(instructorId.toString());
                if (hasRequiredCerts) {
                    compliantInstructors++;
                }
            }
            return Math.round((compliantInstructors / activeInstructors.length) * 100);
        }
        catch (error) {
            (0, logger_1.logError)('컴플라이언스 비율 계산 실패:', error);
            return 0;
        }
    }
    async hasAllRequiredCertifications(instructorId) {
        const requiredTypes = Object.entries(InstructorHistory_1.CERTIFICATION_TYPES)
            .filter(([, config]) => config.required)
            .map(([type]) => type);
        for (const certType of requiredTypes) {
            const validCert = await InstructorHistory_1.InstructorCertification.findOne({
                instructorId,
                certificationType: certType,
                verificationStatus: 'verified',
                isValid: true,
                $or: [
                    { expiryDate: null },
                    { expiryDate: { $gt: new Date() } }
                ]
            });
            if (!validCert) {
                return false;
            }
        }
        return true;
    }
}
exports.InstructorHistoryService = InstructorHistoryService;
exports.default = InstructorHistoryService;
//# sourceMappingURL=instructorHistoryService.js.map