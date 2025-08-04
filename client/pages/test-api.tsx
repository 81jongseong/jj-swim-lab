'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

                const testSignup = async () => {
                setLoading(true);
                try {
                  const response = await fetch('http://localhost:5002/api/auth/signup', {
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

                  const data = await response.json();
                  setResult(JSON.stringify(data, null, 2));
                } catch (error) {
                  setResult(`Error: ${error}`);
                } finally {
                  setLoading(false);
                }
              };

                const testHealth = async () => {
                setLoading(true);
                try {
                  const response = await fetch('http://localhost:5002/health');
                  const data = await response.json();
                  setResult(JSON.stringify(data, null, 2));
                } catch (error) {
                  setResult(`Error: ${error}`);
                } finally {
                  setLoading(false);
                }
              };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API 테스트</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testHealth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Health Check
          </button>
          
          <button
            onClick={testSignup}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
          >
            Test Signup
          </button>
        </div>

        {loading && (
          <div className="mb-4">
            <p className="text-blue-600">로딩 중...</p>
          </div>
        )}

        {result && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">결과:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 