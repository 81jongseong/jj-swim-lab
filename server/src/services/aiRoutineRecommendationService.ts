/**
 * 🤖 AI 기반 개인별 운동 루틴 추천 서비스
 * 
 * 📋 **서비스 목적**
 * - 사용자 패턴 분석을 통한 맞춤형 루틴 추천
 * - 운동 이력, 건강 데이터, 목표 분석 기반 추천
 * - AI 기반 동적 루틴 생성 및 조정
 * 
 * 🔄 **연동되는 모델**
 * - User (사용자 정보)
 * - SwimProgram (운동 프로그램 이력)
 * - HealthData (건강 데이터)
 * - LearningProgress (학습 진행도)
 * - Checklist (체크리스트 진행도)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-18: 초기 AI 기반 루틴 추천 서비스 구현
 */

import mongoose from 'mongoose';
import { User } from '../models/User';
import SwimProgram from '../models/SwimProgram';
import { HealthData } from '../models/HealthData';
import { LearningProgress } from '../models/LearningProgress';
// import { Checklist } from '../models/Checklist'; // 사용되지 않음
import { ExercisePrescriptionSystem } from '../utils/ExercisePrescriptionSystem';

interface UserPatternAnalysis {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
  averageSessionDuration: number;
  preferredDaysOfWeek: number[]; // 0-6 (일-토)
  completionRate: number; // 0-100
  intensityPreference: 'low' | 'moderate' | 'high' | 'varied';
  strokePreference: string[];
  consistencyScore: number; // 0-100
  improvementTrend: 'improving' | 'stable' | 'declining';
  weeklyFrequency: number;
}

interface RoutineRecommendation {
  routineId: string;
  routineName: string;
  description: string;
  weeklySchedule: {
    dayOfWeek: number;
    recommendedTime: string;
    sessionDuration: number;
    intensity: 'low' | 'moderate' | 'high';
    focusArea: string;
    strokes: string[];
  }[];
  totalWeeklyDuration: number;
  totalWeeklyDistance: number;
  expectedCompletionRate: number;
  suitabilityScore: number; // 0-100
  reasoning: string[];
  goals: string[];
  adaptations: {
    ifLowCompletion: string;
    ifHighCompletion: string;
    ifInjury: string;
    ifTimeLimited: string;
  };
  createdAt: Date;
}

