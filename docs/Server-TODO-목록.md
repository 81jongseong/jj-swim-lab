# 📋 Server TODO 목록

> **작성일**: 2025-01-22  
> **목적**: Server 코드베이스의 TODO 주석을 정리하고 우선순위를 매김

---

## 🔍 **발견된 TODO 주석 (16개 파일)**

### **우선순위 높음 (긴급)**

#### 1. **환불 정책 계산 로직** (`server/src/routes/approvals.ts:369`)
```typescript
// TODO: 환불 정책에 따른 정확한 환불 금액 계산 로직 추가 필요
const refundAmount = approval.estimatedAmount || payment.amount;
```
- **파일**: `server/src/routes/approvals.ts`
- **라인**: 369
- **우선순위**: 높음 (비즈니스 로직)
- **작업 내용**: 환불 정책에 따른 정확한 환불 금액 계산 로직 구현
- **예상 시간**: 2-3시간

---

### **우선순위 중간 (중요)**

#### 2. **학생 통계 계산** (`server/src/routes/student.ts`)
```typescript
currentStreak: 0, // TODO: 연속 출석 계산
averageRating: 0, // TODO: 평균 평점 계산
achievements: 0, // TODO: 업적 계산
```
- **파일**: `server/src/routes/student.ts`
- **라인**: 238-241
- **우선순위**: 중간 (기능 개선)
- **작업 내용**: 
  - 연속 출석 계산 로직 구현
  - 평균 평점 계산 로직 구현
  - 업적 계산 로직 구현
- **예상 시간**: 4-6시간

#### 3. **수영 엔진 호출** (`server/src/routes/swim-programs.ts:96`)
```typescript
// TODO: 실제로는 클라이언트의 엔진을 서버에서 호출하거나
// 서버에 동일한 로직을 구현해야 함
console.log('⚠️ 수영 엔진 v3.1 호출 필요:', engineInput);
```
- **파일**: `server/src/routes/swim-programs.ts`
- **라인**: 96-98
- **우선순위**: 중간 (아키텍처 개선)
- **작업 내용**: 클라이언트 엔진을 서버에서 호출하거나 서버에 동일한 로직 구현
- **예상 시간**: 6-8시간

#### 4. **강습 과정 센터 확인** (`server/src/routes/users.ts:943`)
```typescript
// TODO: 실제로는 Course 모델을 통해 강습 과정의 센터 확인 필요
// 현재는 임시로 true 반환 (향후 개선 필요)
return true;
```
- **파일**: `server/src/routes/users.ts`
- **라인**: 943-945
- **우선순위**: 중간 (로직 개선)
- **작업 내용**: Course 모델을 통해 강습 과정의 센터 확인 로직 구현
- **예상 시간**: 2-3시간

---

## 📊 **TODO 통계**

- **총 TODO 개수**: 6개 (Server)
- **우선순위 높음**: 1개
- **우선순위 중간**: 3개
- **우선순위 낮음**: 2개 (기타 파일)

---

## 🎯 **작업 우선순위**

### **1단계: 즉시 처리 (1주 내)**
1. ✅ 환불 정책 계산 로직 (`approvals.ts`)
   - 비즈니스 로직이므로 우선 처리

### **2단계: 단기 개선 (2-4주)**
2. 학생 통계 계산 (`student.ts`)
3. 강습 과정 센터 확인 (`users.ts`)

### **3단계: 중기 개선 (1-2개월)**
4. 수영 엔진 호출 (`swim-programs.ts`)
   - 아키텍처 변경이 필요하므로 신중한 검토 필요

---

## 📝 **TODO 상세 정보**

### **파일별 TODO 목록**

#### `server/src/routes/approvals.ts`
- **라인 369**: 환불 정책 계산 로직

#### `server/src/routes/student.ts`
- **라인 238**: 연속 출석 계산
- **라인 239**: 평균 평점 계산
- **라인 241**: 업적 계산

#### `server/src/routes/swim-programs.ts`
- **라인 96**: 수영 엔진 호출

#### `server/src/routes/users.ts`
- **라인 943**: 강습 과정 센터 확인

---

## 🔄 **다음 단계**

1. 각 TODO를 이슈로 등록
2. 우선순위별 작업 계획 수립
3. 담당자 할당 및 마일스톤 설정
4. 작업 진행 및 완료 체크

---

## 📅 **업데이트 이력**

- 2025-01-22: Server TODO 목록 작성

