/**
 * 센터 운영 스케줄 설정 페이지
 * 
 * 연동 컴포넌트:
 * - client/components/center-admin/ScheduleCalendar.tsx (스케줄 캘린더)
 * - client/components/center-admin/ScheduleList.tsx (스케줄 목록)
 * - client/components/center-admin/ScheduleModal.tsx (스케줄 추가/수정 모달)
 * 
 * 연동 데이터:
 * - 센터 운영 시간, 강사별 스케줄, 단체 수업 시간표
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import { Calendar, List, Plus, Clock, Users, Settings } from 'lucide-react';
import ScheduleCalendar from '@/components/center-admin/ScheduleCalendar';
import ScheduleModal from '@/components/center-admin/ScheduleModal';
import { LoadingState, PageHeader, ConfirmModal, ErrorState } from '@/components/common';

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
  const router = useRouter();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [centerSchedule, setCenterSchedule] = useState<CenterSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  // 🔍 디버깅: 컴포넌트 렌더링 확인
  logger.info('🚀🚀🚀 센터 운영 스케줄 설정 페이지 렌더링 시작! 🚀🚀🚀');
  logger.info('🔍 CenterScheduleManagement 렌더링:', {
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
    logger.info('🔍 CenterScheduleManagement useEffect 실행:', { user: !!user });
    if (user) {
      logger.info('🔍 사용자 로그인됨 - 데이터 로딩 시작');
      loadSchedules();
      loadCenterSchedule();
    } else {
      logger.info('❌ 사용자 로그인 안됨');
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/center-admin/schedules');
      const data = await response.json();
      
      if (data.success) {
        setSchedules(data.data);
      } else {
        // 테스트용 임시 데이터
        logger.info('⚠️ API에서 데이터를 가져올 수 없어 임시 데이터를 사용합니다.');
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
    } catch (err: any) {
      logger.error('스케줄 데이터 로드 실패:', err);
      setError(err.message || '스케줄 데이터를 불러오는데 실패했습니다.');
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
      logger.error('센터 스케줄 데이터 로드 실패:', error);
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
      logger.error('스케줄 저장 실패:', error);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '정말로 이 스케줄을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/center-admin/schedules/${scheduleId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            await loadSchedules();
          }
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        } catch (error) {
          logger.error('스케줄 삭제 실패:', error);
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const filteredSchedules = schedules.filter(schedule => {
    const typeMatch = filterType === 'all' || schedule.type === filterType;
    const statusMatch = filterStatus === 'all' || schedule.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState 
          message={error}
          onRetry={() => {
            setError(null);
            loadSchedules();
          }}
          retryText="다시 시도"
        />
      </div>
    );
  }

  if (loading) {
    logger.info('⏳ 센터 운영 스케줄 설정 페이지 로딩 중...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="센터 운영 스케줄 설정 페이지 로딩 중..." size="lg" />
      </div>
    );
  }

  logger.info('🎯 센터 운영 스케줄 설정 페이지 렌더링 완료!');
  
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
          <button
            onClick={handleAddSchedule}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            스케줄 추가
          </button>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                logger.info('🔍 캘린더 뷰 버튼 클릭됨');
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
                logger.info('🔍 목록 뷰 버튼 클릭됨');
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
        logger.info('🔍 캘린더 뷰 렌더링 체크:', {
          viewMode,
          isCalendarMode: viewMode === 'calendar',
          loading,
          filteredSchedulesLength: filteredSchedules.length
        });
        
        if (viewMode === 'calendar') {
          logger.info('✅ 캘린더 뷰 조건 만족 - 렌더링 시작');
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
                    logger.info('📅 새 스케줄 추가 요청:', { date, time });
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
          logger.info('❌ 캘린더 뷰 조건 불만족 - 뷰 모드:', viewMode);
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

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}

export default withAuth(CenterScheduleManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
