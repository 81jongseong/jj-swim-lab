/**
 * 🏊 SwimLab - 완료율 입력 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 간편/상세 완료율 입력
 * - RPE(자각 운동 강도) 선택
 * - 메모 작성
 * 
 * 🔄 **주요 기능**
 * - 간편 모드: 슬라이더로 전체 완료율만 입력
 * - 상세 모드: 세트별 거리/반복/시간 입력
 * - 자동 계산: 세트별 데이터 기반 전체 완료율 계산
 */

'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';

interface CompletionInputModalProps {
  programId: string;
  sessionIndex: number;
  sessionDay: string;
  sessionDate?: string;
  plannedSets?: Array<{ // 프로그램의 계획된 세트 정보
    distance: number;
    reps: number;
    estimatedTime?: number; // 예상 소요 시간 (초)
  }>;
  onClose: () => void;
  onSubmit: (data: CompletionData) => Promise<void>;
}

export interface CompletionData {
  completionType: 'simple' | 'detailed';
  simpleCompletion?: {
    overallRate: number;
    feeling: 'easy' | 'moderate' | 'hard' | 'very_hard';
    notes?: string;
  };
  detailedCompletion?: {
    sets: Array<{
      setIndex: number;
      planned: { distance: number; reps: number };
      actual: { distance?: number; reps?: number; time?: number; completed: boolean };
    }>;
    feeling: 'easy' | 'moderate' | 'hard' | 'very_hard';
    notes?: string;
  };
  inputByRole: 'self' | 'instructor';
}

