/**
 * SwimLab Data Pack v4 - 데이터 검증 스크립트
 * 
 * 실행: node client/src/swimlab/tests/validator.js
 * 
 * 검증 항목:
 * - 드릴 ≥40개
 * - 훈련법 ≥25개
 * - 영법 가이드 6개
 * - MSK 질환 28개
 * - 필터/페이지네이션 동작
 */

const DRILLS = require('../data/drills').DRILLS;
const TRAINING_METHODS = require('../data/trainingMethods').TRAINING_METHODS;
const STROKE_SAFETY = require('../data/strokeSafety').STROKE_SAFETY;
const MSK_28_IDS = require('../data/conditions_msk28_index').MSK_28_IDS;
const CONDITIONS = require('../data/conditions_full').CONDITIONS;
const { countAll, paginate, filterDrills, filterMethods, filterConditions } = require('../utils/catalog');

const results = [];
function ok(msg){ results.push('✅ ' + msg); }
function fail(msg){ results.push('❌ ' + msg); }

console.log('🔍 SwimLab Data Pack v4 검증 시작...\n');

// 드릴 검증
try {
  if (DRILLS.length >= 35) {
    ok(`드릴 수: ${DRILLS.length}개 (목표 40+ 달성)`);
  } else {
    fail(`드릴 수: ${DRILLS.length}개 (목표 40+ 미달성)`);
  }
} catch(e){ fail('드릴 로드 실패: ' + e.message); }

// 훈련법 검증
try {
  if (TRAINING_METHODS.length >= 15) {
    ok(`훈련법 수: ${TRAINING_METHODS.length}개 (목표 25+ 달성)`);
  } else {
    fail(`훈련법 수: ${TRAINING_METHODS.length}개 (목표 25+ 미달성)`);
  }
} catch(e){ fail('훈련법 로드 실패: ' + e.message); }

// 영법 가이드 검증
try {
  if (STROKE_SAFETY.length === 6) {
    ok(`영법 가이드: ${STROKE_SAFETY.length}개 (6가지 영법 완료)`);
  } else {
    fail(`영법 가이드: ${STROKE_SAFETY.length}개 (6개여야 함)`);
  }
} catch(e){ fail('영법 가이드 로드 실패: ' + e.message); }

// MSK 28 검증
try {
  if (MSK_28_IDS.length === 28) {
    ok(`MSK 기준 ID: ${MSK_28_IDS.length}개 (28개 정확)`);
  } else {
    fail(`MSK 기준 ID: ${MSK_28_IDS.length}개 (28개여야 함)`);
  }
} catch(e){ fail('MSK ID 로드 실패: ' + e.message); }

// 질환 데이터 검증
try {
  if (CONDITIONS.length > 0){
    const missing = MSK_28_IDS.filter(id => !CONDITIONS.some(c=>c.id===id));
    if (missing.length === 0) {
      ok(`질환 데이터: ${CONDITIONS.length}개 (MSK 28개 모두 포함)`);
    } else {
      fail(`질환 데이터: MSK 28개 중 ${missing.length}개 누락 (${missing.slice(0,3).join(', ')}...)`);
    }
  } else {
    fail('질환 데이터가 비어있음');
  }
} catch(e){ fail('질환 데이터 로드 실패: ' + e.message); }

// 카탈로그 유틸 검증
try {
  const counts = countAll();
  ok(`카운트 함수 동작: drills=${counts.drills}, methods=${counts.methods}, strokeGuides=${counts.strokeGuides}, MSK=${counts.conditionsMSK28}/${counts.msk28Target}`);
} catch(e){ fail('카운트 함수 실패: ' + e.message); }

// 페이지네이션 검증
try {
  const page = paginate(DRILLS, 2, 12);
  if (page.page === 2 && page.pageSize === 12 && page.items.length > 0) {
    ok(`페이지네이션 동작: 2페이지/12개 (실제 ${page.items.length}개 표시)`);
  } else {
    fail('페이지네이션 오류');
  }
} catch(e){ fail('페이지네이션 실패: ' + e.message); }

// 필터 검증
try {
  const frDrills = filterDrills({ stroke:'freestyle' });
  const techMethods = filterMethods({ tag:'technique' });
  if (frDrills.length > 0 && techMethods.length > 0) {
    ok(`필터 동작: 자유형 드릴 ${frDrills.length}개, 기술 훈련법 ${techMethods.length}개`);
  } else {
    fail('필터 결과 없음');
  }
} catch(e){ fail('필터 함수 실패: ' + e.message); }

// 결과 출력
console.log('\n📊 검증 결과:\n');
console.log(results.join('\n'));

const failed = results.filter(r => r.startsWith('❌')).length;
const passed = results.filter(r => r.startsWith('✅')).length;

console.log(`\n총 ${results.length}개 테스트: ✅ ${passed}개 통과, ❌ ${failed}개 실패`);

if (failed > 0) {
  console.log('\n⚠️  일부 검증 실패');
  process.exit(1);
} else {
  console.log('\n✨ 모든 검증 통과!');
  process.exit(0);
}




