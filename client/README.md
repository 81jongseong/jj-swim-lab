# JJ Swim Lab - Client

JJ Swim Lab의 프론트엔드 애플리케이션입니다.

## 🎨 테마 시스템

이 프로젝트는 중앙화된 테마 시스템을 사용합니다.

### 테마 구조

```
client/
├── styles/
│   └── theme.ts          # 중앙화된 테마 설정
├── components/
│   └── ui/               # 재사용 가능한 UI 컴포넌트
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── LoadingSpinner.tsx
│       ├── Badge.tsx
│       ├── ThemeProvider.tsx
│       └── index.ts
└── utils/
    └── themeUtils.ts     # 테마 유틸리티 함수들
```

### 주요 기능

#### 1. 중앙화된 색상 관리
- 모든 색상이 `styles/theme.ts`에서 정의됨
- CSS 변수를 통한 동적 색상 변경 지원
- 일관된 색상 팔레트 사용

#### 2. 재사용 가능한 UI 컴포넌트
- **Button**: 다양한 variant와 size 지원
- **Card**: 일관된 카드 디자인
- **Input**: 폼 입력 필드
- **Modal**: 모달 다이얼로그
- **LoadingSpinner**: 로딩 인디케이터
- **Badge**: 상태 표시 배지

#### 3. 테마 Provider
- `ThemeProvider`를 통한 전역 테마 관리
- 다크 모드 지원 (향후 확장)
- 로컬 스토리지 기반 테마 설정 저장

### 사용법

#### 테마 색상 사용
```typescript
import { theme } from '../styles/theme';

// 직접 색상 사용
const primaryColor = theme.colors.primary[600];

// 유틸리티 함수 사용
import { getThemeColor } from '../utils/themeUtils';
const color = getThemeColor('primary', '600');
```

#### UI 컴포넌트 사용
```typescript
import { Button, Card, LoadingSpinner } from '../components/ui';

// Button 사용
<Button variant="primary" size="md">
  클릭하세요
</Button>

// Card 사용
<Card padding="md" shadow="lg">
  <h2>카드 제목</h2>
  <p>카드 내용</p>
</Card>

// LoadingSpinner 사용
<LoadingSpinner size="lg" color="primary" />
```

#### 테마 변경
```typescript
import { useTheme } from '../components/ui';

const { changeTheme, toggleDarkMode } = useTheme();

// 테마 변경
changeTheme({
  colors: {
    primary: {
      600: '#new-color'
    }
  }
});

// 다크 모드 토글
toggleDarkMode();
```

### CSS 클래스

#### 테마 색상 클래스
- `.text-primary` - 주요 텍스트 색상
- `.bg-primary` - 주요 배경 색상
- `.btn-primary` - 주요 버튼 스타일

#### 컴포넌트 클래스
- `.card` - 카드 스타일
- `.input` - 입력 필드 스타일
- `.input-error` - 에러 상태 입력 필드

### 최적화된 기능

1. **타입 안전성**: TypeScript를 통한 완전한 타입 지원
2. **성능 최적화**: CSS 변수를 통한 효율적인 스타일 적용
3. **접근성**: ARIA 속성과 키보드 네비게이션 지원
4. **반응형 디자인**: 모든 컴포넌트가 모바일 친화적
5. **일관성**: 모든 UI 요소가 통일된 디자인 시스템 사용

## 🚀 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint
```

## 📁 프로젝트 구조

```
client/
├── app/                    # Next.js App Router
├── components/             # React 컴포넌트
│   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   └── Navigation.tsx    # 네비게이션 컴포넌트
├── pages/                 # 페이지 컴포넌트
│   ├── admin/            # 관리자 페이지
│   └── auth/             # 인증 페이지
├── styles/               # 스타일 관련 파일
├── utils/                # 유틸리티 함수
└── public/               # 정적 파일
```

## 🛠 기술 스택

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Package Manager**: pnpm

## 📝 주요 변경사항

### v2.0.0 - 테마 시스템 도입
- 중앙화된 테마 시스템 구축
- 재사용 가능한 UI 컴포넌트 라이브러리 추가
- CSS 변수를 통한 동적 테마 지원
- 타입 안전성 강화
- 코드 최적화 및 리팩토링
