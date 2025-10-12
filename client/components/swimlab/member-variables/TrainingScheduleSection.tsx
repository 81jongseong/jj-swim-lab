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
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">⏱️ 세션 시간</h4>
        <div className="flex gap-2">
          {[30, 50, 60].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onUpdate({ sessionDuration: n })}
              className={`px-4 py-2 border rounded-lg transition ${
                sessionDuration === n
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white border-gray-300 hover:border-blue-300'
              }`}
            >
              {n}분
            </button>
          ))}
          <input
            type="number"
            min="20"
            max="180"
            value={sessionDuration}
            onChange={(e) => onUpdate({ sessionDuration: parseInt(e.target.value) || 60 })}
            placeholder="직접 입력"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 1회 운동 시간 (운동 요일은 위에서 선택)
        </p>
      </div>

      {/* 풀 길이 선택 */}
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">🏊‍♂️ 풀 길이</h4>
        <div className="flex gap-2">
          {availablePoolLengths.map(length => (
            <button
              key={length}
              onClick={() => onUpdate({ poolLength: length })}
              className={`px-4 py-3 border-2 rounded-lg transition-all ${
                poolLength === length
                  ? 'border-cyan-500 bg-cyan-100 text-cyan-700 font-semibold'
                  : 'border-gray-200 hover:border-cyan-300'
              }`}
            >
              {length}m
            </button>
          ))}
          <input
            type="number"
            min="20"
            max="100"
            step="5"
            value={poolLength}
            onChange={(e) => onUpdate({ poolLength: parseInt(e.target.value) || 25 })}
            placeholder="직접 입력"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 25m 단수영장, 50m 장수영장, 또는 직접 입력
        </p>
      </div>
    </>
  );
}

