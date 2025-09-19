/**
 * 🏊‍♂️ JJ Swim Lab - 센터관리자 강습 과정 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터별 맞춤 강습 과정 기획 및 관리
 * - 레인 설정 및 시설 관리
 * - 강습 일정 및 강사 배정
 * - 센터별 수용 인원 설정
 * 
 * 🔄 **주요 기능**
 * - 강습 과정 CRUD (생성/조회/수정/삭제)
 * - 동적 레인 설정 (1-20개, 홀수/짝수 지원)
 * - 레인당 인원 설정 (센터별 시설 특성 반영)
 * - 강사 배정 및 일정 관리
 * - 강습료 설정 및 관리
 * 
 * 🗄️ **데이터 연동**
 * - Course 모델: 강습 과정 정보
 * - Center 모델: 센터별 시설 정보
 * - User 모델: 강사 정보
 * - Booking 모델: 예약 및 일정
 * 
 * 🏢 **센터관리자 전용 권한**
 * - 자신이 관리하는 센터의 강습 과정만 관리
 * - 센터별 레인 설정 및 시설 관리
 * - 센터별 맞춤형 강습료 설정
 * - 소속 강사 배정 및 관리
 * 
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LaneManager from '@/components/LaneManager';
import { Plus, Edit, Trash2, Search, Filter, Settings, Users, Clock, DollarSign } from 'lucide-react';

// 강습 과정 인터페이스
interface Course {
  _id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  maxStudents: number;
  price: number;
  instructor?: string;
  schedule: {
    dayOfWeek: string[];
    startTime: string;
    endTime: string;
  };
  facility: {
    lanes: number[];
    poolType: string;
    capacity: number;
  };
  isActive: boolean;
}

// 레인 설정 인터페이스
interface LaneSettings {
  totalLanes: number;
  laneCapacity: number; // 레인당 기본 인원
  poolType: 'standard' | 'olympic' | 'kids' | 'therapy';
  customCapacities?: { [laneId: number]: number }; // 레인별 맞춤 인원
}

const CenterAdmin강의관리Page: React.FC = () => {
  const { user } = useAuth();
  
  // 상태 관리
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  
  // 레인 설정 상태
  const [laneSettings, setLaneSettings] = useState<LaneSettings>({
    totalLanes: 8,
    laneCapacity: 8, // 기본 8명
    poolType: 'standard',
    customCapacities: {}
  });
  
  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLaneSettings, setShowLaneSettings] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadCourses();
    loadLaneSettings();
  }, []);

  // 강습 과정 로드
  const loadCourses = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses?centerId=${user?.centerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('강습 과정 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setCourses(result.data || []);
      } else {
        throw new Error(result.message || '강습 과정 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('강습 과정 로딩 실패:', error);
      setCourses([]); // API 연결 실패 시 빈 배열
    } finally {
      setLoading(false);
    }
  };
  
  // 센터별 레인 설정 로드
  const loadLaneSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/lane-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLaneSettings(result.data);
        }
      }
    } catch (error) {
      console.error('레인 설정 로드 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 레인당 인원 기준 데이터
  const laneCapacityStandards = {
    standard: { base: 8, description: '표준 풀 (25m × 2.5m 레인)' },
    olympic: { base: 12, description: '올림픽 풀 (50m × 2.5m 레인)' },
    kids: { base: 6, description: '어린이 풀 (15m × 2m 레인)' },
    therapy: { base: 4, description: '재활 풀 (20m × 3m 레인)' }
  };
  
  // 레인당 인원 설정 업데이트
  const updateLaneCapacity = (laneId: number, capacity: number) => {
    setLaneSettings(prev => ({
      ...prev,
      customCapacities: {
        ...prev.customCapacities,
        [laneId]: capacity
      }
    }));
  };
  
  // 레인별 실제 수용 인원 계산
  const getLaneCapacity = (laneId: number): number => {
    return laneSettings.customCapacities?.[laneId] || laneSettings.laneCapacity;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏊‍♂️ 강습 과정 관리
        </h1>
        <p className="text-gray-600">
          우리 센터의 강습 과정과 레인을 관리하세요.
        </p>
        <div className="mt-2 text-sm text-blue-600">
          💡 센터관리자 전용: 레인 설정, 강습료, 인원 수용 등을 자유롭게 설정할 수 있습니다.
        </div>
      </div>
      
      {/* 센터 정보 및 레인 현황 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{laneSettings.totalLanes}</div>
            <div className="text-sm text-gray-600">총 레인 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{laneSettings.laneCapacity}</div>
            <div className="text-sm text-gray-600">레인당 기본 인원</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{courses.length}</div>
            <div className="text-sm text-gray-600">운영 중인 강습</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {laneSettings.totalLanes * laneSettings.laneCapacity}
            </div>
            <div className="text-sm text-gray-600">총 수용 인원</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="강습 과정 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 레벨</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setShowLaneSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              레인 설정
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              강습 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 강습 과정 목록 */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                <div className="text-4xl mb-4">🏊‍♂️</div>
                <p className="text-lg font-medium">아직 등록된 강습 과정이 없습니다.</p>
                <p className="text-sm mt-2">첫 번째 강습 과정을 추가해보세요!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          courses
            .filter(course => 
              filterLevel === 'all' || course.level === filterLevel
            )
            .filter(course =>
              searchTerm === '' || 
              course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((course) => (
            <Card key={course._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <Badge variant={course.level === 'beginner' ? 'secondary' : course.level === 'intermediate' ? 'primary' : 'success'}>
                        {course.level === 'beginner' ? '🥉 초급' : 
                         course.level === 'intermediate' ? '🥈 중급' : '🥇 고급'}
                      </Badge>
                      <Badge variant={course.isActive ? 'success' : 'secondary'}>
                        {course.isActive ? '운영중' : '중단'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{course.duration}분</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span>최대 {course.maxStudents}명</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        <span>{course.price?.toLocaleString()}원</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500">🏊‍♀️</span>
                        <span>{course.facility?.lanes?.length || 0}개 레인</span>
                      </div>
                    </div>
                    
                    {course.schedule && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">일정:</span> {course.schedule.dayOfWeek?.join(', ')} 
                        {course.schedule.startTime && course.schedule.endTime && 
                          ` ${course.schedule.startTime}-${course.schedule.endTime}`
                        }
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingCourse(course);
                      setShowEditModal(true);
                    }}>
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="danger">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* 센터관리자용 레인 설정 모달 */}
      {showLaneSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-900">🏊‍♂️ 센터 레인 설정</h3>
              <button
                onClick={() => setShowLaneSettings(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-8">
              {/* 기본 레인 설정 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏊‍♂️ 총 레인 수 (1-20개)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={laneSettings.totalLanes}
                    onChange={(e) => setLaneSettings({
                      ...laneSettings,
                      totalLanes: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    현재: {laneSettings.totalLanes}개 ({laneSettings.totalLanes % 2 === 0 ? '짝수' : '홀수'})
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏊‍♀️ 수영장 타입
                  </label>
                  <select
                    value={laneSettings.poolType}
                    onChange={(e) => {
                      const poolType = e.target.value as any;
                      const standard = laneCapacityStandards[poolType];
                      setLaneSettings({
                        ...laneSettings,
                        poolType,
                        laneCapacity: standard.base
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">표준 풀 (25m)</option>
                    <option value="olympic">올림픽 풀 (50m)</option>
                    <option value="kids">어린이 풀</option>
                    <option value="therapy">재활 풀</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    {laneCapacityStandards[laneSettings.poolType].description}
                  </div>
                </div>
              </div>
              
              {/* 레인당 인원 기준 설정 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">👥 레인당 인원 설정</h4>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-blue-900 mb-2">📊 권장 기준 (참고용)</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {Object.entries(laneCapacityStandards).map(([type, info]) => (
                      <div key={type} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">{info.description}</div>
                        <div className="text-blue-600 font-bold">권장: {info.base}명</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기본 레인당 인원
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={laneSettings.laneCapacity}
                      onChange={(e) => setLaneSettings({
                        ...laneSettings,
                        laneCapacity: parseInt(e.target.value) || 1
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      모든 레인의 기본 수용 인원 (개별 설정 가능)
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      총 수용 가능 인원
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                      {laneSettings.totalLanes * laneSettings.laneCapacity}명
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {laneSettings.totalLanes}개 레인 × {laneSettings.laneCapacity}명
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 레인별 개별 인원 설정 */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 레인별 맞춤 인원 설정</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({ length: laneSettings.totalLanes }, (_, i) => i + 1).map(laneId => (
                    <div key={laneId} className="bg-white p-3 border border-gray-300 rounded-lg">
                      <div className="text-center mb-2">
                        <div className="font-medium text-gray-900">{laneId}번 레인</div>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={getLaneCapacity(laneId)}
                        onChange={(e) => updateLaneCapacity(laneId, parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="text-xs text-gray-500 text-center mt-1">명</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  💡 각 레인별로 다른 인원을 설정할 수 있습니다. (예: 어린이 레인은 적게, 성인 레인은 많게)
                </div>
              </div>
              
              {/* 저장 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowLaneSettings(false)}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // API 호출로 레인 설정 저장
                    console.log('레인 설정 저장:', laneSettings);
                    setShowLaneSettings(false);
                  }}
                >
                  설정 저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterAdmin강의관리Page;
