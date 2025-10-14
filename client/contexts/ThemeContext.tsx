/**
 * 🎨 테마 컨텍스트
 * 
 * 📋 **목적**:
 * - 전역 테마 관리
 * - 다크/라이트 모드
 * - 컬러 테마 변경
 * 
 * 🔗 **연동 파일**:
 * - client/app/layout.tsx
 * - 모든 컴포넌트
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ColorTheme = 'blue' | 'purple' | 'green' | 'orange' | 'pink';
export type DisplayMode = 'light' | 'dark';

interface ThemeContextType {
  colorTheme: ColorTheme;
  displayMode: DisplayMode;
  setColorTheme: (theme: ColorTheme) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  getGradient: (variant: 'primary' | 'secondary' | 'accent') => string;
  getColor: (shade: 'light' | 'main' | 'dark') => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 🎨 테마별 그라디언트 정의
const GRADIENTS = {
  blue: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-blue-600 to-cyan-600',
    accent: 'from-blue-400 to-cyan-400',
    ring: 'ring-blue-300',
    border: 'border-blue-400'
  },
  purple: {
    primary: 'from-purple-500 to-pink-500',
    secondary: 'from-purple-600 to-pink-600',
    accent: 'from-purple-400 to-pink-400',
    ring: 'ring-purple-300',
    border: 'border-purple-400'
  },
  green: {
    primary: 'from-green-500 to-emerald-500',
    secondary: 'from-green-600 to-emerald-600',
    accent: 'from-green-400 to-emerald-400',
    ring: 'ring-green-300',
    border: 'border-green-400'
  },
  orange: {
    primary: 'from-orange-500 to-yellow-500',
    secondary: 'from-orange-600 to-yellow-600',
    accent: 'from-orange-400 to-yellow-400',
    ring: 'ring-orange-300',
    border: 'border-orange-400'
  },
  pink: {
    primary: 'from-pink-500 to-rose-500',
    secondary: 'from-pink-600 to-rose-600',
    accent: 'from-pink-400 to-rose-400',
    ring: 'ring-pink-300',
    border: 'border-pink-400'
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>('blue');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('light');

  // 로컬스토리지에서 테마 로드
  useEffect(() => {
    const savedTheme = localStorage.getItem('colorTheme') as ColorTheme;
    const savedMode = localStorage.getItem('displayMode') as DisplayMode;
    
    if (savedTheme) setColorTheme(savedTheme);
    if (savedMode) setDisplayMode(savedMode);
  }, []);

  // 테마 변경 시 저장
  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
    localStorage.setItem('displayMode', displayMode);
    
    // body에 클래스 추가 (다크모드용)
    if (displayMode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [colorTheme, displayMode]);

  const getGradient = (variant: 'primary' | 'secondary' | 'accent') => {
    return GRADIENTS[colorTheme][variant];
  };

  const getColor = (shade: 'light' | 'main' | 'dark') => {
    const themeColors = {
      blue: { light: 'bg-blue-100', main: 'bg-blue-500', dark: 'bg-blue-900' },
      purple: { light: 'bg-purple-100', main: 'bg-purple-500', dark: 'bg-purple-900' },
      green: { light: 'bg-green-100', main: 'bg-green-500', dark: 'bg-green-900' },
      orange: { light: 'bg-orange-100', main: 'bg-orange-500', dark: 'bg-orange-900' },
      pink: { light: 'bg-pink-100', main: 'bg-pink-500', dark: 'bg-pink-900' }
    };
    return themeColors[colorTheme][shade];
  };

  const getRing = () => GRADIENTS[colorTheme].ring;
  const getBorder = () => GRADIENTS[colorTheme].border;

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        displayMode,
        setColorTheme,
        setDisplayMode,
        getGradient,
        getColor
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

