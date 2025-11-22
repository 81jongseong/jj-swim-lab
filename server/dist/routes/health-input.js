"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const Checklist_1 = require("../models/Checklist");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/input', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🏥 건강정보 저장 요청');
        const userId = req.user._id;
        const healthData = req.body;
        if (!healthData) {
            return res.status(400).json({
                success: false,
                message: '건강정보 데이터가 필요합니다.'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        let bmi = undefined;
        if (healthData.height && healthData.weight) {
            bmi = healthData.weight / Math.pow(healthData.height / 100, 2);
        }
        let obesityStatus = 'normal';
        if (bmi) {
            if (bmi < 18.5)
                obesityStatus = 'underweight';
            else if (bmi < 23.0)
                obesityStatus = 'normal';
            else if (bmi < 25.0)
                obesityStatus = 'overweight';
            else
                obesityStatus = 'obese';
        }
        let hypertensionStatus = 'normal';
        if (healthData.bloodPressure?.systolic && healthData.bloodPressure?.diastolic) {
            const { systolic, diastolic } = healthData.bloodPressure;
            if (systolic < 120 && diastolic < 80)
                hypertensionStatus = 'normal';
            else if (systolic < 130 && diastolic < 80)
                hypertensionStatus = 'elevated';
            else if (systolic < 140 || diastolic < 90)
                hypertensionStatus = 'stage1';
            else
                hypertensionStatus = 'stage2';
        }
        user.healthProfile = {
            age: healthData.age,
            gender: healthData.gender,
            height: healthData.height,
            weight: healthData.weight,
            bmi,
            bloodPressure: healthData.bloodPressure,
            obesityStatus,
            hypertensionStatus,
            chronicConditions: healthData.chronicConditions || [],
            allergies: healthData.allergies || [],
            medications: healthData.medications || [],
            emergencyContact: healthData.emergencyContact,
            specialConditions: healthData.specialConditions,
            lastUpdated: new Date()
        };
        await user.save();
        console.log('✅ 건강정보 저장 완료:', userId);
        console.log('  - BMI:', bmi?.toFixed(1), '→', obesityStatus);
        console.log('  - 혈압:', healthData.bloodPressure?.systolic, '/', healthData.bloodPressure?.diastolic, '→', hypertensionStatus);
        res.json({
            success: true,
            message: '건강정보가 성공적으로 저장되었습니다.',
            data: {
                userId: user._id,
                healthProfile: user.healthProfile,
                autoClassification: {
                    bmi: bmi?.toFixed(1),
                    obesityStatus,
                    hypertensionStatus
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 건강정보 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/checklist', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('📋 체크리스트 불러오기 요청');
        const userId = req.user._id;
        const userType = req.user.userType;
        let checklists = [];
        if (userType === 'instructor') {
            checklists = await Checklist_1.Checklist.find({ instructorId: userId })
                .populate('studentId', 'name email phone currentLevel')
                .populate('courseId', 'name level')
                .sort({ lastUpdated: -1 });
        }
        else if (userType === 'student') {
            checklists = await Checklist_1.Checklist.find({ studentId: userId })
                .populate('instructorId', 'name email')
                .populate('courseId', 'name level')
                .sort({ lastUpdated: -1 });
        }
        else if (userType === 'centerAdmin') {
            const managedCenters = req.user.centerAdminInfo?.managedCenters || [];
            if (managedCenters.length > 0) {
                checklists = await Checklist_1.Checklist.find()
                    .populate('studentId', 'name email phone currentLevel')
                    .populate('instructorId', 'name email')
                    .populate('courseId', 'name level')
                    .sort({ lastUpdated: -1 });
            }
        }
        console.log('✅ 체크리스트 조회 완료:', checklists.length, '개');
        res.json({
            success: true,
            message: '체크리스트를 성공적으로 불러왔습니다.',
            data: {
                checklists,
                totalCount: checklists.length,
                userType
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 체크리스트 불러오기 오류:', error);
        res.status(500).json({
            success: false,
            message: '체크리스트를 불러오는데 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/checklist/:checklistId', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('📋 체크리스트 상세 조회 요청');
        const { checklistId } = req.params;
        const userId = req.user._id;
        const userType = req.user.userType;
        const checklist = await Checklist_1.Checklist.findById(checklistId)
            .populate('studentId', 'name email phone currentLevel')
            .populate('instructorId', 'name email')
            .populate('courseId', 'name level');
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: '체크리스트를 찾을 수 없습니다.'
            });
        }
        const canAccess = userType === 'superAdmin' ||
            checklist.studentId._id.toString() === userId.toString() ||
            checklist.instructorId._id.toString() === userId.toString() ||
            (userType === 'centerAdmin' && req.user.centerAdminInfo?.managedCenters?.length > 0);
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: '이 체크리스트에 접근할 권한이 없습니다.'
            });
        }
        console.log('✅ 체크리스트 상세 조회 완료:', checklistId);
        res.json({
            success: true,
            message: '체크리스트 상세 정보를 성공적으로 불러왔습니다.',
            data: checklist
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 체크리스트 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '체크리스트 상세 정보를 불러오는데 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/info', auth_1.authMiddleware, async (req, res) => {
    try {
        console.log('🏥 건강정보 조회 요청');
        const userId = req.user._id;
        const user = await User_1.User.findById(userId).select('healthInfo');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        console.log('✅ 건강정보 조회 완료:', userId);
        res.json({
            success: true,
            message: '건강정보를 성공적으로 조회했습니다.',
            data: {
                healthInfo: user.healthInfo || {},
                lastUpdated: user.healthInfo?.lastUpdated || null
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('❌ 건강정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보를 조회하는데 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=health-input.js.map