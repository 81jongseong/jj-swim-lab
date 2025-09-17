# 🏊‍♂️ JJ Swim Lab - 프로젝트 설정 가이드

## 📋 프로젝트 시작 시 설정해야 할 것들

### 1. 자동 검증 시스템 설정

```bash
# 1. 초기 설정
npm install --save-dev husky lint-staged @commitlint/config-conventional @commitlint/cli

# 2. Git 훅 설정
npx husky install
npx husky add .husky/pre-commit "npm run check"
npx husky add .husky/pre-push "npm run test:all"

# 3. commitlint 설정
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

### 2. CI/CD 파이프라인 설정

```yaml
# .github/workflows/validate.yml
name: Validation Pipeline
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run check
      - run: npm run test:all
```

### 3. 코드 품질 도구

```bash
# SonarQube 설정
npm install --save-dev sonarjs eslint-plugin-sonarjs

# Bundle 분석기
npm install --save-dev @next/bundle-analyzer

# 의존성 보안 검사
npm install --save-dev npm-audit-ci-wrapper
```

## 🗑️ 파일 삭제/수정 이유 설명

### 삭제된 파일들

#### 1. **클라이언트 컴포넌트들**
- `client/components/ThreeSplash.tsx` ❌
  - **삭제 이유**: 3D 관련 기능이 실제로 사용되지 않음
  - **대체**: 더 간단한 스플래시 화면으로 교체

- `client/components/AnimationLab.tsx` ❌
  - **삭제 이유**: 복잡한 애니메이션 라이브러리로 인한 성능 이슈
  - **대체**: Framer Motion으로 단순화

- `client/components/ThreeJSViewer.tsx` ❌
- `client/components/ThreeJSAnimationViewer.tsx` ❌
- `client/components/GLBAnimationTest.tsx` ❌
  - **삭제 이유**: 3D 모델 렌더링이 실제 서비스에 필요하지 않음
  - **대체**: 2D 이미지 기반 UI로 변경

#### 2. **테스트/데모 파일들**
- `client/lib/mockData.ts` ❌
  - **삭제 이유**: 실제 API 연동으로 대체됨
  - **대체**: 서버에서 실제 데이터 제공

- `server/scripts/check-current-data.js` ❌
  - **삭제 이유**: 일회성 데이터 확인 스크립트
  - **대체**: 정기적인 데이터 검증 시스템으로 교체

#### 3. **3D 관련 페이지들**
- `client/app/admin/3d-viewer/management/page.tsx` ❌
- `client/app/admin/3d-viewer/models/page.tsx` ❌
- `client/app/video-3d-analysis/page.tsx` ❌
- `client/app/animation-test/page.tsx` ❌
- `client/app/pipeline-test/page.tsx` ❌
  - **삭제 이유**: 3D 기능이 실제 서비스 요구사항에 포함되지 않음
  - **대체**: 실제 필요한 관리 기능으로 교체

#### 4. **Python 스크립트들**
- `test_video_processing.py` ❌
- `fix_glb_animation.py` ❌
- `fix_bvh_format.py` ❌
- `create_standard_bvh.py` ❌
- `debug_glb_bones.py` ❌
- `fix_animation_binding.py` ❌
- `create_matched_bvh.py` ❌
- `create_exact_match_bvh.py` ❌
- `create_swim_animation.py` ❌
- `analyze_glb_structure.py` ❌
  - **삭제 이유**: 3D 애니메이션 관련 기능이 제거됨
  - **대체**: 실제 수영 강습 관리에 필요한 기능으로 집중

#### 5. **시작 스크립트**
- `시작.bat` ❌
  - **삭제 이유**: 통합된 `check.bat`으로 대체
  - **대체**: 더 포괄적인 검증 시스템

#### 6. **서버 유틸리티**
- `server/src/utils/Video3DAnalysisAIEngine.ts` ❌
- `server/utils/spawnProc.ts` ❌
- `server/routes/runPipeline.ts` ❌
  - **삭제 이유**: 3D 비디오 분석 기능이 실제 서비스에 필요하지 않음
  - **대체**: 실제 수영 강습 관리에 필요한 API로 교체

### 수정된 파일들

#### 1. **모델 파일들**
- `server/src/models/Course.ts` ✏️
  - **수정 이유**: `centerId` 필드 추가로 데이터 연관성 강화
  - **변경사항**: 센터별 강의 관리 가능

- `server/src/models/Booking.ts` ✏️
  - **수정 이유**: `centerId` 필드 추가로 예약 데이터 정확성 향상
  - **변경사항**: 센터별 예약 관리 가능

- `server/src/models/Payment.ts` ✏️
  - **수정 이유**: `centerId` 필드 추가로 결제 데이터 정확성 향상
  - **변경사항**: 센터별 결제 관리 가능

#### 2. **라우트 파일들**
- `server/src/routes/centers.ts` ✏️
  - **수정 이유**: 잘못된 모델 참조 수정 및 통계 로직 개선
  - **변경사항**: 정확한 센터 데이터 제공

- `server/src/routes/dashboard.ts` ✏️
  - **수정 이유**: 필드명 수정 및 통계 로직 개선
  - **변경사항**: 정확한 대시보드 데이터 제공

#### 3. **인증 시스템**
- `server/src/routes/auth.ts` ✏️
  - **수정 이유**: `centerId` 정보를 토큰에 포함하여 클라이언트에서 활용
  - **변경사항**: 센터별 인증 정보 제공

- `client/hooks/useAuth.tsx` ✏️
  - **수정 이유**: `centerId` 정보 활용 및 올바른 리다이렉트 로직
  - **변경사항**: 센터 관리자 올바른 대시보드로 이동

#### 4. **UI 컴포넌트들**
- `client/app/center-admin/dashboard/page.tsx` ✏️
  - **수정 이유**: 누락된 버튼 추가 및 개발 메모 제거
  - **변경사항**: 완전한 UI 제공

- `client/app/center-admin/introduction/page.tsx` ✏️
  - **수정 이유**: 로딩 상태 처리 개선
  - **변경사항**: 안정적인 데이터 로딩

## 🎯 프로젝트 시작 시 권장 설정

### 1. 초기 프로젝트 구조
```
jj-swim-lab/
├── .github/workflows/          # CI/CD 설정
├── .husky/                     # Git 훅 설정
├── client/                     # Next.js 프론트엔드
│   ├── e2e/                    # E2E 테스트
│   ├── scripts/                # 자동화 스크립트
│   └── ...
├── server/                     # Express.js 백엔드
├── scripts/                    # 공통 스크립트
├── check.bat                   # 통합 검증 스크립트
└── ...
```

### 2. 필수 의존성
```json
{
  "devDependencies": {
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "@commitlint/cli": "^17.0.0",
    "sonarjs": "^0.0.0",
    "eslint-plugin-sonarjs": "^0.0.0"
  }
}
```

### 3. 자동화 스크립트
```bash
# package.json scripts
{
  "scripts": {
    "check": "./check.bat",
    "prepare": "husky install",
    "test:all": "npm run test && npm run test:e2e",
    "lint:staged": "lint-staged"
  }
}
```

## 🚀 다음 단계 권장사항

1. **Git 훅 설정**: 커밋 전 자동 검증
2. **CI/CD 파이프라인**: GitHub Actions 설정
3. **코드 품질 도구**: SonarQube 연동
4. **의존성 관리**: 정기적인 보안 검사
5. **성능 모니터링**: Bundle 분석 및 최적화

이렇게 프로젝트 시작부터 설정하면 훨씬 안정적이고 유지보수하기 좋은 프로젝트가 됩니다! 🎉
