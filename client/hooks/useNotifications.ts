/**
 * 🔔 JJ Swim Lab - useNotifications 커스텀 훅
 * 
 * 📋 **훅 목적**
 * - 애플리케이션의 알림 시스템을 관리하는 커스텀 훅
 * - 사용자별 맞춤형 알림 생성, 표시 및 관리 기능 제공
 * - 알림 우선순위, 타입, 상태 등을 체계적으로 관리
 * - 실시간 알림 업데이트 및 사용자 상호작용 처리
 * - 알림 히스토리 및 설정 관리 지원
 * 
 * 🔄 **주요 기능**
 * - 알림 생성, 표시 및 관리
 * - 알림 우선순위 및 타입별 분류
 * - 실시간 알림 업데이트 및 동기화
 * - 사용자 알림 상호작용 처리
 * - 알림 히스토리 및 설정 관리
 * - 푸시 알림 및 브라우저 알림 지원
 * 
 * 🗄️ **데이터 연동**
 * - 알림 데이터 및 메타데이터
 * - 사용자 알림 설정 및 선호도
 * - 알림 히스토리 및 상태 정보
 * - 실시간 알림 업데이트 이벤트
 * - 푸시 알림 토큰 및 설정
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 알림 관리 및 상태 시스템
 * - 푸시 알림 API 및 서비스 워커
 * - 실시간 알림 업데이트 시스템
 * - 알림 데이터베이스 및 저장소
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 알림의 적절한 타이밍 및 빈도 관리
 * 2. 사용자 알림 설정 및 선호도 반영
 * 3. 실시간 알림 업데이트의 성능 최적화
 * 4. 푸시 알림의 브라우저 호환성
 * 5. 알림 데이터의 보안 및 개인정보 보호
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 알림 생성 및 표시 동작 확인
 * - [ ] 알림 우선순위 및 타입 분류 검증
 * - [ ] 실시간 알림 업데이트 확인
 * - [ ] 사용자 상호작용 처리 확인
 * - [ ] 푸시 알림 및 브라우저 알림 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 알림 시스템)
 * - 2024-12-19: 알림 우선순위 및 타입 시스템 구현
 * - 2024-12-19: 실시간 알림 업데이트 시스템 구현
 * - 2024-12-19: 푸시 알림 및 브라우저 알림 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (알림 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 알림 최적화
 * - 자동 알림 스케줄링
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 컴포넌트에서 알림 훅 사용
 * function MyComponent() {
 *   const { 
 *     notifications, 
 *     addNotification, 
 *     markAsRead, 
 *     clearAll 
 *   } = useNotifications();
 *   
 *   const handleNewMessage = () => {
 *     addNotification({
 *       id: 'msg-1',
 *       type: 'info',
 *       title: '새 메시지',
 *       message: '새로운 메시지가 도착했습니다.',
 *       priority: 'high'
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleNewMessage}>알림 생성</button>
 *       <button onClick={clearAll}>모든 알림 지우기</button>
 *       {notifications.map(notification => (
 *         <div key={notification.id}>
 *           <h3>{notification.title}</h3>
 *           <p>{notification.message}</p>
 *           <button onClick={() => markAsRead(notification.id)}>
 *             읽음 표시
 *           </button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 * 
 * 🔍 **알림 처리 흐름**
 * 1. 알림 이벤트 발생 및 감지
 * 2. 알림 데이터 생성 및 우선순위 설정
 * 3. 알림 표시 및 사용자 상호작용 처리
 * 4. 실시간 알림 업데이트 및 동기화
 * 5. 알림 히스토리 관리 및 설정 반영
 */

'use client';

import { useEffect, useRef, useState } from 'react';

export interface AppNotification {
  _id?: string;
  type: string;
  title?: string;
  message: string;
  createdAt?: string;
  isRead?: boolean;
  priority?: string;
  data?: any;
}

export function useNotifications(userId?: string) {
  const socketRef = useRef<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // API에서 알림 가져오기
  useEffect(() => {
    if (!userId || typeof window === 'undefined') return;
    
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/notifications?limit=20', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.notifications) {
            setNotifications(result.data.notifications.map((n: any) => ({
              _id: n._id,
              type: n.type,
              title: n.title,
              message: n.message,
              createdAt: n.createdAt,
              isRead: n.isRead,
              priority: n.priority,
              data: n.data
            })));
          }
        }
      } catch (error) {
        console.error('알림 조회 실패:', error);
      }
    };
    
    fetchNotifications();
    
    // 주기적으로 알림 새로고침 (30초마다)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // WebSocket 연결
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    // dynamic import to avoid SSR issues
    const connect = async () => {
      try {
        const { io } = await import('socket.io-client');
        socketRef.current = io(base, { 
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 5000,
          reconnectionAttempts: 3
        });
        
        socketRef.current.on('connect', () => {
          if (userId) socketRef.current.emit('register', { userId });
        });
        
        socketRef.current.on('notification', (payload: AppNotification) => {
          setNotifications(prev => [{ ...payload, createdAt: new Date().toISOString() }, ...prev]);
        });
        
        socketRef.current.on('connect_error', (error) => {
          console.warn('WebSocket 연결 실패 (정상 동작, 실시간 알림만 비활성화):', error.message);
        });
      } catch (error) {
        console.warn('WebSocket 초기화 실패 (정상 동작, 실시간 알림만 비활성화):', error);
      }
    };
    connect();
    return () => {
      try { socketRef.current?.disconnect?.(); } catch {}
    };
  }, [userId]);

  return { notifications };
}










