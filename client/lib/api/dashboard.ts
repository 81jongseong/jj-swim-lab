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
    // Next.js API 라우트를 통해 프록시 (서버 사이드에서 환경 변수 사용)
    // 상대 경로를 사용하여 같은 도메인으로 요청
    const API_ENDPOINT = '/api/dashboard/stats';
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      console.warn('인증 토큰이 없습니다. 대시보드 통계를 가져올 수 없습니다.');
      // 토큰이 없어도 기본값 반환 (에러 방지)
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    // 개발 환경에서 디버깅 정보 출력
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔍 Dashboard API 호출:', API_ENDPOINT);
      console.log('🔍 토큰:', token ? '있음' : '없음');
    }
    
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers,
    });

    // 401 오류 발생 시 토큰 제거 및 로그인 페이지로 리다이렉트
    if (response.status === 401) {
      console.warn('인증 토큰이 만료되었거나 유효하지 않습니다.');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
      throw new Error('인증이 필요합니다.');
    }

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
  interval: number = 60000 // 60초마다 새로고침
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
