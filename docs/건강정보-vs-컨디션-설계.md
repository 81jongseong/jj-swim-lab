# 🏥 건강정보 vs 컨디션 - 데이터 아키텍처

## 🎯 **핵심 개념**

### **건강정보 (Health Profile)** - 1회성, 회원가입 시
```
📝 정의: 변하지 않거나 천천히 변하는 기본 정보

저장 위치: MongoDB User.studentInfo.healthProfile

입력 시점: 회원가입 시 1회

변경 빈도: 거의 없음 (연 1~2회)

포함 항목:
✅ 나이 (생년월일)
✅ 신장
✅ 체중
✅ 혈액형
✅ 만성 질환 (당뇨, 고혈압 등)
✅ 알레르기
✅ 복용 약물
✅ 긴급 연락처
✅ 수영 실력 수준
```

### **컨디션 (Daily Conditions)** - 매번 변경
```
📝 정의: 당일 또는 단기적으로 변하는 상태

저장 위치: AthleteProfile.conditionIds (LocalStorage)

입력 시점: 프로그램 생성 전마다

변경 빈도: 매일 또는 매주

포함 항목:
✅ 수면부족
✅ 피로 高
✅ 코감기/비염
✅ 귀 불편
✅ 근육통(DOMS)
✅ 생리 영향
✅ 당일 특이사항
```

---

## 🔄 **자동 변환 시스템**

### **회원 불러오기 시 자동 매핑**

```typescript
User (MongoDB)
  ↓
건강정보 추출
  ↓
자동 컨디션 변환
  ↓
AthleteProfile

예시:
User.studentInfo.healthProfile: {
  age: 70,                          → senior_65plus (자동)
  chronicConditions: ['diabetes'],  → diabetes_type2
  allergies: ['chlorine']          → chlorine_sensitivity
}

AthleteProfile.conditionIds: [
  'senior_65plus',      // ← 나이 기반 자동
  'diabetes_type2',     // ← 만성질환
  'chlorine_sensitivity' // ← 알레르기
]
```

---

## 📊 **데이터 흐름**

### **회원가입 시**
```
1. 기본 정보 입력
   - 이름, 이메일, 비밀번호

2. 건강정보 입력 (1회성)
   - 나이, 신장, 체중
   - 만성 질환
   - 알레르기
   - 수영 실력

3. MongoDB에 저장
   User.studentInfo.healthProfile

4. 완료!
```

### **프로그램 생성 시**
```
1. 회원 불러오기
   ↓
2. 건강정보 → 기본 컨디션 자동 변환
   - 65세 이상 → senior_65plus
   - 당뇨 → diabetes_type2
   - 고혈압 → hypertension_controlled
   ↓
3. 추가 당일 컨디션 선택
   - 수면부족
   - 피로
   - 감기 등
   ↓
4. 통합된 컨디션으로 프로그램 생성
```

---

## 🚀 **자동 컨디션 규칙**

### **나이 기반**
```typescript
if (age >= 65) → 'senior_65plus'
if (age >= 75) → 'senior_75plus'
if (age < 18)  → 'youth'
if (age < 12)  → 'child'
```

### **만성 질환 기반**
```typescript
chronicConditions.includes('diabetes')     → 'diabetes_type2'
chronicConditions.includes('hypertension') → 'hypertension_controlled'
chronicConditions.includes('asthma')       → 'asthma_exercise'
chronicConditions.includes('arthritis')    → 'arthritis_general'
```

### **BMI 기반**
```typescript
if (bmi >= 30)      → 'obesity'
if (bmi >= 25)      → 'overweight'
if (bmi < 18.5)     → 'underweight'
```

### **알레르기 기반**
```typescript
allergies.includes('chlorine')     → 'chlorine_sensitivity'
allergies.includes('penicillin')   → (프로그램에 영향 없음)
```

---

## 💡 **실제 사용 예시**

### **시나리오: 70세 당뇨 환자**

