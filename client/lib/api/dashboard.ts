/**
 * 📊 JJ Swim Lab - 대시보드 API 클라이언트
 * 
 * 📋 **기능**
 * - 실시간 시스템 통계 데이터 가져오기
 * - 하드코딩된 더미 데이터 대체
 * - 데이터베이스 기반 실시간 통계
 */

export interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  totalRevenue: number;
  activeBookings: number;
  pendingApprovals: number;
  instructorStats: Array<{
    name: string;
    studentCount: number;
  }>;
  courseStats: Array<{
    name: string;
    enrollmentRate: number;
  }>;
}

/**
 * 대시보드 통계 데이터를 가져옵니다
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`대시보드 통계를 가져올 수 없습니다: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('대시보드 통계 가져오기 실패:', error);
    
    // 에러 시 기본값 반환 (빈 통계)
    return {
      totalUsers: 0,
      activeCourses: 0,
      totalRevenue: 0,
      activeBookings: 0,
      pendingApprovals: 0,
      instructorStats: [],
      courseStats: []
    };
  }
};

/**
 * 대시보드 통계를 주기적으로 새로고침합니다
 */
export const refreshDashboardStats = async (
  setStats: (stats: DashboardStats) => void,
  interval: number = 30000 // 30초마다 새로고침
) => {
  const fetchStats = async () => {
    const stats = await getDashboardStats();
    setStats(stats);
  };

  // 초기 데이터 로드
  await fetchStats();

  // 주기적 새로고침 설정
  const intervalId = setInterval(fetchStats, interval);

  // 클린업 함수 반환
  return () => clearInterval(intervalId);
};
