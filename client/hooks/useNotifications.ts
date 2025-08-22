'use client';

import { useEffect, useRef, useState } from 'react';

export interface AppNotification {
  type: string;
  message: string;
  createdAt?: string;
}

export function useNotifications(userId?: string) {
  const socketRef = useRef<any>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    // dynamic import to avoid SSR issues
    const connect = async () => {
      const { io } = await import('socket.io-client');
      socketRef.current = io(base, { transports: ['websocket'] });
      socketRef.current.on('connect', () => {
        if (userId) socketRef.current.emit('register', { userId });
      });
      socketRef.current.on('notification', (payload: AppNotification) => {
        setNotifications(prev => [{ ...payload, createdAt: new Date().toISOString() }, ...prev]);
      });
    };
    connect();
    return () => {
      try { socketRef.current?.disconnect?.(); } catch {}
    };
  }, [userId]);

  return { notifications };
}










