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
  level: '초급' | '중급' | '고급' | string;
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
  startDate?: Date; // 수업 시작일
  endDate?: Date; // 수업 종료일 (만료일)
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool'; // ⭐ 풀 타입
  lanes?: number[]; // ⭐ 레인 번호 배열 (예: [1, 2, 3])
  laneInfo?: {
    assignedLanes?: number[];
    maxLanes?: number;
    minLanes?: number;
    laneNotes?: string;
  };
  courseType?: 'group' | 'personal'; // ⭐ 과정 타입 (단체/개인)
  isPersonalLesson?: boolean; // ⭐ 개인레슨 여부
  personalLessonSettings?: {
    timeSlots: Array<{
      id: string;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }>;
    lessonTypes: Array<{
      id?: string;
      type: '1:1' | '1:2' | '1:3' | '1:4' | '1:5';
      maxStudents: number;
      pricePerSession: number;
      monthlyPrice?: number;
    }>;
    frequencyOptions: Array<{
      id?: string;
      type: 'weekly' | 'monthly';
      sessions: number;
      price: number;
      expirationDays?: number;
    }>;
  };
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course?: Course | null;
  instructors?: { _id: string; name: string; userId?: string; instructorType?: 'instructor' | 'lifeguard' }[];
  customLevels?: Array<{ id: string; name: string; description: string; order: number }>;
  onAssignMembers?: (course: Course) => void; // 회원 배정 함수 추가
}

