# 🚀 AntiGravity를 위한 JJ Swim Lab 프로젝트 온보딩 가이드

> **목적**: 이 문서를 AntiGravity에게 전달하면 프로젝트를 완전히 파악할 수 있습니다.  
> **사용법**: AntiGravity에게 이 문서의 내용을 복사해서 전달하거나, 파일을 참조하도록 요청하세요.

---

## 📋 **1. 먼저 읽어야 할 필수 문서 (우선순위 순)**

### **최우선 문서 (반드시 읽어야 함)**
1. **`PROJECT_CONTEXT.md`** - 프로젝트 전체 컨텍스트 마스터 문서
   - 프로젝트 개요, 목표, 기술 스택
   - 계정 타입 및 권한 구조
   - 핵심 기능 설명
   - 주요 파일 위치
   - 개발 규칙 및 주의사항
   - **이 문서 하나만 읽으면 프로젝트의 80%를 파악할 수 있습니다**

2. **`DEVELOPMENT.md`** - 최신 개발 현황 및 오류 해결 이력
   - 현재 진행 중인 작업
   - 최근 해결된 이슈
   - 개발 가이드라인
   - 빌드/배포 관련 정보

### **추가 참고 문서**
3. **`docs/계정별-기능명세서.md`** - 각 계정 타입별 기능 현황
4. **`docs/프로젝트-구조.md`** - 디렉토리 구조 및 파일 위치 상세 설명
5. **`docs/로드맵-구현-현황.md`** - 전체 로드맵 및 구현 현황 통계

---

## 🎯 **2. 프로젝트 핵심 요약**

### **프로젝트 이름**
**JJ Swim Lab** (JJ 수영 연구소) - 수영 강습 전문 플랫폼

### **기술 스택**
- **프론트엔드**: Next.js 14.2.5, React 18.3.1, TypeScript 5.3.2, Tailwind CSS
- **백엔드**: Express.js 4.18.2, MongoDB Atlas, Mongoose
- **패키지 매니저**: pnpm (모노레포 구조)
- **포트**: 클라이언트 3000, 서버 5000

### **계정 타입 (5가지)**
1. **superAdmin** - 최고 관리자
2. **centerAdmin** - 센터 관리자
3. **instructor** - 강사
4. **student** - 학생
5. **guest** - 게스트

---

## ⚠️ **3. 중요한 개발 규칙 (반드시 준수해야 함)**

### **코딩 규칙**
- ✅ **pnpm만 사용** (npm/yarn 절대 금지!)
- ✅ **TypeScript 타입 안전성** - `as any` 최소화
- ✅ **파일 상단 주석 필수** - 파일 전체 주석 (연동 데이터, 연동 파일)
- ✅ **대소문자 통일** - 소문자로 통일 (Badge → badge, Button → button)
- ✅ **계정 4가지 모두 고려** - student, instructor, centerAdmin, superAdmin
- ✅ **파일을 새로 만들지 말고 기존 파일 수정** (주석 먼저 읽기)

### **데이터 관리**
- ✅ **임시/테스트 데이터는 DB에 저장**
- ✅ **.env 파일 재생성 금지**
- ✅ **작업 후 항상 build, linter, TypeScript 오류 체크**
- ✅ **서버는 항상 실행 상태 유지**

### **문서화**
- ✅ **오류 사항은 `DEVELOPMENT.md`에 추가**
- ✅ **해결 후 해결방법도 추가**

---

## 📁 **4. 주요 파일 위치 (빠른 참조)**

### **핵심 엔진 로직**
- `client/lib/swimlab/engine-v31.ts` - 메인 수영 프로그램 생성 엔진
- `client/lib/swimlab/engine-v35-time-based.ts` - 시간 기반 프로그램 생성
- `client/lib/swimlab/condition-rules-v4.ts` - 질환별 자동 조정 규칙

### **인증 및 권한**
- `client/hooks/useAuth.tsx` - 인증 훅 (사용자 정보 관리)
- `client/components/withAuth.tsx` - 인증 HOC
- `client/components/Navigation.tsx` - 네비게이션 (사용자 타입별 메뉴)

### **API 라우트**
- `server/src/routes/` - 모든 API 엔드포인트
- `server/src/models/` - Mongoose 데이터 모델

### **관리자 페이지**
- `client/app/admin/` - 최고 관리자 페이지
- `client/app/center-admin/` - 센터 관리자 페이지
- `client/app/instructor/` - 강사 페이지

