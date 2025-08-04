'use client';

import { useState } from 'react';

export default function MongoDBTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testMongoDBConnection = async () => {
    setLoading(true);
    try {
      // 여러 포트에서 서버 상태 확인
      const ports = [5000, 5001, 5002];
      const results = [];

      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            results.push({
              port,
              status: 'success',
              data: data as any
            });
          } else {
            results.push({
              port,
              status: 'error',
              error: `HTTP ${response.status}`
            });
          }
        } catch (error) {
          results.push({
            port,
            status: 'error',
            error: error.message
          });
        }
      }

      setResult(JSON.stringify(results, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignupAPI = async () => {
    setLoading(true);
    try {
      const ports = [5000, 5001, 5002];
      const results = [];

      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/api/auth/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: '테스트 사용자',
              email: 'test@example.com',
              password: 'password123',
              phone: '010-1234-5678',
              address: '서울시 강남구',
              userType: 'member'
            }),
          });

          if (response.ok) {
            const data = await response.json();
            results.push({
              port,
              status: 'success',
              data: data as any
            });
          } else {
            const errorData = await response.json();
            results.push({
              port,
              status: 'error',
              error: errorData.error || `HTTP ${response.status}`
            });
          }
        } catch (error) {
          results.push({
            port,
            status: 'error',
            error: error.message
          });
        }
      }

      setResult(JSON.stringify(results, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkNetworkStatus = async () => {
    setLoading(true);
    try {
      const networkInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt
        } : 'Not available',
        localhost: {
          ports: []
        }
      };

      // 로컬호스트 포트 스캔
      const ports = [3000, 3001, 3002, 5000, 5001, 5002];
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}`, {
            method: 'GET',
            mode: 'no-cors'
          });
          networkInfo.localhost.ports.push({
            port,
            status: 'reachable'
          });
        } catch (error) {
          networkInfo.localhost.ports.push({
            port,
            status: 'unreachable',
            error: error.message
          });
        }
      }

      setResult(JSON.stringify(networkInfo, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">MongoDB 연결 테스트</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testMongoDBConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Health Check (모든 포트)
          </button>
          
          <button
            onClick={testSignupAPI}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Signup API 테스트
          </button>

          <button
            onClick={checkNetworkStatus}
            disabled={loading}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
          >
            네트워크 상태 확인
          </button>
        </div>

        {loading && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600">테스트 중...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">테스트 결과:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-96">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">문제 해결 가이드</h3>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li>• 모든 포트에서 "Failed to fetch" 오류: 서버가 실행되지 않음</li>
            <li>• 특정 포트만 오류: 해당 포트의 서버만 문제</li>
            <li>• MongoDB 연결 실패: Atlas 설정 또는 네트워크 문제</li>
            <li>• CORS 오류: 서버의 CORS 설정 문제</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 