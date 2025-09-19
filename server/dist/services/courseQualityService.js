"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseQualityService = void 0;
const CourseAction_1 = require("../models/CourseAction");
const Course_1 = require("../models/Course");
const mongoose_1 = __importDefault(require("mongoose"));
class CourseQualityService {
    static async performQualityCheck(courseId) {
        const course = await Course_1.Course.findById(courseId).populate('centerId instructor');
        if (!course) {
            throw new Error('강습 과정을 찾을 수 없습니다.');
        }
        const issues = [];
        let overallScore = 100;
        const satisfaction = Math.random() * 5;
        if (satisfaction < 2.0) {
            issues.push({
                category: 'quality',
                severity: 'critical',
                description: `고객 만족도가 ${satisfaction.toFixed(1)}점으로 기준치(2.0점) 미달`,
                threshold: 2.0,
                currentValue: satisfaction
            });
            overallScore -= 40;
        }
        else if (satisfaction < 3.0) {
            issues.push({
                category: 'quality',
                severity: 'high',
                description: `고객 만족도가 ${satisfaction.toFixed(1)}점으로 권장 기준(3.0점) 미달`,
                threshold: 3.0,
                currentValue: satisfaction
            });
            overallScore -= 20;
        }
        const safetyIncidents = Math.floor(Math.random() * 3);
        if (safetyIncidents >= 2) {
            issues.push({
                category: 'safety',
                severity: 'critical',
                description: `최근 3개월 내 안전사고 ${safetyIncidents}건 발생 (허용 기준: 1건)`,
                threshold: 1,
                currentValue: safetyIncidents
            });
            overallScore -= 50;
        }
        const paymentOverdue = Math.random() > 0.8;
        if (paymentOverdue) {
            const overdueDays = Math.floor(Math.random() * 90) + 30;
            issues.push({
                category: 'financial',
                severity: overdueDays > 60 ? 'critical' : 'high',
                description: `수수료 ${overdueDays}일 연체 (허용 기준: 30일)`,
                threshold: 30,
                currentValue: overdueDays
            });
            overallScore -= overdueDays > 60 ? 30 : 15;
        }
        const certificationExpired = Math.random() > 0.9;
        if (certificationExpired) {
            issues.push({
                category: 'certification',
                severity: 'critical',
                description: '담당 강사의 수영 지도자 자격증이 만료됨',
                threshold: 1,
                currentValue: 0
            });
            overallScore -= 35;
        }
        let recommendedAction = 'none';
        const criticalIssues = issues.filter(i => i.severity === 'critical').length;
        const highIssues = issues.filter(i => i.severity === 'high').length;
        if (criticalIssues >= 2 || overallScore < 30) {
            recommendedAction = 'deactivate';
        }
        else if (criticalIssues >= 1 || overallScore < 50) {
            recommendedAction = 'suspend';
        }
        else if (highIssues >= 2 || overallScore < 70) {
            recommendedAction = 'warning';
        }
        return {
            courseId,
            centerId: course.centerId.toString(),
            issues,
            overallScore: Math.max(0, overallScore),
            recommendedAction
        };
    }
    static async issueWarning(courseId, adminId, qualityCheck, warningLevel) {
        const improvementDays = warningLevel === 1 ? 7 : warningLevel === 2 ? 14 : 3;
        const requirements = qualityCheck.issues.map(issue => `${issue.category} 개선: ${issue.description}`);
        const courseAction = new CourseAction_1.CourseAction({
            courseId,
            centerId: qualityCheck.centerId,
            actionType: 'warning',
            actionBy: adminId,
            reason: {
                category: 'quality',
                description: `${warningLevel}차 경고: 품질 기준 미달 (총점: ${qualityCheck.overallScore}점)`,
                evidence: []
            },
            warningLevel,
            improvementPeriod: {
                startDate: new Date(),
                endDate: new Date(Date.now() + improvementDays * 24 * 60 * 60 * 1000),
                requirements
            },
            automaticTrigger: {
                condition: 'satisfaction_low',
                value: qualityCheck.overallScore,
                threshold: 70
            }
        });
        await courseAction.save();
        console.log(`📧 ${warningLevel}차 경고 알림 발송: 강습 과정 ${courseId}`);
        return courseAction;
    }
    static async deactivateCourseWithJustification(courseId, adminId, reason, qualityCheck) {
        if (!reason.description || reason.description.length < 50) {
            throw new Error('비활성화 사유는 최소 50자 이상 상세히 기재해야 합니다.');
        }
        await Course_1.Course.findByIdAndUpdate(courseId, { isActive: false });
        const courseAction = new CourseAction_1.CourseAction({
            courseId,
            centerId: qualityCheck?.centerId,
            actionType: 'deactivate',
            actionBy: adminId,
            reason,
            automaticTrigger: qualityCheck ? {
                condition: 'satisfaction_low',
                value: qualityCheck.overallScore,
                threshold: 30
            } : undefined,
            reactivationConditions: {
                requirements: [
                    '품질 개선 계획서 제출',
                    '관련 문제 해결 완료',
                    '재심사 통과'
                ],
                completed: false
            }
        });
        await courseAction.save();
        console.log(`📧 비활성화 알림 및 이의제기 안내 발송: 강습 과정 ${courseId}`);
        return courseAction;
    }
    static async submitAppeal(actionId, centerId, appealReason, evidence) {
        if (!appealReason || appealReason.length < 100) {
            throw new Error('이의제기 사유는 최소 100자 이상 상세히 기재해야 합니다.');
        }
        const courseAction = await CourseAction_1.CourseAction.findById(actionId);
        if (!courseAction) {
            throw new Error('해당 액션을 찾을 수 없습니다.');
        }
        if (courseAction.centerId.toString() !== centerId) {
            throw new Error('해당 센터의 액션이 아닙니다.');
        }
        const daysSinceAction = (Date.now() - courseAction.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceAction > 7) {
            throw new Error('이의제기 기간(7일)이 만료되었습니다.');
        }
        courseAction.appeal = {
            submitted: true,
            submittedAt: new Date(),
            submittedBy: new mongoose_1.default.Types.ObjectId(centerId),
            reason: appealReason,
            evidence: evidence || [],
            status: 'pending'
        };
        await courseAction.save();
        console.log(`📧 이의제기 접수 알림: 액션 ${actionId}`);
        return courseAction;
    }
    static async reviewAppeal(actionId, reviewerId, decision, reviewResult) {
        const courseAction = await CourseAction_1.CourseAction.findById(actionId);
        if (!courseAction || !courseAction.appeal) {
            throw new Error('이의제기를 찾을 수 없습니다.');
        }
        if (!reviewResult || reviewResult.length < 100) {
            throw new Error('심사 결과는 최소 100자 이상 상세히 기재해야 합니다.');
        }
        courseAction.appeal.status = decision;
        courseAction.appeal.reviewedAt = new Date();
        courseAction.appeal.reviewedBy = new mongoose_1.default.Types.ObjectId(reviewerId);
        courseAction.appeal.reviewResult = reviewResult;
        if (decision === 'approved') {
            await Course_1.Course.findByIdAndUpdate(courseAction.courseId, { isActive: true });
            courseAction.isActive = false;
        }
        await courseAction.save();
        console.log(`📧 이의제기 심사 결과 알림: ${decision} - ${actionId}`);
        return courseAction;
    }
    static async getQualityDashboard() {
        const totalActions = await CourseAction_1.CourseAction.countDocuments();
        const activeWarnings = await CourseAction_1.CourseAction.countDocuments({
            actionType: 'warning',
            isActive: true
        });
        const pendingAppeals = await CourseAction_1.CourseAction.countDocuments({
            'appeal.status': 'pending'
        });
        const deactivatedCourses = await CourseAction_1.CourseAction.countDocuments({
            actionType: 'deactivate',
            isActive: true
        });
        return {
            totalActions,
            activeWarnings,
            pendingAppeals,
            deactivatedCourses,
            transparencyScore: Math.round((pendingAppeals === 0 ? 100 : Math.max(0, 100 - pendingAppeals * 10)))
        };
    }
}
exports.CourseQualityService = CourseQualityService;
//# sourceMappingURL=courseQualityService.js.map