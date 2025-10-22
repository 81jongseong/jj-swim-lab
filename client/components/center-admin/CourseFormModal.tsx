/**
 * 센터 과정 관리 - 과정 추가/수정 모달
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Course {
  _id?: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime?: string; // optional로 변경
  }[];
  status: 'active' | 'inactive' | 'full';
  createdAt?: Date; // 추가
  tags?: string[]; // 과정 태그 (어린이, 아쿠아 등)
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool'; // ⭐ 풀 타입
  lanes?: number[]; // ⭐ 레인 번호 배열 (예: [1, 2, 3])
  laneInfo?: {
    assignedLanes?: number[];
    maxLanes?: number;
    laneNotes?: string;
  };
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course?: Course | null;
  instructors?: { _id: string; name: string; userId?: string; instructorType?: 'instructor' | 'lifeguard' }[];
  customLevels?: Array<{ id: string; name: string; description: string; order: number }>;
}

export default function CourseFormModal({
  isOpen,
  onClose,
  onSave,
  course,
  instructors = [],
  customLevels = []
}: CourseFormModalProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '',
    description: '',
    level: 'beginner',
    duration: 60,
    maxStudents: 20,
    currentStudents: 0,
    instructorId: '',
    instructorName: '',
    price: 50000,
    schedule: [{ dayOfWeek: '월', startTime: '09:00', endTime: '10:00' }],
    status: 'active',
    tags: [],
    lanes: [], // ⭐ 레인 정보
    laneInfo: {
      assignedLanes: [],
      maxLanes: 1,
      laneNotes: ''
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newLevelInput, setNewLevelInput] = useState('');
  const [showLevelInput, setShowLevelInput] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedLanes, setSelectedLanes] = useState<number[]>([]); // ⭐ 선택된 레인들
  const [instructorTypeFilter, setInstructorTypeFilter] = useState<'all' | 'instructor' | 'lifeguard'>('all'); // ⭐ 강사 종류 필터
  const [selectedPoolType, setSelectedPoolType] = useState<'mainPool' | 'kidsPool' | 'auxiliaryPool'>('mainPool'); // ⭐ 선택된 풀
  const [poolConfig, setPoolConfig] = useState<any>(null); // ⭐ 센터 풀 구성 정보

  const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];

  // 센터 풀 구성 정보 로드
  useEffect(() => {
    const loadPoolConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/center-admin/center-info', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('🏊 센터 정보 응답:', data);
          console.log('🏊 센터 풀 구성 정보:', data.data?.poolConfiguration);
          
          const poolConf = data.data?.poolConfiguration || {
            mainPool: { name: '메인 풀', lanes: 6 },
            kidsPool: { name: '유아 풀', lanes: 3 },
            auxiliaryPool: { name: '보조 풀', lanes: 0 }
          };
          
          setPoolConfig(poolConf);
          console.log('✅ 풀 구성 설정 완료:', poolConf);
        } else {
          console.error('❌ API 응답 에러:', response.status);
          // 기본값 설정
          const defaultConfig = {
            mainPool: { name: '메인 풀', lanes: 6 },
            kidsPool: { name: '유아 풀', lanes: 3 },
            auxiliaryPool: { name: '보조 풀', lanes: 0 }
          };
          setPoolConfig(defaultConfig);
          console.log('⚠️ 기본값 사용:', defaultConfig);
        }
      } catch (error) {
        console.error('💥 센터 정보 로드 실패:', error);
        // 기본값 설정
        const defaultConfig = {
          mainPool: { name: '메인 풀', lanes: 6 },
          kidsPool: { name: '유아 풀', lanes: 3 },
          auxiliaryPool: { name: '보조 풀', lanes: 0 }
        };
        setPoolConfig(defaultConfig);
        console.log('⚠️ 에러 발생 - 기본값 사용:', defaultConfig);
      }
    };
    
    if (isOpen) {
      loadPoolConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    if (course && course._id) {
      // 수정 모드: 기존 데이터 로드
      setFormData({
        ...course,
        price: course.price || 50000, // NaN 방지
        duration: course.duration || 60,
        maxStudents: course.maxStudents || 20
      });
      // 요일 초기화 (쉼표로 구분된 문자열 → 배열)
      const days = course.schedule?.[0]?.dayOfWeek?.split(',').map(d => d.trim()) || ['월'];
      setSelectedDays(days);
      // 레인 및 풀 타입 초기화
      const lanes = course.laneInfo?.assignedLanes || course.lanes || [];
      setSelectedLanes(lanes);
      if (course.poolType) {
        setSelectedPoolType(course.poolType);
      }
    } else if (course && !course._id) {
      // 추가 모드 (초기값 있음): 빈 슬롯 클릭 시
      setFormData({
        name: '',
        description: '',
        level: 'beginner',
        duration: course.duration || 60,
        maxStudents: course.maxStudents || 20,
        currentStudents: 0,
        instructorId: course.instructorId || '',
        instructorName: '',
        price: course.price || 50000,
        schedule: course.schedule || [{ dayOfWeek: '월', startTime: '09:00', endTime: '10:00' }],
        status: 'active',
        tags: course.tags || []
      });
      // 요일 초기화
      const days = course.schedule?.[0]?.dayOfWeek?.split(',').map(d => d.trim()) || ['월'];
      setSelectedDays(days);
      setSelectedLanes([]); // 레인 초기화
    } else {
      // 추가 모드 (초기값 없음): [새 과정 추가] 버튼 클릭 시
      setFormData({
        name: '',
        description: '',
        level: 'beginner',
        duration: 60,
        maxStudents: 20,
        currentStudents: 0,
        instructorId: '',
        instructorName: '',
        price: 50000,
        schedule: [{ dayOfWeek: '월', startTime: '09:00', endTime: '10:00' }],
        status: 'active',
        tags: [],
        lanes: [],
        laneInfo: {
          assignedLanes: [],
          maxLanes: 1,
          laneNotes: ''
        }
      });
      setSelectedDays(['월']);
      setSelectedLanes([]); // 레인 초기화
    }
  }, [course, isOpen]);

  // 요일 선택 토글
  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newDays);
    
    // schedule 업데이트 (요일을 쉼표로 구분하여 저장)
    setFormData({
      ...formData,
      schedule: [{
        ...formData.schedule?.[0],
        dayOfWeek: newDays.join(',')
      } as any]
    });
  };

  // 레인 선택 토글
  const toggleLane = (laneNumber: number) => {
    const newLanes = selectedLanes.includes(laneNumber)
      ? selectedLanes.filter(l => l !== laneNumber)
      : [...selectedLanes, laneNumber].sort((a, b) => a - b);
    
    setSelectedLanes(newLanes);
    
    // formData 업데이트 (poolType도 함께 저장)
    setFormData({
      ...formData,
      poolType: selectedPoolType, // ⭐ 풀 타입 저장
      lanes: newLanes,
      laneInfo: {
        ...formData.laneInfo,
        assignedLanes: newLanes,
        maxLanes: newLanes.length
      }
    });
  };

  // 종료 시간 자동 계산
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // 시작 시간 변경 시 종료 시간 자동 계산
  const handleStartTimeChange = (startTime: string) => {
    const endTime = calculateEndTime(startTime, formData.duration || 60);
    
    setFormData({
      ...formData,
      schedule: [{
        ...formData.schedule?.[0],
        startTime,
        endTime
      } as any]
    });
  };

  // 수업 시간(분) 변경 시 종료 시간 재계산
  const handleDurationChange = (duration: number) => {
    const startTime = formData.schedule?.[0]?.startTime || '09:00';
    const endTime = calculateEndTime(startTime, duration);
    
    setFormData({
      ...formData,
      duration,
      schedule: [{
        ...formData.schedule?.[0],
        endTime
      } as any]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Course);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {course ? '과정 수정' : '새 과정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 과정명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              과정명 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 초급 자유형 클래스"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="과정에 대한 설명을 입력하세요"
            />
          </div>

          {/* 2열 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 급수/레벨 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                급수/레벨 *
              </label>
              
              {!showLevelInput ? (
                <div className="space-y-2">
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setShowLevelInput(true);
                        setFormData({ ...formData, level: '' as any });
                      } else {
                        setFormData({ ...formData, level: e.target.value as any });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">급수 선택</option>
                    {customLevels.length > 0 ? (
                      customLevels.sort((a, b) => a.order - b.order).map((level) => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </>
                    )}
                    <option value="__custom__">➕ 직접 입력...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLevelInput}
                    onChange={(e) => setNewLevelInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newLevelInput.trim()) {
                          setFormData({ ...formData, level: newLevelInput.trim() as any });
                          setShowLevelInput(false);
                          setNewLevelInput('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="급수 입력 (예: 10급, A레벨, 물놀이반)"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newLevelInput.trim()) {
                        setFormData({ ...formData, level: newLevelInput.trim() as any });
                        setShowLevelInput(false);
                        setNewLevelInput('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLevelInput(false);
                      setNewLevelInput('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              )}
              
              {formData.level && !showLevelInput && (
                <p className="text-xs text-blue-600 mt-1">
                  선택된 급수: <strong>
                    {customLevels.find(l => l.id === formData.level)?.name || formData.level}
                  </strong>
                </p>
              )}
            </div>

            {/* 수업시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수업시간 (분) *
              </label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="10"
                step="5"
                placeholder="예: 60, 90, 120"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 입력 시 종료 시간이 자동 계산됩니다
              </p>
            </div>
          </div>

          {/* 2열 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 최대 학생 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최대 학생 수 *
              </label>
              <input
                type="number"
                required
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>

            {/* 가격 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 (원) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* 강사 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              담당 강사 *
            </label>
            
            {/* 강사 종류 필터 */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setInstructorTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  instructorTypeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setInstructorTypeFilter('instructor')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  instructorTypeFilter === 'instructor'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏊 강습 강사
              </button>
              <button
                type="button"
                onClick={() => setInstructorTypeFilter('lifeguard')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  instructorTypeFilter === 'lifeguard'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🛟 안전 요원
              </button>
            </div>
            
            <select
              required
              value={formData.instructorId}
              onChange={(e) => {
                const instructor = instructors.find(i => i._id === e.target.value);
                setFormData({ 
                  ...formData, 
                  instructorId: e.target.value,
                  instructorName: instructor?.name || ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">강사를 선택하세요</option>
              {instructors
                .filter(instructor => {
                  if (instructorTypeFilter === 'all') return true;
                  return instructor.instructorType === instructorTypeFilter;
                })
                .map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          {/* 일정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 일정 *
            </label>
            
            {/* 요일 선택 (버튼) */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">수업 요일 (복수 선택 가능)</p>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                선택된 요일: {selectedDays.length > 0 ? selectedDays.join(', ') : '없음'}
              </p>
            </div>

            {/* 시간 설정 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">시작 시간 *</label>
                <input
                  type="time"
                  required
                  value={formData.schedule?.[0]?.startTime || ''}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  종료 시간 
                  <span className="ml-1 text-blue-600">(자동 계산)</span>
                </label>
                <input
                  type="time"
                  value={formData.schedule?.[0]?.endTime || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  title="시작 시간과 수업 시간(분)을 기반으로 자동 계산됩니다"
                />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ⏰ 종료 시간은 시작 시간 + 수업 시간으로 자동 계산됩니다
            </p>
          </div>

          {/* 과정 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              과정 태그 (분류용)
            </label>
            
            {/* 태그 입력 */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newTag.trim()) {
                      const currentTags = formData.tags || [];
                      if (!currentTags.includes(newTag.trim())) {
                        setFormData({ ...formData, tags: [...currentTags, newTag.trim()] });
                      }
                      setNewTag('');
                    }
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="태그 입력 후 Enter (예: 어린이, 아쿠아, 새벽반)"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTag.trim()) {
                    const currentTags = formData.tags || [];
                    if (!currentTags.includes(newTag.trim())) {
                      setFormData({ ...formData, tags: [...currentTags, newTag.trim()] });
                    }
                    setNewTag('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>

            {/* 추가된 태그 목록 */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          tags: formData.tags?.filter((_, i) => i !== index)
                        });
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              💡 태그를 추가하면 과정 목록 상단에 필터 버튼이 자동 생성됩니다.
            </p>
          </div>

          {/* 레인 배정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏊 풀 및 레인 배정
            </label>
            
            {/* 풀 선택 */}
            {poolConfig ? (
              <div className="mb-4 space-y-2">
                <p className="text-xs text-gray-600 mb-2">풀 선택:</p>
                <div className="flex gap-2">
                  {poolConfig.mainPool && poolConfig.mainPool.lanes > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPoolType('mainPool');
                        setSelectedLanes([]); // 레인 초기화
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPoolType === 'mainPool'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏊 {poolConfig.mainPool.name} ({poolConfig.mainPool.lanes}레인)
                    </button>
                  )}
                  {poolConfig.kidsPool && poolConfig.kidsPool.lanes > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPoolType('kidsPool');
                        setSelectedLanes([]); // 레인 초기화
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPoolType === 'kidsPool'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      👶 {poolConfig.kidsPool.name} ({poolConfig.kidsPool.lanes}레인)
                    </button>
                  )}
                  {poolConfig.auxiliaryPool && poolConfig.auxiliaryPool.lanes > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPoolType('auxiliaryPool');
                        setSelectedLanes([]); // 레인 초기화
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPoolType === 'auxiliaryPool'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏊‍♀️ {poolConfig.auxiliaryPool.name} ({poolConfig.auxiliaryPool.lanes}레인)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                ⏳ 센터 풀 정보 로딩 중...
              </div>
            )}
            
            {/* 레인 선택 - 선택된 풀의 레인 수만큼만 표시 */}
            {poolConfig && poolConfig[selectedPoolType] && poolConfig[selectedPoolType].lanes > 0 ? (
              <>
                <p className="text-xs text-gray-600 mb-2">레인 선택:</p>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {Array.from({ length: poolConfig[selectedPoolType].lanes }, (_, i) => i + 1).map((laneNum) => (
                    <button
                      key={laneNum}
                      type="button"
                      onClick={() => toggleLane(laneNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedLanes.includes(laneNum)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {laneNum}레인
                    </button>
                  ))}
                </div>
              </>
            ) : poolConfig ? (
              <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                ⚠️ 선택된 풀({poolConfig[selectedPoolType]?.name || selectedPoolType})에 레인이 없습니다.
              </div>
            ) : null}

            {/* 선택된 레인 표시 */}
            {selectedLanes.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  ✅ <span className="font-semibold">
                    {poolConfig && poolConfig[selectedPoolType] && poolConfig[selectedPoolType].name}
                  </span>의 <span className="font-semibold">{selectedLanes.join(', ')}레인</span> ({selectedLanes.length}개)
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              💡 풀을 선택하고 레인을 배정하세요. 유아풀이나 보조풀이 있는 경우 센터 시설 관리에서 설정할 수 있습니다.
            </p>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="full">정원마감</option>
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {course ? '수정 완료' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

