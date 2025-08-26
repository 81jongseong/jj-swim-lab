import { useState, useEffect, useCallback } from 'react';
import { offlineDB } from '../lib/offlineDB';

interface OfflineData {
  id: string;
  type: 'student-level-change' | 'teaching-method-update' | 'user-update';
  data: any;
  timestamp: number;
}

interface OfflineStats {
  teachingMethods: number;
  students: number;
  userProfiles: number;
  offlineActions: number;
  cachedPages: number;
}

const useEnhancedOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDBReady, setIsDBReady] = useState(false);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [hasPreloaded, setHasPreloaded] = useState(false);

  // 데이터베이스 초기화
  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;

    const initDB = async () => {
      try {
        await offlineDB.init();
        setIsDBReady(true);
        console.log('✅ 오프라인 데이터베이스 초기화 완료');
        
        // 기존 오프라인 액션 로드
        await loadOfflineActions();
        
        // 통계 정보 로드
        await loadStats();
      } catch (error) {
        console.error('❌ 오프라인 데이터베이스 초기화 실패:', error);
      }
    };

    initDB();
  }, []);

  // 온라인/오프라인 상태 감지
  useEffect(() => {
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 온라인 상태로 전환');
      
      // 온라인 복구 시 자동 동기화
      if (isDBReady) {
        syncOfflineData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 오프라인 상태로 전환');
    };

    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDBReady]);

  // 오프라인 액션 로드
  const loadOfflineActions = async () => {
    try {
      const actions = await offlineDB.getOfflineActions();
      setOfflineData(actions);
      console.log('📱 오프라인 액션 로드:', actions.length, '개');
    } catch (error) {
      console.error('오프라인 액션 로드 실패:', error);
    }
  };

  // 통계 정보 로드
  const loadStats = async () => {
    try {
      const dbStats = await offlineDB.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('통계 정보 로드 실패:', error);
    }
  };

  // 데이터 프리로딩 (온라인일 때, 한 번만)
  const preloadData = useCallback(async () => {
    if (!isOnline || !isDBReady || isPreloading || hasPreloaded) return;

    setIsPreloading(true);
    console.log('🔄 데이터 프리로딩 시작...');

    try {
      // API 기본 URL 설정 (서버 포트 5000)
      const API_BASE_URL = 'http://localhost:5000';
      
      // 강습법 데이터 프리로딩
      const teachingMethodsResponse = await fetch(`${API_BASE_URL}/api/teaching-methods`);
      if (teachingMethodsResponse.ok) {
        const responseData = await teachingMethodsResponse.json();
        
        // API 응답 구조에서 data 필드 추출
        const teachingMethods = responseData.data || responseData;
        
        // 데이터 검증: 배열인지 확인
        if (Array.isArray(teachingMethods)) {
          await offlineDB.saveTeachingMethods(teachingMethods);
          console.log('📚 강습법 데이터 프리로딩 완료:', teachingMethods.length, '개');
        } else {
          console.warn('⚠️ 강습법 데이터가 배열이 아닙니다:', typeof teachingMethods, teachingMethods);
        }
      } else {
        console.warn('⚠️ 강습법 데이터 프리로딩 실패:', teachingMethodsResponse.status);
      }

      // 사용자 프로필과 학생 정보는 로그인 후에만 프리로딩
      // 현재는 인증이 필요하므로 건너뜀
      console.log('ℹ️ 사용자 프로필과 학생 정보는 로그인 후 프리로딩됩니다');

      // 통계 정보 업데이트
      await loadStats();
      
      console.log('✅ 기본 데이터 프리로딩 완료');
    } catch (error) {
      console.error('❌ 데이터 프리로딩 실패:', error);
    } finally {
      // 에러가 발생해도 프리로딩 완료로 표시하여 무한 루프 방지
      setHasPreloaded(true);
      setIsPreloading(false);
      console.log('🔄 프리로딩 완료 (에러 발생 시에도 중단)');
    }
  }, [isOnline, isDBReady, isPreloading, hasPreloaded]);

  // 오프라인 데이터 저장
  const saveOfflineData = useCallback(async (type: OfflineData['type'], data: any) => {
    if (!isDBReady) {
      console.warn('데이터베이스가 준비되지 않았습니다');
      return;
    }

    try {
      const offlineItem: OfflineData = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now()
      };

      // IndexedDB에 저장
      await offlineDB.saveOfflineAction(offlineItem);
      
      // 로컬 상태 업데이트
      setOfflineData(prev => [...prev, offlineItem]);
      
      console.log('📱 오프라인 데이터 저장:', offlineItem);
    } catch (error) {
      console.error('오프라인 데이터 저장 실패:', error);
    }
  }, [isDBReady]);

  // 오프라인 데이터 동기화
  const syncOfflineData = useCallback(async () => {
    if (!isOnline || !isDBReady || offlineData.length === 0) return;

    console.log('🔄 오프라인 데이터 동기화 시작:', offlineData.length, '개');

    const successItems: string[] = [];
    const failedItems: OfflineData[] = [];

    for (const item of offlineData) {
      try {
        await syncItem(item);
        successItems.push(item.id);
        
        // 성공한 항목을 IndexedDB에서 삭제
        await offlineDB.deleteOfflineAction(parseInt(item.id.split('-')[1]));
      } catch (error) {
        console.error('동기화 실패:', item, error);
        failedItems.push(item);
      }
    }

    // 성공한 항목들 제거
    if (successItems.length > 0) {
      const remainingData = offlineData.filter(item => !successItems.includes(item.id));
      setOfflineData(remainingData);
      
      console.log(`✅ ${successItems.length}개 항목 동기화 완료`);
    }

    // 실패한 항목들 유지
    if (failedItems.length > 0) {
      console.log(`❌ ${failedItems.length}개 항목 동기화 실패`);
    }

    // 통계 정보 업데이트
    await loadStats();
  }, [isOnline, isDBReady, offlineData]);

  // 개별 항목 동기화
  const syncItem = async (item: OfflineData) => {
    const API_BASE_URL = 'http://localhost:5000';
    
    switch (item.type) {
      case 'student-level-change':
        return await fetch(`${API_BASE_URL}/api/student-levels/${item.data.studentId}/level`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      case 'teaching-method-update':
        return await fetch(`${API_BASE_URL}/api/teaching-methods/${item.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      case 'user-update':
        return await fetch(`${API_BASE_URL}/api/users/${item.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      default:
        throw new Error(`알 수 없는 동기화 타입: ${item.type}`);
    }
  };

  // 오프라인 데이터 삭제
  const clearOfflineData = useCallback(async () => {
    if (!isDBReady) return;

    try {
      await offlineDB.clear();
      setOfflineData([]);
      setHasPreloaded(false);
      await loadStats();
      console.log('🗑️ 오프라인 데이터 삭제 완료');
    } catch (error) {
      console.error('오프라인 데이터 삭제 실패:', error);
    }
  }, [isDBReady]);

  // 강습법 데이터 조회 (오프라인 우선)
  const getTeachingMethods = useCallback(async (level?: string) => {
    if (!isDBReady) return [];

    try {
      if (level) {
        return await offlineDB.getTeachingMethodsByLevel(level);
      } else {
        return await offlineDB.getTeachingMethods();
      }
    } catch (error) {
      console.error('강습법 데이터 조회 실패:', error);
      return [];
    }
  }, [isDBReady]);

  // 학생 정보 조회 (오프라인 우선)
  const getStudents = useCallback(async (centerId?: string) => {
    if (!isDBReady) return [];

    try {
      if (centerId) {
        return await offlineDB.getStudentsByCenter(centerId);
      } else {
        return await offlineDB.getStudents();
      }
    } catch (error) {
      console.error('학생 정보 조회 실패:', error);
      return [];
    }
  }, [isDBReady]);

  // 사용자 프로필 조회 (오프라인 우선)
  const getUserProfile = useCallback(async (userId: string) => {
    if (!isDBReady) return null;

    try {
      return await offlineDB.getUserProfile(userId);
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      return null;
    }
  }, [isDBReady]);

  return {
    // 상태
    isOnline,
    isDBReady,
    isPreloading,
    offlineData,
    stats,
    
    // 데이터 관리
    preloadData,
    saveOfflineData,
    syncOfflineData,
    clearOfflineData,
    
    // 데이터 조회
    getTeachingMethods,
    getStudents,
    getUserProfile,
    
    // 유틸리티
    loadStats
  };
};

export default useEnhancedOffline;
