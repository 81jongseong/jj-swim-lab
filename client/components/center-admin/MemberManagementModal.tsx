import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, AlertCircle, GraduationCap, Target, MessageSquare, Users, Plus, Trash2, Edit, BookOpen } from 'lucide-react';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  status: string;
  joinedAt: string;
  currentLevel?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  medicalConditionsVisible?: boolean; // 회원이 설정한 의료정보 노출여부
  swimmingGoals?: string[];
  centerMemo?: string;
  centerMemos?: Array<{
    _id: string;
    content: string;
    type: 'info' | 'warning' | 'complaint' | 'special';
    createdAt: string;
    createdByName: string;
  }>;
  currentCourses?: Array<{
    courseId: string;
    courseName: string;
    courseType: string;
    instructorName: string;
    startDate: string;
    endDate: string;
    status: string;
    remainingSessions: number;
    totalSessions: number;
  }>;
  personalLessons?: Array<{
    lessonId: string;
    lessonType: string;
    instructorName: string;
    startDate: string;
    endDate: string;
    status: string;
    remainingSessions: number;
    totalSessions: number;
  }>;
  notes?: string;
  membershipType?: string;
}

interface Course {
  _id: string;
  name: string;
  level: string;
  instructorName?: string;
  schedule?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  courses: Course[];
  onSave: (memberId: string, updatedData: Partial<Member>) => Promise<void>;
  onUpdateMemo: (memberId: string, memo: string, memoType: 'info' | 'warning' | 'complaint' | 'special') => Promise<void>;
  onDeleteMemo: (memberId: string, memoId: string) => Promise<void>;
  onAssignCourse: (memberId: string, courseId: string) => Promise<void>;
  onUnassignCourse?: (memberId: string, courseId: string) => Promise<void>;
}

