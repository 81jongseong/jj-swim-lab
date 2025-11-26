/**
 * 🌤️ SwimLab - 당일 컨디션 입력 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 운동 시작 전 당일 컨디션 입력
 * - 컨디션, 통증, 수면, 스트레스 등 입력
 * - 강사 또는 회원 본인이 입력 가능
 * 
 * 🔄 **연동되는 데이터**
 * - SwimProgram (프로그램 정보)
 * - User (입력자 정보)
 * 
 * 💡 **사용 방법**
 * - 프로그램 시작 전 버튼 클릭
 * - 컨디션 정보 입력
 * - 저장 시 프로그램 자동 조절 (선택사항)
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const AllConditionsDrawer = dynamic(
  () => import('@/components/swimlab/AllConditionsDrawer'),
  { ssr: false }
);

interface DayConditionInputModalProps {
  sessionDate: string;
  onSubmit: (data: DayConditionData) => void;
  onClose: () => void;
}

export interface DayConditionData {
  condition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired';
  hasPain: boolean;
  painLocation?: string;
  sleepQuality?: number; // 1-10
  stressLevel?: number; // 1-10
  todayConditionIds?: string[]; // 오늘 해당되는 질환/특수상황
}

export default function DayConditionInputModal({
  sessionDate,
  onSubmit,
  onClose
}: DayConditionInputModalProps) {
  const [condition, setCondition] = useState<'very_good' | 'good' | 'normal' | 'tired' | 'very_tired'>('normal');
  const [hasPain, setHasPain] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [sleepQuality, setSleepQuality] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [showConditionsDrawer, setShowConditionsDrawer] = useState(false);
  const [todayConditionIds, setTodayConditionIds] = useState<string[]>([]);

  const handleSubmit = () => {
    const data: DayConditionData = {
      condition,
      hasPain,
      painLocation: hasPain ? painLocation : undefined,
      sleepQuality,
      stressLevel,
      todayConditionIds
    };

    logger.info('🌤️ 당일 컨디션 제출:', data);
    onSubmit(data);
    onClose();
  };

  const conditionOptions = [
    { value: 'very_good', label: '매우 좋음', emoji: '😄', color: 'bg-green-500' },
    { value: 'good', label: '좋음', emoji: '🙂', color: 'bg-blue-500' },
    { value: 'normal', label: '보통', emoji: '😐', color: 'bg-gray-500' },
    { value: 'tired', label: '피곤함', emoji: '😓', color: 'bg-orange-500' },
    { value: 'very_tired', label: '매우 피곤함', emoji: '😫', color: 'bg-red-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">🌤️ 당일 컨디션 입력</h3>
            <p className="text-sm text-gray-600 mt-1">{sessionDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 컨디션 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            오늘의 컨디션 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {conditionOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCondition(opt.value as any)}
                className={`px-3 py-4 border-2 rounded-lg text-center transition-all ${
                  condition === opt.value
                    ? `${opt.color} text-white border-transparent shadow-lg`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{opt.emoji}</div>
                <div className="text-xs font-medium">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 통증 여부 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            통증 여부
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setHasPain(false)}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                !hasPain
                  ? 'border-green-500 bg-green-100 text-green-700 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ✅ 통증 없음
            </button>
            <button
              onClick={() => setHasPain(true)}
              className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                hasPain
                  ? 'border-red-500 bg-red-100 text-red-700 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              ⚠️ 통증 있음
            </button>
          </div>

          {hasPain && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">통증 부위</label>
              <input
                type="text"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                placeholder="예: 어깨, 무릎, 허리 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}
        </div>

        {/* 수면 질 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            수면 질 (1-10점)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-purple-600 w-12 text-center">
              {sleepQuality}점
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>매우 나쁨</span>
            <span>보통</span>
            <span>매우 좋음</span>
          </div>
        </div>

        {/* 스트레스 수준 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            스트레스 수준 (1-10점)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-orange-600 w-12 text-center">
              {stressLevel}점
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>매우 낮음</span>
            <span>보통</span>
            <span>매우 높음</span>
          </div>
        </div>

        {/* 오늘의 질환/특수상황 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            오늘 해당되는 질환/특수상황 (선택사항)
          </label>
          <button
            type="button"
            onClick={() => setShowConditionsDrawer(true)}
            className="w-full px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-2 border-red-300 rounded-lg font-medium text-red-700"
          >
            📋 질환/특수상황 선택 ({todayConditionIds.length}개)
          </button>
          {todayConditionIds.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
              <p className="text-xs text-red-700">
                선택됨: {todayConditionIds.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>당일 컨디션에 따라 프로그램이 자동 조절됩니다:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li><strong>매우 피곤함:</strong> 강도 15% 감소, 지구력 위주로 변경</li>
            <li><strong>피곤함:</strong> 강도 10% 감소</li>
            <li><strong>통증 있음:</strong> 안전한 영법만 사용, 강도 20% 감소</li>
            <li><strong>수면 질 낮음:</strong> 회복 위주 훈련</li>
            <li><strong>스트레스 높음:</strong> 편안한 페이스로 조절</li>
            <li><strong>질환 선택 시:</strong> 해당 질환에 맞는 영법/강도 자동 조절</li>
            <li><strong>매우 좋음:</strong> 강도 5% 증가 (선택사항)</li>
          </ul>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
          >
            ✅ 컨디션 저장 및 프로그램 조절
          </button>
        </div>
      </div>

      {/* 질환/특수상황 선택 Drawer */}
      {showConditionsDrawer && (
        <AllConditionsDrawer
          value={todayConditionIds}
          onChange={setTodayConditionIds}
          onClose={() => setShowConditionsDrawer(false)}
        />
      )}
    </div>
  );
}

