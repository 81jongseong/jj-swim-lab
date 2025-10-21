'use client';

import React, { useState } from 'react';
import { Calculator, Info } from 'lucide-react';

interface CSSConverterProps {
  onCSSChange?: (css: number) => void;
}

export default function CSSConverter({ onCSSChange }: CSSConverterProps) {
  const [distance, setDistance] = useState<'25' | '50' | '100' | '200' | '400'>('100');
  const [time, setTime] = useState('');
  const [css, setCSS] = useState<number | null>(null);

  // CSS 계산 공식: CSS = (거리 × 100) / 시간(초)
  const calculateCSS = () => {
    if (!time) return;
    
    const timeInSeconds = parseFloat(time);
    if (isNaN(timeInSeconds) || timeInSeconds <= 0) return;
    
    const distanceInMeters = parseInt(distance);
    const calculatedCSS = (distanceInMeters * 100) / timeInSeconds;
    
    setCSS(Math.round(calculatedCSS * 100) / 100);
    onCSSChange?.(calculatedCSS);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return minutes > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${remainingSeconds}초`;
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-blue-800">CSS(임계수영속도) 계산기</h4>
        <div title="CSS는 Critical Swim Speed의 약자로, 지속 가능한 최대 수영 속도를 의미합니다">
          <Info className="h-4 w-4 text-blue-500" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="bg-blue-50 p-2 rounded">
          <div className="font-medium text-blue-700 mb-1">💡 CSS란?</div>
          <div className="text-blue-600 text-sm">"지속 가능한 최대 수영 속도" - 30분 이상 지속할 수 있는 최고 속도</div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">거리 선택</label>
            <select 
              value={distance} 
              onChange={(e) => setDistance(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="25">25m</option>
              <option value="50">50m</option>
              <option value="100">100m</option>
              <option value="200">200m</option>
              <option value="400">400m</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시간 (초)</label>
            <input 
              type="number" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="예: 60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        
        <button 
          onClick={calculateCSS}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          CSS 계산하기
        </button>
        
        {css && (
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">계산된 CSS</div>
              <div className="text-2xl font-bold text-blue-600">{css} cm/s</div>
              <div className="text-xs text-gray-500 mt-1">
                {distance}m를 {formatTime(parseFloat(time))}에 수영할 때의 CSS
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-yellow-50 p-2 rounded text-xs">
          <div className="font-medium text-yellow-700 mb-1">📝 사용법:</div>
          <div className="text-yellow-600">
            • 100m 기록이 1분 30초라면: 거리 100m, 시간 90초 입력<br/>
            • 50m 기록이 45초라면: 거리 50m, 시간 45초 입력<br/>
            • CSS는 훈련 강도 설정의 기준이 됩니다
          </div>
        </div>
      </div>
    </div>
  );
}









