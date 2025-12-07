/**
 * 🔔 JJ Swim Lab - NotificationsBell 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 알림 상태를 시각적으로 표시
 * - 읽지 않은 알림 개수를 배지로 표시
 * - 알림 클릭 시 알림 목록 모달 열기
 * - 실시간 알림 상태 업데이트
 * 
 * 🔄 **주요 기능**
 * - 알림 개수 배지 표시
 * - 알림 클릭 이벤트 처리
 * - 읽지 않은 알림 하이라이트
 * - 알림 상태에 따른 시각적 피드백
 * - 알림 목록 모달 연동
 * 
 * 🗄️ **데이터 연동**
 * - 알림 개수 상태 관리
 * - 알림 클릭 이벤트 콜백
 * - 실시간 알림 데이터 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 알림 관련 아이콘 (SVG)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 알림 개수는 0보다 큰 경우에만 배지 표시
 * 2. 알림 클릭 시 적절한 이벤트 핸들러 호출
 * 3. 실시간 알림 업데이트를 위한 상태 관리
 * 4. 접근성을 위한 ARIA 라벨 설정
 * 5. 모바일 환경에서의 터치 이벤트 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 알림 개수 배지 표시 로직 확인
 * - [ ] 클릭 이벤트 핸들러 동작 검증
 * - [ ] 실시간 알림 업데이트 검증
 * - [ ] 접근성 속성 검증
 * - [ ] 반응형 디자인 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 알림 벨)
 * - 2024-12-19: 알림 개수 배지 표시 구현
 * - 2024-12-19: 클릭 이벤트 처리 구현
 * - 2024-12-19: 시각적 피드백 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (알림 벨 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 웹소켓 알림 연동
 * - 알림 타입별 아이콘 표시
 * - 알림 우선순위 표시
 * - 알림 설정 관리
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <NotificationsBell 
 *   count={5} 
 *   onClick={() => setShowNotifications(true)} 
 * />
 * ```
 */

'use client';
import { logger } from '@/lib/logger';

import React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsBell() {
  const { user } = useAuth();
  const router = useRouter();
  const userId = (user as any)?.id || (user as any)?._id; // token payload vs api profile
  const { notifications, refreshNotifications } = useNotifications(userId);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const count = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  // 알림 클릭 시 해당 페이지로 이동하고 읽음 처리
  const handleNotificationClick = async (notification: any) => {
    if (!notification._id) return;

    try {
      const token = localStorage.getItem('token');
      
      // 알림 읽음 처리
      const readResponse = await fetch(`http://localhost:5000/api/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (readResponse.ok) {
        // 알림 목록 새로고침
        if (refreshNotifications) {
          refreshNotifications();
        }
      }

      // 알림 데이터에 따라 페이지 이동
      if (notification.data) {
        const { postId, applicationId, centerId } = notification.data;
        
        // 구인구직 관련 알림
        if (postId || applicationId) {
          router.push('/job-board');
          setOpen(false);
          return;
        }
        
        // 센터 관련 알림
        if (centerId) {
          router.push('/center-admin');
          setOpen(false);
          return;
        }
      }

      // 기본적으로 job-board로 이동
      router.push('/job-board');
      setOpen(false);
    } catch (error) {
      logger.error('알림 읽음 처리 실패:', error);
    }
  };

  // 마우스가 영역을 벗어나면 알림창 닫기 (메시지창 내부에서는 유지)
  useEffect(() => {
    if (!open) return;

    const handleMouseLeave = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      
      // 알림창이나 버튼 영역을 완전히 벗어났는지 확인
      // relatedTarget이 null이거나 container 밖에 있을 때만 닫기
      if (containerRef.current) {
        // relatedTarget이 null이면 마우스가 완전히 페이지 밖으로 나간 경우
        if (!relatedTarget) {
          setOpen(false);
          return;
        }
        
        // relatedTarget이 container 밖에 있는지 확인
        if (!containerRef.current.contains(relatedTarget)) {
          // 약간의 지연을 두어 마우스가 다른 요소로 이동할 때 닫히지 않도록
          setTimeout(() => {
            if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
              setOpen(false);
            }
          }, 100);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="notifications"
        onClick={() => setOpen(o => !o)}
        className="relative text-gray-700 hover:text-blue-600 transition-colors"
      >
        <span className="text-2xl" title="일반 알림">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5 py-0.5">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg border z-50"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={(e) => {
            // 마우스가 알림창 영역을 완전히 벗어났을 때만 닫기
            const relatedTarget = e.relatedTarget as HTMLElement | null;
            if (!relatedTarget || !containerRef.current?.contains(relatedTarget)) {
              setTimeout(() => {
                if (containerRef.current && !containerRef.current.matches(':hover')) {
                  setOpen(false);
                }
              }, 200);
            }
          }}
        >
          <div className="p-2 border-b font-semibold">알림</div>
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-3 text-sm text-gray-600">새 알림이 없습니다.</div>
            )}
            {notifications.map((n, idx) => (
              <div 
                key={n._id || idx} 
                onClick={() => handleNotificationClick(n)}
                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="text-sm font-semibold text-gray-900">{n.title || n.type}</div>
                <div className="text-sm text-gray-700">{n.message}</div>
                {n.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString('ko-KR')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







