export default function CompletionInputModal({
  programId,
  sessionIndex,
  sessionDay,
  sessionDate,
  plannedSets,
  onClose,
  onSubmit
}: CompletionInputModalProps) {
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const [completionRate, setCompletionRate] = useState(85);
  const [feeling, setFeeling] = useState<'easy' | 'moderate' | 'hard' | 'very_hard'>('moderate');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // 상세 입력용 세트 데이터 (임시 - 실제로는 프로그램에서 가져와야 함)
  const [detailedSets, setDetailedSets] = useState<Array<{
    setIndex: number;
    planned: { distance: number; reps: number };
    actual: { distance: number; reps: number; time: number; completed: boolean };
  }>>(() => {
    // plannedSets가 있으면 사용, 없으면 기본값
    if (plannedSets && plannedSets.length > 0) {
      return plannedSets.map((set, idx) => ({
        setIndex: idx,
        planned: { distance: set.distance, reps: set.reps },
        actual: { 
          distance: set.distance, 
          reps: set.reps, 
          time: set.estimatedTime || 0, // 예상 시간 가져오기
          completed: false 
        }
      }));
    }
    // 기본값
    return [
      { setIndex: 0, planned: { distance: 400, reps: 1 }, actual: { distance: 400, reps: 1, time: 0, completed: false } },
      { setIndex: 1, planned: { distance: 200, reps: 4 }, actual: { distance: 200, reps: 4, time: 0, completed: false } },
      { setIndex: 2, planned: { distance: 100, reps: 8 }, actual: { distance: 100, reps: 8, time: 0, completed: false } }
    ];
  });

  const feelings = [
    { value: 'easy', label: '😊 쉬움', desc: '여유롭게 완료', color: 'green' },
    { value: 'moderate', label: '😐 적당함', desc: '적절한 난이도', color: 'blue' },
    { value: 'hard', label: '😓 힘듦', desc: '힘들지만 완료', color: 'orange' },
    { value: 'very_hard', label: '😰 매우 힘듦', desc: '매우 힘들었음', color: 'red' }
  ];

  // 상세 입력 기반 전체 완료율 계산
  const calculateDetailedCompletionRate = () => {
    const totalPlannedDistance = detailedSets.reduce((sum, set) => 
      sum + (set.planned.distance * set.planned.reps), 0
    );
    // completed가 false면 0으로 계산, true면 actual 값 사용
    const totalActualDistance = detailedSets.reduce((sum, set) => 
      sum + (set.actual.completed ? (set.actual.distance * set.actual.reps) : 0), 0
    );
    const rate = totalPlannedDistance > 0 ? Math.round((totalActualDistance / totalPlannedDistance) * 100) : 0;
    console.log('📊 완료율 계산:', {
      totalPlannedDistance,
      totalActualDistance,
      rate,
      sets: detailedSets.map(s => ({
        planned: s.planned.distance * s.planned.reps,
        actual: s.actual.completed ? (s.actual.distance * s.actual.reps) : 0,
        completed: s.actual.completed
      }))
    });
    return rate;
  };
  
  // detailedSets가 변경될 때마다 완료율 자동 업데이트
  React.useEffect(() => {
    if (mode === 'detailed') {
      const newRate = calculateDetailedCompletionRate();
      setCompletionRate(newRate);
    }
  }, [detailedSets, mode]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data: CompletionData = {
        completionType: mode,
        inputByRole: 'self',
        simpleCompletion: mode === 'simple' ? {
          overallRate: completionRate,
          feeling,
          notes
        } : undefined,
        detailedCompletion: mode === 'detailed' ? {
          sets: detailedSets.map(set => ({
            setIndex: set.setIndex,
            planned: set.planned,
            actual: {
              distance: set.actual.completed ? set.actual.distance : 0,
              reps: set.actual.completed ? set.actual.reps : 0,
              time: set.actual.completed ? set.actual.time : 0,
              completed: set.actual.completed
            }
          })),
          feeling,
          notes
        } : undefined
      };

      console.log('💾 완료율 제출 데이터:', {
        mode,
        completionRate: mode === 'simple' ? completionRate : calculateDetailedCompletionRate(),
        data,
        detailedSets: mode === 'detailed' ? detailedSets : null
      });
      
      console.log('🔍 제출 직전 detailedSets 상태:', 
        detailedSets.map(s => ({
          setIndex: s.setIndex,
          completed: s.actual.completed,
          distance: s.actual.distance,
          reps: s.actual.reps
        }))
      );

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('완료율 입력 오류:', error);
      alert('완료율 입력 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              완료율 입력
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {sessionDay} {sessionDate && `(${sessionDate})`}
          </p>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 입력 모드 선택 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              입력 방식
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('simple')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  mode === 'simple'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold mb-1">📊 간편 입력</div>
                <div className="text-xs text-gray-600">
                  전체 완료율만 입력 (빠름)
                </div>
              </button>
              <button
                onClick={() => setMode('detailed')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  mode === 'detailed'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="font-semibold mb-1">🔍 상세 입력</div>
                <div className="text-xs text-gray-600">
                  세트별 거리/시간 입력 (정확함)
                </div>
              </button>
            </div>
          </div>

          {/* 간편 입력 */}
          {mode === 'simple' && (
            <div className="space-y-6">
              {/* 완료율 슬라이더 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  전체 완료율
                </label>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <span className="text-5xl font-bold text-blue-600">
                      {completionRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={completionRate}
                    onChange={(e) => setCompletionRate(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${completionRate}%, #e5e7eb ${completionRate}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* 체감 난이도 (RPE) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  체감 난이도 (RPE)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feelings.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFeeling(f.value as any)}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        feeling === f.value
                          ? `border-${f.color}-500 bg-${f.color}-50 shadow-md`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">{f.label}</div>
                      <div className="text-xs text-gray-600">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  메모 (선택)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="오늘 훈련에 대한 메모를 남겨주세요 (예: 접영 킥이 많이 개선됨)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* 상세 입력 */}
          {mode === 'detailed' && (
            <div className="space-y-6">
              {/* 전체 완료율 표시 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    자동 계산된 전체 완료율
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateDetailedCompletionRate()}%
                  </span>
                </div>
              </div>

              {/* 세트별 입력 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  세트별 실제 수행 내용
                </label>
                <div className="space-y-3">
                  {detailedSets.map((set, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">
                          세트 {idx + 1}
                        </span>
                        <span className="text-sm text-gray-600">
                          계획: {set.planned.distance}m × {set.planned.reps}회
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            실제 거리(m)
                          </label>
                          <input
                            type="number"
                            value={set.actual.distance}
                            onChange={(e) => {
                              const newSets = [...detailedSets];
                              newSets[idx].actual.distance = parseInt(e.target.value) || 0;
                              setDetailedSets(newSets);
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            실제 반복(회)
                          </label>
                          <input
                            type="number"
                            value={set.actual.reps}
                            onChange={(e) => {
                              const newSets = [...detailedSets];
                              newSets[idx].actual.reps = parseInt(e.target.value) || 0;
                              setDetailedSets(newSets);
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            소요 시간(초)
                          </label>
                          <input
                            type="number"
                            value={set.actual.time}
                            onChange={(e) => {
                              const newSets = [...detailedSets];
                              newSets[idx].actual.time = parseInt(e.target.value) || 0;
                              setDetailedSets(newSets);
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={set.actual.completed}
                          onChange={(e) => {
                            const newSets = [...detailedSets];
                            newSets[idx].actual.completed = e.target.checked;
                            // 체크 시 actual 값을 planned 값으로 자동 설정
                            if (e.target.checked) {
                              newSets[idx].actual.distance = set.planned.distance;
                              newSets[idx].actual.reps = set.planned.reps;
                              // time은 사용자가 직접 입력하므로 기존 값 유지
                              newSets[idx].actual.time = set.actual.time || 0;
                            } else {
                              // 체크 해제 시 0으로 초기화
                              newSets[idx].actual.distance = 0;
                              newSets[idx].actual.reps = 0;
                              newSets[idx].actual.time = 0;
                            }
                            console.log(`✅ 세트 ${idx} 체크 변경:`, {
                              checked: e.target.checked,
                              actual: newSets[idx].actual
                            });
                            setDetailedSets(newSets);
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label className="text-sm text-gray-700">
                          이 세트를 완료했습니다
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 체감 난이도 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  체감 난이도 (RPE)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {feelings.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFeeling(f.value as any)}
                      className={`px-4 py-3 border-2 rounded-lg transition-all text-left ${
                        feeling === f.value
                          ? `border-${f.color}-500 bg-${f.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{f.label}</div>
                      <div className="text-xs text-gray-600">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  메모 (선택)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="오늘 훈련에 대한 특이사항을 기록해주세요."
                />
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '저장 중...' : '완료율 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}


