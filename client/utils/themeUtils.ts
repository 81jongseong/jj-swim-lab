import { theme } from '../styles/theme';

// 테마 색상 유틸리티 함수들
export const getThemeColor = (color: keyof typeof theme.colors, shade: keyof typeof theme.colors.primary = '600') => {
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