#### **1. 회원가입 (1회)**
```
이름: 김영희
나이: 70세
신장: 160cm
체중: 65kg
만성질환: ✅ 당뇨
알레르기: ✅ 염소 알레르기
실력: 초급

→ MongoDB에 저장
```

#### **2. 프로그램 생성 (매주)**
```
"회원 불러오기" → 김영희 선택

자동 변환:
✅ senior_65plus      (나이 70 → 자동)
✅ diabetes_type2     (당뇨 → 자동)
✅ chlorine_sensitivity (염소 → 자동)

추가 선택:
✅ 수면부족 (오늘만)
✅ 피로 高 (오늘만)

최종 컨디션: 5개
- senior_65plus (영구)
- diabetes_type2 (영구)
- chlorine_sensitivity (영구)
- sleep_deprived (당일)
- fatigue_high (당일)

프로그램 생성:
→ 강도 자동 조정 (65+ 규칙)
→ 당뇨 안전 가이드 적용
→ 염소 노출 최소화
→ 피로 고려 볼륨 감소
```

---

## 🔧 **구현 계획**

### **Phase 1: 자동 변환 함수** ✅
```typescript
// lib/swimlab/utils/healthToCondition.ts
export function convertHealthToConditions(user: User): string[] {
  const auto: string[] = [];
  
  // 나이
  if (user.studentInfo?.age) {
    if (age >= 75) auto.push('senior_75plus');
    else if (age >= 65) auto.push('senior_65plus');
    else if (age < 18) auto.push('youth');
  }
  
  // 만성질환
  user.studentInfo?.healthProfile?.chronicConditions?.forEach(c => {
    if (c.includes('diabetes')) auto.push('diabetes_type2');
    if (c.includes('hypertension')) auto.push('hypertension_controlled');
    // ... 더 많은 매핑
  });
  
  return auto;
}
```

### **Phase 2: MemberSelectModal 개선** ✅
```typescript
onSelect={(user) => {
  // 건강정보 → 기본 컨디션 자동 변환
  const autoConditions = convertHealthToConditions(user);
  
  const newProfile: AthleteProfile = {
    id: `athlete_${user._id}`,
    name: user.name,
    conditionIds: autoConditions, // ← 자동 변환된 것만
    // 당일 컨디션은 나중에 추가
  };
  
  upsertAthlete(newProfile);
}}
```

### **Phase 3: UI 분리** ✅
```
회원 불러오기
  ↓
자동 컨디션 (회색, 수정 불가)
  - 🔒 65세 이상
  - 🔒 당뇨
  - 🔒 염소 알레르기
  ↓
수동 컨디션 (흰색, 추가 가능)
  - ➕ 수면부족
  - ➕ 피로
  - ➕ 감기
```

---

## 📋 **User 모델 개선 제안**

### **현재 구조**
```typescript
studentInfo: {
  healthProfile: {
    chronicConditions?: string[]  // 너무 자유로움
  }
}
```

### **개선된 구조**
```typescript
studentInfo: {
  healthProfile: {
    // 구조화된 만성질환
    chronic: {
      diabetes: boolean,
      hypertension: boolean,
      asthma: boolean,
      arthritis: boolean,
      // ... 체크박스 형태
    },
    
    // 구조화된 알레르기
    allergies: {
      chlorine: boolean,
      penicillin: boolean,
      // ...
    },
    
    // 측정값
    measurements: {
      height_cm: number,
      weight_kg: number,
      bmi: number
    }
  }
}
```

---

## 🎉 **최종 워크플로우**

### **1회: 회원가입**
```
기본정보 → 건강정보 입력 → MongoDB 저장
(이후 수정 가능하지만 거의 안 함)
```

### **매번: 프로그램 생성**
```
회원 선택 → 건강정보 자동 로드 → 당일 컨디션 추가 → 생성
```

---

**마지막 업데이트: 2025-01-22**

