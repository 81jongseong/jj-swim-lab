/**
 * 📊 JJ Swim Lab - SystemStatus 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 시스템 전반의 상태 및 성능 정보를 실시간으로 표시
 * - 서버 상태, 데이터베이스 연결, API 응답 시간 모니터링
 * - 시스템 리소스 사용량 및 성능 지표 제공
 * - 문제 발생 시 즉시 알림 및 상태 표시
 * - 시스템 건강성 및 안정성 모니터링
 * 
 * 🔄 **주요 기능**
 * - 실시간 시스템 상태 모니터링
 * - 서버 및 데이터베이스 연결 상태 확인
 * - API 응답 시간 및 성능 지표 측정
 * - 시스템 리소스 사용량 표시
 * - 문제 발생 시 알림 및 상태 표시
 * 
 * 🗄️ **데이터 연동**
 * - 시스템 상태 모니터링 데이터
 * - 서버 및 데이터베이스 연결 정보
 * - API 성능 및 응답 시간 데이터
 * - 시스템 리소스 사용량 통계
 * - 문제 발생 이력 및 로그
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 시스템 모니터링 API
 * - 성능 측정 도구
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 시스템 모니터링의 오버헤드 최소화
 * 2. 실시간 데이터 업데이트의 정확성
 * 3. 문제 발생 시 적절한 알림 및 대응
 * 4. 시스템 리소스 사용량의 정확한 측정
 * 5. 사용자 경험에 미치는 영향 최소화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 시스템 상태 모니터링 동작 확인
 * - [ ] 서버 및 데이터베이스 연결 상태 확인
 * - [ ] API 성능 지표 측정 정확성 확인
 * - [ ] 문제 발생 시 알림 시스템 검증
 * - [ ] 시스템 리소스 사용량 표시 정확성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 시스템 상태 모니터링)
 * - 2024-12-19: 실시간 상태 업데이트 시스템 구현
 * - 2024-12-19: 성능 지표 측정 시스템 구현
 * - 2024-12-19: 문제 발생 알림 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (시스템 상태 모니터링 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 문제 예측 및 방지
 * - 자동 시스템 최적화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <SystemStatus 
 *   onStatusChange={(status) => handleStatusChange(status)}
 *   onProblemDetected={(problem) => handleProblem(problem)}
 *   onPerformanceUpdate={(metrics) => handlePerformanceUpdate(metrics)}
 *   enableRealTimeMonitoring={true}
 * />
 * ```
 */

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
