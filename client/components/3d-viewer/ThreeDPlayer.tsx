/**
 * 🎮 3D 드릴 플레이어 (스켈레톤)
 * 
 * 📋 **의존성**:
 * - ../../types/drill3d.ts
 * - ../../stores/threeStore.ts
 * - ../../data/drills3d.ts
 * - @react-three/fiber, @react-three/drei (나중에 추가)
 * 
 * 🔄 **사용처**:
 * - /3d-viewer 페이지 (우측 스티키 뷰어)
 * 
 * 🎨 **기능**:
 * - 선택된 드릴의 3D 모델 표시 (TODO)
 * - 재생 제어 (속도, 일시정지)
 * - 카메라 프리셋 전환
 * - 스켈레톤/큐 오버레이 토글
 * - 코칭 큐 및 주의사항 표시
 * 
 * ⚠️ **주의사항**:
 * - 현재는 플레이스홀더 UI만 구현
 * - 실제 3D 렌더링은 나중에 Three.js 추가
 * - dynamic import + ssr:false 필요
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 스켈레톤 생성
 * - TODO: Three.js 통합
 */

'use client';

import React, { useMemo } from 'react';
import { useThreeStore } from '../../stores/threeStore';
import { DRILLS_3D } from '../../data/drills3d';

export default function ThreeDPlayer() {
  const {
    selectedId,
    speed,
    setSpeed,
    camera,
    setCamera,
    showSkeleton,
    setShowSkeleton,
    showCues,
    setShowCues,
    isPlaying,
    setIsPlaying
  } = useThreeStore();

  const item = useMemo(
    () => DRILLS_3D.find((d) => d.id === selectedId) ?? DRILLS_3D[0],
    [selectedId]
  );

  const getStrokeText = (stroke: string) => {
    switch (stroke) {
      case 'FR': return '🏊‍♂️ 자유형';
      case 'BK': return '🏊‍♀️ 배영';
      case 'BR': return '🏊 평영';
      case 'FL': return '🦋 접영';
      case 'IM': return '🎯 IM';
      default: return stroke;
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden w-full bg-white shadow-lg">
      {/* 헤더 - 컨트롤 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-900">{item.title}</div>
          <span className="text-xs text-gray-500">{getStrokeText(item.stroke)}</span>
        </div>
      </div>

      {/* 재생 컨트롤 바 */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white/60 backdrop-blur">
        {/* 재생/일시정지 */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* 속도 조절 */}
        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-600">속도</label>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-gray-900 font-medium w-8">{speed.toFixed(1)}x</span>
        </div>

        {/* 카메라 프리셋 */}
        <select
          value={camera}
          onChange={(e) => setCamera(e.target.value as any)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="side">📐 측면</option>
          <option value="front">👁️ 정면</option>
          <option value="top">🔝 상단</option>
          <option value="diagonal">📊 대각</option>
        </select>

        {/* 표시 옵션 */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showSkeleton}
              onChange={(e) => setShowSkeleton(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700">스켈레톤</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showCues}
              onChange={(e) => setShowCues(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700">큐</span>
          </label>
        </div>
      </div>

      {/* 3D 뷰어 영역 (플레이스홀더) */}
      <div className="w-full aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* TODO: Three.js Canvas 추가 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-6xl mb-4 animate-pulse">
            {getStrokeText(item.stroke).split(' ')[0]}
          </div>
          <div className="text-sm font-medium mb-2">{item.title}</div>
          <div className="text-xs opacity-70 max-w-md text-center px-4">
            {item.description}
          </div>
          <div className="mt-6 text-xs opacity-50">
            🎯 3D 모델 준비 중 · Three.js 통합 예정
          </div>
        </div>

        {/* 카메라 위치 표시 (개발용) */}
        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          📷 {camera.toUpperCase()}
        </div>

        {/* 재생 상태 표시 */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="p-4 text-xs space-y-3 bg-gray-50">
        {/* 설명 */}
        <div className="text-gray-700">
          <span className="font-medium text-gray-900">📝 설명:</span> {item.description}
        </div>

        {/* 코칭 큐 */}
        {showCues && item.cues.length > 0 && (
          <div>
            <div className="font-medium text-gray-900 mb-1">💡 코칭 큐:</div>
            <div className="flex flex-wrap gap-1">
              {item.cues.map((cue, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
                >
                  {cue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 주의사항 */}
        {item.cautions && item.cautions.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2">
            <div className="font-medium text-orange-900 mb-1">⚠️ 주의사항:</div>
            <ul className="list-disc list-inside text-orange-700 space-y-0.5">
              {item.cautions.map((caution, idx) => (
                <li key={idx}>{caution}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 태그 */}
        <div>
          <div className="font-medium text-gray-900 mb-1">🏷️ 태그:</div>
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

