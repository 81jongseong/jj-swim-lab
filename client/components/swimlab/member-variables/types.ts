/**
 * 🏊 회원 변수 설정 타입 정의
 * 
 * 📋 **파일 목적**
 * - 회원별 변수 설정에 사용되는 공통 타입 정의
 * 
 * 🔗 **연동 파일:**
 * - BulkMemberVariablesModal.tsx
 * - 각종 섹션 컴포넌트들
 */

export interface MemberVariable {
  memberId: string;
  memberName: string;
  memberLevel: string;
  css: Record<string, number>;
  mainStrokes: string[];
  excludedStrokes: string[];
  trainingDays: number[];
  sessionDuration: number;
  poolLength: number;
  programType: 'base' | 'race';
  goal: string;
  conditionIds: string[];
  weeklyDistance?: number;
  // 레이스 플랜 전용
  startDate?: string;
  raceDate?: string;
  raceEvents?: Array<{
    distance: number;
    stroke: string;
    currentTime: number;
    targetTime: number;
    priority: 'primary' | 'secondary';
  }>;
  // 호환성을 위한 단일 종목 필드
  raceDistance?: number;
  raceStroke?: string;
  currentTime?: number;
  targetTime?: number;
  taperWeeks?: number;
  // 생리학적 지표
  vo2max?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
}

export interface Stroke {
  id: string;
  label: string;
  icon: string;
}

