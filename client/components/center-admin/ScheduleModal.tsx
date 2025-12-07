/**
 * 스케줄 추가/수정 모달 컴포넌트
 * 
 * 연동 데이터:
 * - 스케줄 타입별 설정 옵션
 * - 강사 목록 (instructor_schedule용)
 * - 풀 타입 설정
 * 
 * 연동 컴포넌트:
 * - client/components/center-admin/ScheduleCalendar.tsx
 * - client/app/center-admin/schedule/page.tsx
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { X, Clock, Users, Settings, AlertCircle } from 'lucide-react';

interface ScheduleItem {
  _id: string;
  type: 'operating_hours' | 'instructor_schedule' | 'group_class' | 'maintenance';
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  instructorId?: string;
  instructorName?: string;
  maxStudents?: number;
  currentStudents?: number;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  status: 'confirmed' | 'tentative' | 'cancelled';
  color: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleData: any) => void;
  editingSchedule?: ScheduleItem | null;
  selectedDate?: string;
  selectedTime?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  selectedDate,
  selectedTime
}: ScheduleModalProps) {
  const [formData, setFormData] = useState<{
    type: 'operating_hours' | 'instructor_schedule' | 'group_class' | 'maintenance';
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    instructorId: string;
    instructorName: string;
    maxStudents: number;
    poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
    status: 'confirmed' | 'tentative' | 'cancelled';
    isRecurring: boolean;
    recurringPattern: 'daily' | 'weekly' | 'monthly';
    notes: string;
  }>({
    type: 'operating_hours',
    title: '',
    description: '',
    date: selectedDate || '',
    startTime: selectedTime || '09:00',
    endTime: selectedTime ? `${String(parseInt(selectedTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00',
    instructorId: '',
    instructorName: '',
    maxStudents: 1,
    poolType: 'mainPool',
    status: 'confirmed',
    isRecurring: false,
    recurringPattern: 'weekly',
    notes: ''
  });

  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        type: editingSchedule.type,
        title: editingSchedule.title,
        description: editingSchedule.description,
        date: editingSchedule.date,
        startTime: editingSchedule.startTime,
        endTime: editingSchedule.endTime,
        instructorId: editingSchedule.instructorId || '',
        instructorName: editingSchedule.instructorName || '',
        maxStudents: editingSchedule.maxStudents || 1,
        poolType: editingSchedule.poolType,
        status: editingSchedule.status,
        isRecurring: editingSchedule.isRecurring,
        recurringPattern: editingSchedule.recurringPattern || 'weekly',
        notes: editingSchedule.notes || ''
      });
    } else {
      setFormData({
        type: 'operating_hours',
        title: '',
        description: '',
        date: selectedDate || '',
        startTime: selectedTime || '09:00',
        endTime: selectedTime ? `${String(parseInt(selectedTime.split(':')[0]) + 1).padStart(2, '0')}:00` : '10:00',
        instructorId: '',
        instructorName: '',
        maxStudents: 1,
        poolType: 'mainPool',
        status: 'confirmed',
        isRecurring: false,
        recurringPattern: 'weekly',
        notes: ''
      });
    }
  }, [editingSchedule, selectedDate, selectedTime]);

  useEffect(() => {
    if (isOpen) {
      loadInstructors();
    }
  }, [isOpen]);

  const loadInstructors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/center-users?userType=instructor&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const instructorList = (data.data?.users || data.users || data.data || data || [])
          .filter((instructor: any) => instructor.instructorInfo?.instructorType === 'instructor')
          .map((instructor: any) => ({
            _id: instructor._id,
            name: instructor.name || instructor.userId || '이름 없음'
          }));
        setInstructors(instructorList);
      }
    } catch (error) {
      logger.error('강사 목록 로드 실패:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (formData.type === 'instructor_schedule' && !formData.instructorId) {
      alert('강사를 선택해주세요.');
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstructorSelect = (instructorId: string) => {
    const instructor = instructors.find(inst => inst._id === instructorId);
    if (instructor) {
      setFormData(prev => ({
        ...prev,
        instructorId: instructor._id,
        instructorName: instructor.name
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {editingSchedule ? '스케줄 수정' : '새 스케줄 추가'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 스케줄 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스케줄 타입
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="operating_hours">운영시간</option>
                <option value="instructor_schedule">강사 스케줄</option>
                <option value="group_class">단체 수업</option>
                <option value="maintenance">점검/정비</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="스케줄 제목을 입력하세요"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="스케줄 설명을 입력하세요"
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시작 시간
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종료 시간
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 강사 선택 (강사 스케줄인 경우) */}
            {formData.type === 'instructor_schedule' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강사 선택 *
                </label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => handleInstructorSelect(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">강사를 선택하세요</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 최대 인원 (단체 수업인 경우) */}
            {formData.type === 'group_class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 인원
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* 풀 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                풀 타입
              </label>
              <select
                value={formData.poolType}
                onChange={(e) => handleInputChange('poolType', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mainPool">메인풀</option>
                <option value="kidsPool">유아풀</option>
                <option value="auxiliaryPool">보조풀</option>
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="confirmed">확정</option>
                <option value="tentative">예정</option>
                <option value="cancelled">취소</option>
              </select>
            </div>

            {/* 반복 설정 */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">반복 설정</span>
              </label>
              {formData.isRecurring && (
                <select
                  value={formData.recurringPattern}
                  onChange={(e) => handleInputChange('recurringPattern', e.target.value)}
                  className="w-full mt-2 border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                </select>
              )}
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="추가 메모를 입력하세요"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingSchedule ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






