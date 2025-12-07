'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../../hooks/useAuth';
import { LoadingState, ErrorState, PageHeader } from '@/components/common';
import apiClient from '../../utils/api';

// 동적 임포트로 코드 스플리팅 적용
const StatsCards = lazy(() => import('../../components/dashboard/StatsCards'));
const HealthDashboard = lazy(() => import('../../components/HealthDashboard'));
const RecentBookings = lazy(() => import('../../components/dashboard/RecentBookings'));

interface MemberStats {
  totalBookings: number;
  activeCourses: number;
  totalPayments: number;
  nextLesson: string | null;
}

// 건강 관련 데이터 인터페이스
interface HealthData {
  riskLevel: 'low' | 'medium' | 'high';
  riskChange: number;
  weeklyGoal: number;
  weeklyTotal: number;
  weeklyChange: number;
  exerciseFrequency: number;
  frequencyChange: number;
  nextWorkout: string;
  nextWorkoutChange: number;
}

interface ExerciseRecord {
  date: string;
  duration: number;
  satisfaction: number;
  pain: number;
}

interface HealthGoal {
  name: string;
  current: number;
  target: number;
  progress: number;
  unit: string;
}

interface WeeklyProgram {
  day: string;
  duration: number;
  strokes: string;
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  
  // 건강 관련 상태
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [weeklyProgram, setWeeklyProgram] = useState<WeeklyProgram[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        setInfoMessage(null);
        setErrorMessage(null);
        
        // 사용자 타입에 따라 다른 API 엔드포인트 사용
        let apiEndpoint = 'http://localhost:5000/api/centers/student-dashboard-stats';
        
        // center-admin인 경우 센터 관리자 전용 API 사용
        if (user?.userType === 'centerAdmin' || user?.userType === 'center-admin') {
          apiEndpoint = 'http://localhost:5000/api/center-admin/bookings/dashboard';
        }
        
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        let parsed: any = null;
        try {
          parsed = await response.json();
        } catch (jsonError) {
          logger.error('대시보드 응답 파싱 실패:', jsonError);
        }
        const res = parsed || {};
        logger.info('🔍 대시보드 API 응답:', res);
        
        if (!response.ok) {
          const message = res?.message || '대시보드 데이터를 불러오지 못했습니다.';
          // 학생이고 센터 미배정인 경우 센터 검색 페이지로 리다이렉트
          if (user?.userType === 'student' && (response.status === 404 && message.includes('소속 센터'))) {
            setInfoMessage('소속 센터가 아직 배정되지 않았습니다. 지도에서 센터를 찾아 수강 신청을 진행해주세요.');
            setStats(null);
            setRecentBookings([]);
            return;
          }
          
          logger.error('대시보드 API 오류 상태:', response.status, message);
          setErrorMessage(message);
          return;
        }
        
        if (res.success && res.data) {
          // 학생이고 센터 미배정인 경우 센터 검색 페이지로 리다이렉트
          if (user?.userType === 'student' && res.data.needsCenterAssignment) {
            setInfoMessage('소속 센터가 아직 배정되지 않았습니다. 지도에서 센터를 찾아 수강 신청을 진행해주세요.');
          }
          
          const d = res.data;
          // ⭐ 총예약과 활성강습은 같은 값 (등록된 강습 수)
          const enrolledCount = d.enrolledCourses || d.activeCourses || 0;
          setStats({
            totalBookings: enrolledCount,
            activeCourses: enrolledCount,
            totalPayments: d.totalPayments || 0,
            nextLesson: d.nextClass || null,
          });
          
          // 최근 예약 내역 설정
          if (Array.isArray(d.recentBookings)) {
            setRecentBookings(d.recentBookings);
          } else if (Array.isArray(d.bookings)) {
            setRecentBookings(d.bookings);
          } else {
            setRecentBookings([]);
          }
          // 건강 데이터 로드 (샘플 데이터)
          setHealthData({
            riskLevel: 'medium',
            riskChange: 5,
            weeklyGoal: 150,
            weeklyTotal: 120,
            weeklyChange: 5.2,
            exerciseFrequency: 5,
            frequencyChange: 2.1,
            nextWorkout: 'Mon',
            nextWorkoutChange: 0
          });
          
          setExerciseRecords([
            { date: '2024-01-15', duration: 30, satisfaction: 8, pain: 2 },
            { date: '2024-01-12', duration: 25, satisfaction: 7, pain: 3 }
          ]);
          
          setHealthGoals([
            { name: '체중 감량', current: 68, target: 65, progress: 60, unit: 'kg' },
            { name: '심박수 개선', current: 75, target: 70, progress: 100, unit: 'bpm' }
          ]);
          
          // ⭐ 등록된 코스의 프로그램 가져오기
          try {
            const coursesRes = await apiClient.get('/api/courses/student/enrolled');
            const enrolledCourses = coursesRes?.data || [];
            
            // 첫 번째 등록된 코스의 프로그램 찾기
            let programData: any = null;
            for (const course of enrolledCourses) {
              if (course._id) {
                try {
                  // 단체반 프로그램 조회
                  const programRes = await apiClient.get(`/api/group-programs/${course._id}`);
                  if (programRes?.data?.programs && programRes.data.programs.length > 0) {
                    programData = programRes.data.programs[0]; // 가장 최근 프로그램
                    break;
                  }
                } catch (err) {
                  // 프로그램이 없으면 다음 코스 확인
                  continue;
                }
              }
            }
            
            // 프로그램 데이터가 있으면 주간 프로그램 생성
            if (programData && programData.content?.sessions) {
              const sessions = programData.content.sessions || [];
              const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
              const weeklyProgramData = sessions.slice(0, 5).map((session: any, idx: number) => ({
                _id: programData._id,
                programId: programData._id,
                courseId: programData.groupClassId,
                courseName: programData.groupClassName || enrolledCourses[0]?.name,
                instructorName: enrolledCourses[0]?.instructor?.name || enrolledCourses[0]?.instructorName,
                day: dayNames[idx] || `Day ${idx + 1}`,
                duration: session.duration || programData.params?.sessionDuration || 30,
                strokes: session.strokes?.join(' + ') || session.summary || '운동',
                summary: programData.content?.summary
              }));
              setWeeklyProgram(weeklyProgramData);
            } else {
              // 프로그램이 없으면 빈 배열
              setWeeklyProgram([]);
            }
          } catch (err) {
            logger.error('프로그램 데이터 로딩 실패:', err);
            setWeeklyProgram([]);
          }
        } else {
          const message = res?.message || '대시보드 데이터를 불러오지 못했습니다.';
          setErrorMessage(message);
        }
      } catch (error) {
        logger.error('대시보드 데이터 로딩 실패:', error);
        setErrorMessage('대시보드 데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message="로딩 중..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="회원 대시보드"
          className="mb-8"
        />

        {infoMessage && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
            {infoMessage}
          </div>
        )}

        {errorMessage && (
          <ErrorState 
            message={errorMessage} 
            onRetry={() => window.location.reload()}
            className="mb-6"
          />
        )}

        {stats && (
          <Suspense
            fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            }
          >
          <StatsCards stats={stats} />
        </Suspense>
        )}

        {/* 건강 대시보드 - 코드 스플리팅 적용 */}
        {healthData && (
          <Suspense fallback={
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          }>
            <HealthDashboard 
              healthData={healthData}
              exerciseRecords={exerciseRecords}
              healthGoals={healthGoals}
              weeklyProgram={weeklyProgram}
            />
          </Suspense>
        )}

      </div>
    </div>
  );
}

