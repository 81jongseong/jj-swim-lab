/**
 * 운동 강도 가이드 시스템
 * 
 * 연동되는 데이터:
 * - 사용자의 주간 수영 가능 요일
 * - 사용자의 건강 상태 및 목표
 * - 수영 실력 레벨
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - 건강정보 입력 시스템
 */

export interface WorkoutDay {
  day: string;
  intensity: 'rest' | 'easy' | 'moderate' | 'hard';
  focus: string;
  description: string;
  duration: number; // 분 단위
  benefits: string[];
}

export interface WeeklySchedule {
  days: WorkoutDay[];
  totalWorkoutDays: number;
  totalDuration: number;
  intensityDistribution: {
    rest: number;
    easy: number;
    moderate: number;
    hard: number;
  };
}

export interface UserProfile {
  availableDays: string[]; // ['월', '화', '수', '목', '금', '토', '일']
  swimLevel: 'beginner_1' | 'beginner_2' | 'intermediate_1' | 'intermediate_2' | 'advanced_1' | 'advanced_2';
  goals: string[];
  healthConditions: string[];
  maxDailyDuration: number; // 최대 일일 운동 시간 (분)
}

/**
 * 운동 강도 가이드 생성
 * @param userProfile 사용자 프로필
 * @returns 주간 운동 스케줄
 */
export function generateWorkoutIntensityGuide(userProfile: UserProfile): WeeklySchedule {
  const { availableDays, swimLevel, goals, healthConditions, maxDailyDuration } = userProfile;
  
  // 요일 순서 정의
  const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
  
  // 사용 가능한 요일들을 순서대로 정렬
  const sortedAvailableDays = dayOrder.filter(day => availableDays.includes(day));
  const totalWorkoutDays = sortedAvailableDays.length;
  
  // 운동 강도 패턴 생성
  const workoutPattern = generateWorkoutPattern(totalWorkoutDays, swimLevel, goals, healthConditions);
  
  // 주간 스케줄 생성
  const days: WorkoutDay[] = dayOrder.map(day => {
    const isAvailable = availableDays.includes(day);
    const dayIndex = sortedAvailableDays.indexOf(day);
    
    if (!isAvailable) {
      return {
        day,
        intensity: 'rest',
        focus: '휴식',
        description: '수영 불가능한 날',
        duration: 0,
        benefits: ['근육 회복', '정신적 휴식', '에너지 보충']
      };
    }
    
    const pattern = workoutPattern[dayIndex];
    return {
      day,
      intensity: pattern.intensity,
      focus: pattern.focus,
      description: pattern.description,
      duration: Math.min(pattern.duration, maxDailyDuration),
      benefits: pattern.benefits
    };
  });
  
  // 강도 분포 계산
  const intensityDistribution = {
    rest: days.filter(d => d.intensity === 'rest').length,
    easy: days.filter(d => d.intensity === 'easy').length,
    moderate: days.filter(d => d.intensity === 'moderate').length,
    hard: days.filter(d => d.intensity === 'hard').length
  };
  
  const totalDuration = days.reduce((sum, day) => sum + day.duration, 0);
  
  return {
    days,
    totalWorkoutDays,
    totalDuration,
    intensityDistribution
  };
}

/**
 * 운동 패턴 생성
 * @param totalDays 총 운동 가능한 날 수
 * @param swimLevel 수영 실력
 * @param goals 운동 목표
 * @param healthConditions 건강 상태
 * @returns 운동 패턴 배열
 */
