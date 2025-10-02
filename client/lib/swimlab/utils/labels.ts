/**
 * 🏊 SwimLab - 훈련법/드릴 ID → 한글 이름 매핑
 * 
 * 📋 **파일 목적**
 * - 훈련법/드릴 id를 한글 이름으로 변환
 * - 툴팁에서 "kick_drill" → "킥 드릴" 처럼 보이게
 * - 사용자 친화적인 표시
 * 
 * 🔄 **주요 기능**
 * - labelOfMethod: 훈련법 id → 한글 이름
 * - labelOfDrill: 드릴 id → 한글 이름
 * 
 * 🗄️ **데이터 연동**
 * - trainingMethods_plus.ts (25개 훈련법)
 * - drills_plus.ts (40개 드릴)
 * - ConditionQuickPick 툴팁에서 사용
 * 
 * 💡 **사용 예시**
 * ```typescript
 * labelOfMethod('kick_drill')  // → "킥 드릴"
 * labelOfDrill('scull_front')  // → "프론트 스컬"
 * ```
 */

// 실제 데이터가 없으므로 모의 매핑
// 실제 프로젝트에서는 아래 주석을 해제하고 사용
// import { TRAINING_METHODS_PLUS } from '@/swimlab/data/trainingMethods_plus';
// import { DRILLS_PLUS } from '@/swimlab/data/drills_plus';
// const M = Object.fromEntries(TRAINING_METHODS_PLUS.map(m => [m.id, m.name || m.title || m.id]));
// const D = Object.fromEntries(DRILLS_PLUS.map(d => [d.id, d.name || d.title || d.id]));

// 모의 매핑 (실제 데이터 대신)
const M: Record<string, string> = {
  'kick_drill': '킥 드릴',
  'backstroke_technique': '배영 기술',
  'butterfly_drill': '접영 드릴',
  'freestyle_sprint': '자유형 스프린트',
  'technique_focus': '기술 집중 세트',
  'kick_endurance': '킥 지구력',
  'sprint_intervals': '스프린트 인터벌',
  'power_pull': '파워 풀',
  'scull_progression': '스컬 진행',
  'catch_technique': '캐치 기술',
  'high_volume_pull': '고볼륨 풀',
  'pull_focus': '풀 중심',
  'upper_body_endurance': '상체 지구력',
  'breaststroke_intensive': '평영 집중',
  'kick_intensive': '킥 집중',
  'pull_moderate': '적정 풀',
  'technique_drill': '기술 드릴',
  'high_volume_kick': '고볼륨 킥',
  'freestyle_neutral_spine': '자유형 중립 척추',
  'side_breathing': '사이드 호흡',
  'butterfly_dolphin': '접영 돌핀킥',
  'backstroke_arch': '배영 아치',
  'neutral_spine_drill': '중립 척추 드릴',
  'backstroke_steady': '배영 정속',
  'flip_turn_intensive': '플립턴 집중',
  'breaststroke_dive': '평영 다이브',
  'gentle_kick': '부드러운 킥',
  'wall_push_hard': '벽차기 강도',
  'sprint_kick': '스프린트 킥',
  'pull_endurance': '풀 지구력',
  'easy_kick': '쉬운 킥',
  'sprint_push_off': '스프린트 출발',
  'high_intensity_kick': '고강도 킥',
  'low_intensity_steady': '저강도 정속',
  'recovery_swim': '회복 수영',
  'high_intensity_intervals': '고강도 인터벌',
  'race_pace': '레이스 페이스',
  'base_endurance': '기초 지구력',
  'technique_rebuild': '기술 재구축',
  'sprint_intensive': '스프린트 집중',
  'high_volume_sudden': '급격한 고볼륨',
  'easy_technique': '쉬운 기술',
  'recovery_easy': '회복 수영',
  'high_intensity_main': '고강도 메인',
  'breathing_drill': '호흡 드릴',
  'steady_easy': '정속 쉬운',
  'underwater_intensive': '수중 집중',
  'hypoxic_drill': '저산소 드릴',
  'technique_light': '가벼운 기술',
  'sprint_set': '스프린트 세트',
  'high_volume_main': '고볼륨 메인',
};

const D: Record<string, string> = {
  'single_arm_backstroke': '한팔 배영',
  'scull_front': '프론트 스컬',
  'dolphin_underwater': '수중 돌핀킥',
  'catch_up_drill': '캐치업 드릴',
  'fingertip_drag': '핑거팁 드래그',
  'scull_side': '사이드 스컬',
  'breaststroke_kick': '평영 킥',
  'dolphin_kick': '돌핀 킥',
};

export const labelOfMethod = (id?: string) => (id && M[id]) || (id ?? '');
export const labelOfDrill  = (id?: string) => (id && D[id]) || (id ?? '');

