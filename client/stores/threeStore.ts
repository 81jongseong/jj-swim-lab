/**
 * 🎯 3D 뷰어 전역 상태 관리 (Zustand)
 * 
 * 📋 **의존성**:
 * - zustand
 * - ../types/drill3d.ts
 * 
 * 🔄 **사용처**:
 * - /3d-viewer (체험 페이지)
 * - DrillCard 컴포넌트 (선택 상태)
 * - ThreeDPlayer 컴포넌트 (재생 제어)
 * 
 * 🎮 **관리 상태**:
 * - selectedId: 현재 선택된 드릴 ID
 * - speed: 재생 속도 (0.5 ~ 1.5)
 * - camera: 카메라 프리셋 (side/front/top/diagonal)
 * - showSkeleton: 스켈레톤 표시 여부
 * - showCues: 코칭 큐 오버레이 표시 여부
 * - isPlaying: 재생/일시정지 상태
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 스토어 생성
 */

import { create } from 'zustand';
import type { CameraPreset } from '../types/drill3d';

interface ThreeStoreState {
  // 선택 상태
  selectedId?: string;
  setSelected: (id?: string) => void;
  
  // 재생 제어
  speed: number;
  setSpeed: (v: number) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  
  // 카메라
  camera: CameraPreset;
  setCamera: (c: CameraPreset) => void;
  
  // 표시 옵션
  showSkeleton: boolean;
  setShowSkeleton: (b: boolean) => void;
  showCues: boolean;
  setShowCues: (b: boolean) => void;
  
  // 리셋
  reset: () => void;
}

const initialState = {
  selectedId: undefined,
  speed: 1,
  isPlaying: true,
  camera: 'side' as CameraPreset,
  showSkeleton: false,
  showCues: true
};

export const useThreeStore = create<ThreeStoreState>((set) => ({
  ...initialState,
  
  setSelected: (id) => set({ selectedId: id }),
  setSpeed: (v) => set({ speed: Math.max(0.5, Math.min(1.5, v)) }), // 0.5 ~ 1.5 범위 제한
  setIsPlaying: (v) => set({ isPlaying: v }),
  setCamera: (c) => set({ camera: c }),
  setShowSkeleton: (b) => set({ showSkeleton: b }),
  setShowCues: (b) => set({ showCues: b }),
  
  reset: () => set(initialState)
}));

