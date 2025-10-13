/**
 * 💼 회원 유형 및 권한 정의
 * 
 * 📋 **회원 분류**:
 * - Guest: 체험판 (1일 프로그램만)
 * - FreeSwimmer: 자유수영 회원 (AI 프로그램, 강사 없음)
 * - ClassMember: 강습 회원 (AI + 강사 프로그램)
 * - CenterMember: 센터 전용 회원 (센터 일괄 결제)
 * 
 * 🔗 **연동 파일**:
 * - client/app/community/page.tsx
 * - client/app/guest/programs/page.tsx
 * - client/components/Navigation.tsx
 */

export type MembershipTier = 'guest' | 'basic' | 'premium' | 'pro' | 'center';

export type UserRole = 'guest' | 'student' | 'instructor' | 'center_admin' | 'super_admin';

export interface MembershipConfig {
  tier: MembershipTier;
  name: string;
  price: number; // 월 가격 (₩)
  features: {
    // 프로그램
    dailyProgram: boolean;
    weeklyProgram: boolean;
    monthlyProgram: boolean;
    competitionProgram: boolean;
    programSave: boolean;
    programEdit: boolean;
    programHistory: number; // 저장 개수 제한 (0 = 무제한)
    
    // 강사
    instructorAssignment: boolean;
    instructorFeedback: boolean;
    videoAnalysis: boolean;
    
    // 분석
    progressTracking: boolean;
    detailedAnalysis: boolean;
    physiologicalMetrics: boolean;
    
    // 커뮤니티
    communityRead: 'limited' | 'full'; // limited = 3개, full = 전체
    communityWrite: boolean;
    communityComment: boolean;
    
    // 기타
    centerSearch: boolean;
    quizAccess: boolean;
  };
}

export const MEMBERSHIP_CONFIGS: Record<MembershipTier, MembershipConfig> = {
  guest: {
    tier: 'guest',
    name: '체험 회원',
    price: 0,
    features: {
      dailyProgram: true,
      weeklyProgram: false,
      monthlyProgram: false,
      competitionProgram: false,
      programSave: false,
      programEdit: false,
      programHistory: 0,
      
      instructorAssignment: false,
      instructorFeedback: false,
      videoAnalysis: false,
      
      progressTracking: false,
      detailedAnalysis: false,
      physiologicalMetrics: false,
      
      communityRead: 'limited',
      communityWrite: false,
      communityComment: false,
      
      centerSearch: true,
      quizAccess: true
    }
  },
  
  basic: {
    tier: 'basic',
    name: '베이직 (자유수영)',
    price: 9900,
    features: {
      dailyProgram: true,
      weeklyProgram: true,
      monthlyProgram: false,
      competitionProgram: false,
      programSave: true,
      programEdit: true,
      programHistory: 30,
      
      instructorAssignment: false,
      instructorFeedback: false,
      videoAnalysis: false,
      
      progressTracking: true,
      detailedAnalysis: false,
      physiologicalMetrics: false,
      
      communityRead: 'full',
      communityWrite: true,
      communityComment: true,
      
      centerSearch: true,
      quizAccess: true
    }
  },
  
  premium: {
    tier: 'premium',
    name: '프리미엄',
    price: 19900,
    features: {
      dailyProgram: true,
      weeklyProgram: true,
      monthlyProgram: true,
      competitionProgram: true,
      programSave: true,
      programEdit: true,
      programHistory: 0, // 무제한
      
      instructorAssignment: false,
      instructorFeedback: false,
      videoAnalysis: false,
      
      progressTracking: true,
      detailedAnalysis: true,
      physiologicalMetrics: true,
      
      communityRead: 'full',
      communityWrite: true,
      communityComment: true,
      
      centerSearch: true,
      quizAccess: true
    }
  },
  
  pro: {
    tier: 'pro',
    name: '프로 (강습 회원)',
    price: 39900,
    features: {
      dailyProgram: true,
      weeklyProgram: true,
      monthlyProgram: true,
      competitionProgram: true,
      programSave: true,
      programEdit: true,
      programHistory: 0,
      
      instructorAssignment: true,
      instructorFeedback: true,
      videoAnalysis: true,
      
      progressTracking: true,
      detailedAnalysis: true,
      physiologicalMetrics: true,
      
      communityRead: 'full',
      communityWrite: true,
      communityComment: true,
      
      centerSearch: true,
      quizAccess: true
    }
  },
  
  center: {
    tier: 'center',
    name: '센터 패키지',
    price: 299000, // 30명 기준
    features: {
      dailyProgram: true,
      weeklyProgram: true,
      monthlyProgram: true,
      competitionProgram: true,
      programSave: true,
      programEdit: true,
      programHistory: 0,
      
      instructorAssignment: true,
      instructorFeedback: true,
      videoAnalysis: true,
      
      progressTracking: true,
      detailedAnalysis: true,
      physiologicalMetrics: true,
      
      communityRead: 'full',
      communityWrite: true,
      communityComment: true,
      
      centerSearch: true,
      quizAccess: true
    }
  }
};

/**
 * 프로그램 수정 권한 체크
 */
export function canEditProgram(
  program: { userId?: string; assignedInstructorId?: string; centerId?: string },
  currentUser: { id: string; role: UserRole; centerId?: string }
): boolean {
  // 1. 게스트는 수정 불가
  if (currentUser.role === 'guest') {
    return false;
  }
  
  // 2. 본인 프로그램은 항상 수정 가능
  if (program.userId === currentUser.id) {
    return true;
  }
  
  // 3. 강사는 배정된 회원의 프로그램 수정 가능
  if (currentUser.role === 'instructor' && program.assignedInstructorId === currentUser.id) {
    return true;
  }
  
  // 4. 센터 관리자는 센터 회원 전체 수정 가능
  if (currentUser.role === 'center_admin' && program.centerId === currentUser.centerId) {
    return true;
  }
  
  // 5. 최고관리자는 모든 프로그램 수정 가능
  if (currentUser.role === 'super_admin') {
    return true;
  }
  
  return false;
}

/**
 * 기능별 권한 체크
 */
export function hasFeature(
  tier: MembershipTier,
  feature: keyof MembershipConfig['features']
): boolean {
  return MEMBERSHIP_CONFIGS[tier].features[feature] as boolean;
}

/**
 * 커뮤니티 접근 권한 체크
 */
export function canAccessCommunity(
  tier: MembershipTier,
  action: 'read' | 'write' | 'comment'
): boolean {
  const config = MEMBERSHIP_CONFIGS[tier];
  
  if (action === 'read') {
    return config.features.communityRead !== undefined;
  }
  
  if (action === 'write') {
    return config.features.communityWrite;
  }
  
  if (action === 'comment') {
    return config.features.communityComment;
  }
  
  return false;
}

