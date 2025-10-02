"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ExercisePrescription_1 = require("../models/ExercisePrescription");
const User_1 = require("../models/User");
const HealthData_1 = require("../models/HealthData");
const ExercisePrescriptionSystem_1 = require("../utils/ExercisePrescriptionSystem");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/create', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, centerId, instructorId, creationReason } = req.body;
        const currentUser = req.user;
        console.log(`🏃‍♂️ 운동 처방 생성 요청: 사용자 ${userId}, 센터 ${centerId}`);
        if (currentUser.role === 'member' && currentUser.id !== userId) {
            return res.status(403).json({
                success: false,
                message: '본인의 운동 처방만 생성할 수 있습니다.'
            });
        }
        if (currentUser.role === 'instructor' && !instructorId) {
            return res.status(400).json({
                success: false,
                message: '강사 처방 시 instructorId가 필요합니다.'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }
        const healthData = await HealthData_1.HealthData.findOne({ userId }).sort({ createdAt: -1 });
        if (!healthData) {
            return res.status(404).json({
                success: false,
                message: '건강 정보가 없어 운동 처방을 생성할 수 없습니다.'
            });
        }
        const existingPrescription = await ExercisePrescription_1.ExercisePrescription.findOne({
            userId,
            'status.isActive': true
        });
        if (existingPrescription) {
            return res.status(400).json({
                success: false,
                message: '이미 활성화된 운동 처방이 있습니다. 기존 처방을 수정하거나 비활성화 후 새로 생성해주세요.'
            });
        }
        const healthGrade = ExercisePrescriptionSystem_1.ExercisePrescriptionSystem.classifyHealthGrade(healthData, user);
        const prescription = ExercisePrescriptionSystem_1.ExercisePrescriptionSystem.generateExercisePrescription(healthGrade, healthData, user);
        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + 7);
        const newPrescription = new ExercisePrescription_1.ExercisePrescription({
            userId,
            centerId: centerId || null,
            instructorId: instructorId || null,
            healthGrade,
            currentPrescription: prescription,
            prescriptionInfo: {
                createdBy: currentUser.role === 'member' ? 'user' :
                    currentUser.role === 'instructor' ? 'instructor' :
                        currentUser.role === 'centerAdmin' ? 'center_admin' : 'system',
                createdByUserId: currentUser.id,
                creationReason: creationReason || '시스템 자동 생성',
                baseHealthData: healthData,
                algorithmVersion: '1.0'
            },
            adjustmentHistory: [],
            exerciseHistory: [],
            status: {
                isActive: true,
                lastUpdated: new Date(),
                nextReviewDate,
                totalSessions: 0,
                averageCompletionRate: 0,
                currentStreak: 0,
                longestStreak: 0
            }
        });
        await newPrescription.save();
        console.log(`✅ 운동 처방 생성 완료: 등급 ${healthGrade.overallGrade}, 강도 ${prescription.targetHeartRate.optimal}bpm`);
        res.json({
            success: true,
            data: {
                prescriptionId: newPrescription._id,
                healthGrade,
                prescription,
                nextReviewDate
            },
            message: '운동 처방이 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 운동 처방 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 처방 생성 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser.role === 'member' && currentUser.id !== userId) {
            return res.status(403).json({
                success: false,
                message: '본인의 운동 처방만 조회할 수 있습니다.'
            });
        }
        const prescription = await ExercisePrescription_1.ExercisePrescription.findOne({
            userId,
            'status.isActive': true
        }).populate('user', 'name email').populate('center', 'name').populate('instructor', 'name');
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: '활성화된 운동 처방이 없습니다.'
            });
        }
        res.json({
            success: true,
            data: prescription,
            message: '운동 처방을 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('❌ 운동 처방 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 처방 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:prescriptionId/session', auth_1.authMiddleware, async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { actualPerformance, feedback, instructorNotes } = req.body;
        const currentUser = req.user;
        console.log(`📝 운동 이력 기록: 처방 ${prescriptionId}`);
        const prescription = await ExercisePrescription_1.ExercisePrescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: '운동 처방을 찾을 수 없습니다.'
            });
        }
        if (currentUser.role === 'member' && prescription.userId.toString() !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: '본인의 운동 이력만 기록할 수 있습니다.'
            });
        }
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const exerciseSession = {
            sessionId,
            date: new Date(),
            prescribedExercise: prescription.currentPrescription,
            actualPerformance: {
                duration: actualPerformance.duration || 0,
                distance: actualPerformance.distance || 0,
                averageHeartRate: actualPerformance.averageHeartRate || 0,
                maxHeartRate: actualPerformance.maxHeartRate || 0,
                perceivedExertion: actualPerformance.perceivedExertion || 5,
                completionRate: actualPerformance.completionRate || 0
            },
            feedback: {
                difficulty: feedback.difficulty || 'appropriate',
                fatigue: feedback.fatigue || 'moderate',
                enjoyment: feedback.enjoyment || 'moderate',
                instructorNotes: instructorNotes || ''
            },
            nextAdjustment: {
                intensityChange: 0,
                durationChange: 0,
                reason: '처음 기록'
            }
        };
        prescription.exerciseHistory.push(exerciseSession);
        prescription.status.totalSessions += 1;
        prescription.status.currentStreak += 1;
        prescription.status.longestStreak = Math.max(prescription.status.longestStreak, prescription.status.currentStreak);
        const totalCompletionRate = prescription.exerciseHistory.reduce((sum, session) => sum + session.actualPerformance.completionRate, 0);
        prescription.status.averageCompletionRate = totalCompletionRate / prescription.exerciseHistory.length;
        await prescription.save();
        const adjustment = ExercisePrescriptionSystem_1.ExercisePrescriptionSystem.calculateHistoryBasedAdjustment(prescription.exerciseHistory);
        console.log(`✅ 운동 이력 기록 완료: 완주율 ${actualPerformance.completionRate}%, 조정 ${adjustment.adjustmentType}`);
        res.json({
            success: true,
            data: {
                sessionId,
                adjustment,
                updatedStats: {
                    totalSessions: prescription.status.totalSessions,
                    averageCompletionRate: prescription.status.averageCompletionRate,
                    currentStreak: prescription.status.currentStreak
                }
            },
            message: '운동 이력이 성공적으로 기록되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 운동 이력 기록 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 이력 기록 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:prescriptionId/adjust', auth_1.authMiddleware, async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { adjustmentType, adjustmentAmount, reason, manualAdjustment } = req.body;
        const currentUser = req.user;
        console.log(`🔄 운동 처방 조정: 처방 ${prescriptionId}, 타입 ${adjustmentType}`);
        const prescription = await ExercisePrescription_1.ExercisePrescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: '운동 처방을 찾을 수 없습니다.'
            });
        }
        if (currentUser.role === 'member' && prescription.userId.toString() !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: '본인의 운동 처방만 조정할 수 있습니다.'
            });
        }
        const previousPrescription = { ...prescription.currentPrescription };
        let newPrescription = { ...prescription.currentPrescription };
        if (manualAdjustment) {
            if (manualAdjustment.sessionDuration) {
                newPrescription.sessionDuration = manualAdjustment.sessionDuration;
            }
            if (manualAdjustment.totalDistance) {
                newPrescription.totalDistance = manualAdjustment.totalDistance;
            }
            if (manualAdjustment.weeklyFrequency) {
                newPrescription.weeklyFrequency = manualAdjustment.weeklyFrequency;
            }
        }
        else {
            const adjustmentFactor = 1 + (adjustmentAmount / 100);
            if (adjustmentType === 'increase') {
                newPrescription.sessionDuration = Math.round(newPrescription.sessionDuration * adjustmentFactor);
                newPrescription.totalDistance = Math.round(newPrescription.totalDistance * adjustmentFactor);
            }
            else if (adjustmentType === 'decrease') {
                newPrescription.sessionDuration = Math.round(newPrescription.sessionDuration / adjustmentFactor);
                newPrescription.totalDistance = Math.round(newPrescription.totalDistance / adjustmentFactor);
            }
        }
        const adjustmentRecord = {
            adjustmentId: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: new Date(),
            type: adjustmentType,
            amount: adjustmentAmount,
            reason: Array.isArray(reason) ? reason : [reason],
            confidence: manualAdjustment ? 1.0 : 0.8,
            adjustedBy: currentUser.role === 'member' ? 'user' :
                currentUser.role === 'instructor' ? 'instructor' :
                    currentUser.role === 'centerAdmin' ? 'center_admin' : 'system',
            adjustedByUserId: currentUser.id,
            previousPrescription,
            newPrescription
        };
        prescription.currentPrescription = newPrescription;
        prescription.adjustmentHistory.push(adjustmentRecord);
        prescription.status.lastUpdated = new Date();
        await prescription.save();
        console.log(`✅ 운동 처방 조정 완료: ${adjustmentType} ${adjustmentAmount}%`);
        res.json({
            success: true,
            data: {
                adjustmentRecord,
                newPrescription
            },
            message: '운동 처방이 성공적으로 조정되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 운동 처방 조정 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 처방 조정 중 오류가 발생했습니다.'
        });
    }
});
router.get('/center/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { centerId } = req.params;
        const { page = 1, limit = 10, status = 'active' } = req.query;
        const currentUser = req.user;
        if (currentUser.role === 'member') {
            return res.status(403).json({
                success: false,
                message: '센터별 운동 처방 조회 권한이 없습니다.'
            });
        }
        const query = { centerId };
        if (status === 'active') {
            query['status.isActive'] = true;
        }
        const prescriptions = await ExercisePrescription_1.ExercisePrescription.find(query)
            .populate('user', 'name email phone')
            .populate('instructor', 'name')
            .sort({ 'status.lastUpdated': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        const total = await ExercisePrescription_1.ExercisePrescription.countDocuments(query);
        res.json({
            success: true,
            data: {
                prescriptions,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total
                }
            },
            message: '센터별 운동 처방을 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('❌ 센터별 운동 처방 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터별 운동 처방 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:prescriptionId/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const currentUser = req.user;
        const prescription = await ExercisePrescription_1.ExercisePrescription.findById(prescriptionId);
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: '운동 처방을 찾을 수 없습니다.'
            });
        }
        if (currentUser.role === 'member' && prescription.userId.toString() !== currentUser.id) {
            return res.status(403).json({
                success: false,
                message: '본인의 운동 처방 통계만 조회할 수 있습니다.'
            });
        }
        const stats = {
            totalSessions: prescription.status.totalSessions,
            averageCompletionRate: prescription.status.averageCompletionRate,
            currentStreak: prescription.status.currentStreak,
            longestStreak: prescription.status.longestStreak,
            totalAdjustments: prescription.adjustmentHistory.length,
            recentPerformance: prescription.exerciseHistory.slice(-5).map(session => ({
                date: session.date,
                completionRate: session.actualPerformance.completionRate,
                difficulty: session.feedback.difficulty,
                fatigue: session.feedback.fatigue
            })),
            healthGrade: prescription.healthGrade,
            currentPrescription: prescription.currentPrescription
        };
        res.json({
            success: true,
            data: stats,
            message: '운동 처방 통계를 성공적으로 조회했습니다.'
        });
    }
    catch (error) {
        console.error('❌ 운동 처방 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '운동 처방 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=exercise-prescription.js.map