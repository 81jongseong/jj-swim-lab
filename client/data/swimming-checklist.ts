/**
 * 수영 체크리스트 데이터
 * 
 * 연동되는 데이터:
 * - 강사가 체크한 회원별 수영 실력 체크리스트
 * - 회원의 수영 기술 평가 결과
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - 강사 평가 시스템
 */

export interface SwimmingChecklistItem {
  id: string;
  label: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'stroke' | 'technique' | 'endurance' | 'safety';
  description: string;
  instructorNotes?: string;
  checkedBy: 'instructor' | 'self' | 'both';
  checkedAt?: string;
}

export interface SwimmingChecklist {
  userId: string;
  instructorId: string;
  checkedAt: string;
  items: SwimmingChecklistItem[];
  overallLevel: 'beginner' | 'intermediate' | 'advanced';
  notes: string;
}

// 기본 체크리스트 항목들
export const defaultChecklistItems: SwimmingChecklistItem[] = [
  // 기본 영법
  { id: 'freestyle_25m', label: '자유형 25m 연속 수영', level: 'beginner', category: 'stroke', description: '자유형으로 25m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  { id: 'freestyle_100m', label: '자유형 100m 연속 수영', level: 'intermediate', category: 'stroke', description: '자유형으로 100m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  { id: 'freestyle_200m', label: '자유형 200m 연속 수영', level: 'advanced', category: 'stroke', description: '자유형으로 200m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  
  { id: 'backstroke_25m', label: '배영 25m 연속 수영', level: 'beginner', category: 'stroke', description: '배영으로 25m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  { id: 'backstroke_100m', label: '배영 100m 연속 수영', level: 'intermediate', category: 'stroke', description: '배영으로 100m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  
  { id: 'breaststroke_25m', label: '평영 25m 연속 수영', level: 'intermediate', category: 'stroke', description: '평영으로 25m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  { id: 'breaststroke_100m', label: '평영 100m 연속 수영', level: 'advanced', category: 'stroke', description: '평영으로 100m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  
  { id: 'butterfly_25m', label: '접영 25m 연속 수영', level: 'advanced', category: 'stroke', description: '접영으로 25m를 연속으로 수영할 수 있음', checkedBy: 'self' },
  
  // 기술
  { id: 'treading_water', label: '제자리 뜀 5분 이상', level: 'intermediate', category: 'technique', description: '물속에서 제자리 뜀을 5분 이상 할 수 있음 (수영 안정성과 체력 향상에 중요 - 수영 중 휴식, 구조 상황 대비, 코어 근력 강화)', checkedBy: 'self' },
  { id: 'diving', label: '다이빙 가능', level: 'intermediate', category: 'technique', description: '안전하게 다이빙을 할 수 있음', checkedBy: 'self' },
  { id: 'turns', label: '턴(회전) 기술 가능', level: 'advanced', category: 'technique', description: '벽 턴을 정확하게 할 수 있음', checkedBy: 'self' },
  
  // 체력
  { id: 'continuous_swim_10min', label: '연속 수영 10분', level: 'advanced', category: 'endurance', description: '휴식 없이 10분간 연속 수영 가능 (고급자 수준)', checkedBy: 'self' },
  { id: 'continuous_swim_20min', label: '연속 수영 20분', level: 'advanced', category: 'endurance', description: '휴식 없이 20분간 연속 수영 가능 (엘리트 수준)', checkedBy: 'self' },
  { id: 'continuous_swim_30min', label: '연속 수영 30분', level: 'advanced', category: 'endurance', description: '휴식 없이 30분간 연속 수영 가능 (프로 수준)', checkedBy: 'self' },
  
  // 안전
  { id: 'water_safety', label: '수중 안전 수칙 숙지', level: 'beginner', category: 'safety', description: '수영장 안전 수칙을 숙지하고 준수함', checkedBy: 'self' },
  { id: 'rescue_basic', label: '기본 구조 기술', level: 'intermediate', category: 'safety', description: '기본적인 구조 기술을 알고 있음', checkedBy: 'self' },
];

// 샘플 강사 체크리스트 데이터
export const sampleInstructorChecklists: SwimmingChecklist[] = [
  {
    userId: 'user_001',
    instructorId: 'instructor_001',
    checkedAt: '2024-01-15',
    overallLevel: 'beginner',
    notes: '기본 자유형과 배영은 가능하나, 체력 향상이 필요합니다.',
    items: [
      { ...defaultChecklistItems[0], checkedBy: 'instructor', instructorNotes: '기본 자세 양호', checkedAt: '2024-01-15' },
      { ...defaultChecklistItems[3], checkedBy: 'instructor', instructorNotes: '발차기 개선 필요', checkedAt: '2024-01-15' },
      { ...defaultChecklistItems[12], checkedBy: 'instructor', instructorNotes: '체력 부족으로 8분만 가능', checkedAt: '2024-01-15' },
      { ...defaultChecklistItems[15], checkedBy: 'instructor', instructorNotes: '안전 수칙 잘 숙지함', checkedAt: '2024-01-15' }
    ]
  },
  {
    userId: 'user_002',
    instructorId: 'instructor_002',
    checkedAt: '2024-01-20',
    overallLevel: 'intermediate',
    notes: '여러 영법이 가능하고 체력도 양호합니다. 고급 기술 습득을 권장합니다.',
    items: [
      { ...defaultChecklistItems[1], checkedBy: 'instructor', instructorNotes: '페이스 일정함', checkedAt: '2024-01-20' },
      { ...defaultChecklistItems[4], checkedBy: 'instructor', instructorNotes: '자세 완벽함', checkedAt: '2024-01-20' },
      { ...defaultChecklistItems[5], checkedBy: 'instructor', instructorNotes: '킥 동작 개선됨', checkedAt: '2024-01-20' },
      { ...defaultChecklistItems[8], checkedBy: 'instructor', instructorNotes: '기본 동작 가능', checkedAt: '2024-01-20' },
      { ...defaultChecklistItems[13], checkedBy: 'instructor', instructorNotes: '체력 양호', checkedAt: '2024-01-20' }
    ]
  }
];

// 체크리스트를 가져오는 함수
export function getInstructorChecklist(userId: string): SwimmingChecklist | null {
  return sampleInstructorChecklists.find(checklist => checklist.userId === userId) || null;
}

// 체크리스트 항목을 가져오는 함수
export function getChecklistItems(): SwimmingChecklistItem[] {
  return defaultChecklistItems;
}
