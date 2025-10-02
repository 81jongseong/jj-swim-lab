# 🏊 SwimLab - 컨디션 선택 패치 가이드

## 📋 개요

**주관식 입력을 제거하고 클릭만으로 컨디션을 선택하는 가벼운 패치**

### ✨ 핵심 개선 사항

1. ✅ **100% 클릭 기반** - 주관식 입력 완전 제거
2. ✅ **ACUTE/CHRONIC 구분** - 당일 상태 vs 질환 분리
3. ✅ **프리셋 버튼** - 자주 사용하는 조합 빠르게 적용
4. ✅ **길이 초과 방지** - 가벼운 패치 형태로 최소화

---

## 🎯 2단계 적용 방법

### 1단계: ConditionQuickPick 컴포넌트 추가

**파일 위치:** `client/components/swimlab/ConditionQuickPick.tsx`

이미 생성되었습니다 ✅

**주요 기능:**
- 당일 컨디션 8개 (수면부족, 피로, 감기 등)
- 질환·특수상황 12개 (어깨, 무릎, 허리 등)
- 프리셋 5개 (어깨 패키지, 무릎 패키지 등)

### 2단계: 기존 페이지에 적용

#### A) 새로운 페이지에서 사용하기 (권장)

**데모 페이지 확인:**
```bash
http://localhost:3000/swimlab-demo
```

**코드 예시:**
```tsx
'use client';
import { useState } from 'react';
import ConditionQuickPick from '@/components/swimlab/ConditionQuickPick';

export default function MyPage() {
  const [conditionIds, setConditionIds] = useState<string[]>([]);

  return (
    <div>
      <ConditionQuickPick 
        value={conditionIds} 
        onChange={setConditionIds}
      />
      
      {/* 선택 결과 사용 */}
      <div>선택됨: {conditionIds.join(', ')}</div>
    </div>
  );
}
```

#### B) 기존 health/input/page.tsx에 적용하기

**Step 1: Import 추가**
```tsx
// 기존 imports 아래에 추가
import ConditionQuickPick from '@/components/swimlab/ConditionQuickPick';
```

**Step 2: State 추가 (또는 기존 state 활용)**
```tsx
// 이미 있다면 생략
const [conditionIds, setConditionIds] = useState<string[]>([]);
```

**Step 3: 기존 관절질환 섹션 교체**

**Before (기존 코드 - 547~630줄):**
```tsx
{currentStep === 3 && (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">관절 질환 선택</h3>
      <p className="text-sm text-gray-600 mb-6">
        현재 가지고 있는 관절 질환이나 통증이 있다면 선택해주세요. (복수 선택 가능)
      </p>
      
      {/* 복잡한 카테고리 필터 + 체크박스 리스트 */}
      ...
    </div>
  </div>
)}
```

**After (새로운 코드):**
```tsx
{currentStep === 3 && (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">컨디션 선택</h3>
      <p className="text-sm text-gray-600 mb-6">
        당일 상태와 질환·특수상황을 선택해주세요. (클릭만으로 간편하게!)
      </p>
      
      {/* 새로운 컨디션 퀵피커 */}
      <ConditionQuickPick 
        value={healthData.orthopedics || []} 
        onChange={(ids) => setHealthData(prev => ({ ...prev, orthopedics: ids }))}
      />
    </div>
  </div>
)}
```

---

## 📊 컨디션 종류

### 🟡 ACUTE (당일 컨디션)

| ID | 라벨 | 설명 |
|---|---|---|
| `sleep_deprived` | 수면부족 | 전날 충분히 못 잠 |
| `upper_respiratory` | 코감기/비염 | 호흡기 불편 |
| `ear_irritation` | 귀 불편(염증 의심) | 귀 통증/불편 |
| `skin_irritation` | 피부 자극/염증 | 피부 민감 |
| `doms` | 근육통(DOMS) | 운동 후 근육통 |
| `menstruation` | 생리 주기 영향 | 생리 중 |
| `fatigue_high` | 피로 高 | 매우 피곤함 |
| `openwater_cold` | 오픈워터-저수온 | 찬물 수영 |

### 🔴 CHRONIC (질환·특수상황)

| ID | 라벨 | 영향 부위 |
|---|---|---|
| `shoulder_impingement` | 어깨 충돌 | 어깨 |
| `rotator_cuff_irritation` | 회전근개 과민 | 어깨 |
| `scapular_dyskinesis` | 견갑 불균형 | 어깨 |
| `patellofemoral_pain` | 무릎 PFPS | 무릎 |
| `patellar_tendinopathy` | 슬개건 통증 | 무릎 |
| `it_band_syndrome` | 장경인대(ITB) | 무릎 |
| `lumbar_extension_intolerance` | 허리 신전 민감 | 허리 |
| `lumbar_flexion_intolerance` | 허리 굴곡 민감 | 허리 |
| `achilles_tendinopathy` | 아킬레스 | 발목 |
| `plantar_fasciitis` | 족저근막 | 발 |
| `long_covid_fatigue` | 장기 COVID 피로 | 전신 |
| `general_deconditioning` | 전신 컨디션 저하 | 전신 |

### 🎁 프리셋

| 이름 | 포함 컨디션 | 용도 |
|---|---|---|
| 어깨 패키지 | 어깨 충돌 + 회전근개 + 견갑 불균형 | 어깨 종합 |
| 무릎 패키지 | 무릎 PFPS + 장경인대 | 무릎 종합 |
| 허리 민감(신전) | 허리 신전 민감 | 허리 신전 문제 |
| 피로+수면 | 피로 高 + 수면부족 | 피곤한 날 |
| 감기 세이프 | 코감기 + 귀 불편 | 감기 걸렸을 때 |

