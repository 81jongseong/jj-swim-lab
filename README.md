# 🏊‍♂️ JJ Swim Lab - 수영 트레이닝 규칙 엔진

> **🚀 빠른 시작**: 프로젝트 전체 현황을 파악하려면 **[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)** 문서를 먼저 읽으세요!  
> 이 문서 하나만 읽으면 프로젝트의 목표, 구조, 히스토리를 모두 파악할 수 있습니다.

## 📋 개요

JJ Swim Lab 수영 트레이닝 규칙 엔진은 건강검진 데이터와 정형 28개 관절질환 가이드를 기반으로 한 과학적 수영 계획 생성 시스템입니다.

### 🎯 주요 기능

- **WHO/ACSM 기준 기반 운동 도스 계산**
- **고혈압/비만/고지혈증 가드레일 적용**
- **수중 HR 보정 및 의료 확인 필요성 판단**
- **28개 관절질환 × 6영법 안전도 기반 영법 선택**
- **성취율 기반 프로그레션 알고리즘**
- **투명성 노트 포함** (추측입니다, 확실하지 않음, 모르겠습니다)

## 🏗️ 프로젝트 구조

```
swim-training-engine/
├── src/
│   ├── types.ts                           # 타입 정의
│   ├── data/
│   │   └── jj-swim-lab-joint-guidance.ts  # 28개 관절질환 × 6영법 데이터
│   └── engine/
│       ├── health-policy.ts                # 건강 정책 및 도스 규칙
│       └── swim-plan.ts                   # 수영 계획 생성기
├── scripts/
│   └── demo.ts                            # 데모 스크립트
├── tests/
│   ├── dose.test.ts                       # 도스 규칙 테스트
│   ├── guardrails.test.ts                # 가드레일 테스트
│   ├── progression.test.ts               # 프로그레션 테스트
│   └── ortho-filter.test.ts              # 정형 가이드 필터 테스트
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```

## 🚀 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 빌드

```bash
npm run build
```

### 3. 데모 실행

```bash
npm run demo
```

### 4. 테스트 실행

```bash
npm test
```

## 📊 사용 예시

### 기본 사용법

```typescript
import { buildPlan } from './src/engine/swim-plan';
import { HealthInput } from './src/types';

const healthInput: HealthInput = {
  demographics: { age: 45, sex: 'M' },
  anthropometrics: { height_cm: 175, weight_kg: 80, bmi: 26.1 },
  vitals: { 
    rest_hr: 70, 
    rest_bp: { sbp: 140, dbp: 90 }, 
    on_beta_blocker: false 
  },
  conditions: { 
    obesity: 'overweight', 
    hypertension: 'stage1', 
    dyslipidemia: true, 
    diabetes: false 
  },
  orthopedics: ['knee_oa'],
  swim_profile: { level: 'intermediate' },
  goals: ['blood_pressure_control', 'fat_loss'],
  adherence_last_week: 0.8,
  symptoms_flags: []
};

const plan = buildPlan(healthInput);
console.log(JSON.stringify(plan, null, 2));
```

### 출력 예시

```json
{
  "microcycle_week": 1,
  "weekly_target_min": 250,
  "medical_clearance_required": false,
  "sessions": [
    {
      "day": "Mon",
      "focus": ["blood_pressure_control", "fat_loss"],
      "stroke_plan": [
        { "stroke": "backstroke", "block": "15' easy" },
        { "stroke": "freestyle", "block": "25' @RPE 11–13(중등도)" },
        { "stroke": "elementary_backstroke", "block": "10' easy" }
      ],
      "constraints": [
        "킥 폭 축소",
        "속도 낮춤",
        "피하기: 깊은 굴곡+트위스트"
      ],
      "intensity_cues": {
        "primary": "RPE 11–13(중등도)",
        "secondary": "HR: 육상 목표에서 −10~15bpm(수중 보정, 개인차 큼 — 확실하지 않음)"
      },
      "stop_rules": [
        "SBP≥250 or DBP≥115(즉시 중지)",
        "chest_pain",
        "unusual_dyspnea"
      ]
    }
  ],
  "strength_days": 2,
  "next_week_adjustment": "progress_+5%",
  "notes": [
    "수중 HR은 개인차가 큼 — 확실하지 않음",
    "평영 킥 폭 축소 — 추측입니다"
  ]
}
```

## 🧪 테스트 케이스

### 데모 케이스

1. **Case A**: 비만+고혈압+무릎OA (52세 남성)
2. **Case B**: 고지혈증+아킬레스건병증 (41세 여성)  
3. **Case C**: 정상혈압+만성요통+베타차단제 (47세 남성)

### 테스트 범위

- **도스 규칙**: WHO/ACSM 기준 준수, 질환별 도스 조정
- **가드레일**: 의료 확인 필요성, 혈압 기준, 증상 플래그
- **프로그레션**: 성취율 기반 조정, 증상 영향
- **정형 필터**: 관절질환별 영법 선택, 제약사항 적용

## 📚 의학적 근거

### 근거 수준

- **Level 1**: Cochrane Review, Systematic Review, Meta-analysis
- **Level 2**: Randomized Controlled Trial (RCT)
- **Level 3**: Clinical Practice Guidelines (CPG)
- **Level 4**: Observational Studies
- **Level 5**: Expert Opinion

### 주요 출처

- **Cochrane Database**: Bartels 2016 (고관절/무릎 OA), Hayden 2005 (요통)
- **JOSPT CPG**: 무릎, 발목, 고관절, 손목 가이드라인
- **RCT 연구**: Hinman 2007, Peng 2022, Mellor 2018, Sadaak 2024
- **AAOS 가이드라인**: 수근관 증후군 2024

## ⚠️ 투명성 및 한계

### 투명성 노트

시스템은 불확실한 부분에 대해 다음과 같은 노트를 자동 생성합니다:

- **"추측입니다"**: 근거가 부족한 부분
- **"확실하지 않음"**: 개인차가 큰 부분  
- **"모르겠습니다"**: 명확한 근거가 없는 부분

### 주요 한계

1. **수중 HR 보정**: 개인차가 크며 확실하지 않음
2. **영법별 직접 RCT**: 대부분 관찰연구/전문가 합의 수준
3. **다중 관절질환**: 개별 반응 차이가 큼
4. **고령자**: 점진적 부하 증가는 추측 수준

## 🔧 개발 정보

- **언어**: TypeScript
- **테스트**: Jest + ts-jest
- **빌드**: TypeScript Compiler
- **ESM**: ES Modules 지원

## 📄 라이선스

MIT License

## 👥 기여

JJ Swim Lab 개발팀

---

**⚠️ 의료 상담 필요**: 이 시스템은 참고용이며, 실제 운동 전 의료진 상담을 권장합니다.