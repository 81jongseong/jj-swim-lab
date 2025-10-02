/**
 * 🏊‍♂️ JJ Swim Lab - 동적 레인 관리 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 수영장 레인의 동적 설정 및 관리
 * - 홀수/짝수 레인 수 지원 (1-20개)
 * - 레인별 상태 관리 및 시각화
 * - 강습 과정별 레인 배정 최적화
 * 
 * 🔄 **주요 기능**
 * - 레인 수 동적 조정 (1-20개)
 * - 레인별 상태 관리 (사용가능/사용중/점검중)
 * - 강습 과정별 레인 배정
 * - 레인 사용률 통계
 * - 레인 배치 최적화 알고리즘
 * 
 * 🗄️ **데이터 연동**
 * - Course 모델과 연동 (강습 과정별 레인 사용)
 * - Center 모델과 연동 (센터별 레인 설정)
 * - Booking 모델과 연동 (예약별 레인 배정)
 * - 실시간 레인 상태 업데이트
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-19: 초기 동적 레인 관리 시스템 구현
 * - 2025-09-19: 홀수/짝수 레인 수 지원 추가
 * - 2025-09-19: 레인 배치 최적화 알고리즘 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

// 레인 인터페이스
export interface Lane {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  currentCourse?: string | null;
  instructor?: string | null;
  studentCount?: number;
  maxCapacity?: number;
  timeSlot?: string | null;
}

// 레인 설정 인터페이스
export interface LaneConfiguration {
  totalLanes: number; // 1-20개
  activeStart: number; // 활성 레인 시작 번호
  activeEnd: number; // 활성 레인 종료 번호
  poolType: 'standard' | 'olympic' | 'kids' | 'therapy';
  laneWidth: number; // 미터
  poolLength: number; // 미터 (25m, 50m 등)
}

// 레인 관리자 Props
interface LaneManagerProps {
  centerId?: string;
  onLaneConfigChange?: (config: LaneConfiguration) => void;
  onLaneStatusChange?: (laneId: number, status: Lane['status']) => void;
  initialConfig?: LaneConfiguration;
  readonly?: boolean;
}

/**
 * 동적 레인 관리 컴포넌트
 */
