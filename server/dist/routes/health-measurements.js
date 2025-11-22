"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/measurements', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }
        const { type, value, date, isPublic } = req.body;
        if (!type || value === undefined || !date) {
            return res.status(400).json({
                success: false,
                message: '측정 항목, 측정값, 측정일은 필수입니다.'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        if (!user.studentInfo.healthProfile) {
            user.studentInfo.healthProfile = {};
        }
        if (!user.studentInfo.healthProfile.healthHistory) {
            user.studentInfo.healthProfile.healthHistory = [];
        }
        const measurementDate = new Date(date);
        const healthHistoryEntry = {
            date: measurementDate,
            notes: `측정 항목: ${type}, 값: ${value}`
        };
        switch (type) {
            case 'weight':
                healthHistoryEntry.weight = parseFloat(value);
                if (user.studentInfo.healthProfile.height) {
                    const heightInMeters = user.studentInfo.healthProfile.height / 100;
                    healthHistoryEntry.bmi = parseFloat((parseFloat(value) / (heightInMeters * heightInMeters)).toFixed(1));
                }
                user.studentInfo.healthProfile.weight = parseFloat(value);
                break;
            case 'height':
                user.studentInfo.healthProfile.height = parseFloat(value);
                if (user.studentInfo.healthProfile.weight) {
                    const heightInMeters = parseFloat(value) / 100;
                    user.studentInfo.healthProfile.bmi = parseFloat((user.studentInfo.healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));
                }
                break;
            case 'bmi':
                healthHistoryEntry.bmi = parseFloat(value);
                user.studentInfo.healthProfile.bmi = parseFloat(value);
                break;
            case 'blood_pressure_systolic':
                if (!healthHistoryEntry.bloodPressure) {
                    healthHistoryEntry.bloodPressure = {};
                }
                healthHistoryEntry.bloodPressure.systolic = parseFloat(value);
                if (!user.studentInfo.healthProfile.bloodPressure) {
                    user.studentInfo.healthProfile.bloodPressure = {};
                }
                user.studentInfo.healthProfile.bloodPressure.systolic = parseFloat(value);
                user.studentInfo.healthProfile.bloodPressure.measuredAt = measurementDate;
                break;
            case 'blood_pressure_diastolic':
                if (!healthHistoryEntry.bloodPressure) {
                    healthHistoryEntry.bloodPressure = {};
                }
                healthHistoryEntry.bloodPressure.diastolic = parseFloat(value);
                if (!user.studentInfo.healthProfile.bloodPressure) {
                    user.studentInfo.healthProfile.bloodPressure = {};
                }
                user.studentInfo.healthProfile.bloodPressure.diastolic = parseFloat(value);
                user.studentInfo.healthProfile.bloodPressure.measuredAt = measurementDate;
                break;
            case 'cholesterol_total':
                if (!healthHistoryEntry.cholesterol) {
                    healthHistoryEntry.cholesterol = {};
                }
                healthHistoryEntry.cholesterol.total = parseFloat(value);
                if (!user.studentInfo.healthProfile.cholesterol) {
                    user.studentInfo.healthProfile.cholesterol = {};
                }
                user.studentInfo.healthProfile.cholesterol.total = parseFloat(value);
                user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
                break;
            case 'cholesterol_ldl':
                if (!healthHistoryEntry.cholesterol) {
                    healthHistoryEntry.cholesterol = {};
                }
                healthHistoryEntry.cholesterol.ldl = parseFloat(value);
                if (!user.studentInfo.healthProfile.cholesterol) {
                    user.studentInfo.healthProfile.cholesterol = {};
                }
                user.studentInfo.healthProfile.cholesterol.ldl = parseFloat(value);
                user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
                break;
            case 'cholesterol_hdl':
                if (!healthHistoryEntry.cholesterol) {
                    healthHistoryEntry.cholesterol = {};
                }
                healthHistoryEntry.cholesterol.hdl = parseFloat(value);
                if (!user.studentInfo.healthProfile.cholesterol) {
                    user.studentInfo.healthProfile.cholesterol = {};
                }
                user.studentInfo.healthProfile.cholesterol.hdl = parseFloat(value);
                user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
                break;
            case 'cholesterol_triglycerides':
                if (!healthHistoryEntry.cholesterol) {
                    healthHistoryEntry.cholesterol = {};
                }
                healthHistoryEntry.cholesterol.triglycerides = parseFloat(value);
                if (!user.studentInfo.healthProfile.cholesterol) {
                    user.studentInfo.healthProfile.cholesterol = {};
                }
                user.studentInfo.healthProfile.cholesterol.triglycerides = parseFloat(value);
                user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
                break;
            case 'blood_sugar_fasting':
                if (!healthHistoryEntry.bloodSugar) {
                    healthHistoryEntry.bloodSugar = {};
                }
                healthHistoryEntry.bloodSugar.fasting = parseFloat(value);
                if (!user.studentInfo.healthProfile.bloodSugar) {
                    user.studentInfo.healthProfile.bloodSugar = {};
                }
                user.studentInfo.healthProfile.bloodSugar.fasting = parseFloat(value);
                user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
                break;
            case 'blood_sugar_postprandial':
                if (!healthHistoryEntry.bloodSugar) {
                    healthHistoryEntry.bloodSugar = {};
                }
                healthHistoryEntry.bloodSugar.postprandial = parseFloat(value);
                if (!user.studentInfo.healthProfile.bloodSugar) {
                    user.studentInfo.healthProfile.bloodSugar = {};
                }
                user.studentInfo.healthProfile.bloodSugar.postprandial = parseFloat(value);
                user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
                break;
            case 'blood_sugar_hba1c':
                if (!healthHistoryEntry.bloodSugar) {
                    healthHistoryEntry.bloodSugar = {};
                }
                healthHistoryEntry.bloodSugar.hba1c = parseFloat(value);
                if (!user.studentInfo.healthProfile.bloodSugar) {
                    user.studentInfo.healthProfile.bloodSugar = {};
                }
                user.studentInfo.healthProfile.bloodSugar.hba1c = parseFloat(value);
                user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
                break;
            case 'muscle_mass':
                if (!user.studentInfo.healthProfile.fitnessMetrics) {
                    user.studentInfo.healthProfile.fitnessMetrics = {};
                }
                user.studentInfo.healthProfile.fitnessMetrics.muscleMass = parseFloat(value);
                user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
                break;
            case 'body_fat':
                if (!user.studentInfo.healthProfile.fitnessMetrics) {
                    user.studentInfo.healthProfile.fitnessMetrics = {};
                }
                user.studentInfo.healthProfile.fitnessMetrics.bodyFatPercentage = parseFloat(value);
                user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
                break;
            case 'heart_rate':
                if (!user.studentInfo.healthProfile.fitnessMetrics) {
                    user.studentInfo.healthProfile.fitnessMetrics = {};
                }
                user.studentInfo.healthProfile.fitnessMetrics.restingHeartRate = parseFloat(value);
                user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
                break;
            case 'max_heart_rate':
                if (!user.studentInfo.healthProfile.fitnessMetrics) {
                    user.studentInfo.healthProfile.fitnessMetrics = {};
                }
                user.studentInfo.healthProfile.fitnessMetrics.maxHeartRate = parseFloat(value);
                user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
                break;
        }
        user.studentInfo.healthProfile.healthHistory.unshift(healthHistoryEntry);
        user.studentInfo.healthProfile.lastHealthCheck = measurementDate;
        await user.save();
        res.json({
            success: true,
            message: '측정 데이터가 저장되었습니다.',
            data: {
                type,
                value: parseFloat(value),
                date: measurementDate,
                isPublic: isPublic !== undefined ? isPublic : true
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 측정 데이터 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '측정 데이터 저장 중 오류가 발생했습니다.'
        });
    }
});
router.get('/measurements', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }
        const user = await User_1.User.findById(userId).select('studentInfo.healthProfile studentInfo.healthProfile.privacySettings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        const healthProfile = user.studentInfo?.healthProfile || {};
        const healthHistory = healthProfile.healthHistory || [];
        const privacySettings = healthProfile.privacySettings || {};
        res.json({
            success: true,
            data: {
                healthProfile,
                healthHistory,
                privacySettings
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 측정 데이터 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '측정 데이터 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/measurements/privacy', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: '인증이 필요합니다.'
            });
        }
        const { privacySettings } = req.body;
        if (!privacySettings || typeof privacySettings !== 'object') {
            return res.status(400).json({
                success: false,
                message: '공개 설정 데이터가 필요합니다.'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        if (!user.studentInfo.healthProfile) {
            user.studentInfo.healthProfile = {};
        }
        user.studentInfo.healthProfile.privacySettings = {
            ...user.studentInfo.healthProfile.privacySettings,
            ...privacySettings
        };
        await user.save();
        res.json({
            success: true,
            message: '공개 설정이 저장되었습니다.',
            data: {
                privacySettings: user.studentInfo.healthProfile.privacySettings
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('공개 설정 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '공개 설정 저장 중 오류가 발생했습니다.'
        });
    }
});
router.get('/measurements/:userId', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'center-admin', 'instructor', 'superAdmin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const viewerId = req.user?._id || req.user?.userId;
        if (!userId || !viewerId) {
            return res.status(400).json({
                success: false,
                message: '사용자 ID가 필요합니다.'
            });
        }
        const user = await User_1.User.findById(userId).select('studentInfo.healthProfile studentInfo.healthProfile.privacySettings');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        const healthProfile = user.studentInfo?.healthProfile || {};
        const privacySettings = healthProfile.privacySettings || {};
        const filteredHealthProfile = {};
        if (healthProfile.height !== undefined && (privacySettings.height !== false)) {
            filteredHealthProfile.height = healthProfile.height;
        }
        if (healthProfile.weight !== undefined && (privacySettings.weight !== false)) {
            filteredHealthProfile.weight = healthProfile.weight;
        }
        if (healthProfile.bmi !== undefined && (privacySettings.bmi !== false)) {
            filteredHealthProfile.bmi = healthProfile.bmi;
        }
        if (healthProfile.bloodPressure) {
            const bpPublic = privacySettings.blood_pressure_systolic !== false && privacySettings.blood_pressure_diastolic !== false;
            if (bpPublic) {
                filteredHealthProfile.bloodPressure = healthProfile.bloodPressure;
            }
        }
        if (healthProfile.cholesterol) {
            const cholPublic = (privacySettings.cholesterol_total !== false && healthProfile.cholesterol.total !== undefined) ||
                (privacySettings.cholesterol_ldl !== false && healthProfile.cholesterol.ldl !== undefined) ||
                (privacySettings.cholesterol_hdl !== false && healthProfile.cholesterol.hdl !== undefined) ||
                (privacySettings.cholesterol_triglycerides !== false && healthProfile.cholesterol.triglycerides !== undefined);
            if (cholPublic) {
                filteredHealthProfile.cholesterol = {};
                if (privacySettings.cholesterol_total !== false && healthProfile.cholesterol.total !== undefined) {
                    filteredHealthProfile.cholesterol.total = healthProfile.cholesterol.total;
                }
                if (privacySettings.cholesterol_ldl !== false && healthProfile.cholesterol.ldl !== undefined) {
                    filteredHealthProfile.cholesterol.ldl = healthProfile.cholesterol.ldl;
                }
                if (privacySettings.cholesterol_hdl !== false && healthProfile.cholesterol.hdl !== undefined) {
                    filteredHealthProfile.cholesterol.hdl = healthProfile.cholesterol.hdl;
                }
                if (privacySettings.cholesterol_triglycerides !== false && healthProfile.cholesterol.triglycerides !== undefined) {
                    filteredHealthProfile.cholesterol.triglycerides = healthProfile.cholesterol.triglycerides;
                }
            }
        }
        if (healthProfile.bloodSugar) {
            const sugarPublic = (privacySettings.blood_sugar_fasting !== false && healthProfile.bloodSugar.fasting !== undefined) ||
                (privacySettings.blood_sugar_postprandial !== false && healthProfile.bloodSugar.postprandial !== undefined) ||
                (privacySettings.blood_sugar_hba1c !== false && healthProfile.bloodSugar.hba1c !== undefined);
            if (sugarPublic) {
                filteredHealthProfile.bloodSugar = {};
                if (privacySettings.blood_sugar_fasting !== false && healthProfile.bloodSugar.fasting !== undefined) {
                    filteredHealthProfile.bloodSugar.fasting = healthProfile.bloodSugar.fasting;
                }
                if (privacySettings.blood_sugar_postprandial !== false && healthProfile.bloodSugar.postprandial !== undefined) {
                    filteredHealthProfile.bloodSugar.postprandial = healthProfile.bloodSugar.postprandial;
                }
                if (privacySettings.blood_sugar_hba1c !== false && healthProfile.bloodSugar.hba1c !== undefined) {
                    filteredHealthProfile.bloodSugar.hba1c = healthProfile.bloodSugar.hba1c;
                }
            }
        }
        if (healthProfile.fitnessMetrics) {
            filteredHealthProfile.fitnessMetrics = {};
            if (privacySettings.muscle_mass !== false && healthProfile.fitnessMetrics.muscleMass !== undefined) {
                filteredHealthProfile.fitnessMetrics.muscleMass = healthProfile.fitnessMetrics.muscleMass;
            }
            if (privacySettings.body_fat !== false && healthProfile.fitnessMetrics.bodyFatPercentage !== undefined) {
                filteredHealthProfile.fitnessMetrics.bodyFatPercentage = healthProfile.fitnessMetrics.bodyFatPercentage;
            }
            if (privacySettings.heart_rate !== false && healthProfile.fitnessMetrics.restingHeartRate !== undefined) {
                filteredHealthProfile.fitnessMetrics.restingHeartRate = healthProfile.fitnessMetrics.restingHeartRate;
            }
            if (privacySettings.max_heart_rate !== false && healthProfile.fitnessMetrics.maxHeartRate !== undefined) {
                filteredHealthProfile.fitnessMetrics.maxHeartRate = healthProfile.fitnessMetrics.maxHeartRate;
            }
        }
        if (user.studentInfo?.swimmingProfile) {
            filteredHealthProfile.swimmingProfile = user.studentInfo.swimmingProfile;
        }
        res.json({
            success: true,
            data: {
                healthProfile: filteredHealthProfile,
                hasPrivateData: Object.keys(filteredHealthProfile).length < Object.keys(healthProfile).length
            },
            message: '건강 정보를 조회했습니다. (비공개 정보는 제외되었습니다)'
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 건강 정보 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '건강 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/measurements/center/statistics', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'center-admin', 'superAdmin']), async (req, res) => {
    try {
        const centerId = req.user?.centerId;
        const viewerType = req.user?.userType;
        if (!centerId && viewerType !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: '센터 관리자 권한이 필요합니다.'
            });
        }
        const filter = { userType: 'student' };
        if (viewerType !== 'superAdmin') {
            filter.centerId = new mongoose_1.default.Types.ObjectId(centerId);
        }
        const members = await User_1.User.find(filter).select('studentInfo.healthProfile');
        const statistics = {
            totalMembers: members.length,
            membersWithHealthData: members.filter(m => m.studentInfo?.healthProfile).length,
            averageBMI: 0,
            averageWeight: 0,
            averageHeight: 0,
            bloodPressureStats: {
                averageSystolic: 0,
                averageDiastolic: 0,
                count: 0
            },
            cholesterolStats: {
                averageTotal: 0,
                averageLDL: 0,
                averageHDL: 0,
                count: 0
            },
            bloodSugarStats: {
                averageFasting: 0,
                averageHba1c: 0,
                count: 0
            },
            fitnessStats: {
                averageMuscleMass: 0,
                averageBodyFat: 0,
                averageHeartRate: 0,
                count: 0
            }
        };
        let bmiSum = 0;
        let bmiCount = 0;
        let weightSum = 0;
        let weightCount = 0;
        let heightSum = 0;
        let heightCount = 0;
        let bpSystolicSum = 0;
        let bpDiastolicSum = 0;
        let bpCount = 0;
        let cholTotalSum = 0;
        let cholLDLSum = 0;
        let cholHDLSum = 0;
        let cholCount = 0;
        let sugarFastingSum = 0;
        let sugarHba1cSum = 0;
        let sugarCount = 0;
        let muscleSum = 0;
        let bodyFatSum = 0;
        let heartRateSum = 0;
        let fitnessCount = 0;
        members.forEach(member => {
            const healthProfile = member.studentInfo?.healthProfile;
            if (!healthProfile)
                return;
            if (healthProfile.bmi !== undefined) {
                bmiSum += healthProfile.bmi;
                bmiCount++;
            }
            if (healthProfile.weight !== undefined) {
                weightSum += healthProfile.weight;
                weightCount++;
            }
            if (healthProfile.height !== undefined) {
                heightSum += healthProfile.height;
                heightCount++;
            }
            if (healthProfile.bloodPressure?.systolic && healthProfile.bloodPressure?.diastolic) {
                bpSystolicSum += healthProfile.bloodPressure.systolic;
                bpDiastolicSum += healthProfile.bloodPressure.diastolic;
                bpCount++;
            }
            if (healthProfile.cholesterol?.total) {
                cholTotalSum += healthProfile.cholesterol.total;
                if (healthProfile.cholesterol.ldl)
                    cholLDLSum += healthProfile.cholesterol.ldl;
                if (healthProfile.cholesterol.hdl)
                    cholHDLSum += healthProfile.cholesterol.hdl;
                cholCount++;
            }
            if (healthProfile.bloodSugar?.fasting) {
                sugarFastingSum += healthProfile.bloodSugar.fasting;
                if (healthProfile.bloodSugar.hba1c)
                    sugarHba1cSum += healthProfile.bloodSugar.hba1c;
                sugarCount++;
            }
            if (healthProfile.fitnessMetrics) {
                if (healthProfile.fitnessMetrics.muscleMass) {
                    muscleSum += healthProfile.fitnessMetrics.muscleMass;
                    fitnessCount++;
                }
                if (healthProfile.fitnessMetrics.bodyFatPercentage) {
                    bodyFatSum += healthProfile.fitnessMetrics.bodyFatPercentage;
                }
                if (healthProfile.fitnessMetrics.restingHeartRate) {
                    heartRateSum += healthProfile.fitnessMetrics.restingHeartRate;
                }
            }
        });
        statistics.averageBMI = bmiCount > 0 ? parseFloat((bmiSum / bmiCount).toFixed(1)) : 0;
        statistics.averageWeight = weightCount > 0 ? parseFloat((weightSum / weightCount).toFixed(1)) : 0;
        statistics.averageHeight = heightCount > 0 ? parseFloat((heightSum / heightCount).toFixed(1)) : 0;
        statistics.bloodPressureStats.averageSystolic = bpCount > 0 ? Math.round(bpSystolicSum / bpCount) : 0;
        statistics.bloodPressureStats.averageDiastolic = bpCount > 0 ? Math.round(bpDiastolicSum / bpCount) : 0;
        statistics.bloodPressureStats.count = bpCount;
        statistics.cholesterolStats.averageTotal = cholCount > 0 ? Math.round(cholTotalSum / cholCount) : 0;
        statistics.cholesterolStats.averageLDL = cholCount > 0 ? Math.round(cholLDLSum / cholCount) : 0;
        statistics.cholesterolStats.averageHDL = cholCount > 0 ? Math.round(cholHDLSum / cholCount) : 0;
        statistics.cholesterolStats.count = cholCount;
        statistics.bloodSugarStats.averageFasting = sugarCount > 0 ? Math.round(sugarFastingSum / sugarCount) : 0;
        statistics.bloodSugarStats.averageHba1c = sugarCount > 0 ? parseFloat((sugarHba1cSum / sugarCount).toFixed(1)) : 0;
        statistics.bloodSugarStats.count = sugarCount;
        statistics.fitnessStats.averageMuscleMass = fitnessCount > 0 ? parseFloat((muscleSum / fitnessCount).toFixed(1)) : 0;
        statistics.fitnessStats.averageBodyFat = fitnessCount > 0 ? parseFloat((bodyFatSum / fitnessCount).toFixed(1)) : 0;
        statistics.fitnessStats.averageHeartRate = fitnessCount > 0 ? Math.round(heartRateSum / fitnessCount) : 0;
        statistics.fitnessStats.count = fitnessCount;
        res.json({
            success: true,
            data: statistics,
            message: '센터 건강 통계를 조회했습니다. (비공개 정보도 통계에 포함됨)'
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 건강 통계 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '건강 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health-measurements.js.map