---

## 🔗 데이터 흐름

### 1. 사용자 선택
```
사용자 클릭 → ConditionQuickPick
```

### 2. ID 배열 생성
```tsx
// 예시
conditionIds = [
  'sleep_deprived',
  'shoulder_impingement',
  'rotator_cuff_irritation'
]
```

### 3. 엔진 전달
```tsx
buildWeeklyPlan({
  // ... 기타 설정
  conditionIds: conditionIds,  // 여기로 전달
})
```

### 4. 자동 조정
```
rules_multi.ts
→ 회피 메서드 필터링
→ 권장 메서드 우선순위
→ 충돌 시 경고
→ engine.ts로 전달
→ 세트 자동 조정
```

---

## 💡 사용 예시

### 시나리오 1: 피곤한 날

**선택:**
- ✅ 수면부족
- ✅ 피로 高

**또는 프리셋 클릭:**
- 🎁 피로+수면

**결과:**
```typescript
conditionIds = ['sleep_deprived', 'fatigue_high']
→ 강도 자동 하향 조정
→ Recovery 세션 우선
```

### 시나리오 2: 어깨 문제

**프리셋 클릭:**
- 🎁 어깨 패키지

**결과:**
```typescript
conditionIds = [
  'shoulder_impingement',
  'rotator_cuff_irritation',
  'scapular_dyskinesis'
]
→ 자유형 주의 세트 조정
→ 킥 중심 드릴 추가
→ 스트로크 카운트(SPL) 낮춤
```

### 시나리오 3: 감기 + 피로

**선택:**
- ✅ 코감기/비염
- ✅ 피로 高

**결과:**
```typescript
conditionIds = ['upper_respiratory', 'fatigue_high']
→ 호흡 부하 낮춤
→ 거리 단축
→ 휴식 시간 증가
```

---

## 🎨 UI/UX 개선 사항

### Before (기존)
```
❌ 주관식 텍스트 입력
❌ 긴 드롭다운 리스트
❌ 카테고리 필터 필요
❌ 입력 오류 가능성
```

### After (개선)
```
✅ 클릭만으로 선택
✅ ACUTE/CHRONIC 시각적 구분
✅ 프리셋으로 빠른 적용
✅ 입력 오류 완전 제거
✅ 선택 결과 실시간 표시
```

---

## 🚀 테스트 방법

### 1. 데모 페이지 접속
```bash
http://localhost:3000/swimlab-demo
```

### 2. 컨디션 선택
1. 당일 컨디션 클릭 (노란색 태그)
2. 질환·특수상황 클릭 (빨간색 태그)
3. 프리셋 버튼 클릭

### 3. 결과 확인
- 선택된 개수 확인
- ID 배열 확인 (개발자 도구)
- 사용 예시 코드 확인

---

## 📦 파일 구조

```
client/
├── components/
│   └── swimlab/
│       └── ConditionQuickPick.tsx  ✅ 새로 추가
├── app/
│   ├── swimlab-demo/
│   │   └── page.tsx                ✅ 데모 페이지
│   └── health/
│       └── input/
│           └── page.tsx            🔧 패치 적용 대상
└── docs/
    └── SwimLab-컨디션-선택-패치-가이드.md  📝 이 문서
```

---

## ⚡ 성능 및 최적화

### 파일 크기
- `ConditionQuickPick.tsx`: ~3KB (경량)
- 추가 의존성: 없음 (React 기본 훅만 사용)

### 렌더링 최적화
```tsx
// useMemo로 Set 캐싱
const set = useMemo(()=> new Set(value), [value]);

// 불필요한 리렌더링 방지
```

### 번들 크기 영향
- 최소 (~3KB gzipped)
- 트리 쉐이킹 가능

---

## 🔧 확장 가이드

### 새로운 컨디션 추가

**ACUTE 추가:**
```tsx
const ACUTE: QuickCondition[] = [
  // ... 기존
  { id:'new_condition', label:'새 컨디션', group:'ACUTE' },
];
```

**CHRONIC 추가:**
```tsx
const CHRONIC: QuickCondition[] = [
  // ... 기존
  { id:'new_chronic', label:'새 질환', group:'CHRONIC' },
];
```

### 새로운 프리셋 추가
```tsx
const PRESETS: { name: string; ids: string[] }[] = [
  // ... 기존
  { name:'나의 프리셋', ids:['condition1','condition2'] },
];
```

---

## ❓ FAQ

### Q: 기존 데이터와 호환되나요?
**A:** 네, ID 배열은 동일하게 사용됩니다. 기존 `healthData.orthopedics` 배열과 완전 호환됩니다.

### Q: 주관식 입력을 완전히 제거해도 되나요?
**A:** 네, 20개의 사전 정의된 컨디션 + 프리셋으로 대부분의 상황을 커버합니다.

### Q: 새로운 컨디션이 필요하면?
**A:** `ConditionQuickPick.tsx`의 `ACUTE` 또는 `CHRONIC` 배열에 추가하면 됩니다.

### Q: rules_multi.ts와 연동이 자동인가요?
**A:** 네, 선택된 ID 배열만 전달하면 자동으로 중재됩니다.

---

## 🎉 완료!

이제 다음 명령어로 테스트하세요:

```bash
# 개발 서버 시작
npm run dev

# 데모 페이지 접속
http://localhost:3000/swimlab-demo
```

**주관식 입력 없이 클릭만으로 컨디션을 선택할 수 있습니다!** 🎊

