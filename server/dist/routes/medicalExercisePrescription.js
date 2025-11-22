"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const medicalExercisePrescriptionService_1 = require("../services/medicalExercisePrescriptionService");
const HealthAssessment_1 = require("../models/HealthAssessment");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/assessment', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        const { basicHealth, vitalSigns, chronicConditions, medicalHistory, currentSymptoms, physicalLimitations, emergencyContact, medicalTeam } = req.body;
        if (!basicHealth || !emergencyContact) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['basicHealth', 'emergencyContact']
            });
        }
        await HealthAssessment_1.HealthAssessment.updateMany({ userId: new mongoose_1.default.Types.ObjectId(userId), isActive: true }, { isActive: false });
        const riskAssessment = calculateRiskAssessment(basicHealth, chronicConditions || [], vitalSigns || []);
        const healthAssessment = new HealthAssessment_1.HealthAssessment({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            assessmentDate: new Date(),
            basicHealth: {
                age: parseInt(basicHealth.age) || 25,
                gender: basicHealth.gender || 'other',
                height: parseFloat(basicHealth.height) || 170,
                weight: parseFloat(basicHealth.weight) || 70,
                bmi: 0,
                smokingStatus: basicHealth.smokingStatus || 'never',
                alcoholConsumption: basicHealth.alcoholConsumption || 'none',
                sleepHours: parseFloat(basicHealth.sleepHours) || 8,
                stressLevel: parseInt(basicHealth.stressLevel) || 5,
                activityLevel: basicHealth.activityLevel || 'lightly_active'
            },
            vitalSigns: (vitalSigns || []).map((vs) => ({
                date: new Date(vs.date),
                systolicBP: parseInt(vs.systolicBP) || 120,
                diastolicBP: parseInt(vs.diastolicBP) || 80,
                restingHR: parseInt(vs.restingHR) || 70,
                bloodGlucose: vs.bloodGlucose ? parseFloat(vs.bloodGlucose) : undefined,
                weight: parseFloat(vs.weight) || basicHealth.weight,
                bodyFat: vs.bodyFat ? parseFloat(vs.bodyFat) : undefined,
                temperature: vs.temperature ? parseFloat(vs.temperature) : undefined,
                oxygenSaturation: vs.oxygenSaturation ? parseFloat(vs.oxygenSaturation) : undefined,
                notes: vs.notes || ''
            })),
            chronicConditions: (chronicConditions || []).map((cc) => ({
                condition: cc.condition,
                diagnosedDate: new Date(cc.diagnosedDate),
                severity: cc.severity || 'mild',
                controlled: cc.controlled !== undefined ? cc.controlled : true,
                lastCheckup: new Date(cc.lastCheckup),
                doctorNotes: cc.doctorNotes || '',
                medications: (cc.medications || []).map((med) => ({
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    timing: med.timing || [],
                    sideEffects: med.sideEffects || [],
                    exerciseImpact: med.exerciseImpact || 'none',
                    precautions: med.precautions || []
                }))
            })),
            medicalHistory: (medicalHistory || []).map((mh) => ({
                condition: mh.condition,
                date: new Date(mh.date),
                severity: mh.severity || 'mild',
                treatment: mh.treatment,
                currentStatus: mh.currentStatus || 'resolved',
                restrictions: mh.restrictions || []
            })),
            currentSymptoms: (currentSymptoms || []).map((cs) => ({
                symptom: cs.symptom,
                severity: parseInt(cs.severity) || 5,
                frequency: cs.frequency || 'sometimes',
                triggers: cs.triggers || [],
                duration: cs.duration || ''
            })),
            physicalLimitations: (physicalLimitations || []).map((pl) => ({
                bodyPart: pl.bodyPart,
                limitation: pl.limitation,
                severity: pl.severity || 'mild',
                cause: pl.cause,
                recommendations: pl.recommendations || []
            })),
            exerciseRestrictions: req.body.exerciseRestrictions || [],
            emergencyContact: {
                name: emergencyContact.name,
                relationship: emergencyContact.relationship,
                phone: emergencyContact.phone,
                email: emergencyContact.email
            },
            medicalTeam: (medicalTeam || []).map((mt) => ({
                doctorName: mt.doctorName,
                specialty: mt.specialty,
                hospital: mt.hospital,
                phone: mt.phone,
                email: mt.email,
                lastConsultation: new Date(mt.lastConsultation),
                nextAppointment: mt.nextAppointment ? new Date(mt.nextAppointment) : undefined
            })),
            riskAssessment,
            exerciseRecommendations: [],
            monitoringPlan: {
                vitalSignsFrequency: riskAssessment.overallRisk === HealthAssessment_1.HealthRiskLevel.HIGH ? 'weekly' : 'monthly',
                medicalCheckupFrequency: riskAssessment.overallRisk === HealthAssessment_1.HealthRiskLevel.HIGH ? 'quarterly' : 'biannually',
                parametersToMonitor: getMonitoringParameters(chronicConditions || []),
                alertThresholds: getAlertThresholds(chronicConditions || []),
                reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            assessedBy: new mongoose_1.default.Types.ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            version: 1
        });
        const savedAssessment = await healthAssessment.save();
        res.status(201).json({
            message: '건강 상태 평가가 성공적으로 등록되었습니다.',
            data: savedAssessment
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 평가 등록 오류:', error);
        res.status(500).json({
            error: '건강 평가 등록에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
    function calculateRiskAssessment(basicHealth, chronicConditions, vitalSigns) {
        let cardiovascularRisk = 0;
        let metabolicRisk = 0;
        let musculoskeletalRisk = 0;
        let respiratoryRisk = 0;
        const riskFactors = [];
        if (basicHealth.age >= 65) {
            cardiovascularRisk += 15;
            riskFactors.push({ factor: '고령 (65세 이상)', severity: 7, modifiable: false });
        }
        else if (basicHealth.age >= 45) {
            cardiovascularRisk += 10;
            riskFactors.push({ factor: '중년 (45세 이상)', severity: 5, modifiable: false });
        }
        const height = parseFloat(basicHealth.height) / 100;
        const weight = parseFloat(basicHealth.weight);
        const bmi = weight / (height * height);
        if (bmi >= 35) {
            metabolicRisk += 25;
            cardiovascularRisk += 15;
            riskFactors.push({ factor: '고도비만 (BMI ≥35)', severity: 8, modifiable: true });
        }
        else if (bmi >= 30) {
            metabolicRisk += 20;
            cardiovascularRisk += 10;
            riskFactors.push({ factor: '비만 (BMI 30-34.9)', severity: 6, modifiable: true });
        }
        else if (bmi >= 25) {
            metabolicRisk += 10;
            riskFactors.push({ factor: '과체중 (BMI 25-29.9)', severity: 4, modifiable: true });
        }
        if (basicHealth.smokingStatus === 'current') {
            cardiovascularRisk += 25;
            respiratoryRisk += 20;
            riskFactors.push({ factor: '현재 흡연', severity: 9, modifiable: true });
        }
        else if (basicHealth.smokingStatus === 'former') {
            cardiovascularRisk += 10;
            riskFactors.push({ factor: '과거 흡연', severity: 4, modifiable: false });
        }
        chronicConditions.forEach(condition => {
            switch (condition.condition) {
                case HealthAssessment_1.ChronicCondition.HYPERTENSION:
                    cardiovascularRisk += condition.controlled ? 15 : 30;
                    riskFactors.push({
                        factor: `고혈압 (${condition.controlled ? '조절됨' : '조절안됨'})`,
                        severity: condition.controlled ? 6 : 9,
                        modifiable: true
                    });
                    break;
                case HealthAssessment_1.ChronicCondition.DIABETES_TYPE2:
                    metabolicRisk += condition.controlled ? 20 : 35;
                    cardiovascularRisk += 15;
                    riskFactors.push({
                        factor: `제2형 당뇨병 (${condition.controlled ? '조절됨' : '조절안됨'})`,
                        severity: condition.controlled ? 7 : 9,
                        modifiable: true
                    });
                    break;
                case HealthAssessment_1.ChronicCondition.HEART_DISEASE:
                    cardiovascularRisk += 40;
                    riskFactors.push({ factor: '심장질환', severity: 10, modifiable: false });
                    break;
                case HealthAssessment_1.ChronicCondition.ASTHMA:
                    respiratoryRisk += condition.controlled ? 15 : 25;
                    riskFactors.push({
                        factor: `천식 (${condition.controlled ? '조절됨' : '조절안됨'})`,
                        severity: condition.controlled ? 5 : 8,
                        modifiable: true
                    });
                    break;
                case HealthAssessment_1.ChronicCondition.ARTHRITIS:
                    musculoskeletalRisk += 20;
                    riskFactors.push({ factor: '관절염', severity: 6, modifiable: true });
                    break;
            }
        });
        if (vitalSigns.length > 0) {
            const latest = vitalSigns[vitalSigns.length - 1];
            if (latest.systolicBP >= 180 || latest.diastolicBP >= 110) {
                cardiovascularRisk += 30;
                riskFactors.push({ factor: '고혈압 위기', severity: 10, modifiable: true });
            }
            else if (latest.systolicBP >= 160 || latest.diastolicBP >= 100) {
                cardiovascularRisk += 20;
                riskFactors.push({ factor: '고혈압 2단계', severity: 8, modifiable: true });
            }
            if (latest.bloodGlucose && latest.bloodGlucose >= 200) {
                metabolicRisk += 25;
                riskFactors.push({ factor: '혈당 매우 높음', severity: 9, modifiable: true });
            }
        }
        const avgRisk = (cardiovascularRisk + metabolicRisk + musculoskeletalRisk + respiratoryRisk) / 4;
        let overallRisk;
        if (avgRisk >= 70 || cardiovascularRisk >= 80) {
            overallRisk = HealthAssessment_1.HealthRiskLevel.CRITICAL;
        }
        else if (avgRisk >= 55 || cardiovascularRisk >= 65) {
            overallRisk = HealthAssessment_1.HealthRiskLevel.VERY_HIGH;
        }
        else if (avgRisk >= 40 || cardiovascularRisk >= 50) {
            overallRisk = HealthAssessment_1.HealthRiskLevel.HIGH;
        }
        else if (avgRisk >= 25) {
            overallRisk = HealthAssessment_1.HealthRiskLevel.MODERATE;
        }
        else if (avgRisk >= 15) {
            overallRisk = HealthAssessment_1.HealthRiskLevel.LOW;
        }
        else {
            overallRisk = HealthAssessment_1.HealthRiskLevel.VERY_LOW;
        }
        return {
            overallRisk,
            cardiovascularRisk: Math.min(cardiovascularRisk, 100),
            metabolicRisk: Math.min(metabolicRisk, 100),
            musculoskeletalRisk: Math.min(musculoskeletalRisk, 100),
            respiratoryRisk: Math.min(respiratoryRisk, 100),
            riskFactors,
            clearanceRequired: overallRisk === HealthAssessment_1.HealthRiskLevel.HIGH ||
                overallRisk === HealthAssessment_1.HealthRiskLevel.VERY_HIGH ||
                overallRisk === HealthAssessment_1.HealthRiskLevel.CRITICAL,
            clearanceObtained: false
        };
    }
    function getMonitoringParameters(chronicConditions) {
        const parameters = ['체중', '활동 수준'];
        chronicConditions.forEach(condition => {
            switch (condition.condition) {
                case HealthAssessment_1.ChronicCondition.HYPERTENSION:
                    parameters.push('혈압', '심박수');
                    break;
                case HealthAssessment_1.ChronicCondition.DIABETES_TYPE1:
                case HealthAssessment_1.ChronicCondition.DIABETES_TYPE2:
                    parameters.push('혈당', '체중');
                    break;
                case HealthAssessment_1.ChronicCondition.HEART_DISEASE:
                    parameters.push('심박수', '운동능력');
                    break;
                case HealthAssessment_1.ChronicCondition.ASTHMA:
                    parameters.push('호흡기능', '증상 빈도');
                    break;
            }
        });
        return [...new Set(parameters)];
    }
    function getAlertThresholds(chronicConditions) {
        const thresholds = [];
        chronicConditions.forEach(condition => {
            switch (condition.condition) {
                case HealthAssessment_1.ChronicCondition.HYPERTENSION:
                    thresholds.push({
                        parameter: '수축기혈압',
                        maxValue: 180,
                        action: '즉시 운동 중단 및 의료진 연락'
                    });
                    thresholds.push({
                        parameter: '이완기혈압',
                        maxValue: 110,
                        action: '즉시 운동 중단 및 의료진 연락'
                    });
                    break;
                case HealthAssessment_1.ChronicCondition.DIABETES_TYPE2:
                    thresholds.push({
                        parameter: '혈당',
                        minValue: 70,
                        maxValue: 250,
                        action: '혈당 조절 후 운동 재개'
                    });
                    break;
                case HealthAssessment_1.ChronicCondition.HEART_DISEASE:
                    thresholds.push({
                        parameter: '심박수',
                        maxValue: 150,
                        action: '운동 강도 즉시 감소'
                    });
                    break;
            }
        });
        return thresholds;
    }
});
router.post('/prescription', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        const { healthAssessmentId, goals, preferences, environmentalFactors } = req.body;
        if (!healthAssessmentId || !goals || !preferences) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['healthAssessmentId', 'goals', 'preferences']
            });
        }
        const healthAssessment = await HealthAssessment_1.HealthAssessment.findById(healthAssessmentId);
        if (!healthAssessment) {
            return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
        }
        if (healthAssessment.userId.toString() !== userId &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const prescriptionRequest = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            healthAssessmentId: new mongoose_1.default.Types.ObjectId(healthAssessmentId),
            goals: goals,
            preferences: {
                exerciseTypes: preferences.exerciseTypes || [],
                timeAvailable: parseInt(preferences.timeAvailable) || 30,
                daysPerWeek: parseInt(preferences.daysPerWeek) || 3,
                intensity: preferences.intensity || 'moderate'
            },
            environmentalFactors: {
                poolAvailable: environmentalFactors?.poolAvailable || false,
                gymAccess: environmentalFactors?.gymAccess || false,
                homeEquipment: environmentalFactors?.homeEquipment || [],
                weatherRestrictions: environmentalFactors?.weatherRestrictions || []
            }
        };
        const prescription = await medicalExercisePrescriptionService_1.MedicalExercisePrescriptionService.createMedicalPrescription(prescriptionRequest);
        res.status(201).json({
            message: '의학적 운동 처방이 성공적으로 생성되었습니다.',
            data: prescription
        });
    }
    catch (error) {
        (0, logger_1.logError)('운동 처방 생성 오류:', error);
        res.status(500).json({
            error: '운동 처방 생성에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/clearance/:assessmentId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
        }
        const assessment = await HealthAssessment_1.HealthAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
        }
        if (assessment.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const clearanceResult = await medicalExercisePrescriptionService_1.MedicalExercisePrescriptionService.checkExerciseClearance(new mongoose_1.default.Types.ObjectId(assessmentId));
        res.json({
            message: '운동 허가 상태를 성공적으로 확인했습니다.',
            data: clearanceResult
        });
    }
    catch (error) {
        (0, logger_1.logError)('운동 허가 확인 오류:', error);
        res.status(500).json({
            error: '운동 허가 확인에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/user/:userId/assessments', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestUserId = req.user?._id;
        if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const assessments = await medicalExercisePrescriptionService_1.MedicalExercisePrescriptionService.getUserHealthAssessments(new mongoose_1.default.Types.ObjectId(userId));
        res.json({
            message: '건강 평가 목록을 성공적으로 조회했습니다.',
            data: assessments
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 평가 목록 조회 오류:', error);
        res.status(500).json({
            error: '건강 평가 목록 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/high-risk-patients', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin' &&
            req.user?.userType !== 'instructor') {
            return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
        }
        const highRiskPatients = await medicalExercisePrescriptionService_1.MedicalExercisePrescriptionService.getHighRiskPatients();
        res.json({
            message: '고위험군 환자 목록을 성공적으로 조회했습니다.',
            data: highRiskPatients
        });
    }
    catch (error) {
        (0, logger_1.logError)('고위험군 조회 오류:', error);
        res.status(500).json({
            error: '고위험군 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/pending-clearances', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin' &&
            req.user?.userType !== 'instructor') {
            return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
        }
        const pendingClearances = await medicalExercisePrescriptionService_1.MedicalExercisePrescriptionService.getPendingClearances();
        res.json({
            message: '승인 대기 목록을 성공적으로 조회했습니다.',
            data: pendingClearances
        });
    }
    catch (error) {
        (0, logger_1.logError)('승인 대기 목록 조회 오류:', error);
        res.status(500).json({
            error: '승인 대기 목록 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:assessmentId/approve', auth_1.authMiddleware, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { approved, notes } = req.body;
        if (req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin' &&
            req.user?.userType !== 'instructor') {
            return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
        }
        const assessment = await HealthAssessment_1.HealthAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
        }
        assessment.riskAssessment.clearanceObtained = approved;
        if (approved) {
            assessment.riskAssessment.clearanceDate = new Date();
            assessment.riskAssessment.clearanceDoctor = req.user?.name || '의료진';
        }
        assessment.reviewedBy = new mongoose_1.default.Types.ObjectId(req.user?._id);
        if (approved) {
            assessment.approvedBy = new mongoose_1.default.Types.ObjectId(req.user?._id);
        }
        if (notes) {
            assessment.medicalTeam.push({
                doctorName: req.user?.name || '의료진',
                specialty: '운동의학',
                hospital: '수영장',
                phone: '000-0000-0000',
                email: req.user?.email,
                lastConsultation: new Date(),
                nextAppointment: undefined
            });
        }
        await assessment.save();
        res.json({
            message: `건강 평가가 성공적으로 ${approved ? '승인' : '거부'}되었습니다.`,
            data: assessment
        });
    }
    catch (error) {
        (0, logger_1.logError)('승인 처리 오류:', error);
        res.status(500).json({
            error: '승인 처리에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/statistics/health', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
        }
        const healthStatistics = await HealthAssessment_1.HealthAssessment.getHealthStatistics();
        const totalAssessments = await HealthAssessment_1.HealthAssessment.countDocuments({ isActive: true });
        const highRiskCount = await HealthAssessment_1.HealthAssessment.countDocuments({
            isActive: true,
            'riskAssessment.overallRisk': { $in: [HealthAssessment_1.HealthRiskLevel.HIGH, HealthAssessment_1.HealthRiskLevel.VERY_HIGH, HealthAssessment_1.HealthRiskLevel.CRITICAL] }
        });
        const pendingApprovalCount = await HealthAssessment_1.HealthAssessment.countDocuments({
            isActive: true,
            'riskAssessment.clearanceRequired': true,
            'riskAssessment.clearanceObtained': false
        });
        res.json({
            message: '건강 통계를 성공적으로 조회했습니다.',
            data: {
                overview: {
                    totalAssessments,
                    highRiskCount,
                    pendingApprovalCount,
                    highRiskPercentage: (highRiskCount / totalAssessments) * 100
                },
                riskLevelDistribution: healthStatistics
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('건강 통계 조회 오류:', error);
        res.status(500).json({
            error: '건강 통계 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/:assessmentId/vital-signs', auth_1.authMiddleware, async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const vitalSignsData = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
        }
        const assessment = await HealthAssessment_1.HealthAssessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
        }
        if (assessment.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        assessment.vitalSigns.push({
            date: new Date(),
            systolicBP: parseInt(vitalSignsData.systolicBP) || 120,
            diastolicBP: parseInt(vitalSignsData.diastolicBP) || 80,
            restingHR: parseInt(vitalSignsData.restingHR) || 70,
            bloodGlucose: vitalSignsData.bloodGlucose ? parseFloat(vitalSignsData.bloodGlucose) : undefined,
            weight: parseFloat(vitalSignsData.weight) || assessment.basicHealth.weight,
            bodyFat: vitalSignsData.bodyFat ? parseFloat(vitalSignsData.bodyFat) : undefined,
            temperature: vitalSignsData.temperature ? parseFloat(vitalSignsData.temperature) : undefined,
            oxygenSaturation: vitalSignsData.oxygenSaturation ? parseFloat(vitalSignsData.oxygenSaturation) : undefined,
            notes: vitalSignsData.notes || ''
        });
        const newRiskLevel = assessment.recalculateRisk();
        if (newRiskLevel !== assessment.riskAssessment.overallRisk) {
            assessment.riskAssessment.overallRisk = newRiskLevel;
            if (newRiskLevel === HealthAssessment_1.HealthRiskLevel.HIGH ||
                newRiskLevel === HealthAssessment_1.HealthRiskLevel.VERY_HIGH ||
                newRiskLevel === HealthAssessment_1.HealthRiskLevel.CRITICAL) {
                assessment.riskAssessment.clearanceRequired = true;
                assessment.riskAssessment.clearanceObtained = false;
            }
        }
        await assessment.save();
        res.json({
            message: '생체신호가 성공적으로 추가되었습니다.',
            data: {
                latestVitalSigns: assessment.vitalSigns[assessment.vitalSigns.length - 1],
                riskLevel: assessment.riskAssessment.overallRisk,
                clearanceRequired: assessment.riskAssessment.clearanceRequired
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('생체신호 추가 오류:', error);
        res.status(500).json({
            error: '생체신호 추가에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=medicalExercisePrescription.js.map