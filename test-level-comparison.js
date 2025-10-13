/**
 * 레벨별 프로그램 비교 테스트
 * 
 * 조건:
 * - 정상인 (질환 없음)
 * - 자유형 CSS: 120초
 * - 세션 시간: 50분
 * - 운동 목표: 장거리 수영
 * - 풀 길이: 25m
 */

const { generateTimeBasedProgram } = require('./client/lib/swimlab/engine-v35-time-based.ts');

const baseConfig = {
  targetMinutes: 50,
  css100: { freestyle: 120, backstroke: 130, breaststroke: 140, butterfly: 150 },
  poolLen: 25,
  goal: '장거리 수영',
  strokesAllowed: ['freestyle', 'backstroke', 'breaststroke'],
  strokesAvoid: [],
  conditionIds: [],
  dayCondition: 'normal',
  weeklyFrequency: 3,
  intensityPercent: 1.0
};

const levels = [
  { name: '초급', level: 'beginner_2' },
  { name: '중급 하위', level: 'intermediate_1' },
  { name: '중급 상위', level: 'intermediate_2' },
  { name: '고급 하위', level: 'advanced_1' },
  { name: '고급 상위', level: 'advanced_2' }
];

console.log('═══════════════════════════════════════════════════════════');
console.log('🏊 레벨별 프로그램 비교 (장거리 수영, CSS 120초, 50분)');
console.log('═══════════════════════════════════════════════════════════\n');

levels.forEach(({ name, level }) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${name} (${level})`);
  console.log('='.repeat(60));
  
  const program = generateTimeBasedProgram({
    ...baseConfig,
    level
  });
  
  console.log(`\n🎯 총 거리: ${program.totalMeters}m`);
  console.log(`⏱️  예상 시간: ${program.estimatedMinutes}분`);
  console.log(`📋 세트 수: ${program.sets.length}개\n`);
  
  program.sets.forEach((set, idx) => {
    const subtypeLabel = {
      'WARMUP': '🔥 워밍업',
      'DRILL_LESSON': '🎓 강습',
      'DRILL_PULL': '🤲 드릴(팔)',
      'DRILL_KICK': '🦵 드릴(발)',
      'MAIN': '💪 메인',
      'MAIN_SUB': '💪 메인',
      'COOLDOWN': '❄️  쿨다운'
    }[set.subtype] || set.subtype;
    
    console.log(`${idx + 1}. ${subtypeLabel} ${set.desc}`);
  });
  
  console.log(`\n📊 거리 분포:`);
  const warmupMeters = program.sets.filter(s => s.subtype === 'WARMUP').reduce((sum, s) => sum + s.meters, 0);
  const drillMeters = program.sets.filter(s => s.subtype.includes('DRILL')).reduce((sum, s) => sum + s.meters, 0);
  const mainMeters = program.sets.filter(s => s.subtype.includes('MAIN')).reduce((sum, s) => sum + s.meters, 0);
  const cooldownMeters = program.sets.filter(s => s.subtype === 'COOLDOWN').reduce((sum, s) => sum + s.meters, 0);
  
  console.log(`  워밍업: ${warmupMeters}m (${(warmupMeters/program.totalMeters*100).toFixed(1)}%)`);
  console.log(`  드릴: ${drillMeters}m (${(drillMeters/program.totalMeters*100).toFixed(1)}%)`);
  console.log(`  메인: ${mainMeters}m (${(mainMeters/program.totalMeters*100).toFixed(1)}%)`);
  console.log(`  쿨다운: ${cooldownMeters}m (${(cooldownMeters/program.totalMeters*100).toFixed(1)}%)`);
});

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('📊 레벨별 차이점 요약');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🎯 **거리 단위 차이**:');
console.log('  - 초급: 워밍업 25m, 드릴 25m, 메인 50m, 쿨다운 25m');
console.log('  - 중급: 워밍업 50m, 드릴 50m, 메인 100m, 쿨다운 50m');
console.log('  - 고급: 워밍업 100m, 드릴 50m, 메인 200m, 쿨다운 50m');
console.log('\n💪 **총 거리 차이**:');
console.log('  - 레벨 ↑ → 세트당 거리 ↑ → 총 거리 ↑');
console.log('\n🔬 **과학적 근거**:');
console.log('  - Maglischo (2003): 레벨별 최적 거리 단위');
console.log('  - 초급: 짧은 거리로 기술 습득 집중');
console.log('  - 고급: 긴 거리로 지구력 강화');

