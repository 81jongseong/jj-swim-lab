/**
 * 📚 SwimLab - 커리큘럼 프로그램 생성기
 * 
 * 📋 **페이지 목적**
 * - 초급/중급 회원을 위한 커리큘럼 프로그램 생성
 * - 강습법 목록 불러와서 선택
 * - 워밍업 - 메인세트 - 쿨다운 구조
 * - 거리/시간 + 휴식시간 설정
 * 
 * 🔄 **연동되는 데이터**
 * - TeachingMethod (강습법 목록)
 * - SwimProgram (생성된 프로그램)
 * 
 * 💡 **사용 대상**
 * - 강사 (초급/중급 커리큘럼 생성)
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { LoadingState, PageHeader } from '@/components/common';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  checklist: string[];
}

interface ProgramBlock {
  type: 'warmup' | 'mainset' | 'cooldown';
  teachingMethodId?: string; // 강습법 ID (메인세트만)
  teachingMethodName?: string;
  distanceOrTime: 'distance' | 'time';
  value: number; // 거리(m) 또는 시간(분)
  restTime: number; // 휴식시간(초)
  description?: string;
}

export default function CurriculumProgramPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [programLevel, setProgramLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [programName, setProgramName] = useState('');
  const [blocks, setBlocks] = useState<ProgramBlock[]>([
    { type: 'warmup', distanceOrTime: 'distance', value: 200, restTime: 0 },
    { type: 'mainset', distanceOrTime: 'distance', value: 400, restTime: 30 },
    { type: 'cooldown', distanceOrTime: 'distance', value: 200, restTime: 0 }
  ]);

  useEffect(() => {
    loadTeachingMethods();
  }, [programLevel]);

  const loadTeachingMethods = async () => {
    try {
      // TODO: API 연동
      // const response = await apiClient.get('/api/teaching-methods');
      // setTeachingMethods(response.data);
      
      // 임시 데이터
      const tempMethods: TeachingMethod[] = [
        {
          _id: '1',
          name: '자유형 팔 동작 교정법',
          description: '자유형 팔 동작을 올바르게 교정하는 방법',
          category: '자유형',
          level: programLevel,
          steps: ['벽에 기대기', '팔 앞뒤로 움직이기', '회전 추가'],
          checklist: ['팔꿈치 높이 확인', '손목 각도 확인']
        },
        {
          _id: '2',
          name: '평영 다리 교정법',
          description: '평영 다리 동작 교정',
          category: '평영',
          level: programLevel,
          steps: ['벽 잡고 다리만', '풀부이 없이', '전체 동작'],
          checklist: ['무릎 각도', '발목 유연성']
        }
      ];
      setTeachingMethods(tempMethods);
    } catch (error) {
      logger.error('강습법 로드 오류:', error);
    }
  };

  const addMainSet = () => {
    const cooldownIdx = blocks.findIndex(b => b.type === 'cooldown');
    const newBlock: ProgramBlock = {
      type: 'mainset',
      distanceOrTime: 'distance',
      value: 400,
      restTime: 30
    };
    
    if (cooldownIdx >= 0) {
      setBlocks([
        ...blocks.slice(0, cooldownIdx),
        newBlock,
        ...blocks.slice(cooldownIdx)
      ]);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlock = (index: number, updates: Partial<ProgramBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const deleteBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // TODO: API 연동하여 프로그램 저장
      alert('프로그램이 저장되었습니다!');
      router.push('/instructor/teaching-methods');
    } catch (error) {
      logger.error('저장 오류:', error);
      alert('저장에 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <PageHeader
        title="📚 커리큘럼 프로그램 생성"
        description="초급/중급 회원을 위한 커리큘럼 프로그램을 생성합니다"
      />

      {/* 기본 설정 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">기본 설정</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">프로그램명</label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="예: 초급 1주차 프로그램"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
            <select
              value={programLevel}
              onChange={(e) => setProgramLevel(e.target.value as 'beginner' | 'intermediate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
            </select>
          </div>
        </div>
      </div>

      {/* 프로그램 블록 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">프로그램 구성</h2>
          <button
            onClick={addMainSet}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            + 메인세트 추가
          </button>
        </div>

        <div className="space-y-4">
          {blocks.map((block, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-2 ${
              block.type === 'warmup' ? 'bg-green-50 border-green-300' :
              block.type === 'cooldown' ? 'bg-blue-50 border-blue-300' :
              'bg-purple-50 border-purple-300'
            }`}>
              {/* 블록 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {block.type === 'warmup' ? '🔥 워밍업' :
                   block.type === 'cooldown' ? '❄️ 쿨다운' :
                   `💪 메인세트 ${blocks.filter((b, i) => i < idx && b.type === 'mainset').length + 1}`}
                </h3>
                {block.type === 'mainset' && (
                  <button
                    onClick={() => deleteBlock(idx)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    ✕ 삭제
                  </button>
                )}
              </div>

              {/* 강습법 선택 (메인세트만) */}
              {block.type === 'mainset' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    강습법 선택
                  </label>
                  <select
                    value={block.teachingMethodId || ''}
                    onChange={(e) => {
                      const method = teachingMethods.find(m => m._id === e.target.value);
                      updateBlock(idx, {
                        teachingMethodId: e.target.value,
                        teachingMethodName: method?.name,
                        description: method?.description
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- 강습법 선택 --</option>
                    {teachingMethods.map(method => (
                      <option key={method._id} value={method._id}>
                        {method.name} ({method.category})
                      </option>
                    ))}
                  </select>
                  {block.teachingMethodId && (
                    <p className="mt-2 text-xs text-gray-600">
                      📋 {block.description}
                    </p>
                  )}
                </div>
              )}

              {/* 거리/시간 + 휴식시간 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">단위</label>
                  <select
                    value={block.distanceOrTime}
                    onChange={(e) => updateBlock(idx, { distanceOrTime: e.target.value as 'distance' | 'time' })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="distance">거리 (m)</option>
                    <option value="time">시간 (분)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    {block.distanceOrTime === 'distance' ? '거리 (m)' : '시간 (분)'}
                  </label>
                  <input
                    type="number"
                    value={block.value}
                    onChange={(e) => updateBlock(idx, { value: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">휴식 (초)</label>
                  <input
                    type="number"
                    value={block.restTime}
                    onChange={(e) => updateBlock(idx, { restTime: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          저장
        </button>
      </div>
    </div>
  );
}