export default function CourseFormModal({
  isOpen,
  onClose,
  onSave,
  course,
  instructors: propInstructors = [],
  customLevels = [],
  onAssignMembers
}: CourseFormModalProps) {
  const [formData, setFormData] = useState<Partial<Course>>({
    name: '',
    description: '',
    level: '초급',
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
      minLanes: 1,
      laneNotes: ''
    },
    courseType: 'group', // ⭐ 기본값: 단체
    isPersonalLesson: false, // ⭐ 기본값: 개인레슨 아님
    startDate: new Date(), // 수업 시작일 (오늘 날짜)
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // 수업 종료일 (한 달 후)
  });

  // ⭐ 직접 입력한 급수들을 로컬 상태로 관리
  const [customInputLevels, setCustomInputLevels] = useState<string[]>([]);

  const [newTag, setNewTag] = useState('');
  const [newLevelInput, setNewLevelInput] = useState('');
  const [showLevelInput, setShowLevelInput] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedLanes, setSelectedLanes] = useState<number[]>([]); // ⭐ 선택된 레인들
  const [instructorTypeFilter, setInstructorTypeFilter] = useState<'all' | 'instructor' | 'lifeguard'>('all'); // ⭐ 강사 종류 필터
  const [selectedPoolType, setSelectedPoolType] = useState<'mainPool' | 'kidsPool' | 'auxiliaryPool'>('mainPool'); // ⭐ 선택된 풀
  const [poolConfig, setPoolConfig] = useState<any>(null); // ⭐ 센터 풀 구성 정보
  const [instructors, setInstructors] = useState<any[]>([]); // ⭐ 강사 목록
  const [loadingInstructors, setLoadingInstructors] = useState(false); // ⭐ 강사 로딩 상태

  const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];

  // 강사 목록 로드
  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/center-admin/instructors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const instructorList = data.data?.instructors || data.data || [];
            setInstructors(Array.isArray(instructorList) ? instructorList : []);
          }
        }
      } catch (error) {
        console.error('강사 목록 로드 오류:', error);
        // API 호출 실패 시 props로 받은 강사 목록 사용
        if (Array.isArray(propInstructors) && propInstructors.length > 0) {
          setInstructors(propInstructors);
        }
      } finally {
        setLoadingInstructors(false);
      }
    };

    if (isOpen) {
      // props로 받은 강사 목록이 있으면 먼저 설정
      if (Array.isArray(propInstructors) && propInstructors.length > 0) {
        setInstructors(propInstructors);
      }
      // API로 최신 강사 목록 로드
      loadInstructors();
    }
  }, [isOpen, propInstructors]);

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
          
          const poolConf = data.data?.poolConfiguration || {
            mainPool: { name: '메인 풀', lanes: 6 },
            kidsPool: { name: '유아 풀', lanes: 3 },
            auxiliaryPool: { name: '보조 풀', lanes: 0 }
          };
          
          setPoolConfig(poolConf);
        } else {
          console.error('❌ API 응답 에러:', response.status);
          // 기본값 설정
          const defaultConfig = {
            mainPool: { name: '메인 풀', lanes: 6 },
            kidsPool: { name: '유아 풀', lanes: 3 },
            auxiliaryPool: { name: '보조 풀', lanes: 0 }
          };
          setPoolConfig(defaultConfig);
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
      }
    };
    
    if (isOpen) {
      loadPoolConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    if (course && course._id) {
      // 수정 모드: 기존 데이터 로드
      const startTime = course.schedule?.[0]?.startTime || '09:00';
      const duration = course.duration || 60;
      const endTime = calculateEndTime(startTime, duration);
      
      setFormData({
        ...course,
        price: course.price || 50000, // NaN 방지
        duration: duration,
        maxStudents: course.maxStudents || 20,
        schedule: [{
          ...course.schedule?.[0],
          startTime: startTime,
          endTime: endTime
        }]
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
      const startTime = '09:00';
      const duration = course.duration || 60;
      const endTime = calculateEndTime(startTime, duration);
      
      setFormData({
        name: '',
        description: '',
        level: '초급',
        duration: duration,
        maxStudents: course.maxStudents || 20,
        currentStudents: 0,
        instructorId: course.instructorId || '',
        instructorName: '',
        price: course.price || 50000,
        schedule: [{ dayOfWeek: '월', startTime: startTime, endTime: endTime }],
        status: 'active',
        tags: course.tags || []
      });
      // 요일 초기화
      const days = course.schedule?.[0]?.dayOfWeek?.split(',').map(d => d.trim()) || ['월'];
      setSelectedDays(days);
      setSelectedLanes([]); // 레인 초기화
    } else {
      // 추가 모드 (초기값 없음): [새 과정 추가] 버튼 클릭 시
      const startTime = '09:00';
      const duration = 60;
      const endTime = calculateEndTime(startTime, duration);
      
      setFormData({
        name: '',
        description: '',
        level: '초급',
        duration: duration,
        maxStudents: 20,
        currentStudents: 0,
        instructorId: '',
        instructorName: '',
        price: 50000,
        schedule: [{ dayOfWeek: '월', startTime: startTime, endTime: endTime }],
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
      poolType: formData.poolType || selectedPoolType, // ⭐ formData의 poolType 우선 사용
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
    
    console.log('🎯 CourseFormModal handleSubmit 시작');
    console.log('📋 formData:', formData);
    console.log('🏊 selectedLanes:', selectedLanes);
    console.log('🏊 selectedPoolType:', selectedPoolType);
    console.log('🏊 formData.laneInfo:', formData.laneInfo);
    
    // 강사 정보 설정
    const selectedInstructor = Array.isArray(instructors) ? instructors.find(i => i._id === formData.instructorId) : null;
    const finalFormData = {
      ...formData,
      instructorName: selectedInstructor?.name || formData.instructorName,
      instructorId: formData.instructorId,
      startDate: formData.startDate || new Date(),
      endDate: formData.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      // ⭐ 레인 정보 추가
      lanes: selectedLanes,
      poolType: selectedPoolType,
      laneInfo: {
        assignedLanes: selectedLanes,
        maxLanes: selectedLanes.length || formData.laneInfo?.maxLanes || 1,
        minLanes: formData.laneInfo?.minLanes || 1,
        laneNotes: formData.laneInfo?.laneNotes || ''
      }
    };
    
    console.log('✅ finalFormData:', finalFormData);
    console.log('🏊 finalFormData.lanes:', finalFormData.lanes);
    console.log('🏊 finalFormData.poolType:', finalFormData.poolType);
    console.log('🏊 finalFormData.laneInfo:', finalFormData.laneInfo);
    
    onSave(finalFormData as Course);
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
          {/* 과정 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              과정 타입 *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="courseType"
                  value="group"
                  checked={formData.courseType === 'group'}
                  onChange={(e) => {
                    const courseType = e.target.value as 'group' | 'personal';
                    setFormData({
                      ...formData,
                      courseType,
                      isPersonalLesson: courseType === 'personal',
                      maxStudents: courseType === 'personal' ? 1 : 20,
                      currentStudents: courseType === 'personal' ? 0 : formData.currentStudents,
                      name: courseType === 'personal' ? '개인 레슨' : formData.name
                    });
                  }}
                  className="mr-2"
                />
                <span className="text-sm">단체 수업</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="courseType"
                  value="personal"
                  checked={formData.courseType === 'personal'}
                  onChange={(e) => {
                    const courseType = e.target.value as 'group' | 'personal';
                    setFormData({
                      ...formData,
                      courseType,
                      isPersonalLesson: courseType === 'personal',
                      maxStudents: courseType === 'personal' ? 1 : 20,
                      currentStudents: courseType === 'personal' ? 0 : formData.currentStudents,
                      name: courseType === 'personal' ? '개인 레슨' : formData.name
                    });
                  }}
                  className="mr-2"
                />
                <span className="text-sm">개인 레슨</span>
              </label>
            </div>
          </div>

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
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formData.isPersonalLesson ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder={formData.isPersonalLesson ? '개인 레슨' : '예: 초급 자유형 클래스'}
              disabled={formData.isPersonalLesson}
            />
            {formData.isPersonalLesson && (
              <p className="text-xs text-blue-600 mt-1">
                💡 개인레슨은 자동으로 '개인 레슨'으로 설정됩니다.
              </p>
            )}
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
                급수/레벨 {formData.isPersonalLesson ? '' : '*'}
              </label>
              
              {formData.isPersonalLesson ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  개인레슨은 급수 선택 불필요
                </div>
              ) : !showLevelInput ? (
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
                        <option value="초급">초급</option>
                        <option value="중급">중급</option>
                        <option value="고급">고급</option>
                      </>
                    )}
                    {/* ⭐ 직접 입력한 급수들 표시 */}
                    {customInputLevels.map((level) => (
                      <option key={level} value={level}>
                        {level} (직접 입력)
                      </option>
                    ))}
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
                          const newLevel = newLevelInput.trim();
                          // ⭐ 직접 입력한 급수를 customInputLevels에 추가
                          if (!customInputLevels.includes(newLevel)) {
                            setCustomInputLevels([...customInputLevels, newLevel]);
                          }
                          setFormData({ ...formData, level: newLevel as any });
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
                        const newLevel = newLevelInput.trim();
                        // ⭐ 직접 입력한 급수를 customInputLevels에 추가
                        if (!customInputLevels.includes(newLevel)) {
                          setCustomInputLevels([...customInputLevels, newLevel]);
                        }
                        setFormData({ ...formData, level: newLevel as any });
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
              
              {!formData.isPersonalLesson && formData.level && !showLevelInput && (
                <p className="text-xs text-blue-600 mt-1">
                  선택된 급수: <strong>
                    {customLevels.find(l => l.id === formData.level)?.name || formData.level}
                  </strong>
                </p>
              )}
            </div>

            {/* 수업 기간 (단체반만) */}
            {!formData.isPersonalLesson && (
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수업 시작일 *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        startDate: new Date(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수업 종료일 (만료일) *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endDate: new Date(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ※ 수업 기간은 학생의 수강 만료일로 사용됩니다.
                </p>
              </div>
            )}

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
                {formData.isPersonalLesson ? '개인레슨 가격 설정' : '가격 (원) *'}
              </label>
              {formData.isPersonalLesson ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">개인레슨은 다양한 형태와 가격 체계를 지원합니다.</p>
                  
                  {/* 레슨 타입별 가격 설정 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">레슨 타입별 가격</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newLessonTypes = formData.personalLessonSettings?.lessonTypes || [];
                          const newLessonType = {
                            id: `lesson_${Date.now()}`,
                            type: '1:1' as '1:1' | '1:2' | '1:3' | '1:4' | '1:5',
                            maxStudents: 1,
                            pricePerSession: 80000
                          };
                          setFormData({
                            ...formData,
                            personalLessonSettings: {
                              ...formData.personalLessonSettings,
                              lessonTypes: [...newLessonTypes, newLessonType]
                            }
                          });
                        }}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        + 추가
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.personalLessonSettings?.lessonTypes || []).map((lessonType, index) => (
                        <div key={lessonType.id || index} className="flex items-center gap-3 p-2 border rounded-lg">
                          <select
                            value={lessonType.type}
                            onChange={(e) => {
                              const newLessonTypes = [...(formData.personalLessonSettings?.lessonTypes || [])];
                              newLessonTypes[index] = {
                                ...lessonType,
                                type: e.target.value as '1:1' | '1:2' | '1:3' | '1:4' | '1:5',
                                maxStudents: parseInt(e.target.value.split(':')[1])
                              };
                              setFormData({
                                ...formData,
                                personalLessonSettings: {
                                  ...formData.personalLessonSettings,
                                  lessonTypes: newLessonTypes
                                }
                              });
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="1:1">1:1</option>
                            <option value="1:2">1:2</option>
                            <option value="1:3">1:3</option>
                            <option value="1:4">1:4</option>
                            <option value="1:5">1:5</option>
                          </select>
                          <input
                            type="number"
                            value={lessonType.pricePerSession || ''}
                            onChange={(e) => {
                              const newLessonTypes = [...(formData.personalLessonSettings?.lessonTypes || [])];
                              newLessonTypes[index] = {
                                ...lessonType,
                                pricePerSession: parseInt(e.target.value) || 0
                              };
                              setFormData({
                                ...formData,
                                personalLessonSettings: {
                                  ...formData.personalLessonSettings,
                                  lessonTypes: newLessonTypes
                                }
                              });
                            }}
                            placeholder="가격 입력"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="1000"
                          />
                          <span className="text-sm text-gray-500">원/회</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLessonTypes = (formData.personalLessonSettings?.lessonTypes || []).filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                personalLessonSettings: {
                                  ...formData.personalLessonSettings,
                                  lessonTypes: newLessonTypes
                                }
                              });
                            }}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                      
                      {(!formData.personalLessonSettings?.lessonTypes || formData.personalLessonSettings.lessonTypes.length === 0) && (
                        <div className="text-center py-2 text-gray-500 text-sm">
                          '+ 추가' 버튼을 클릭하여 레슨 타입을 추가하세요.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 주간/월간 패키지 설정 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">패키지 옵션</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newFrequencyOptions = formData.personalLessonSettings?.frequencyOptions || [];
                          const newFrequencyOption = {
                            id: `package_${Date.now()}`,
                            type: 'weekly' as 'weekly' | 'monthly',
                            sessions: 4,
                            price: 300000,
                            expirationDays: 30
                          };
                          setFormData({
                            ...formData,
                            personalLessonSettings: {
                              ...formData.personalLessonSettings,
                              frequencyOptions: [...newFrequencyOptions, newFrequencyOption]
                            }
                          });
                        }}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        + 추가
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.personalLessonSettings?.frequencyOptions || []).map((packageOption, index) => (
                        <div key={packageOption.id || index} className="p-2 border rounded-lg space-y-2">
                          <div className="flex items-center gap-3">
                            <select
                              value={packageOption.type}
                              onChange={(e) => {
                                const newFrequencyOptions = [...(formData.personalLessonSettings?.frequencyOptions || [])];
                                newFrequencyOptions[index] = {
                                  ...packageOption,
                                  type: e.target.value as 'weekly' | 'monthly'
                                };
                                setFormData({
                                  ...formData,
                                  personalLessonSettings: {
                                    ...formData.personalLessonSettings,
                                    frequencyOptions: newFrequencyOptions
                                  }
                                });
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="weekly">주간</option>
                              <option value="monthly">월간</option>
                            </select>
                            <input
                              type="number"
                              value={packageOption.sessions || ''}
                              onChange={(e) => {
                                const newFrequencyOptions = [...(formData.personalLessonSettings?.frequencyOptions || [])];
                                newFrequencyOptions[index] = {
                                  ...packageOption,
                                  sessions: parseInt(e.target.value) || 0
                                };
                                setFormData({
                                  ...formData,
                                  personalLessonSettings: {
                                    ...formData.personalLessonSettings,
                                    frequencyOptions: newFrequencyOptions
                                  }
                                });
                              }}
                              placeholder="횟수"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                            <span className="text-sm text-gray-500">회</span>
                            <input
                              type="number"
                              value={packageOption.price || ''}
                              onChange={(e) => {
                                const newFrequencyOptions = [...(formData.personalLessonSettings?.frequencyOptions || [])];
                                newFrequencyOptions[index] = {
                                  ...packageOption,
                                  price: parseInt(e.target.value) || 0
                                };
                                setFormData({
                                  ...formData,
                                  personalLessonSettings: {
                                    ...formData.personalLessonSettings,
                                    frequencyOptions: newFrequencyOptions
                                  }
                                });
                              }}
                              placeholder="가격"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              min="0"
                              step="1000"
                            />
                            <span className="text-sm text-gray-500">원</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFrequencyOptions = (formData.personalLessonSettings?.frequencyOptions || []).filter((_, i) => i !== index);
                                setFormData({
                                  ...formData,
                                  personalLessonSettings: {
                                    ...formData.personalLessonSettings,
                                    frequencyOptions: newFrequencyOptions
                                  }
                                });
                              }}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                              삭제
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">사용기한:</label>
                            <input
                              type="number"
                              value={packageOption.expirationDays || ''}
                              onChange={(e) => {
                                const newFrequencyOptions = [...(formData.personalLessonSettings?.frequencyOptions || [])];
                                newFrequencyOptions[index] = {
                                  ...packageOption,
                                  expirationDays: parseInt(e.target.value) || 0
                                };
                                setFormData({
                                  ...formData,
                                  personalLessonSettings: {
                                    ...formData.personalLessonSettings,
                                    frequencyOptions: newFrequencyOptions
                                  }
                                });
                              }}
                              placeholder="30"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="1"
                            />
                            <span className="text-xs text-gray-500">일</span>
                          </div>
                        </div>
                      ))}
                      
                      {(!formData.personalLessonSettings?.frequencyOptions || formData.personalLessonSettings.frequencyOptions.length === 0) && (
                        <div className="text-center py-2 text-gray-500 text-sm">
                          '+ 추가' 버튼을 클릭하여 패키지 옵션을 추가하세요.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1000"
                />
              )}
            </div>
          </div>

          {/* 강사 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.isPersonalLesson ? '개인레슨 담당 강사 (선택사항)' : '담당 강사 *'}
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
              required={!formData.isPersonalLesson}
              value={formData.instructorId}
              onChange={(e) => {
                const instructor = Array.isArray(instructors) ? instructors.find(i => i._id === e.target.value) : null;
                setFormData({ 
                  ...formData, 
                  instructorId: e.target.value,
                  instructorName: instructor?.name || ''
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loadingInstructors}
            >
              <option value="">
                {loadingInstructors ? '강사 목록 로딩 중...' : 
                 formData.isPersonalLesson ? '강사 미배정 (나중에 배정)' : '강사를 선택하세요'}
              </option>
              {Array.isArray(instructors) ? instructors
                .filter(instructor => {
                  if (instructorTypeFilter === 'all') return true;
                  return instructor.instructorInfo?.specialties?.includes(instructorTypeFilter) || 
                         instructor.userType === instructorTypeFilter;
                })
                .map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              )) : []}
            </select>
            
            {formData.isPersonalLesson && (
              <p className="text-xs text-blue-600 mt-1">
                💡 개인레슨은 강사 미배정 상태로 저장 가능하며, 회원 신청 후 관리자가 강사를 배정할 수 있습니다.
              </p>
            )}
          </div>

          {/* 일정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 일정 *
            </label>
            
            {/* 요일 선택 (버튼) */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {formData.isPersonalLesson ? '개인레슨 가능 요일 (모든 요일 선택 가능)' : '수업 요일 (복수 선택 가능)'}
              </p>
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
              {formData.isPersonalLesson && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 개인레슨은 모든 요일에서 가능하며, 회원이 원하는 요일/시간을 선택할 수 있습니다.
                </p>
              )}
            </div>

            {/* 시간 설정 */}
            {formData.isPersonalLesson ? (
              /* 개인레슨: 시간대 추가 기능 (한 시간 단위) */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    개인레슨 가능 시간대 (한 시간 단위)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newTimeSlots = formData.personalLessonSettings?.timeSlots || [];
                      const newSlot = {
                        id: `slot_${Date.now()}`,
                        startTime: '06:00',
                        endTime: '07:00', // 강습시간(60분) 자동 계산
                        isActive: true
                      };
                      setFormData({
                        ...formData,
                        personalLessonSettings: {
                          ...formData.personalLessonSettings,
                          timeSlots: [...newTimeSlots, newSlot]
                        }
                      });
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    + 시간대 추가
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(formData.personalLessonSettings?.timeSlots || []).map((slot, index) => (
                    <div key={slot.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">시작시간:</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => {
                            const startTime = e.target.value;
                            // 강습시간(60분)을 더해서 종료시간 계산
                            const startHour = parseInt(startTime.split(':')[0]);
                            const startMinute = parseInt(startTime.split(':')[1]);
                            const endHour = startHour + 1;
                            const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                            
                            const newTimeSlots = [...(formData.personalLessonSettings?.timeSlots || [])];
                            newTimeSlots[index] = { ...slot, startTime, endTime };
                            setFormData({
                              ...formData,
                              personalLessonSettings: {
                                ...formData.personalLessonSettings,
                                timeSlots: newTimeSlots
                              }
                            });
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-gray-500">~</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          readOnly
                          className="px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50 text-gray-600"
                        />
                        <span className="text-xs text-gray-500">(자동계산)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newTimeSlots = (formData.personalLessonSettings?.timeSlots || []).filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            personalLessonSettings: {
                              ...formData.personalLessonSettings,
                              timeSlots: newTimeSlots
                            }
                          });
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  
                  {(!formData.personalLessonSettings?.timeSlots || formData.personalLessonSettings.timeSlots.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">아직 설정된 시간대가 없습니다.</p>
                      <p className="text-xs mt-1">'+ 시간대 추가' 버튼을 클릭하여 시간대를 추가하세요.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 단체 수업: 고정 시간 */
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
            )}
            <p className="text-xs text-blue-600 mt-1">
              {formData.isPersonalLesson 
                ? '⏰ 개인레슨은 설정된 시간 범위 내에서 회원이 원하는 시간을 선택할 수 있습니다.'
                : '⏰ 종료 시간은 시작 시간 + 수업 시간으로 자동 계산됩니다'
              }
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
                        // formData도 함께 업데이트
                        setFormData({
                          ...formData,
                          poolType: 'mainPool',
                          lanes: [],
                          laneInfo: {
                            ...formData.laneInfo,
                            assignedLanes: [],
                            maxLanes: 0
                          }
                        });
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
                        // formData도 함께 업데이트
                        setFormData({
                          ...formData,
                          poolType: 'kidsPool',
                          lanes: [],
                          laneInfo: {
                            ...formData.laneInfo,
                            assignedLanes: [],
                            maxLanes: 0
                          }
                        });
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
                        // formData도 함께 업데이트
                        setFormData({
                          ...formData,
                          poolType: 'auxiliaryPool',
                          lanes: [],
                          laneInfo: {
                            ...formData.laneInfo,
                            assignedLanes: [],
                            maxLanes: 0
                          }
                        });
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

            {/* 최대/최소 레인 수 설정 (단체 수업만) */}
            {!formData.isPersonalLesson && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최대 레인 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={poolConfig?.[selectedPoolType]?.lanes || 10}
                    value={formData.laneInfo?.maxLanes || selectedLanes.length || 1}
                    onChange={(e) => {
                      const maxLanes = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        laneInfo: {
                          ...formData.laneInfo,
                          maxLanes
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    사용 가능한 최대 레인 수
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최소 레인 수
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.laneInfo?.maxLanes || selectedLanes.length || 1}
                    value={formData.laneInfo?.minLanes || 1}
                    onChange={(e) => {
                      const minLanes = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        laneInfo: {
                          ...formData.laneInfo,
                          minLanes
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    유지해야 할 최소 레인 수
                  </p>
                </div>
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

          {/* 학생 배정 섹션 (과정이 생성된 후에만 표시) */}
          {course && !formData.isPersonalLesson && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">학생 배정</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">
                      현재 배정된 학생: <span className="font-semibold">{course.currentStudents || 0}명</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      최대 정원: {formData.maxStudents}명
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🎯 CourseFormModal 회원 배정 버튼 클릭:', course);
                      if (onAssignMembers && course) {
                        onAssignMembers(course);
                      } else {
                        console.error('❌ onAssignMembers 함수가 전달되지 않았습니다.');
                        alert('회원 배정 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    학생 배정
                  </button>
                </div>
              </div>

              {/* 배정된 학생 목록 */}
              {course.enrolledStudents && course.enrolledStudents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">배정된 학생 목록</h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {course.enrolledStudents.map((student: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.studentName || `학생 ${index + 1}`}</p>
                          <p className="text-xs text-gray-500">
                            배정일: {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '미설정'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.status === 'active' ? '활성' : student.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