function generateWorkoutPattern(
  totalDays: number, 
  swimLevel: string, 
  goals: string[], 
  healthConditions: string[]
): Array<{intensity: 'easy' | 'moderate' | 'hard', focus: string, description: string, duration: number, benefits: string[]}> {
  
  const patterns = [];
  
  if (totalDays >= 3) {
    // 3일 이상: 체력 기반 구축 → 심혈관 건강 개선 → 체중 감량 효과
    patterns.push({
      intensity: 'easy' as const,
      focus: '지속주 운동',
      description: '체력 기반 구축을 위한 지속적인 수영',
      duration: getDurationByLevel(swimLevel, 'easy'),
      benefits: ['기초 체력 향상', '수영 기술 안정화', '근지구력 강화']
    });
    
    patterns.push({
      intensity: 'moderate' as const,
      focus: '인터벌 운동',
      description: '심혈관 건강 개선을 위한 인터벌 훈련',
      duration: getDurationByLevel(swimLevel, 'moderate'),
      benefits: ['심혈관 건강 개선', '지구력 향상', '칼로리 소모 증가']
    });
    
    patterns.push({
      intensity: 'hard' as const,
      focus: '존2 운동',
      description: '체중 감량 효과를 위한 고강도 운동',
      duration: getDurationByLevel(swimLevel, 'hard'),
      benefits: ['체중 감량 효과', '대사율 향상', '지방 연소 촉진']
    });
    
    // 나머지 날들은 휴식 또는 가벼운 운동
    for (let i = 3; i < totalDays; i++) {
      patterns.push({
        intensity: 'easy' as const,
        focus: '가벼운 운동',
        description: '근육 회복을 위한 가벼운 수영',
        duration: getDurationByLevel(swimLevel, 'easy') * 0.7,
        benefits: ['근육 회복', '유연성 향상', '스트레스 해소']
      });
    }
  } else if (totalDays === 2) {
    // 2일: 체력 기반 구축 + 심혈관 건강 개선
    patterns.push({
      intensity: 'easy' as const,
      focus: '지속주 운동',
      description: '체력 기반 구축을 위한 지속적인 수영',
      duration: getDurationByLevel(swimLevel, 'easy'),
      benefits: ['기초 체력 향상', '수영 기술 안정화']
    });
    
    patterns.push({
      intensity: 'moderate' as const,
      focus: '인터벌 운동',
      description: '심혈관 건강 개선을 위한 인터벌 훈련',
      duration: getDurationByLevel(swimLevel, 'moderate'),
      benefits: ['심혈관 건강 개선', '지구력 향상']
    });
  } else if (totalDays === 1) {
    // 1일: 종합 운동
    patterns.push({
      intensity: 'moderate' as const,
      focus: '종합 운동',
      description: '체력, 심혈관, 체중 감량을 위한 종합 운동',
      duration: getDurationByLevel(swimLevel, 'moderate'),
      benefits: ['전체적인 건강 개선', '시간 효율성', '균형잡힌 운동']
    });
  }
  
  return patterns;
}

/**
 * 수영 실력에 따른 운동 시간 계산
 * @param swimLevel 수영 실력
 * @param intensity 운동 강도
 * @returns 운동 시간 (분)
 */
function getDurationByLevel(swimLevel: string, intensity: 'easy' | 'moderate' | 'hard'): number {
  const baseDuration = {
    beginner_1: { easy: 15, moderate: 20, hard: 25 }, // 완전 초보
    beginner_2: { easy: 20, moderate: 25, hard: 30 }, // 초급
    intermediate_1: { easy: 25, moderate: 30, hard: 35 }, // 중급 하위
    intermediate_2: { easy: 30, moderate: 35, hard: 40 }, // 중급 상위
    advanced_1: { easy: 35, moderate: 40, hard: 45 }, // 고급 하위
    advanced_2: { easy: 40, moderate: 45, hard: 50 }  // 고급 상위
  };
  
  return baseDuration[swimLevel as keyof typeof baseDuration]?.[intensity] || 25;
}

/**
 * 건강 상태에 따른 운동 강도 조정
 * @param intensity 원래 강도
 * @param healthConditions 건강 상태
 * @returns 조정된 강도
 */
export function adjustIntensityForHealth(
  intensity: 'easy' | 'moderate' | 'hard',
  healthConditions: string[]
): 'easy' | 'moderate' | 'hard' {
  
  // 고혈압이 있는 경우 강도 낮춤
  if (healthConditions.includes('hypertension')) {
    if (intensity === 'hard') return 'moderate';
    if (intensity === 'moderate') return 'easy';
  }
  
  // 관절 질환이 있는 경우 강도 낮춤
  if (healthConditions.some(condition => 
    condition.includes('관절') || condition.includes('무릎') || condition.includes('어깨')
  )) {
    if (intensity === 'hard') return 'moderate';
    if (intensity === 'moderate') return 'easy';
  }
  
  return intensity;
}

/**
 * 운동 목표에 따른 강도 조정
 * @param intensity 원래 강도
 * @param goals 운동 목표
 * @returns 조정된 강도
 */
export function adjustIntensityForGoals(
  intensity: 'easy' | 'moderate' | 'hard',
  goals: string[]
): 'easy' | 'moderate' | 'hard' {
  
  // 체중 감량 목표가 있는 경우 강도 높임
  if (goals.some(goal => goal.includes('체중') || goal.includes('감량'))) {
    if (intensity === 'easy') return 'moderate';
    if (intensity === 'moderate') return 'hard';
  }
  
  // 기록 향상 목표가 있는 경우 강도 높임
  if (goals.some(goal => goal.includes('기록') || goal.includes('향상'))) {
    if (intensity === 'easy') return 'moderate';
    if (intensity === 'moderate') return 'hard';
  }
  
  return intensity;
}
