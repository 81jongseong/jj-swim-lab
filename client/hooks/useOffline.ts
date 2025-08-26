import { useState, useEffect } from 'react';

interface OfflineData {
  id: string;
  type: 'student-level-change' | 'teaching-method-update' | 'user-update';
  data: any;
  timestamp: number;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 온라인 상태로 전환');
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

    // 오프라인 데이터 로드
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 오프라인 데이터 저장
  const saveOfflineData = (type: OfflineData['type'], data: any) => {
    const offlineItem: OfflineData = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now()
    };

    const newOfflineData = [...offlineData, offlineItem];
    setOfflineData(newOfflineData);
    
    // localStorage에 저장
    localStorage.setItem('offlineData', JSON.stringify(newOfflineData));
    
    console.log('📱 오프라인 데이터 저장:', offlineItem);
  };

  // 오프라인 데이터 로드
  const loadOfflineData = () => {
    try {
      const saved = localStorage.getItem('offlineData');
      if (saved) {
        const data = JSON.parse(saved);
        setOfflineData(data);
        console.log('📱 오프라인 데이터 로드:', data.length, '개');
      }
    } catch (error) {
      console.error('오프라인 데이터 로드 실패:', error);
    }
  };

  // 오프라인 데이터 동기화
  const syncOfflineData = async () => {
    if (!isOnline || offlineData.length === 0) return;

    console.log('🔄 오프라인 데이터 동기화 시작:', offlineData.length, '개');

    const successItems: string[] = [];
    const failedItems: OfflineData[] = [];

    for (const item of offlineData) {
      try {
        await syncItem(item);
        successItems.push(item.id);
      } catch (error) {
        console.error('동기화 실패:', item, error);
        failedItems.push(item);
      }
    }

    // 성공한 항목들 제거
    if (successItems.length > 0) {
      const remainingData = offlineData.filter(item => !successItems.includes(item.id));
      setOfflineData(remainingData);
      localStorage.setItem('offlineData', JSON.stringify(remainingData));
      
      console.log(`✅ ${successItems.length}개 항목 동기화 완료`);
    }

    // 실패한 항목들 유지
    if (failedItems.length > 0) {
      console.log(`❌ ${failedItems.length}개 항목 동기화 실패`);
    }
  };

  // 개별 항목 동기화
  const syncItem = async (item: OfflineData) => {
    switch (item.type) {
      case 'student-level-change':
        return await fetch('/api/student-levels/' + item.data.studentId + '/level', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      case 'teaching-method-update':
        return await fetch('/api/teaching-methods/' + item.data.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      case 'user-update':
        return await fetch('/api/users/' + item.data.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
      
      default:
        throw new Error(`알 수 없는 동기화 타입: ${item.type}`);
    }
  };

  // 오프라인 데이터 삭제
  const clearOfflineData = () => {
    setOfflineData([]);
    localStorage.removeItem('offlineData');
    console.log('🗑️ 오프라인 데이터 삭제 완료');
  };

  return {
    isOnline,
    offlineData,
    saveOfflineData,
    syncOfflineData,
    clearOfflineData,
    loadOfflineData
  };
}


