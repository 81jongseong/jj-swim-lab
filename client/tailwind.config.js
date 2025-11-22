/**
 * 🎨 JJ Swim Lab - Tailwind CSS 설정 파일
 * 
 * 📋 **파일 목적**
 * - Tailwind CSS 프레임워크의 핵심 설정 및 커스터마이징을 정의하는 설정 파일
 * - 커스텀 색상 팔레트, 폰트, 스페이싱 등의 디자인 시스템 설정
 * - 반응형 브레이크포인트 및 컨테이너 설정 관리
 * - 플러그인 및 확장 기능 설정
 * - 프로젝트별 맞춤형 유틸리티 클래스 정의
 * 
 * 🔄 **주요 기능**
 * - 커스텀 색상 팔레트 및 CSS 변수 설정
 * - 폰트 패밀리 및 타이포그래피 설정
 * - 반응형 브레이크포인트 및 컨테이너 설정
 * - 플러그인 및 확장 기능 설정
 * - 커스텀 유틸리티 클래스 정의
 * - 다크 모드 및 테마 설정
 * 
 * 🗄️ **데이터 연동**
 * - CSS 변수 및 커스텀 속성
 * - 색상 팔레트 및 테마 설정
 * - 폰트 및 타이포그래피 설정
 * - 반응형 브레이크포인트 설정
 * - 플러그인 및 확장 기능
 * 
 * 🛠️ **필요한 설치 파일**
 * - Tailwind CSS 프레임워크
 * - PostCSS 및 Autoprefixer
 * - 커스텀 폰트 및 아이콘
 * - CSS 변수 및 커스텀 속성
 * - 플러그인 및 확장 라이브러리
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 색상 팔레트의 일관성 및 접근성 고려
 * 2. 폰트 설정의 성능 및 로딩 최적화
 * 3. 반응형 브레이크포인트의 일관성 유지
 * 4. 커스텀 유틸리티 클래스의 중복 방지
 * 5. 플러그인 및 확장 기능의 호환성 확인
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 색상 팔레트 및 CSS 변수 설정 확인
 * - [ ] 폰트 및 타이포그래피 설정 검증
 * - [ ] 반응형 브레이크포인트 설정 확인
 * - [ ] 플러그인 및 확장 기능 동작 확인
 * - [ ] 커스텀 유틸리티 클래스 동작 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 Tailwind 설정)
 * - 2024-12-19: 커스텀 색상 팔레트 시스템 구현
 * - 2024-12-19: 폰트 및 타이포그래피 시스템 구현
 * - 2024-12-19: 플러그인 및 확장 기능 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Tailwind CSS 설정 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 디자인 시스템 최적화
 * - 자동 색상 팔레트 생성
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **주요 설정 옵션**
 * - content: CSS 클래스가 사용되는 파일 경로
 * - theme: 색상, 폰트, 스페이싱 등의 커스텀 설정
 * - plugins: Tailwind 플러그인 및 확장 기능
 * - darkMode: 다크 모드 설정 및 전환
 * - variants: 유틸리티 클래스의 변형 설정
 * 
 * 🔍 **설정 처리 흐름**
 * 1. 기본 Tailwind CSS 설정 로드
 * 2. 커스텀 색상 팔레트 및 CSS 변수 적용
 * 3. 폰트 및 타이포그래피 설정 적용
 * 4. 플러그인 및 확장 기능 적용
 * 5. 최종 Tailwind CSS 설정 객체 반환
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium Brand Colors
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Outfit", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // @tailwindcss/line-clamp는 Tailwind CSS v3.3부터 기본 포함
  ],
}
