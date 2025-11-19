"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRoutineRecommendationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const HealthData_1 = require("../models/HealthData");
const LearningProgress_1 = require("../models/LearningProgress");
const ExercisePrescriptionSystem_1 = require("../utils/ExercisePrescriptionSystem");
class AIRoutineRecommendationService {
    static async analyzeUserPattern(userId) {
        const userIdObject = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const [programs, healthData, progress] = await Promise.all([
            SwimProgram_1.default.find({ athleteId: userIdObject })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
            HealthData_1.HealthData.findOne({ studentId: userIdObject }).lean(),
            LearningProgress_1.LearningProgress.find({ studentId: userIdObject })
                .sort({ updatedAt: -1 })
                .limit(10)
                .lean()
        ]);
        const sessionTimes = [];
        const sessionDurations = [];
        const daysOfWeek = [];
        const intensities = [];
        const strokes = [];
        let completedSessions = 0;
        let totalSessions = 0;
        const instructorCompletions = [];
        const selfCompletions = [];
        let totalSessionsWithInstructorRate = 0;
        let totalSessionsWithSelfRate = 0;
        let completedSessionsWithInstructorRate = 0;
        let completedSessionsWithSelfRate = 0;
        programs.forEach((program) => {
            if (program.executionHistory && Array.isArray(program.executionHistory)) {
                program.executionHistory.forEach((exec) => {
                    if (exec.executedDate) {
                        const date = new Date(exec.executedDate);
                        const hour = date.getHours();
                        sessionTimes.push(hour);
                        daysOfWeek.push(date.getDay());
                    }
                    if (exec.completion?.completionRate) {
                        const inputByRole = exec.completion.inputByRole || 'self';
                        const rate = exec.completion.completionRate;
                        if (inputByRole === 'instructor') {
                            instructorCompletions.push(rate);
                            totalSessionsWithInstructorRate++;
                            if (rate >= 80) {
                                completedSessionsWithInstructorRate++;
                            }
                        }
                        else {
                            selfCompletions.push(rate);
                            totalSessionsWithSelfRate++;
                            if (rate >= 80) {
                                completedSessionsWithSelfRate++;
                            }
                        }
                    }
                });
            }
        });
        const avgHour = sessionTimes.length > 0
            ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length
            : 14;
        const preferredTimeOfDay = avgHour < 10 ? 'morning' :
            avgHour < 17 ? 'afternoon' :
                avgHour < 21 ? 'evening' : 'flexible';
        const avgDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
            : 45;
        const dayCounts = {};
        daysOfWeek.forEach(day => {
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        const preferredDays = Object.entries(dayCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([day]) => parseInt(day));
        const user = await User_1.User.findById(userId).lean();
        const isPaidMember = user?.membership ||
            user?.subscription ||
            (user?.studentInfo?.membershipTier &&
                user?.studentInfo?.membershipTier !== 'guest') ||
            false;
        let completionRate = 70;
        if (isPaidMember) {
            if (totalSessionsWithSelfRate > 0) {
                completionRate = (completedSessionsWithSelfRate / totalSessionsWithSelfRate) * 100;
            }
            else if (totalSessionsWithInstructorRate > 0) {
                completionRate = (completedSessionsWithInstructorRate / totalSessionsWithInstructorRate) * 100;
            }
        }
        else {
            if (totalSessionsWithInstructorRate > 0) {
                completionRate = (completedSessionsWithInstructorRate / totalSessionsWithInstructorRate) * 100;
            }
        }
        const recentPrograms = programs.slice(0, 4);
        const weeklyCompletions = recentPrograms.map((p) => {
            if (!p.executionHistory)
                return 0;
            const weekCompletions = p.executionHistory.filter((e) => {
                if (!e.completion?.completionRate)
                    return false;
                const rate = e.completion.completionRate;
                const inputByRole = e.completion.inputByRole || 'self';
                if (isPaidMember) {
                    return rate >= 80 && inputByRole === 'self';
                }
                else {
                    return rate >= 80 && inputByRole === 'instructor';
                }
            }).length;
            return weekCompletions;
        });
        const consistencyScore = weeklyCompletions.length > 0
            ? (weeklyCompletions.reduce((a, b) => a + b, 0) / weeklyCompletions.length) * 10
            : 70;
        const improvementTrend = this.calculateImprovementTrend(progress);
        const weeklyFrequency = preferredDays.length > 0 ? preferredDays.length : 3;
        return {
            preferredTimeOfDay,
            averageSessionDuration: Math.round(avgDuration),
            preferredDaysOfWeek: preferredDays.length > 0 ? preferredDays : [1, 3, 5],
            completionRate: Math.round(completionRate),
            intensityPreference: this.determineIntensityPreference(intensities),
            strokePreference: Array.from(new Set(strokes)),
            consistencyScore: Math.round(consistencyScore),
            improvementTrend,
            weeklyFrequency
        };
    }
    static calculateImprovementTrend(progress) {
        if (progress.length < 3)
            return 'stable';
        const recent = progress.slice(0, 3);
        const older = progress.slice(3, 6);
        if (older.length === 0)
            return 'stable';
        const recentAvg = recent.reduce((sum, p) => sum + (p.progress || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + (p.progress || 0), 0) / older.length;
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        if (change > 5)
            return 'improving';
        if (change < -5)
            return 'declining';
        return 'stable';
    }
    static determineIntensityPreference(intensities) {
        if (intensities.length === 0)
            return 'moderate';
        const counts = {};
        intensities.forEach(int => {
            counts[int] = (counts[int] || 0) + 1;
        });
        const uniqueIntensities = Object.keys(counts).length;
        if (uniqueIntensities >= 3)
            return 'varied';
        const maxIntensity = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])[0][0];
        if (maxIntensity.includes('low') || maxIntensity.includes('easy'))
            return 'low';
        if (maxIntensity.includes('high') || maxIntensity.includes('hard'))
            return 'high';
        return 'moderate';
    }
    static async generateRoutineRecommendation(userId, goals = []) {
        const userIdObject = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const [user, pattern, healthData] = await Promise.all([
            User_1.User.findById(userIdObject).lean(),
            this.analyzeUserPattern(userIdObject),
            HealthData_1.HealthData.findOne({ studentId: userIdObject }).lean()
        ]);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        let prescription = null;
        if (healthData) {
            try {
                const prescriptionResult = await ExercisePrescriptionSystem_1.ExercisePrescriptionSystem.buildPrescriptionForUser(userIdObject.toString());
                prescription = prescriptionResult.prescription;
            }
            catch (error) {
                console.error('처방 생성 실패:', error);
            }
        }
        const defaultGoals = [
            '기술 향상',
            '체력 개선',
            '일관성 유지'
        ];
        const weeklySchedule = pattern.preferredDaysOfWeek.map((day, index) => {
            const timeSlots = {
                morning: '07:00-09:00',
                afternoon: '14:00-16:00',
                evening: '19:00-21:00',
                flexible: '10:00-18:00'
            };
            const focusAreas = [
                '기술 연습',
                '지구력 향상',
                '스피드 훈련',
                '복합 훈련'
            ];
            const intensityLevels = pattern.intensityPreference === 'varied'
                ? ['low', 'moderate', 'high']
                : pattern.intensityPreference === 'low'
                    ? ['low', 'moderate']
                    : pattern.intensityPreference === 'high'
                        ? ['moderate', 'high']
                        : ['moderate'];
            const intensity = intensityLevels[index % intensityLevels.length];
            return {
                dayOfWeek: day,
                recommendedTime: timeSlots[pattern.preferredTimeOfDay],
                sessionDuration: pattern.averageSessionDuration || (prescription?.sessionDuration || 45),
                intensity,
                focusArea: focusAreas[index % focusAreas.length],
                strokes: pattern.strokePreference.length > 0
                    ? pattern.strokePreference
                    : ['freestyle']
            };
        });
        const totalWeeklyDuration = weeklySchedule.reduce((sum, s) => sum + s.sessionDuration, 0);
        const avgPace = 2;
        const totalWeeklyDistance = Math.round(totalWeeklyDuration * avgPace * 10);
        const expectedCompletionRate = Math.min(100, pattern.completionRate +
            (pattern.consistencyScore > 80 ? 10 : 0) -
            (pattern.consistencyScore < 60 ? 10 : 0));
        const suitabilityScore = Math.round((pattern.completionRate * 0.3) +
            (pattern.consistencyScore * 0.3) +
            (expectedCompletionRate * 0.2) +
            (pattern.improvementTrend === 'improving' ? 20 :
                pattern.improvementTrend === 'stable' ? 10 : 0));
        const reasoning = [
            `완료율 ${pattern.completionRate}%를 기준으로 맞춤형 스케줄 제안`,
            `선호 시간대(${pattern.preferredTimeOfDay})에 최적화된 루틴`,
            pattern.consistencyScore > 80
                ? '높은 일관성 점수로 인한 점진적 강도 증가 가능'
                : '일관성 개선을 위한 단계적 접근',
            pattern.improvementTrend === 'improving'
                ? '지속적인 향상 추세 반영'
                : '안정적인 진행을 위한 균형잡힌 루틴'
        ];
        const adaptations = {
            ifLowCompletion: '세션 시간을 20% 단축하고 강도를 낮춰 완료율 향상',
            ifHighCompletion: '세션 시간을 15% 늘리고 난이도 있는 운동 추가',
            ifInjury: '휴식일 증가 및 저강도 유지형 운동으로 전환',
            ifTimeLimited: '세션을 더 짧게 분할하되 주당 빈도는 유지'
        };
        return {
            routineId: `routine_${userId}_${Date.now()}`,
            routineName: `${user.name || '회원'}님의 맞춤형 주간 루틴`,
            description: `AI 분석을 기반으로 한 개인 맞춤형 주간 수영 루틴입니다. ${pattern.preferredDaysOfWeek.length}일 동안 총 ${totalWeeklyDuration}분의 훈련을 제안합니다.`,
            weeklySchedule,
            totalWeeklyDuration,
            totalWeeklyDistance,
            expectedCompletionRate: Math.round(expectedCompletionRate),
            suitabilityScore,
            reasoning,
            goals: goals.length > 0 ? goals : defaultGoals,
            adaptations,
            createdAt: new Date()
        };
    }
    static async generateMultipleRoutineOptions(userId, count = 3) {
        const userIdObject = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const recommendations = [];
        for (let i = 0; i < count; i++) {
            const variation = i === 0
                ? []
                : i === 1
                    ? ['체력 중심']
                    : ['기술 중심'];
            const recommendation = await this.generateRoutineRecommendation(userIdObject, variation);
            recommendations.push({
                ...recommendation,
                routineId: `${recommendation.routineId}_v${i + 1}`,
                routineName: `${recommendation.routineName} (옵션 ${i + 1})`
            });
        }
        return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    }
}
exports.AIRoutineRecommendationService = AIRoutineRecommendationService;
//# sourceMappingURL=aiRoutineRecommendationService.js.map