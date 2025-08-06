'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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