---

## 🔧 **5. 개발 워크플로우**

### **새 기능 개발 시 체크리스트**
1. ✅ 관련 문서 읽기 (`PROJECT_CONTEXT.md`, `docs/README.md` 참조)
2. ✅ 파일 상단 주석 확인 (연동 데이터, 연동 파일 파악)
3. ✅ 타입 정의 확인 및 추가
4. ✅ 계정 4가지 모두 테스트 (student, instructor, centerAdmin, superAdmin)
5. ✅ 빌드 및 린트 오류 체크 (`npm run build` in server, client)
6. ✅ `DEVELOPMENT.md`에 작업 기록
7. ✅ 파일 상단 주석 추가/업데이트

### **오류 발생 시**
1. ✅ 터미널 오류 메시지 확인
2. ✅ TypeScript 오류 확인 (각 디렉토리에서 `npm run build`)
3. ✅ `DEVELOPMENT.md`에서 유사 문제 검색
4. ✅ 해결 후 `DEVELOPMENT.md`에 기록

---

## 📚 **6. 문서 구조**

### **루트 디렉토리 문서**
- `PROJECT_CONTEXT.md` ⭐ - 프로젝트 전체 컨텍스트 (최우선)
- `DEVELOPMENT.md` ⭐ - 개발 현황 및 오류 이력
- `README.md` - 프로젝트 기본 개요

### **docs/ 디렉토리 문서**
- `docs/계정별-기능명세서.md` - 계정별 기능 현황
- `docs/프로젝트-구조.md` - 디렉토리 구조 상세
- `docs/로드맵-구현-현황.md` - 로드맵 및 통계
- `docs/프로젝트-요약.md` - 프로젝트 개요 및 기능
- `docs/API-문서.md` - API 엔드포인트 문서
- 기타 기능별 상세 문서들

---

## 🚀 **7. 빠른 시작 명령어**

```bash
# 의존성 설치 (pnpm만 사용!)
pnpm install

# 개발 서버 실행
pnpm run dev

# 서버만 실행
cd server && npm run dev

# 클라이언트만 실행
cd client && npm run dev

# 빌드 체크 (서버)
cd server && npm run build

# 빌드 체크 (클라이언트)
cd client && npm run build
```

---

## 💡 **8. AntiGravity에게 전달할 프롬프트 예시**

다음과 같이 요청하세요:

```
안녕하세요! JJ Swim Lab 프로젝트를 작업하게 되었습니다.
프로젝트를 파악하기 위해 다음 문서들을 순서대로 읽어주세요:

1. 먼저 PROJECT_CONTEXT.md 파일을 읽어서 전체 컨텍스트를 파악해주세요.
2. 그 다음 DEVELOPMENT.md 파일을 읽어서 최신 개발 현황과 규칙을 확인해주세요.
3. 필요하면 docs/계정별-기능명세서.md를 참조해주세요.

특히 다음 규칙을 반드시 준수해주세요:
- pnpm만 사용 (npm/yarn 금지)
- 파일을 수정할 때는 상단 주석을 먼저 읽고 수정
- 계정 4가지 모두 고려 (student, instructor, centerAdmin, superAdmin)
- 작업 후 항상 build, linter, TypeScript 오류 체크

문서를 읽고 프로젝트를 파악했으면 간단히 요약해주세요.
```

---

## 📝 **9. 최근 주요 변경사항 (2025-11-18 기준)**

- ✅ 퀴즈 관리 기능 개선
  - 퀴즈 카테고리 옵션 확장
  - 난이도에 '없음' 옵션 추가 및 외부 표시 숨김 처리
  - 퀴즈 수정 모달에서 모든 메타데이터 표시 및 편집 가능
- ✅ 최고 관리자 계정명 표시 수정 (Navigation.tsx)
- ✅ 중복 퀴즈 관리 페이지 삭제 및 경로 통일

---

## 🎯 **10. 다음 단계**

문서를 읽은 후:
1. `PROJECT_CONTEXT.md`에서 핵심 개념 이해 확인
2. `DEVELOPMENT.md`에서 현재 작업 상태 파악
3. 특정 기능 작업 시 관련 상세 문서 참조

---

**마지막 업데이트**: 2025-11-18  
**작성자**: JJ Swim Lab 개발팀

