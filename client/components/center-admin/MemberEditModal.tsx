import { logger } from '@/lib/logger';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { User, Mail, Phone, Calendar, MapPin, AlertCircle, GraduationCap, Target } from 'lucide-react';

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
  swimmingGoals?: string[];
  centerMemo?: string;
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
  membershipType?: string;
  notes?: string;
}

interface MemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (memberId: string, updatedData: Partial<Member>) => Promise<void>;
}

export default function MemberEditModal({ isOpen, onClose, member, onSave }: MemberEditModalProps) {
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        status: member.status,
        currentLevel: member.currentLevel || '',
        emergencyContact: member.emergencyContact || '',
        medicalConditions: member.medicalConditions || '',
        swimmingGoals: member.swimmingGoals || [],
        centerMemo: member.centerMemo || '',
        membershipType: member.membershipType || 'regular',
        notes: member.notes || ''
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setIsLoading(true);
    try {
      await onSave(member._id, formData);
      onClose();
    } catch (error) {
      logger.error('회원 정보 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Member, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwimmingGoalsChange = (goals: string) => {
    const goalsArray = goals.split(',').map(goal => goal.trim()).filter(goal => goal);
    handleInputChange('swimmingGoals', goalsArray);
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            ✏️ {member.name} 회원 정보 수정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            기본 정보
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </select>
            </div>
          </div>
        </div>

        {/* 수영 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            수영 정보
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">현재 레벨</label>
              <input
                type="text"
                value={formData.currentLevel || ''}
                onChange={(e) => handleInputChange('currentLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="예: 초급, 중급, 고급"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">회원 유형</label>
              <select
                value={formData.membershipType || 'regular'}
                onChange={(e) => handleInputChange('membershipType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="regular">일반 회원</option>
                <option value="premium">프리미엄 회원</option>
                <option value="vip">VIP 회원</option>
                <option value="student">학생 할인</option>
                <option value="senior">시니어 할인</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수영 목표</label>
            <input
              type="text"
              value={formData.swimmingGoals?.join(', ') || ''}
              onChange={(e) => handleSwimmingGoalsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="예: 자유형 마스터, 생존수영, 건강관리"
            />
            <p className="text-xs text-gray-500 mt-1">쉼표로 구분하여 입력하세요</p>
          </div>
        </div>

        {/* 응급 연락처 및 의료 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            응급 연락처 및 의료 정보
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">응급 연락처</label>
            <input
              type="text"
              value={formData.emergencyContact || ''}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="예: 010-1234-5678 (가족)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">의료 정보</label>
            <textarea
              value={formData.medicalConditions || ''}
              onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              placeholder="알레르기, 만성질환, 주의사항 등을 입력하세요"
            />
          </div>
        </div>

        {/* 메모 및 기타 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            메모 및 기타 정보
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">센터 메모</label>
            <textarea
              value={formData.centerMemo || ''}
              onChange={(e) => handleInputChange('centerMemo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              placeholder="회원에 대한 특이사항이나 주의사항을 입력하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기타 메모</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
              placeholder="기타 참고사항을 입력하세요"
            />
          </div>
        </div>

        {/* 현재 수강 정보 (읽기 전용) */}
        {member.currentCourses && member.currentCourses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              현재 수강 중인 과정
            </h3>
            
            <div className="space-y-2">
              {member.currentCourses.map((course, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-900">{course.courseName}</p>
                      <p className="text-sm text-blue-600">
                        {course.courseType === 'group' ? '단체반' : '개인레슨'} | {course.instructorName}
                      </p>
                      <p className="text-sm text-blue-500">
                        {course.remainingSessions}/{course.totalSessions}회 남음
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      course.status === 'active' ? 'bg-green-100 text-green-800' :
                      course.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.status === 'active' ? '진행중' :
                       course.status === 'completed' ? '완료' : '취소'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
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
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
