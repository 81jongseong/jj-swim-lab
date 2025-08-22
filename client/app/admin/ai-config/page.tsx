'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  enabled: boolean;
  systemPrompt: string;
}

export default function AIConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig>({
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    enabled: true,
    systemPrompt: '당신은 수영 교육 전문가입니다. 수영 기술, 안전, 교육 방법에 대해 정확하고 유용한 정보를 제공해주세요.'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.userType !== 'superAdmin') {
      setError('최고 관리자만 접근할 수 있습니다.');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('AI 설정이 성공적으로 저장되었습니다.');
      setIsFormOpen(false);
    } catch (err) {
      setError('설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.userType !== 'superAdmin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">접근 권한 없음</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>최고 관리자만 AI 설정에 접근할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI 설정 관리</h1>
          <p className="mt-2 text-gray-600">
            수영 교육에 특화된 AI 기능의 설정을 관리합니다.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">현재 AI 설정</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              설정 수정
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">AI 모델</h3>
              <p className="mt-1 text-sm text-gray-900">{config.model}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">창의성 (Temperature)</h3>
              <p className="mt-1 text-sm text-gray-900">{config.temperature}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">최대 토큰 수</h3>
              <p className="mt-1 text-sm text-gray-900">{config.maxTokens}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">AI 기능 상태</h3>
              <p className="mt-1 text-sm text-gray-900">
                {config.enabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    활성화
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    비활성화
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">시스템 프롬프트</h3>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {config.systemPrompt}
            </p>
          </div>
        </div>

        {/* 설정 수정 모달 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">AI 설정 수정</h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                        AI 모델
                      </label>
                      <select
                        id="model"
                        name="model"
                        value={config.model}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                        창의성 (Temperature)
                      </label>
                      <input
                        type="number"
                        id="temperature"
                        name="temperature"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">0.0 (보수적) ~ 2.0 (창의적)</p>
                    </div>

                    <div>
                      <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-2">
                        최대 토큰 수
                      </label>
                      <input
                        type="number"
                        id="maxTokens"
                        name="maxTokens"
                        min="100"
                        max="4000"
                        value={config.maxTokens}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="enabled" className="block text-sm font-medium text-gray-700 mb-2">
                        AI 기능 활성화
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="enabled"
                          name="enabled"
                          checked={config.enabled}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                          AI 기능 사용
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                      시스템 프롬프트
                    </label>
                    <textarea
                      id="systemPrompt"
                      name="systemPrompt"
                      rows={6}
                      value={config.systemPrompt}
                      onChange={handleChange}
                      placeholder="AI가 수영 강습에 특화된 응답을 하도록 하는 시스템 프롬프트를 입력하세요..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '설정 저장'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

















