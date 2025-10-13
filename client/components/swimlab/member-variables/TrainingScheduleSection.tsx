/**
 * 📅 훈련 일정 섹션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 운동 요일 선택
 * - 세션 시간 설정
 * - 풀 길이 선택
 * 
 * 🔗 **연동 파일:**
 * - BulkMemberVariablesModal.tsx (부모 컴포넌트)
 */

'use client';

import React from 'react';

interface TrainingScheduleSectionProps {
  trainingDays: number[];
  sessionDuration: number;
  poolLength: number;
  availablePoolLengths?: number[];
  onUpdate: (data: {
    trainingDays?: number[];
    sessionDuration?: number;
    poolLength?: number;
  }) => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function TrainingScheduleSection({
  trainingDays,
  sessionDuration,
  poolLength,
  availablePoolLengths = [25, 50],
  onUpdate
}: TrainingScheduleSectionProps) {
  const toggleDay = (dayIdx: number) => {
    const isSelected = trainingDays.includes(dayIdx);
    onUpdate({
      trainingDays: isSelected
        ? trainingDays.filter(d => d !== dayIdx)
        : [...trainingDays, dayIdx].sort((a, b) => a - b)
    });
  };

  return (
    <>
      {/* 운동 요일 */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">📅 운동 요일</h4>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ trainingDays: [1, 2, 3, 4, 5] })}
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
              title="월화수목금"
            >
              평일
            </button>
            <button
              onClick={() => onUpdate({ trainingDays: [1, 3, 5] })}
              className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200 transition"
              title="월요일, 수요일, 금요일"
            >
              월수금
            </button>
            <button
              onClick={() => onUpdate({ trainingDays: [2, 4] })}
              className="text-xs px-2 py-1 bg-green-100 rounded hover:bg-green-200 transition"
              title="화요일, 목요일"
            >
              화목
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, idx) => (
            <button
              key={idx}
              onClick={() => toggleDay(idx)}
              className={`px-3 py-2 border-2 rounded-lg font-semibold transition-all ${
                trainingDays.includes(idx)
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          선택된 요일: {trainingDays.length}일/주
        </p>
      </div>

      {/* 세션 시간 */}
      <div className="border rounded-lg p-4 bg-purple-50">
        <h4 className="font-semibold text-gray-900 mb-3">⏱️ 1회 운동 시간 (세션 시간)</h4>
        <div className="flex gap-2">
          {[30, 50, 60].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onUpdate({ sessionDuration: n })}
              className={`px-4 py-2 border rounded-lg transition font-semibold ${
                sessionDuration === n
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white border-gray-300 hover:border-purple-300'
              }`}
            >
              {n}분
            </button>
          ))}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border border-purple-300 rounded-lg bg-white">
            <input
              type="number"
              min="20"
              max="180"
              step="5"
              value={sessionDuration}
              onChange={(e) => onUpdate({ sessionDuration: parseInt(e.target.value) || 60 })}
              placeholder="45"
              className="flex-1 outline-none"
            />
            <span className="text-sm text-gray-600">분</span>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800 font-semibold mb-1">
            💡 <strong>1회 운동 시간</strong>을 입력하세요
          </p>
          <p className="text-xs text-gray-600">
            • 버튼 클릭: 일반적인 시간 (30, 50, 60분)<br/>
            • 직접 입력: 원하는 시간 자유롭게 설정 (20~180분)<br/>
            • 예시: 45분, 75분, 90분 등<br/>
            • 운동 요일은 위에서 별도로 선택합니다
          </p>
        </div>
      </div>

      {/* 풀 길이 선택 */}
      <div className="border rounded-lg p-4 bg-cyan-50">
        <h4 className="font-semibold text-gray-900 mb-3">🏊‍♂️ 운동할 수영장 길이</h4>
        <div className="flex gap-2">
          {availablePoolLengths.map(length => (
            <button
              key={length}
              onClick={() => onUpdate({ poolLength: length })}
              className={`px-4 py-3 border-2 rounded-lg transition-all font-semibold ${
                poolLength === length
                  ? 'border-cyan-500 bg-cyan-500 text-white'
                  : 'border-gray-200 hover:border-cyan-300 bg-white'
              }`}
            >
              {length}m
            </button>
          ))}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 border-2 border-cyan-300 rounded-lg bg-white">
            <input
              type="number"
              min="10"
              max="100"
              step="5"
              value={poolLength}
              onChange={(e) => onUpdate({ poolLength: parseInt(e.target.value) || 25 })}
              placeholder="33"
              className="flex-1 outline-none"
            />
            <span className="text-sm text-gray-600">m</span>
          </div>
        </div>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-gray-600">
            💡 <strong>운동할 수영장</strong>의 길이를 선택하세요<br/>
            • 25m: 일반 단수영장 (턴 많음)<br/>
            • 50m: 장수영장 (턴 적음)<br/>
            • 직접 입력: 15m, 20m, 33m 등 비표준 길이 가능
          </p>
        </div>
      </div>
    </>
  );
}

