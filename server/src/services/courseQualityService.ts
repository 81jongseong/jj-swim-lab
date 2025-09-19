/**
 * ⚖️ JJ Swim Lab - 강습 과정 품질 관리 서비스
 * 
 * 📋 **서비스 목적**
 * - 자동화된 품질 관리 시스템
 * - 갑질 방지를 위한 투명한 절차
 * - 사전 경고 및 개선 기회 제공
 * - 이의제기 절차 지원
 * 
 * 🔄 **주요 기능**
 * - 자동 품질 평가 및 경고 발송
 * - 단계별 경고 시스템 (3단계)
 * - 비활성화 사유 검증 및 기록
 * - 이의제기 처리 및 심사
 * 
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { CourseAction, ICourseAction } from '../models/CourseAction';
import { Course } from '../models/Course';
import { User } from '../models/User';
import { Center } from '../models/Center';
import mongoose from 'mongoose';

export interface QualityCheck {
  courseId: string;
  centerId: string;
  issues: QualityIssue[];
  overallScore: number;
  recommendedAction: 'none' | 'warning' | 'suspend' | 'deactivate';
}

export interface QualityIssue {
  category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
  threshold: number;
  currentValue: number;
}

export class CourseQualityService {
  
  /**
   * 🔍 자동 품질 평가 실행
   */
  static async performQualityCheck(courseId: string): Promise<QualityCheck> {
    const course = await Course.findById(courseId).populate('centerId instructor');
    if (!course) {
      throw new Error('강습 과정을 찾을 수 없습니다.');
    }
    
    const issues: QualityIssue[] = [];
    let overallScore = 100;
    
    // 1. 고객 만족도 체크 (가상 데이터 - 실제로는 리뷰 시스템 연동)
    const satisfaction = Math.random() * 5; // 0-5점
    if (satisfaction < 2.0) {
      issues.push({
        category: 'quality',
        severity: 'critical',
        description: `고객 만족도가 ${satisfaction.toFixed(1)}점으로 기준치(2.0점) 미달`,
        threshold: 2.0,
        currentValue: satisfaction
      });
      overallScore -= 40;
    } else if (satisfaction < 3.0) {
      issues.push({
        category: 'quality',
        severity: 'high',
        description: `고객 만족도가 ${satisfaction.toFixed(1)}점으로 권장 기준(3.0점) 미달`,
        threshold: 3.0,
        currentValue: satisfaction
      });
      overallScore -= 20;
    }
    
    // 2. 안전사고 체크 (가상 데이터)
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
    
    // 3. 재정 상태 체크 (가상 데이터)
    const paymentOverdue = Math.random() > 0.8; // 20% 확률로 연체
    if (paymentOverdue) {
      const overdueDays = Math.floor(Math.random() * 90) + 30; // 30-120일
      issues.push({
        category: 'financial',
        severity: overdueDays > 60 ? 'critical' : 'high',
        description: `수수료 ${overdueDays}일 연체 (허용 기준: 30일)`,
        threshold: 30,
        currentValue: overdueDays
      });
      overallScore -= overdueDays > 60 ? 30 : 15;
    }
    
    // 4. 강사 자격증 체크 (가상 데이터)
    const certificationExpired = Math.random() > 0.9; // 10% 확률로 만료
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
    
    // 추천 액션 결정
    let recommendedAction: 'none' | 'warning' | 'suspend' | 'deactivate' = 'none';
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    
    if (criticalIssues >= 2 || overallScore < 30) {
      recommendedAction = 'deactivate';
    } else if (criticalIssues >= 1 || overallScore < 50) {
      recommendedAction = 'suspend';
    } else if (highIssues >= 2 || overallScore < 70) {
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
  
  /**
   * 🚨 경고 발송 및 개선 기간 설정
   */
  static async issueWarning(
    courseId: string,
    adminId: string,
    qualityCheck: QualityCheck,
    warningLevel: 1 | 2 | 3
  ): Promise<ICourseAction> {
    
    const improvementDays = warningLevel === 1 ? 7 : warningLevel === 2 ? 14 : 3;
    const requirements = qualityCheck.issues.map(issue => 
      `${issue.category} 개선: ${issue.description}`
    );
    
    const courseAction = new CourseAction({
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
    
    // TODO: 센터에 경고 알림 발송
    console.log(`📧 ${warningLevel}차 경고 알림 발송: 강습 과정 ${courseId}`);
    
    return courseAction;
  }
  
  /**
   * ⚖️ 투명한 비활성화 처리
   */
  static async deactivateCourseWithJustification(
    courseId: string,
    adminId: string,
    reason: {
      category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility' | 'other';
      description: string;
      evidence?: string[];
    },
    qualityCheck?: QualityCheck
  ): Promise<ICourseAction> {
    
    // 사유 검증 (최소 50자)
    if (!reason.description || reason.description.length < 50) {
      throw new Error('비활성화 사유는 최소 50자 이상 상세히 기재해야 합니다.');
    }
    
    // 강습 과정 비활성화
    await Course.findByIdAndUpdate(courseId, { isActive: false });
    
    const courseAction = new CourseAction({
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
    
    // TODO: 센터에 비활성화 알림 및 이의제기 안내 발송
    console.log(`📧 비활성화 알림 및 이의제기 안내 발송: 강습 과정 ${courseId}`);
    
    return courseAction;
  }
  
  /**
   * 📝 이의제기 접수
   */
  static async submitAppeal(
    actionId: string,
    centerId: string,
    appealReason: string,
    evidence?: string[]
  ): Promise<ICourseAction> {
    
    if (!appealReason || appealReason.length < 100) {
      throw new Error('이의제기 사유는 최소 100자 이상 상세히 기재해야 합니다.');
    }
    
    const courseAction = await CourseAction.findById(actionId);
    if (!courseAction) {
      throw new Error('해당 액션을 찾을 수 없습니다.');
    }
    
    if (courseAction.centerId.toString() !== centerId) {
      throw new Error('해당 센터의 액션이 아닙니다.');
    }
    
    // 이의제기 기간 체크 (7일)
    const daysSinceAction = (Date.now() - courseAction.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAction > 7) {
      throw new Error('이의제기 기간(7일)이 만료되었습니다.');
    }
    
    courseAction.appeal = {
      submitted: true,
      submittedAt: new Date(),
      submittedBy: new mongoose.Types.ObjectId(centerId),
      reason: appealReason,
      evidence: evidence || [],
      status: 'pending'
    };
    
    await courseAction.save();
    
    // TODO: 심사위원회에 이의제기 접수 알림
    console.log(`📧 이의제기 접수 알림: 액션 ${actionId}`);
    
    return courseAction;
  }
  
  /**
   * 👥 이의제기 심사 처리
   */
  static async reviewAppeal(
    actionId: string,
    reviewerId: string,
    decision: 'approved' | 'rejected',
    reviewResult: string
  ): Promise<ICourseAction> {
    
    const courseAction = await CourseAction.findById(actionId);
    if (!courseAction || !courseAction.appeal) {
      throw new Error('이의제기를 찾을 수 없습니다.');
    }
    
    if (!reviewResult || reviewResult.length < 100) {
      throw new Error('심사 결과는 최소 100자 이상 상세히 기재해야 합니다.');
    }
    
    courseAction.appeal.status = decision;
    courseAction.appeal.reviewedAt = new Date();
    courseAction.appeal.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    courseAction.appeal.reviewResult = reviewResult;
    
    // 이의제기가 승인된 경우 강습 과정 재활성화
    if (decision === 'approved') {
      await Course.findByIdAndUpdate(courseAction.courseId, { isActive: true });
      courseAction.isActive = false; // 액션 무효화
    }
    
    await courseAction.save();
    
    // TODO: 센터에 심사 결과 알림
    console.log(`📧 이의제기 심사 결과 알림: ${decision} - ${actionId}`);
    
    return courseAction;
  }
  
  /**
   * 📊 품질 관리 대시보드 데이터
   */
  static async getQualityDashboard(): Promise<any> {
    const totalActions = await CourseAction.countDocuments();
    const activeWarnings = await CourseAction.countDocuments({ 
      actionType: 'warning',
      isActive: true 
    });
    const pendingAppeals = await CourseAction.countDocuments({ 
      'appeal.status': 'pending' 
    });
    const deactivatedCourses = await CourseAction.countDocuments({ 
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
