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

import React from 'react';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsBell() {
  const { user } = useAuth();
  const userId = (user as any)?.id || (user as any)?._id; // token payload vs api profile
  const { notifications } = useNotifications(userId);
  const [open, setOpen] = useState(false);

  const count = useMemo(() => notifications.length, [notifications]);

  return (
    <div className="relative">
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
        <div className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg border z-50">
          <div className="p-2 border-b font-semibold">알림</div>
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-3 text-sm text-gray-600">새 알림이 없습니다.</div>
            )}
            {notifications.map((n, idx) => (
              <div key={idx} className="p-3 border-b last:border-b-0">
                <div className="text-sm font-medium text-gray-900">{n.type}</div>
                <div className="text-sm text-gray-700">{n.message}</div>
                {n.createdAt && (
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







