export default function LaneManager({
  centerId,
  onLaneConfigChange,
  onLaneStatusChange,
  initialConfig,
  readonly = false
}: LaneManagerProps) {
  // 레인 설정 상태
  const [config, setConfig] = useState<LaneConfiguration>(
    initialConfig || {
      totalLanes: 8,
      activeStart: 1,
      activeEnd: 8,
      poolType: 'standard',
      laneWidth: 2.5,
      poolLength: 25
    }
  );
  
  // 레인 상태 관리
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanes, setSelectedLanes] = useState<number[]>([]);
  
  // 레인 초기화
  useEffect(() => {
    generateLanes(config);
  }, [config]);
  
  /**
   * 레인 배열 생성 함수
   * - 설정된 레인 수만큼 레인 객체 생성
   * - 홀수/짝수 상관없이 동적 생성
   */
  const generateLanes = (configuration: LaneConfiguration) => {
    const newLanes: Lane[] = [];
    
    for (let i = 1; i <= configuration.totalLanes; i++) {
      const isActive = i >= configuration.activeStart && i <= configuration.activeEnd;
      
      newLanes.push({
        id: i,
        name: `${i}번 레인`,
        status: isActive ? 'available' : 'maintenance',
        currentCourse: null,
        instructor: null,
        studentCount: 0,
        maxCapacity: getMaxCapacityByPoolType(configuration.poolType),
        timeSlot: null
      });
    }
    
    setLanes(newLanes);
  };
  
  /**
   * 수영장 타입별 최대 수용 인원 계산
   */
  const getMaxCapacityByPoolType = (poolType: string): number => {
    switch (poolType) {
      case 'olympic': return 12; // 올림픽 풀
      case 'standard': return 8; // 표준 풀
      case 'kids': return 6; // 어린이 풀
      case 'therapy': return 4; // 재활 풀
      default: return 8;
    }
  };
  
  /**
   * 레인 설정 업데이트
   */
  const updateConfiguration = (newConfig: Partial<LaneConfiguration>) => {
    const updatedConfig = { ...config, ...newConfig };
    
    // 활성 레인 범위 검증
    if (updatedConfig.activeStart < 1) updatedConfig.activeStart = 1;
    if (updatedConfig.activeEnd > updatedConfig.totalLanes) updatedConfig.activeEnd = updatedConfig.totalLanes;
    if (updatedConfig.activeStart > updatedConfig.activeEnd) updatedConfig.activeStart = updatedConfig.activeEnd;
    
    setConfig(updatedConfig);
    onLaneConfigChange?.(updatedConfig);
  };
  
  /**
   * 레인 상태 변경
   */
  const changeLaneStatus = (laneId: number, newStatus: Lane['status']) => {
    setLanes(prevLanes =>
      prevLanes.map(lane =>
        lane.id === laneId ? { ...lane, status: newStatus } : lane
      )
    );
    onLaneStatusChange?.(laneId, newStatus);
  };
  
  /**
   * 레인 선택/해제
   */
  const toggleLaneSelection = (laneId: number) => {
    setSelectedLanes(prev =>
      prev.includes(laneId)
        ? prev.filter(id => id !== laneId)
        : [...prev, laneId]
    );
  };
  
  /**
   * 선택된 레인들 일괄 상태 변경
   */
  const bulkChangeLaneStatus = (newStatus: Lane['status']) => {
    selectedLanes.forEach(laneId => {
      changeLaneStatus(laneId, newStatus);
    });
    setSelectedLanes([]);
  };
  
  /**
   * 레인 상태별 색상 반환
   */
  const getLaneStatusColor = (status: Lane['status']): string => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'maintenance': return 'bg-red-100 border-red-300 text-red-800';
      case 'reserved': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  /**
   * 레인 상태별 아이콘 반환
   */
  const getLaneStatusIcon = (status: Lane['status']): string => {
    switch (status) {
      case 'available': return '✅';
      case 'occupied': return '🏊‍♂️';
      case 'maintenance': return '🔧';
      case 'reserved': return '📅';
      default: return '❓';
    }
  };
  
  /**
   * 최적 레인 배정 추천 알고리즘
   */
  const recommendOptimalLanes = (requiredLanes: number): number[] => {
    const availableLanes = lanes
      .filter(lane => lane.status === 'available')
      .map(lane => lane.id);
    
    if (availableLanes.length < requiredLanes) {
      return []; // 충분한 레인이 없음
    }
    
    // 연속된 레인 우선 배정
    for (let i = 0; i <= availableLanes.length - requiredLanes; i++) {
      const consecutiveLanes = [];
      let startIndex = i;
      
      for (let j = 0; j < requiredLanes; j++) {
        if (availableLanes[startIndex + j] === availableLanes[startIndex] + j) {
          consecutiveLanes.push(availableLanes[startIndex + j]);
        } else {
          break;
        }
      }
      
      if (consecutiveLanes.length === requiredLanes) {
        return consecutiveLanes;
      }
    }
    
    // 연속되지 않은 레인이라도 배정
    return availableLanes.slice(0, requiredLanes);
  };

  return (
    <div className="space-y-6">
      {/* 레인 설정 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏊‍♂️ 레인 관리</h2>
          <p className="text-gray-600 mt-1">
            총 {config.totalLanes}개 레인 (활성: {config.activeStart}-{config.activeEnd}번)
          </p>
        </div>
        
        {!readonly && (
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
            >
              ⚙️ 레인 설정
            </Button>
            
            {selectedLanes.length > 0 && (
              <div className="flex space-x-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => bulkChangeLaneStatus('available')}
                >
                  사용가능 ({selectedLanes.length})
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => bulkChangeLaneStatus('maintenance')}
                >
                  점검중 ({selectedLanes.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 레인 상태 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {lanes.filter(lane => lane.status === 'available').length}
          </div>
          <div className="text-sm text-green-700">사용가능</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {lanes.filter(lane => lane.status === 'occupied').length}
          </div>
          <div className="text-sm text-blue-700">사용중</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {lanes.filter(lane => lane.status === 'reserved').length}
          </div>
          <div className="text-sm text-yellow-700">예약됨</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {lanes.filter(lane => lane.status === 'maintenance').length}
          </div>
          <div className="text-sm text-red-700">점검중</div>
        </div>
      </div>
      
      {/* 레인 그리드 표시 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">레인 현황</h3>
          
          {/* 레인 그리드 - 동적 크기 조정 */}
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(config.totalLanes, 10)}, 1fr)`,
              maxHeight: config.totalLanes > 10 ? '400px' : 'auto',
              overflowY: config.totalLanes > 10 ? 'auto' : 'visible'
            }}
          >
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${getLaneStatusColor(lane.status)}
                  ${selectedLanes.includes(lane.id) ? 'ring-4 ring-blue-300' : ''}
                  ${readonly ? 'cursor-default' : 'hover:shadow-md'}
                `}
                onClick={() => !readonly && toggleLaneSelection(lane.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {getLaneStatusIcon(lane.status)}
                  </div>
                  <div className="font-semibold text-sm">
                    {lane.name}
                  </div>
                  
                  {lane.currentCourse && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium">{lane.currentCourse}</div>
                      {lane.instructor && (
                        <div className="text-gray-600">{lane.instructor}</div>
                      )}
                      {lane.studentCount !== undefined && (
                        <div className="text-gray-600">
                          {lane.studentCount}/{lane.maxCapacity}명
                        </div>
                      )}
                    </div>
                  )}
                  
                  {lane.timeSlot && (
                    <div className="mt-1 text-xs text-gray-500">
                      {lane.timeSlot}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* 레인 사용률 표시 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📊 레인 사용률</h4>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(lanes.filter(l => l.status === 'occupied').length / lanes.length) * 100}%`
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {lanes.filter(l => l.status === 'occupied').length}/{lanes.length} 레인 사용 중 
              ({Math.round((lanes.filter(l => l.status === 'occupied').length / lanes.length) * 100)}%)
            </div>
          </div>
        </div>
      </Card>
      
      {/* 레인 설정 모달 */}
      {showSettings && !readonly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-900">⚙️ 레인 설정</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 기본 설정 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏊‍♂️ 총 레인 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.totalLanes}
                    onChange={(e) => updateConfiguration({ totalLanes: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    1-20개 레인 지원 (홀수/짝수 무관)
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏊‍♀️ 수영장 타입
                  </label>
                  <select
                    value={config.poolType}
                    onChange={(e) => updateConfiguration({ poolType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">표준 풀 (25m)</option>
                    <option value="olympic">올림픽 풀 (50m)</option>
                    <option value="kids">어린이 풀</option>
                    <option value="therapy">재활 풀</option>
                  </select>
                </div>
              </div>
              
              {/* 활성 레인 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 활성 레인 범위
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">시작 레인</label>
                    <input
                      type="number"
                      min="1"
                      max={config.totalLanes}
                      value={config.activeStart}
                      onChange={(e) => updateConfiguration({ activeStart: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">종료 레인</label>
                    <input
                      type="number"
                      min={config.activeStart}
                      max={config.totalLanes}
                      value={config.activeEnd}
                      onChange={(e) => updateConfiguration({ activeEnd: parseInt(e.target.value) || config.totalLanes })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  활성 레인: {config.activeEnd - config.activeStart + 1}개
                </div>
              </div>
              
              {/* 물리적 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📏 레인 너비 (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={config.laneWidth}
                    onChange={(e) => updateConfiguration({ laneWidth: parseFloat(e.target.value) || 2.5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📐 수영장 길이 (m)
                  </label>
                  <select
                    value={config.poolLength}
                    onChange={(e) => updateConfiguration({ poolLength: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={25}>25m (표준)</option>
                    <option value={50}>50m (올림픽)</option>
                    <option value={12.5}>12.5m (어린이)</option>
                  </select>
                </div>
              </div>
              
              {/* 프리셋 설정 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎛️ 프리셋 설정
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({ totalLanes: 6, activeStart: 1, activeEnd: 6 })}
                  >
                    표준 6레인
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({ totalLanes: 8, activeStart: 1, activeEnd: 8 })}
                  >
                    표준 8레인
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({ totalLanes: 10, activeStart: 1, activeEnd: 10 })}
                  >
                    대형 10레인
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({ totalLanes: 12, activeStart: 1, activeEnd: 12 })}
                  >
                    올림픽 12레인
                  </Button>
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowSettings(false);
                    console.log('레인 설정 저장:', config);
                  }}
                >
                  설정 저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 레인 배정 추천 도구 */}
      {!readonly && (
        <Card>
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🎯 최적 레인 배정 도구</h4>
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-600">필요한 레인 수:</label>
                <input
                  type="number"
                  min="1"
                  max={lanes.filter(l => l.status === 'available').length}
                  className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  placeholder="3"
                  onChange={(e) => {
                    const required = parseInt(e.target.value) || 0;
                    if (required > 0) {
                      const recommended = recommendOptimalLanes(required);
                      setSelectedLanes(recommended);
                    }
                  }}
                />
              </div>
              <div className="text-sm text-gray-500">
                사용가능한 레인: {lanes.filter(l => l.status === 'available').length}개
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
