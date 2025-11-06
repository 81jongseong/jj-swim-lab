/**
 * 센터 운영 스케줄 설정 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자: 센터 운영 스케줄 관리
 * - 외부 회원: 개인레슨 요청 (장소 섭외 포함)
 * 
 * 연동 컴포넌트:
 * - client/components/center-admin/ScheduleCalendar.tsx (스케줄 캘린더)
 * - client/components/center-admin/ScheduleList.tsx (스케줄 목록)
 * - client/components/center-admin/ScheduleModal.tsx (스케줄 추가/수정 모달)
 * - client/components/center-admin/ExternalPersonalLessonRequestModal.tsx (외부 회원 개인레슨 요청 모달)
 * 
 * 연동 데이터:
 * - 센터 운영 시간, 강사별 스케줄, 단체 수업 시간표
 * - GET /api/centers/public - 센터 목록 조회
 * - POST /api/personal-lessons/external-request - 외부 회원 개인레슨 요청
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Calendar, List, Plus, Clock, Users, Settings, UserPlus } from 'lucide-react';
import ScheduleCalendar from '@/components/center-admin/ScheduleCalendar';
import ScheduleModal from '@/components/center-admin/ScheduleModal';
import ExternalPersonalLessonRequestModal from '@/components/center-admin/ExternalPersonalLessonRequestModal';

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
  dayOfWeek?: string;
}

interface CenterSchedule {
  _id: string;
  centerId: string;
  operatingHours: {
    weekday: { startTime: string; endTime: string; isEnabled: boolean };
    weekend: { startTime: string; endTime: string; isEnabled: boolean };
    holiday: { startTime: string; endTime: string; isEnabled: boolean };
  };
  instructorSchedules: any[];
  groupClassSchedules: any[];
  maintenanceSchedules: any[];
}

function CenterScheduleManagement() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [centerSchedule, setCenterSchedule] = useState<CenterSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  // 권한 확인 - 센터 관리자 또는 외부 회원(학생) 모두 접근 가능
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  const isExternalMember = user && user.userType === 'student' && !user.centerId;
  
  // 센터 관리자도 아니고 외부 회원도 아니면 접근 불가
  if (!isCenterAdmin && !isExternalMember) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExternalRequestModal, setShowExternalRequestModal] = useState(false); // ⭐ 외부 회원 개인레슨 요청 모달
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 🔍 디버깅: 컴포넌트 렌더링 확인
  console.log('🚀🚀🚀 센터 운영 스케줄 설정 페이지 렌더링 시작! 🚀🚀🚀');
  console.log('🔍 CenterScheduleManagement 렌더링:', {
    user: user ? '로그인됨' : '로그인 안됨',
    loading,
    viewMode,
    schedulesCount: schedules.length,
    filteredSchedulesCount: schedules.filter(schedule => {
      const typeMatch = filterType === 'all' || schedule.type === filterType;
      const statusMatch = filterStatus === 'all' || schedule.status === filterStatus;
      return typeMatch && statusMatch;
    }).length
  });

  useEffect(() => {
    console.log('🔍 CenterScheduleManagement useEffect 실행:', { user: !!user });
    if (user) {
      console.log('🔍 사용자 로그인됨 - 데이터 로딩 시작');
      loadSchedules();
      loadCenterSchedule();
    } else {
      console.log('❌ 사용자 로그인 안됨');
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/center-admin/schedules');
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.data);
      } else {
        // 테스트용 임시 데이터
        console.log('⚠️ API에서 데이터를 가져올 수 없어 임시 데이터를 사용합니다.');
        const tempSchedules: ScheduleItem[] = [
          {
            _id: '1',
            type: 'operating_hours',
            title: '센터 운영시간',
            description: '평일 운영시간',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '22:00',
            poolType: 'mainPool',
            status: 'confirmed',
            color: '#10B981',
            isRecurring: true,
            recurringPattern: 'weekly'
          },
          {
            _id: '2',
            type: 'instructor_schedule',
            title: '김강사 개인레슨',
            description: '개인레슨 시간',
            date: new Date().toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '11:00',
            instructorId: 'instructor1',
            instructorName: '김강사',
            poolType: 'mainPool',
            status: 'confirmed',
            color: '#3B82F6',
            isRecurring: false
          }
        ];
        setSchedules(tempSchedules);
      }
    } catch (error) {
      console.error('스케줄 데이터 로드 실패:', error);
      // 에러 시에도 테스트 데이터 사용
      const tempSchedules: ScheduleItem[] = [
        {
          _id: '1',
          type: 'operating_hours',
          title: '센터 운영시간',
          description: '평일 운영시간',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '22:00',
          poolType: 'mainPool',
          status: 'confirmed',
          color: '#10B981',
          isRecurring: true,
          recurringPattern: 'weekly'
        }
      ];
      setSchedules(tempSchedules);
    } finally {
      setLoading(false);
    }
  };

  const loadCenterSchedule = async () => {
    try {
      const response = await fetch('/api/center-admin/center-schedule');
      const data = await response.json();
      
      if (data.success) {
        setCenterSchedule(data.data);
      }
    } catch (error) {
      console.error('센터 스케줄 데이터 로드 실패:', error);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (scheduleData: any) => {
    try {
      const url = editingSchedule ? `/api/center-admin/schedules/${editingSchedule._id}` : '/api/center-admin/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        await loadSchedules();
        setShowScheduleModal(false);
        setEditingSchedule(null);
      }
    } catch (error) {
      console.error('스케줄 저장 실패:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/center-admin/schedules/${scheduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadSchedules();
      }
    } catch (error) {
      console.error('스케줄 삭제 실패:', error);
    }
  };

  // ⭐ 외부 회원 개인레슨 요청 처리
  const handleExternalRequest = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/personal-lessons/external-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert('개인레슨 요청이 완료되었습니다. 센터 승인을 기다려주세요.');
        setShowExternalRequestModal(false);
        // 필요시 스케줄 목록 새로고침
        if (isCenterAdmin) {
          await loadSchedules();
        }
      } else {
        alert(result.message || '개인레슨 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('외부 회원 개인레슨 요청 실패:', error);
      alert('개인레슨 요청 중 오류가 발생했습니다.');
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const typeMatch = filterType === 'all' || schedule.type === filterType;
    const statusMatch = filterStatus === 'all' || schedule.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (loading) {
    console.log('⏳ 센터 운영 스케줄 설정 페이지 로딩 중...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">센터 운영 스케줄 설정 페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 센터 운영 스케줄 설정 페이지 렌더링 완료!');
  
  return (
    <div className="container mx-auto p-6">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              센터 운영 스케줄 관리 📅
            </h1>
            <p className="text-gray-600">센터 운영 시간, 강사 스케줄, 단체 수업을 통합 관리하세요</p>
            <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
              ✅ 센터 운영 스케줄 설정 페이지가 로드되었습니다!
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isExternalMember && (
              <button
                onClick={() => setShowExternalRequestModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                개인레슨 요청
              </button>
            )}
            {isCenterAdmin && (
              <button
                onClick={handleAddSchedule}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                스케줄 추가
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                console.log('🔍 캘린더 뷰 버튼 클릭됨');
                setViewMode('calendar');
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              캘린더 뷰
            </button>
            <button
              onClick={() => {
                console.log('🔍 목록 뷰 버튼 클릭됨');
                setViewMode('list');
              }}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              목록 뷰
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">전체 타입</option>
            <option value="operating_hours">운영 시간</option>
            <option value="instructor_schedule">강사 스케줄</option>
            <option value="group_class">단체 수업</option>
            <option value="maintenance">점검/정비</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="confirmed">확정</option>
            <option value="tentative">예정</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      {/* 센터 운영 시간 설정 */}
      {centerSchedule && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">센터 운영 시간 설정</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">평일 운영</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={centerSchedule.operatingHours.weekday.isEnabled}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">운영</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {centerSchedule.operatingHours.weekday.startTime} - {centerSchedule.operatingHours.weekday.endTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">주말 운영</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={centerSchedule.operatingHours.weekend.isEnabled}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">운영</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {centerSchedule.operatingHours.weekend.startTime} - {centerSchedule.operatingHours.weekend.endTime}
                  </span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">공휴일 운영</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={centerSchedule.operatingHours.holiday.isEnabled}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">운영</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {centerSchedule.operatingHours.holiday.startTime} - {centerSchedule.operatingHours.holiday.endTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 캘린더 뷰 */}
      {(() => {
        console.log('🔍 캘린더 뷰 렌더링 체크:', {
          viewMode,
          isCalendarMode: viewMode === 'calendar',
          loading,
          filteredSchedulesLength: filteredSchedules.length
        });
        
        if (viewMode === 'calendar') {
          console.log('✅ 캘린더 뷰 조건 만족 - 렌더링 시작');
          return (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">스케줄 캘린더</h2>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800 font-medium">🔍 디버깅 정보:</p>
                  <p className="text-sm text-blue-700">현재 뷰 모드: {viewMode}</p>
                  <p className="text-sm text-blue-700">로딩 상태: {loading ? '로딩중' : '완료'}</p>
                  <p className="text-sm text-blue-700">필터된 스케줄 수: {filteredSchedules.length}</p>
                  <p className="text-sm text-blue-700">전체 스케줄 수: {schedules.length}</p>
                  <p className="text-sm text-blue-700">ScheduleCalendar 컴포넌트 렌더링 예정</p>
                </div>
                <ScheduleCalendar
                  schedules={filteredSchedules}
                  onScheduleClick={handleEditSchedule}
                  onAddSchedule={(date, time) => {
                    console.log('📅 새 스케줄 추가 요청:', { date, time });
                    setEditingSchedule(null);
                    setSelectedDate(date);
                    setShowScheduleModal(true);
                  }}
                  onEditSchedule={handleEditSchedule}
                  onDeleteSchedule={handleDeleteSchedule}
                />
              </div>
            </div>
          );
        } else {
          console.log('❌ 캘린더 뷰 조건 불만족 - 뷰 모드:', viewMode);
          return null;
        }
      })()}

      {/* 목록 뷰 */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">스케줄 목록</h2>
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => (
                <div key={schedule._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: schedule.color }}
                      ></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                        <p className="text-sm text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.date} {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="text-xs text-gray-500">
                          {schedule.type === 'instructor_schedule' && schedule.instructorName && (
                            <span>강사: {schedule.instructorName}</span>
                          )}
                          {schedule.type === 'group_class' && schedule.maxStudents && (
                            <span>정원: {schedule.currentStudents || 0}/{schedule.maxStudents}명</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          schedule.status === 'tentative' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {schedule.status === 'confirmed' ? '확정' :
                           schedule.status === 'tentative' ? '예정' : '취소'}
                        </span>
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSchedules.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  등록된 스케줄이 없습니다.
                  <br />
                  <small>새 스케줄을 추가해보세요.</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 스케줄 추가/수정 모달 */}
      {isCenterAdmin && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
          editingSchedule={editingSchedule}
          selectedDate={selectedDate}
          selectedTime={selectedDate ? '09:00' : undefined}
        />
      )}

      {/* ⭐ 외부 회원 개인레슨 요청 모달 */}
      {isExternalMember && (
        <ExternalPersonalLessonRequestModal
          isOpen={showExternalRequestModal}
          onClose={() => setShowExternalRequestModal(false)}
          onSubmit={handleExternalRequest}
        />
      )}
    </div>
  );
}

export default withAuth(CenterScheduleManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin', 'student'] // ⭐ 외부 회원(학생)도 접근 가능
});
