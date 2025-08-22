'use client';

import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Database, 
  Server, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw
} from 'lucide-react';

interface SystemStatus {
  server: 'online' | 'offline' | 'warning';
  database: 'online' | 'offline' | 'warning';
  api: 'online' | 'offline' | 'warning';
  lastCheck: Date;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    server: 'offline',
    database: 'offline',
    api: 'offline',
    lastCheck: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemStatus = async () => {
    setIsChecking(true);
    
    try {
      // 서버 상태 확인
      const serverResponse = await fetch('http://localhost:5000/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      });
      
      // 데이터베이스 상태 확인
      const dbResponse = await fetch('http://localhost:5000/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3초 타임아웃
      });

      setStatus({
        server: serverResponse.ok ? 'online' : 'warning',
        database: dbResponse.ok ? 'online' : 'warning',
        api: serverResponse.ok && dbResponse.ok ? 'online' : 'warning',
        lastCheck: new Date()
      });
    } catch (error) {
      setStatus({
        server: 'offline',
        database: 'offline',
        api: 'offline',
        lastCheck: new Date()
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    
    // 30초마다 자동 체크
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '정상';
      case 'warning':
        return '주의';
      case 'offline':
        return '오프라인';
      default:
        return '확인 중';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">시스템 상태</h3>
        <button
          onClick={checkSystemStatus}
          disabled={isChecking}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {/* 서버 상태 */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status.server)}`}>
          <div className="flex items-center space-x-3">
            <Server className="w-5 h-5" />
            <span className="font-medium">서버</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.server)}
            <span className="text-sm">{getStatusText(status.server)}</span>
          </div>
        </div>

        {/* 데이터베이스 상태 */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status.database)}`}>
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5" />
            <span className="font-medium">데이터베이스</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.database)}
            <span className="text-sm">{getStatusText(status.database)}</span>
          </div>
        </div>

        {/* API 상태 */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status.api)}`}>
          <div className="flex items-center space-x-3">
            <Wifi className="w-5 h-5" />
            <span className="font-medium">API</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.api)}
            <span className="text-sm">{getStatusText(status.api)}</span>
          </div>
        </div>
      </div>

      {/* 마지막 체크 시간 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          마지막 확인: {status.lastCheck.toLocaleTimeString()}
        </p>
      </div>

      {/* 전체 상태 요약 */}
      <div className="mt-3 p-2 rounded-lg bg-gray-50">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium text-gray-700">전체 상태:</span>
          {status.api === 'online' ? (
            <span className="text-sm text-green-600 font-medium">모든 시스템 정상</span>
          ) : status.api === 'warning' ? (
            <span className="text-sm text-yellow-600 font-medium">일부 시스템 주의</span>
          ) : (
            <span className="text-sm text-red-600 font-medium">시스템 오류</span>
          )}
        </div>
      </div>
    </div>
  );
}
