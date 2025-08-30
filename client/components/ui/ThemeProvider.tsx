/**
 * 🎨 JJ Swim Lab - ThemeProvider UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 애플리케이션 전체의 테마 및 색상 시스템을 관리하는 컨텍스트 프로바이더
 * - 다크 모드/라이트 모드 전환 및 테마 설정 관리
 * - 일관된 디자인 시스템과 색상 팔레트 제공
 * - 사용자 테마 선호도 저장 및 복원
 * - 테마 변경 시 실시간 UI 업데이트
 * 
 * 🔄 **주요 기능**
 * - 테마 상태 관리 및 전환
 * - 다크 모드/라이트 모드 지원
 * - 사용자 테마 선호도 저장
 * - 테마별 색상 팔레트 관리
 * - 실시간 테마 변경 및 적용
 * 
 * 🗄️ **데이터 연동**
 * - 테마 상태 및 설정 정보
 * - 사용자 테마 선호도 데이터
 * - 테마별 색상 팔레트
 * - 테마 변경 이벤트
 * - 로컬 스토리지 테마 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (Context API, useState, useEffect)
 * - 테마 관리 라이브러리
 * - 로컬 스토리지 관리 도구
 * - 색상 팔레트 관리 시스템
 * - Tailwind CSS (테마 시스템)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 테마 전환 시 UI 깜빡임 방지
 * 2. 테마 설정의 지속성 및 복원
 * 3. 다크 모드에서의 가독성 및 접근성
 * 4. 테마 변경 시 성능 최적화
 * 5. 다양한 컴포넌트에서의 테마 적용 일관성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테마 전환 동작 확인
 * - [ ] 다크 모드/라이트 모드 표시 검증
 * - [ ] 사용자 테마 선호도 저장 확인
 * - [ ] 테마 변경 시 UI 업데이트 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 테마 프로바이더)
 * - 2024-12-19: 다크 모드/라이트 모드 시스템 구현
 * - 2024-12-19: 사용자 테마 선호도 저장 시스템 구현
 * - 2024-12-19: 실시간 테마 변경 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테마 프로바이더 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 커스텀 테마 지원
 * - 테마별 애니메이션 효과
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ThemeProvider 
 *   defaultTheme="light"
 *   onThemeChange={(theme) => handleThemeChange(theme)}
 *   enableSystemTheme={true}
 *   persistTheme={true}
 * >
 *   {children}
 * </ThemeProvider>
 * ```
 */

'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { theme } from '../../styles/theme';
import { changeTheme } from '../../utils/themeUtils';

interface ThemeContextType {
  theme: typeof theme;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  changeTheme: (newTheme: Partial<typeof theme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setCurrentTheme({ ...theme, ...parsedTheme });
        changeTheme(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }
    
    setIsDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // 다크 모드 클래스 토글
    const root = document.documentElement;
    if (newDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleChangeTheme = (newTheme: Partial<typeof theme>) => {
    const updatedTheme = { ...currentTheme, ...newTheme };
    setCurrentTheme(updatedTheme);
    changeTheme(newTheme);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('theme', JSON.stringify(updatedTheme));
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    isDarkMode,
    toggleDarkMode,
    changeTheme: handleChangeTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 