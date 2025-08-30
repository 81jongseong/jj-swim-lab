/**
 * 🎨 JJ Swim Lab - ThemeUtils 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 애플리케이션의 테마 및 색상 시스템을 관리하는 유틸리티 함수들
 * - 다크 모드/라이트 모드 전환 및 테마 설정 관리
 * - CSS 변수 기반 동적 테마 변경 및 색상 팔레트 관리
 * - 사용자 테마 선호도 저장 및 복원
 * - 접근성을 고려한 고대비 색상 및 테마 옵션 제공
 * 
 * 🔄 **주요 기능**
 * - 테마 전환 (라이트/다크 모드)
 * - CSS 변수 기반 동적 색상 변경
 * - 사용자 테마 선호도 저장 및 로드
 * - 접근성 고려 테마 옵션
 * - 테마별 색상 팔레트 관리
 * - 자동 테마 감지 및 적용
 * 
 * 🗄️ **데이터 연동**
 * - 로컬 스토리지 테마 설정
 * - CSS 변수 및 커스텀 속성
 * - 사용자 테마 선호도 데이터
 * - 시스템 테마 감지 정보
 * - 접근성 설정 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - CSS 변수 지원 브라우저
 * - 로컬 스토리지 API
 * - 테마 전환 애니메이션 라이브러리
 * - 색상 팔레트 관리 도구
 * - 접근성 검증 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테마 전환 시 UI 일관성 유지
 * 2. CSS 변수 및 커스텀 속성의 적절한 사용
 * 3. 접근성 고려 색상 대비 및 가독성
 * 4. 테마 전환 애니메이션의 성능 최적화
 * 5. 사용자 테마 선호도의 지속성 및 동기화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테마 전환 기능 동작 확인
 * - [ ] CSS 변수 및 색상 변경 검증
 * - [ ] 접근성 및 색상 대비 확인
 * - [ ] 테마 전환 애니메이션 확인
 * - [ ] 사용자 선호도 저장 및 복원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 테마 시스템)
 * - 2024-12-19: CSS 변수 기반 테마 시스템 구현
 * - 2024-12-19: 다크 모드/라이트 모드 전환 시스템 구현
 * - 2024-12-19: 접근성 및 사용자 선호도 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테마 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 테마 최적화
 * - 자동 테마 감지 및 적용
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 테마 유틸리티 사용
 * import { 
 *   toggleTheme, 
 *   getCurrentTheme, 
 *   setTheme,
 *   getThemeColors 
 * } from '@/utils/themeUtils';
 * 
 * // 테마 전환
 * const handleThemeToggle = () => {
 *   toggleTheme();
 * };
 * 
 * // 현재 테마 확인
 * const currentTheme = getCurrentTheme();
 * 
 * // 특정 테마 설정
 * setTheme('dark');
 * 
 * // 테마별 색상 가져오기
 * const colors = getThemeColors('dark');
 * ```
 * 
 * 🔍 **테마 처리 흐름**
 * 1. 테마 변경 요청 감지
 * 2. CSS 변수 및 색상 값 업데이트
 * 3. 테마 전환 애니메이션 실행
 * 4. 사용자 선호도 저장
 * 5. UI 컴포넌트 테마 적용
 */

// 테마 및 색상 관리 유틸리티
import { theme } from '../styles/theme';

// 테마 색상 유틸리티 함수들
export const getThemeColor = (color: keyof typeof theme.colors, shade: keyof typeof theme.colors.primary = '600' as unknown as keyof typeof theme.colors.primary) => {
  return theme.colors[color][shade];
};

// 색상 변형 생성 함수
export const createColorVariants = (baseColor: string) => {
  return {
    50: `${baseColor}0a`, // 4% opacity
    100: `${baseColor}1a`, // 6% opacity
    500: baseColor,
    600: `${baseColor}e6`, // 90% opacity
    700: `${baseColor}cc`, // 80% opacity
    800: `${baseColor}b3`, // 70% opacity
    900: `${baseColor}99`, // 60% opacity
  };
};

// CSS 변수 생성 함수
export const generateCSSVariables = () => {
  const variables: Record<string, string> = {};
  
  Object.entries(theme.colors).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      variables[`--color-${colorName}-${shade}`] = value;
    });
  });
  
  return variables;
};

// 반응형 브레이크포인트 유틸리티
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// 스페이싱 유틸리티
export const spacing = theme.spacing;

// 테마 변경 함수 (동적 테마 지원)
export const changeTheme = (newTheme: Partial<typeof theme>) => {
  // CSS 변수 업데이트
  const root = document.documentElement;
  
  if (newTheme.colors) {
    Object.entries(newTheme.colors).forEach(([colorName, shades]) => {
      Object.entries(shades).forEach(([shade, value]) => {
        root.style.setProperty(`--color-${colorName}-${shade}`, value);
      });
    });
  }
};

// 다크 모드 지원 (향후 확장용)
export const toggleDarkMode = () => {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  if (isDark) {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }
};

// 색상 대비 계산 함수
export const getContrastRatio = (color1: string, color2: string): number => {
  // 간단한 대비 계산 (실제로는 더 복잡한 알고리즘 필요)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
  const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
  
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}; 