export default function MemberManagementModal({
  isOpen,
  onClose,
  member,
  courses,
  onSave,
  onUpdateMemo,
  onDeleteMemo,
  onAssignCourse,
  onUnassignCourse,
}: MemberManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'course'>('info');
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState<'info' | 'warning' | 'complaint' | 'special'>('info');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [editMemoContent, setEditMemoContent] = useState('');
  const [editMemoType, setEditMemoType] = useState<'info' | 'warning' | 'complaint' | 'special'>('info');

  useEffect(() => {
    if (member) {
      setFormData({
        status: member.status,
        currentLevel: member.currentLevel,
        emergencyContact: member.emergencyContact,
        medicalConditions: member.medicalConditions,
        swimmingGoals: member.swimmingGoals,
        centerMemo: member.centerMemo,
        membershipType: member.membershipType,
        notes: member.notes,
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSaveMember = async () => {
    if (!member?._id) return;
    setIsLoading(true);
    try {
      await onSave(member._id, formData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemo = async () => {
    if (!member?._id || !memo.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onUpdateMemo(member._id, memo, memoType);
      setMemo('');
      setMemoType('info');
      
      // 메모 저장 후 즉시 메모 이력 업데이트
      if (member.centerMemos) {
        member.centerMemos.push({
          _id: Date.now().toString(), // 임시 ID
          content: memo,
          type: memoType,
          createdAt: new Date().toISOString(),
          createdByName: '센터 관리자'
        });
      }
    } catch (error) {
      logger.error('메모 업데이트 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMemo = async (memoId: string) => {
    if (!member?._id) return;
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      setIsLoading(true);
      try {
        await onDeleteMemo(member._id, memoId);
        
        // 메모 삭제 후 즉시 메모 이력에서 제거
        if (member.centerMemos) {
          member.centerMemos = member.centerMemos.filter(memo => memo._id !== memoId);
        }
      } catch (error) {
        logger.error('메모 삭제 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartEditMemo = (memoItem: any) => {
    setEditingMemo(memoItem._id);
    setEditMemoContent(memoItem.content);
    setEditMemoType(memoItem.type);
  };

  const handleCancelEditMemo = () => {
    setEditingMemo(null);
    setEditMemoContent('');
    setEditMemoType('info');
  };

  const handleSaveEditMemo = async () => {
    if (!member?._id || !editingMemo || !editMemoContent.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      // 메모 수정 API 호출 (서버에서 구현 필요)
      const response = await fetch(`/api/center-admin/members/${member._id}/memo/${editingMemo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editMemoContent,
          type: editMemoType,
        }),
      });

      if (response.ok) {
        // 메모 수정 후 즉시 메모 이력 업데이트
        if (member.centerMemos) {
          const memoIndex = member.centerMemos.findIndex(memo => memo._id === editingMemo);
          if (memoIndex !== -1) {
            member.centerMemos[memoIndex] = {
              ...member.centerMemos[memoIndex],
              content: editMemoContent,
              type: editMemoType,
            };
          }
        }
        
        setEditingMemo(null);
        setEditMemoContent('');
        setEditMemoType('info');
      }
    } catch (error) {
      logger.error('메모 수정 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCourse = async () => {
    if (!member?._id || !selectedCourse) {
      return;
    }
    setIsLoading(true);
    try {
      await onAssignCourse(member._id, selectedCourse);
      setSelectedCourse('');
    } catch (error) {
      logger.error('과정 배정 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemoTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'complaint': return '📢';
      case 'special': return '⭐';
      default: return 'ℹ️';
    }
  };

  const getMemoTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-red-100 text-red-800';
      case 'complaint': return 'bg-orange-100 text-orange-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            👤 {member.name} 회원 관리
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('info')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="h-5 w-5 inline-block mr-2" /> 회원 관리
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'course'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-5 w-5 inline-block mr-2" /> 과정 배정
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* 기본 정보 (읽기 전용) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 기본 정보 (읽기 전용)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <p className="text-sm text-gray-900">{member.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                    <p className="text-sm text-gray-900">{member.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                    <p className="text-sm text-gray-900">{member.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                    <p className="text-sm text-gray-900">{new Date(member.joinedAt).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              </div>

              {/* 회원 정보 (읽기 전용) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">👤 회원 정보 (읽기 전용)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">수영 목표</label>
                    <p className="text-sm text-gray-900">{(member.swimmingGoals || []).join(', ') || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">응급 연락처</label>
                    <p className="text-sm text-gray-900">{member.emergencyContact || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">의료 정보</label>
                    <p className="text-sm text-gray-900">{member.medicalConditions || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회원 유형</label>
                    <p className="text-sm text-gray-900">
                      {member.membershipType === 'regular' ? '일반' :
                       member.membershipType === 'vip' ? 'VIP' :
                       member.membershipType === 'family' ? '가족' : '일반'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 센터 관리 가능 정보 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ 센터 관리 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">회원 상태</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          formData.status === 'active'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        활성
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          formData.status === 'inactive'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        비활성
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, status: 'suspended' }))}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          formData.status === 'suspended'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        정지
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 레벨</label>
                    <input
                      type="text"
                      value={formData.currentLevel || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="회원의 현재 수영 레벨을 입력하세요"
                    />
                  </div>
                </div>
              </div>

              {/* 메모 관리 */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 메모 관리</h3>
                
                {/* 새 메모 작성 */}
                <div className="bg-white border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="space-y-3">
                    <select
                      value={memoType}
                      onChange={(e) => setMemoType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="info">ℹ️ 일반 정보</option>
                      <option value="warning">⚠️ 경고</option>
                      <option value="complaint">📢 민원</option>
                      <option value="special">⭐ 특이사항</option>
                    </select>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="메모를 입력하세요..."
                    />
                    <button
                      onClick={handleUpdateMemo}
                      disabled={isLoading || !memo.trim()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {isLoading ? '저장 중...' : '메모 저장'}
                    </button>
                  </div>
                </div>
                
                {/* 메모 이력 */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {member.centerMemos && member.centerMemos.length > 0 ? (
                    member.centerMemos.map((memoItem) => (
                      <div key={memoItem._id} className="bg-white border border-gray-200 rounded-lg p-3">
                        {editingMemo === memoItem._id ? (
                          // 메모 수정 모드
                          <div className="space-y-3">
                            <select
                              value={editMemoType}
                              onChange={(e) => setEditMemoType(e.target.value as any)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                            >
                              <option value="info">ℹ️ 일반 정보</option>
                              <option value="warning">⚠️ 경고</option>
                              <option value="complaint">📢 민원</option>
                              <option value="special">⭐ 특이사항</option>
                            </select>
                            <textarea
                              value={editMemoContent}
                              onChange={(e) => setEditMemoContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEditMemo}
                                disabled={isLoading || !editMemoContent.trim()}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                              >
                                {isLoading ? '저장 중...' : '저장'}
                              </button>
                              <button
                                onClick={handleCancelEditMemo}
                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 메모 표시 모드
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getMemoTypeColor(memoItem.type)}`}>
                                {getMemoTypeIcon(memoItem.type)} {memoItem.type === 'info' ? '일반' :
                                 memoItem.type === 'warning' ? '경고' :
                                 memoItem.type === 'complaint' ? '민원' :
                                 memoItem.type === 'special' ? '특이' : '일반'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(memoItem.createdAt).toLocaleString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{memoItem.content}</p>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">작성자: {memoItem.createdByName}</p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleStartEditMemo(memoItem)}
                                  className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50"
                                >
                                  <Edit className="h-3 w-3 inline mr-1" /> 수정
                                </button>
                                <button
                                  onClick={() => handleDeleteMemo(memoItem._id)}
                                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 inline mr-1" /> 삭제
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">작성된 메모가 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 현재 수강 정보 (읽기 전용) */}
              {(member.currentCourses && member.currentCourses.length > 0) || (member.personalLessons && member.personalLessons.length > 0) ? (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 현재 수강 중인 과정</h3>
                  <div className="space-y-3">
                    {member.currentCourses?.map((course, index) => (
                      <div key={`group-${index}`} className="bg-white border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-green-900">{course.courseName} ({course.courseType === 'group' ? '단체반' : '개인레슨'})</p>
                            <p className="text-sm text-green-600">강사: {course.instructorName}</p>
                            <p className="text-sm text-green-500">기간: {new Date(course.startDate).toLocaleDateString()} ~ {new Date(course.endDate).toLocaleDateString()}</p>
                            <p className="text-sm text-green-500">남은 횟수: {course.remainingSessions}/{course.totalSessions}회</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(course.status)}`}>
                              {course.status === 'active' ? '진행중' : course.status === 'completed' ? '완료' : '취소'}
                            </span>
                            {course.status === 'active' && course.courseId && onUnassignCourse && (
                              <button
                                onClick={() => onUnassignCourse(member._id, course.courseId)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="배정 취소"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {member.personalLessons?.map((lesson, index) => (
                      <div key={`personal-${index}`} className="bg-white border border-purple-200 rounded-lg p-3">
                        <p className="font-medium text-purple-900">개인레슨 ({lesson.lessonType})</p>
                        <p className="text-sm text-purple-600">강사: {lesson.instructorName}</p>
                        <p className="text-sm text-purple-500">남은 횟수: {lesson.remainingSessions}/{lesson.totalSessions}회</p>
                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(lesson.status)}`}>
                          {lesson.status === 'active' ? '진행중' : lesson.status === 'completed' ? '완료' : '취소'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                  <p>현재 수강 중인 과정이 없습니다.</p>
                </div>
              )}

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveMember}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '정보 저장'}
                </button>
              </div>
            </div>
          )}


          {activeTab === 'course' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">현재 수강 중인 과정</h4>
                {member.currentCourses && member.currentCourses.length > 0 ? (
                  <div className="space-y-2">
                    {member.currentCourses.map((course, index) => (
                      <div key={index} className="bg-white rounded p-2">
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-gray-600">
                          {course.courseType === 'group' ? '단체반' : '개인레슨'} | {course.instructorName}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">현재 수강 중인 과정이 없습니다.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">새 과정 배정</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">과정을 선택하세요</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.level}) - {course.instructorName || '미배정'}
                      {course.schedule && course.schedule.length > 0 && (
                        ` - ${course.schedule[0].dayOfWeek} ${course.schedule[0].startTime}-${course.schedule[0].endTime}`
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleAssignCourse}
                  disabled={isLoading || !selectedCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? '배정 중...' : '배정하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}