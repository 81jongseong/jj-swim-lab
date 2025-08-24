'use client';

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
        <span className="text-2xl">🔔</span>
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
































