# JJ Swim Lab 서버 문제 해결 가이드

## 자주 발생하는 문제들

### 1. MongoDB 연결 문제
**증상**: `connect ECONNREFUSED ::1:27017` 오류
**원인**: 환경 변수가 로드되지 않아 로컬 MongoDB에 연결 시도
**해결**: `server/src/db.ts`에서 Atlas URI를 기본값으로 설정
```typescript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
```

### 2. 서버 시작 시 멈춤
**증상**: 모델 import 후 서버 시작 메시지가 나오지 않음
**원인**: 모델 import에서 문법 오류나 의존성 문제
**해결**: 
1. 모든 모델 import를 주석 처리
2. 단계적으로 모델을 하나씩 활성화
3. 빌드 오류 확인 (`pnpm run build`)

### 3. AI 모델 관련 오류
**증상**: AI 모델 import 시 오류 발생
**원인**: 문법 오류, import 경로 문제, 타입 오류
**해결**: 
- `SmartWatchData.ts`: 인덱스 문법 수정, 중복 인덱스 제거
- `ai.ts`: `EvaluationCriteria` import 추가
- `IntegratedAIEngine.ts`: `VideoAnalysisResult` import 경로 수정

### 5. Mongoose 중복 인덱스 경고
**증상**: `Duplicate schema index on {"sessionId":1} found` 경고
**원인**: 필드에 `unique: true`와 `schema.index()`가 중복으로 설정됨
**해결**: 필드 정의에서 `unique: true` 제거하고 `schema.index()`만 사용

### 4. 환경 변수 로딩 문제
**증상**: `.env` 파일이 있지만 환경 변수가 로드되지 않음
**원인**: `dotenv.config()` 호출 순서 문제
**해결**: `index.ts`에서 환경 변수 로딩을 `connectDB` import 전에 실행
```typescript
// 환경 변수 로드 (다른 import 전에 실행)
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// 환경 변수 로드 후 connectDB import
import { connectDB } from './db';
```

## 문제 진단 체크리스트

1. ✅ 서버 시작 메시지 확인
2. ✅ MongoDB 연결 메시지 확인
3. ✅ 모델 import 오류 확인
4. ✅ 빌드 오류 확인
5. ✅ 환경 변수 로딩 확인

## 빠른 해결 방법

1. **모든 모델 import 주석 처리**
2. **최소한의 모델만 활성화**
3. **빌드 테스트**
4. **단계적으로 모델 활성화**
5. **MongoDB Atlas URI 강제 설정**
