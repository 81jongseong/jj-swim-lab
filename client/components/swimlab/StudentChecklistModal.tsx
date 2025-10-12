/**
 * 🎯 SwimLab - 학생별 강습법 체크리스트 모달
 * 
 * 📋 **컴포넌트 목적**
 * - 강사가 특정 학생의 강습법 진행 상황 체크
 * - 체크리스트 항목별 완료 여부 표시
 * - 다음 강습법 자동 추천
 * 
 * 🔄 **연동 데이터**
 * - /api/teaching-methods: 강습법 목록
 * - /api/teaching-progress: 학생별 진행 상황
 */

'use client';

import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  steps: string[];
  tips: string[];
  checklist: string[];
  order: number;
}

interface ProgressItem {
  methodId: string;
  checklistProgress: {
    [key: string]: {
      completed: boolean;
      completedAt?: string;
      notes?: string;
    };
  };
  completedAt?: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface StudentChecklistModalProps {
  studentId: string;
  studentName: string;
  studentLevel: string;
  onClose: () => void;
}

export default function StudentChecklistModal({
  studentId,
  studentName,
  studentLevel,
  onClose
}: StudentChecklistModalProps) {
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [currentProgress, setCurrentProgress] = useState<ProgressItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [studentId, studentLevel]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. 해당 레벨의 강습법 목록 조회
      const methodsResponse = await apiClient.get(`/api/teaching-methods?level=${studentLevel}`);
      if (methodsResponse.success && methodsResponse.data) {
        const methods = Array.isArray(methodsResponse.data)
          ? methodsResponse.data
          : methodsResponse.data.teachingMethods || [];
        setTeachingMethods(methods.sort((a: any, b: any) => a.order - b.order));

        // 첫 번째 강습법 자동 선택
        if (methods.length > 0) {
          setSelectedMethod(methods[0]);
        }
      }

      // 2. 학생의 진행 상황 조회
      const progressResponse = await apiClient.get(`/api/teaching-progress/${studentId}`);
      if (progressResponse.success && progressResponse.data) {
        setProgress(progressResponse.data.progress || []);
      }

    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMethod) {
      // 선택된 강습법의 진행 상황 찾기
      const methodProgress = progress.find(p => p.methodId === selectedMethod._id);
      if (methodProgress) {
        setCurrentProgress(methodProgress);
      } else {
        // 진행 상황이 없으면 새로 생성
        const newProgress: ProgressItem = {
          methodId: selectedMethod._id,
          checklistProgress: {},
          status: 'not_started'
        };
        selectedMethod.checklist.forEach((item, index) => {
          newProgress.checklistProgress[index] = {
            completed: false
          };
        });
        setCurrentProgress(newProgress);
      }
    }
  }, [selectedMethod, progress]);

  const toggleChecklistItem = (index: number) => {
    if (!currentProgress) return;

    const newProgress = { ...currentProgress };
    const currentItem = newProgress.checklistProgress[index] || { completed: false };
    
    newProgress.checklistProgress[index] = {
      ...currentItem,
      completed: !currentItem.completed,
      completedAt: !currentItem.completed ? new Date().toISOString() : undefined
    };

    // 전체 완료 여부 체크
    const allCompleted = Object.values(newProgress.checklistProgress).every(item => item.completed);
    newProgress.status = allCompleted ? 'completed' : 'in_progress';
    if (allCompleted) {
      newProgress.completedAt = new Date().toISOString();
    }

    setCurrentProgress(newProgress);
  };

  const saveProgress = async () => {
    if (!selectedMethod || !currentProgress) return;

    setSaving(true);
    try {
      const response = await apiClient.post('/api/teaching-progress', {
        userId: studentId,
        methodId: selectedMethod._id,
        checklistProgress: currentProgress.checklistProgress,
        status: currentProgress.status,
        completedAt: currentProgress.completedAt
      });

      if (response.success) {
        alert('✅ 진행 상황이 저장되었습니다!');
        loadData(); // 새로고침
      }
    } catch (error: any) {
      console.error('저장 실패:', error);
      alert(`저장 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setSaving(false);
    }
  };

  const getMethodStatus = (methodId: string) => {
    const methodProgress = progress.find(p => p.methodId === methodId);
    if (!methodProgress) return 'not_started';
    return methodProgress.status;
  };

  const getCompletionRate = () => {
    if (!currentProgress || !selectedMethod) return 0;
    const completed = Object.values(currentProgress.checklistProgress).filter(item => item.completed).length;
    return Math.round((completed / selectedMethod.checklist.length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{studentName}님의 강습 진행 상황</h3>
            <p className="text-sm text-gray-600 mt-1">
              레벨: {studentLevel} | 총 {teachingMethods.length}개 강습법
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* 강습법 목록 */}
          <div className="w-1/3 border-r overflow-y-auto p-4">
            <h4 className="font-semibold text-gray-900 mb-3">강습법 목록</h4>
            <div className="space-y-2">
              {teachingMethods.map((method) => {
                const status = getMethodStatus(method._id);
                const statusColor = status === 'completed' ? 'bg-green-100 border-green-500' :
                                  status === 'in_progress' ? 'bg-yellow-100 border-yellow-500' :
                                  'bg-gray-100 border-gray-300';
                const statusIcon = status === 'completed' ? '✅' :
                                 status === 'in_progress' ? '⏳' : '⬜';

                return (
                  <button
                    key={method._id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedMethod?._id === method._id
                        ? 'border-blue-600 bg-blue-50'
                        : statusColor
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{statusIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{method.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          순서: {method.order} | 체크리스트: {method.checklist.length}개
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 체크리스트 상세 */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl text-gray-600">불러오는 중...</div>
              </div>
            ) : selectedMethod && currentProgress ? (
              <div className="space-y-6">
                {/* 강습법 정보 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedMethod.name}</h4>
                  <p className="text-gray-700 mb-4">{selectedMethod.description}</p>
                  
                  {/* 완료율 */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">완료율</span>
                      <span className="text-2xl font-bold text-blue-600">{getCompletionRate()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{ width: `${getCompletionRate()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 체크리스트 */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span>체크리스트</span>
                  </h5>
                  <div className="space-y-3">
                    {selectedMethod.checklist.map((item, index) => {
                      const isCompleted = currentProgress.checklistProgress[index]?.completed || false;
                      const completedAt = currentProgress.checklistProgress[index]?.completedAt;

                      return (
                        <div
                          key={index}
                          onClick={() => toggleChecklistItem(index)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isCompleted
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400'
                            }`}>
                              {isCompleted && <span className="text-white text-sm">✓</span>}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                                {item}
                              </p>
                              {completedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ {new Date(completedAt).toLocaleString('ko-KR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 단계별 설명 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-3">📝 단계별 설명</h5>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {selectedMethod.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* 팁 */}
                {selectedMethod.tips.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
                    <h5 className="font-semibold text-gray-900 mb-3">💡 팁</h5>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {selectedMethod.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl">강습법을 선택하세요</div>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="border-t p-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
            <button
              onClick={saveProgress}
              disabled={saving || !selectedMethod}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>진행 상황 저장</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

