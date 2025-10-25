/**
 * PT 수업 진행 및 완료 관리 컴포넌트
 * 헬스 PT 관리 시스템 스타일로 수업 진행 상황을 관리합니다.
 * 
 * 연동 데이터: 수업 일정, 수강생 정보, 패키지 정보, 수업 진행 기록
 * 연동 파일: InstructorStudentManagement.tsx, PersonalLesson.ts, CenterSchedule.ts
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play,
  Pause,
  Stop,
  Edit,
  MessageSquare,
  Star,
  Package,
  DollarSign
} from 'lucide-react';

interface Lesson {
  _id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  instructorId: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  lessonType: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'private' | 'group';
  level: string;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  laneNumber: number;
  packageInfo?: {
    name: string;
    remainingSessions: number;
    expirationDate: string;
  };
  progress?: {
    attendanceTime?: string;
    completionTime?: string;
    duration: number;
    notes: string;
    skills: string[];
    improvement: string;
    nextGoals: string[];
    rating: number;
  };
  payment: {
    amount: number;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
  };
}

interface PTLessonProgressProps {
  instructorId: string;
  selectedDate: string;
  onClose: () => void;
}

export default function PTLessonProgress({ 
  instructorId, 
  selectedDate,
  onClose 
}: PTLessonProgressProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessonDetail, setShowLessonDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'personal-settings'>('lessons');
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressForm, setProgressForm] = useState({
    notes: '',
    skills: [] as string[],
    improvement: '',
    nextGoals: [] as string[],
    rating: 5
  });

  useEffect(() => {
    fetchLessons();
  }, [instructorId, selectedDate]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructors/${instructorId}/lessons?date=${selectedDate}`);
      const data = await response.json();
      
      if (data.success) {
        setLessons(data.data);
      }
    } catch (error) {
      console.error('수업 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLessonStatus = async (lessonId: string, status: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchLessons();
      }
    } catch (error) {
      console.error('수업 상태 업데이트 실패:', error);
    }
  };

  const saveProgress = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressForm)
      });

      if (response.ok) {
        setEditingProgress(false);
        setShowLessonDetail(false);
        fetchLessons();
      }
    } catch (error) {
      console.error('진행 상황 저장 실패:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: '예정' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Play, text: '진행중' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: '완료' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: '취소' },
      no_show: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: '무단결석' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  const getPoolName = (poolType: string) => {
    const poolNames = {
      mainPool: '메인풀',
      kidsPool: '유아풀',
      auxiliaryPool: '보조풀'
    };
    return poolNames[poolType as keyof typeof poolNames];
  };

  const getLessonTypeName = (lessonType: string) => {
    const typeNames = {
      freestyle: '자유형',
      backstroke: '배영',
      breaststroke: '평영',
      butterfly: '접영',
      private: '개인레슨',
      group: '그룹레슨'
    };
    return typeNames[lessonType as keyof typeof typeNames];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">수업 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                PT 수업 관리 - {new Date(selectedDate).toLocaleDateString()}
              </h2>
              <p className="text-sm text-gray-600">
                총 {lessons.length}개의 수업 예정
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('lessons')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lessons'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                수업 관리
              </button>
              <button
                onClick={() => setActiveTab('personal-settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personal-settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                개인강습 설정
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'lessons' ? (
            <div className="space-y-4">
              {lessons.map((lesson) => (
              <div key={lesson._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {getTimeSlot(lesson.startTime)} - {getTimeSlot(lesson.endTime)}
                      </span>
                    </div>
                    {getStatusBadge(lesson.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {lesson.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => updateLessonStatus(lesson._id, 'in_progress')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          시작
                        </button>
                        <button
                          onClick={() => updateLessonStatus(lesson._id, 'cancelled')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          취소
                        </button>
                      </>
                    )}
                    {lesson.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowLessonDetail(true);
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          완료
                        </button>
                        <button
                          onClick={() => updateLessonStatus(lesson._id, 'no_show')}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          무단결석
                        </button>
                      </>
                    )}
                    {lesson.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setShowLessonDetail(true);
                        }}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 flex items-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        상세보기
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium">{lesson.studentName}</p>
                      <p className="text-xs text-gray-600">{lesson.studentPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">수업 종류:</span>
                    <span className="text-sm font-medium">{getLessonTypeName(lesson.lessonType)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">수준:</span>
                    <span className="text-sm font-medium">{lesson.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">풀/레인:</span>
                    <span className="text-sm font-medium">{getPoolName(lesson.poolType)} {lesson.laneNumber}레인</span>
                  </div>
                </div>

                {lesson.packageInfo && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{lesson.packageInfo.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>잔여: {lesson.packageInfo.remainingSessions}회</span>
                        <span>만료: {new Date(lesson.packageInfo.expirationDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {lesson.progress && lesson.status === 'completed' && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">수업 완료</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{lesson.progress.rating}/5</span>
                      </div>
                    </div>
                    {lesson.progress.notes && (
                      <p className="text-xs text-gray-600 mt-2">{lesson.progress.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">해당 날짜에 예정된 수업이 없습니다.</p>
              </div>
            )}
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">개인강습 설정</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  개인강습 설정은 수강생 관리 탭에서 관리할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 수업 상세 모달 */}
        {showLessonDetail && selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">수업 진행 기록</h3>
                  <button
                    onClick={() => setShowLessonDetail(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {editingProgress ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수업 내용 및 피드백
                      </label>
                      <textarea
                        value={progressForm.notes}
                        onChange={(e) => setProgressForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full border rounded-lg p-3"
                        rows={4}
                        placeholder="수업 진행 내용, 수강생의 진전 상황, 개선점 등을 기록해주세요."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        향상된 기술
                      </label>
                      <textarea
                        value={progressForm.improvement}
                        onChange={(e) => setProgressForm(prev => ({ ...prev, improvement: e.target.value }))}
                        className="w-full border rounded-lg p-3"
                        rows={2}
                        placeholder="이번 수업에서 향상된 기술이나 능력을 기록해주세요."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        다음 목표
                      </label>
                      <textarea
                        value={progressForm.nextGoals.join(', ')}
                        onChange={(e) => setProgressForm(prev => ({ 
                          ...prev, 
                          nextGoals: e.target.value.split(',').map(goal => goal.trim()).filter(goal => goal)
                        }))}
                        className="w-full border rounded-lg p-3"
                        rows={2}
                        placeholder="다음 수업에서 목표로 할 기술들을 쉼표로 구분하여 입력해주세요."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수업 만족도 (1-5점)
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setProgressForm(prev => ({ ...prev, rating }))}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              progressForm.rating >= rating 
                                ? 'bg-yellow-400 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setEditingProgress(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => saveProgress(selectedLesson._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">수강생</p>
                        <p className="font-medium">{selectedLesson.studentName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">수업 시간</p>
                        <p className="font-medium">
                          {getTimeSlot(selectedLesson.startTime)} - {getTimeSlot(selectedLesson.endTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">수업 종류</p>
                        <p className="font-medium">{getLessonTypeName(selectedLesson.lessonType)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">수준</p>
                        <p className="font-medium">{selectedLesson.level}</p>
                      </div>
                    </div>

                    {selectedLesson.progress && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">수업 진행 기록</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600">수업 내용</p>
                            <p className="text-sm">{selectedLesson.progress.notes}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">향상된 기술</p>
                            <p className="text-sm">{selectedLesson.progress.improvement}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">다음 목표</p>
                            <p className="text-sm">{selectedLesson.progress.nextGoals.join(', ')}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">만족도:</p>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  className={`w-4 h-4 ${
                                    rating <= selectedLesson.progress!.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      {selectedLesson.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setEditingProgress(true);
                            setProgressForm({
                              notes: selectedLesson.progress?.notes || '',
                              skills: selectedLesson.progress?.skills || [],
                              improvement: selectedLesson.progress?.improvement || '',
                              nextGoals: selectedLesson.progress?.nextGoals || [],
                              rating: selectedLesson.progress?.rating || 5
                            });
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          수업 완료 처리
                        </button>
                      )}
                      <button
                        onClick={() => setShowLessonDetail(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


