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
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'full';
  tags?: string[]; // 과정 태그 (어린이, 아쿠아 등)
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course?: Course | null;
  instructors?: { _id: string; name: string }[];
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
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [newLevelInput, setNewLevelInput] = useState('');
  const [showLevelInput, setShowLevelInput] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
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
        status: 'active'
      });
    }
  }, [course, isOpen]);

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
                  선택된 급수: <strong>{formData.level}</strong>
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
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="30"
                step="30"
              />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              담당 강사 *
            </label>
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
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name}
                </option>
              ))}
            </select>
          </div>

          {/* 일정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              수업 일정
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.schedule?.[0]?.dayOfWeek || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: [{
                    ...formData.schedule?.[0],
                    dayOfWeek: e.target.value
                  } as any]
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="요일 (예: 월,수,금)"
              />
              <input
                type="time"
                value={formData.schedule?.[0]?.startTime || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: [{
                    ...formData.schedule?.[0],
                    startTime: e.target.value
                  } as any]
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={formData.schedule?.[0]?.endTime || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: [{
                    ...formData.schedule?.[0],
                    endTime: e.target.value
                  } as any]
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
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