export class AIRoutineRecommendationService {
  /**
   * 사용자 패턴 분석
   * 완료율 우선순위:
   * - 유료 회원: 개인 완료율(self) 우선, 없으면 강사 완료율(instructor), 없으면 기본값(70)
   * - 무료 회원: 강사 완료율(instructor) 우선, 없으면 기본값(70)
   */
  static async analyzeUserPattern(userId: string | mongoose.Types.ObjectId): Promise<UserPatternAnalysis> {
    const userIdObject = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const [programs, healthData, progress] = await Promise.all([
      SwimProgram.find({ athleteId: userIdObject })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      HealthData.findOne({ studentId: userIdObject }).lean(),
      LearningProgress.find({ studentId: userIdObject })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean()
    ]);

    // 프로그램 실행 패턴 분석
    const sessionTimes: number[] = [];
    const sessionDurations: number[] = [];
    const daysOfWeek: number[] = [];
    const intensities: string[] = [];
    const strokes: string[] = [];
    const completedSessions = 0;
    const totalSessions = 0;

    // 완료율 데이터 분리 (강사 설정 vs 개인 완료율)
    const instructorCompletions: number[] = [];
    const selfCompletions: number[] = [];
    let totalSessionsWithInstructorRate = 0;
    let totalSessionsWithSelfRate = 0;
    let completedSessionsWithInstructorRate = 0;
    let completedSessionsWithSelfRate = 0;

    programs.forEach((program: any) => {
      if (program.executionHistory && Array.isArray(program.executionHistory)) {
        program.executionHistory.forEach((exec: any) => {
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
            } else {
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

    // 선호 시간대 계산
    const avgHour = sessionTimes.length > 0
      ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length
      : 14; // 기본 오후 2시
    const preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible' =
      avgHour < 10 ? 'morning' :
      avgHour < 17 ? 'afternoon' :
      avgHour < 21 ? 'evening' : 'flexible';

    // 평균 세션 시간
    const avgDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
      : 45;

    // 선호 요일
    const dayCounts: { [key: number]: number } = {};
    daysOfWeek.forEach(day => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const preferredDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => parseInt(day));

    // 유료 회원 여부 확인 (membership 또는 subscription 정보)
    // TODO: 실제 membership 모델과 연동 필요
    const user = await User.findById(userId).lean();
    const isPaidMember = (user as any)?.membership || 
                         (user as any)?.subscription || 
                         ((user as any)?.studentInfo?.membershipTier && 
                          (user as any)?.studentInfo?.membershipTier !== 'guest') ||
                         false; // 기본값: 무료 회원

    // 완료율 계산 (유료/무료 회원에 따라 우선순위 다름)
    let completionRate = 70; // 기본값
    
    if (isPaidMember) {
      // 유료 회원: 개인 완료율(self) 우선, 없으면 강사 완료율(instructor), 없으면 기본값
      if (totalSessionsWithSelfRate > 0) {
        completionRate = (completedSessionsWithSelfRate / totalSessionsWithSelfRate) * 100;
      } else if (totalSessionsWithInstructorRate > 0) {
        completionRate = (completedSessionsWithInstructorRate / totalSessionsWithInstructorRate) * 100;
      }
    } else {
      // 무료 회원: 강사 완료율(instructor) 우선, 없으면 기본값
      if (totalSessionsWithInstructorRate > 0) {
        completionRate = (completedSessionsWithInstructorRate / totalSessionsWithInstructorRate) * 100;
      }
    }

    // 일관성 점수 (최근 4주 기준) - 완료율 기준도 동일하게 적용
    const recentPrograms = programs.slice(0, 4);
    const weeklyCompletions = recentPrograms.map((p: any) => {
      if (!p.executionHistory) return 0;
      // 완료율 기준 선택 (유료 회원: self 우선, 무료 회원: instructor 우선)
      const weekCompletions = p.executionHistory.filter((e: any) => {
        if (!e.completion?.completionRate) return false;
        const rate = e.completion.completionRate;
        const inputByRole = e.completion.inputByRole || 'self';
        
        if (isPaidMember) {
          // 유료 회원: self 우선
          return rate >= 80 && inputByRole === 'self';
        } else {
          // 무료 회원: instructor 우선
          return rate >= 80 && inputByRole === 'instructor';
        }
      }).length;
      return weekCompletions;
    });
    const consistencyScore = weeklyCompletions.length > 0
      ? (weeklyCompletions.reduce((a: number, b: number) => a + b, 0) / weeklyCompletions.length) * 10
      : 70;

    // 향상 추세
    const improvementTrend = this.calculateImprovementTrend(progress);

    // 주당 빈도
    const weeklyFrequency = preferredDays.length > 0 ? preferredDays.length : 3;

    return {
      preferredTimeOfDay,
      averageSessionDuration: Math.round(avgDuration),
      preferredDaysOfWeek: preferredDays.length > 0 ? preferredDays : [1, 3, 5], // 월, 수, 금
      completionRate: Math.round(completionRate),
      intensityPreference: this.determineIntensityPreference(intensities),
      strokePreference: Array.from(new Set(strokes)),
      consistencyScore: Math.round(consistencyScore),
      improvementTrend,
      weeklyFrequency
    };
  }

  /**
   * 향상 추세 계산
   */
  private static calculateImprovementTrend(progress: any[]): 'improving' | 'stable' | 'declining' {
    if (progress.length < 3) return 'stable';

    const recent = progress.slice(0, 3);
    const older = progress.slice(3, 6);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, p: any) => sum + (p.progress || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, p: any) => sum + (p.progress || 0), 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  /**
   * 강도 선호도 결정
   */
  private static determineIntensityPreference(intensities: string[]): 'low' | 'moderate' | 'high' | 'varied' {
    if (intensities.length === 0) return 'moderate';

    const counts: { [key: string]: number } = {};
    intensities.forEach(int => {
      counts[int] = (counts[int] || 0) + 1;
    });

    const uniqueIntensities = Object.keys(counts).length;
    if (uniqueIntensities >= 3) return 'varied';

    const maxIntensity = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];

    if (maxIntensity.includes('low') || maxIntensity.includes('easy')) return 'low';
    if (maxIntensity.includes('high') || maxIntensity.includes('hard')) return 'high';
    return 'moderate';
  }

  /**
   * AI 기반 개인별 루틴 추천
   */
  static async generateRoutineRecommendation(
    userId: string | mongoose.Types.ObjectId,
    goals: string[] = []
  ): Promise<RoutineRecommendation> {
    const userIdObject = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const [user, pattern, healthData] = await Promise.all([
      User.findById(userIdObject).lean(),
      this.analyzeUserPattern(userIdObject),
      HealthData.findOne({ studentId: userIdObject }).lean()
    ]);

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 건강 데이터 기반 처방 가져오기
    let prescription: any = null;
    if (healthData) {
      try {
        const prescriptionResult = await ExercisePrescriptionSystem.buildPrescriptionForUser(userIdObject.toString());
        prescription = prescriptionResult.prescription;
      } catch (error) {
        console.error('처방 생성 실패:', error);
      }
    }

    // 기본 목표 설정
    const defaultGoals = [
      '기술 향상',
      '체력 개선',
      '일관성 유지'
    ];

    // 주간 스케줄 생성
    const weeklySchedule = pattern.preferredDaysOfWeek.map((day, index) => {
      const timeSlots: { [key: string]: string } = {
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

      const intensityLevels: ('low' | 'moderate' | 'high')[] = 
        pattern.intensityPreference === 'varied'
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

    // 총 주간 시간 및 거리 계산
    const totalWeeklyDuration = weeklySchedule.reduce((sum, s) => sum + s.sessionDuration, 0);
    const avgPace = 2; // 분당 2미터 (기본값)
    const totalWeeklyDistance = Math.round(totalWeeklyDuration * avgPace * 10); // 대략적인 거리

    // 예상 완료율
    const expectedCompletionRate = Math.min(100, pattern.completionRate + 
      (pattern.consistencyScore > 80 ? 10 : 0) -
      (pattern.consistencyScore < 60 ? 10 : 0)
    );

    // 적합성 점수
    const suitabilityScore = Math.round(
      (pattern.completionRate * 0.3) +
      (pattern.consistencyScore * 0.3) +
      (expectedCompletionRate * 0.2) +
      (pattern.improvementTrend === 'improving' ? 20 : 
       pattern.improvementTrend === 'stable' ? 10 : 0)
    );

    // 추천 이유
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

    // 적응 방안
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

  /**
   * 여러 루틴 옵션 생성 (A/B 테스트용)
   */
  static async generateMultipleRoutineOptions(
    userId: string | mongoose.Types.ObjectId,
    count: number = 3
  ): Promise<RoutineRecommendation[]> {
    const userIdObject = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const recommendations: RoutineRecommendation[] = [];

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

