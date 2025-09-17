/**
 * 🏥 JJ Swim Lab - 최고관리자용 건강정보 설정 페이지
 *
 * 📋 **페이지 목적**
 * - 최고관리자가 전체 시스템의 건강정보 설정을 관리하는 페이지
 * - 건강정보 항목, 정상범주, 운동추천 규칙, AI 알고리즘 설정
 * - 권한별 건강정보 접근 제어 및 개인정보 보호 설정
 * 
 * 🔄 **주요 기능**
 * - 건강정보 항목 관리 (추가/수정/삭제/순서 변경)
 * - 각 항목별 정상범주 설정 (연령대별, 성별 구분)
 * - 운동 추천 규칙 관리 및 AI 알고리즘 파라미터 조정
 * - 개인정보 보호 설정 및 권한별 접근 제어
 * - 실시간 설정 변경 및 미리보기
 * 
 * 🗄️ **데이터 연동**
 * - 건강정보 설정 API (/api/health-config)
 * - 사용자 권한 확인 API
 * - AI 알고리즘 설정 API
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - useAuth hook (사용자 인증)
 * - UI 컴포넌트 (Card, Button, Modal, Form)
 * - 건강정보 설정 API
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 최고관리자 권한 확인 필수
 * 2. 의료 데이터의 정확성 검증
 * 3. 개인정보 보호법 준수
 * 4. 설정 변경 시 영향도 분석
 * 5. 실시간 데이터 검증 및 오류 처리
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 건강정보 설정 페이지 구현
 * - 2025-01-13: AI 알고리즘 설정 인터페이스 추가
 * - 2025-01-13: 권한별 접근 제어 시스템 구현
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';

// UI 컴포넌트 임포트
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 아이콘 임포트
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Brain,
  Shield,
  Activity,
  Users
} from 'lucide-react';

// 인터페이스 정의
interface HealthField {
  id: string;
  name: string;
  type: 'number' | 'string' | 'select' | 'boolean' | 'date';
  unit?: string;
  required: boolean;
  category: 'basic' | 'vital' | 'medical' | 'fitness' | 'custom';
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

interface AIConfig {
  modelVersion: string;
  parameters: {
    learningRate: number;
    confidence: number;
    accuracy: number;
    maxRecommendations: number;
    updateFrequency: number;
  };
  features: {
    personalizedRecommendations: boolean;
    riskAssessment: boolean;
    progressTracking: boolean;
    goalSetting: boolean;
    socialComparison: boolean;
  };
  thresholds: {
    riskAlert: number;
    progressAlert: number;
    goalAchievement: number;
  };
}

interface HealthConfig {
  _id: string;
  version: string;
  healthFields: HealthField[];
  aiConfig: AIConfig;
  privacySettings: {
    defaultVisibility: 'public' | 'center' | 'instructor' | 'private';
    allowUserControl: boolean;
    dataRetentionDays: number;
    anonymizeAfterDays: number;
  };
  permissions: {
    superAdmin: string[];
    centerAdmin: string[];
    instructor: string[];
    student: string[];
  };
}

function HealthConfigPage() {
  const { user } = useAuth();
  
  // 상태 관리
  const [healthConfig, setHealthConfig] = useState<HealthConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  const [editingField, setEditingField] = useState<HealthField | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);

  // 새 필드 폼 상태
  const [newField, setNewField] = useState<Partial<HealthField>>({
    name: '',
    type: 'string',
    unit: '',
    required: false,
    category: 'custom',
    description: '',
    isActive: true
  });

  // 권한 확인
  useEffect(() => {
    if (user && user.userType !== 'superAdmin') {
      alert('최고관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // 건강정보 설정 로드
  const loadHealthConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/health-config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHealthConfig(data.data);
          console.log('✅ 건강정보 설정 로드 완료:', data.data);
        } else {
          console.error('건강정보 설정 로드 실패:', data.message);
        }
      } else {
        console.error('건강정보 설정 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('건강정보 설정 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    if (user && user.userType === 'superAdmin') {
      loadHealthConfig();
    }
  }, [user, loadHealthConfig]);

  // 건강정보 항목 추가
  const handleAddField = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/health-config/fields', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newField)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ 건강정보 항목 추가 완료');
          setIsAddingField(false);
          setNewField({
            name: '',
            type: 'string',
            unit: '',
            required: false,
            category: 'custom',
            description: '',
            isActive: true
          });
          loadHealthConfig(); // 새로고침
        }
      }
    } catch (error) {
      console.error('건강정보 항목 추가 오류:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // AI 설정 업데이트
  const handleUpdateAIConfig = async (aiConfig: Partial<AIConfig>) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/health-config/ai', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(aiConfig)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ AI 설정 업데이트 완료');
          loadHealthConfig(); // 새로고침
        }
      }
    } catch (error) {
      console.error('AI 설정 업데이트 오류:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">건강정보 설정을 불러오는 중...</span>
      </div>
    );
  }

  if (!healthConfig) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              건강정보 설정을 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 건강정보 설정을 생성하시겠습니까?
            </p>
            <Button onClick={loadHealthConfig} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              기본 설정 생성
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏥 건강정보 시스템 설정
        </h1>
        <p className="text-gray-600">
          건강정보 항목, 정상범주, 운동추천, AI 알고리즘을 관리하세요
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('fields')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fields'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            건강정보 항목
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Brain className="h-4 w-4 inline mr-2" />
            AI 알고리즘
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            개인정보 설정
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            권한 설정
          </button>
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          {/* 건강정보 항목 관리 */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  건강정보 항목 관리
                </h2>
                <Button
                  onClick={() => setIsAddingField(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  항목 추가
                </Button>
              </div>

              {/* 항목 목록 */}
              <div className="space-y-3">
                {healthConfig.healthFields
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">
                            {field.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({field.type})
                          </span>
                          {field.unit && (
                            <span className="text-sm text-gray-500">
                              {field.unit}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            field.category === 'basic' ? 'bg-blue-100 text-blue-800' :
                            field.category === 'vital' ? 'bg-red-100 text-red-800' :
                            field.category === 'medical' ? 'bg-purple-100 text-purple-800' :
                            field.category === 'fitness' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {field.category}
                          </span>
                          {field.required && (
                            <span className="text-red-500 text-sm">필수</span>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingField(field)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className={`${
                            field.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {field.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* 새 항목 추가 폼 */}
              {isAddingField && (
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    새 건강정보 항목 추가
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        항목명 *
                      </label>
                      <input
                        type="text"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 혈압, 혈당 등"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        타입 *
                      </label>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="string">텍스트</option>
                        <option value="number">숫자</option>
                        <option value="select">선택형</option>
                        <option value="boolean">예/아니오</option>
                        <option value="date">날짜</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        단위
                      </label>
                      <input
                        type="text"
                        value={newField.unit}
                        onChange={(e) => setNewField({ ...newField, unit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: cm, kg, mmHg 등"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        카테고리
                      </label>
                      <select
                        value={newField.category}
                        onChange={(e) => setNewField({ ...newField, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="basic">기본정보</option>
                        <option value="vital">생체징후</option>
                        <option value="medical">의료정보</option>
                        <option value="fitness">체력정보</option>
                        <option value="custom">사용자정의</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        설명
                      </label>
                      <textarea
                        value={newField.description}
                        onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="항목에 대한 상세 설명"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">필수 항목</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <Button
                      onClick={() => setIsAddingField(false)}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleAddField}
                      disabled={!newField.name || isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          저장
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* AI 알고리즘 설정 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                AI 알고리즘 설정
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 파라미터 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">기본 파라미터</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        학습률 (Learning Rate)
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={healthConfig.aiConfig.parameters.learningRate}
                        onChange={(e) => {
                          const newConfig = {
                            ...healthConfig.aiConfig,
                            parameters: {
                              ...healthConfig.aiConfig.parameters,
                              learningRate: parseFloat(e.target.value)
                            }
                          };
                          handleUpdateAIConfig(newConfig);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        신뢰도 (Confidence)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={healthConfig.aiConfig.parameters.confidence}
                        onChange={(e) => {
                          const newConfig = {
                            ...healthConfig.aiConfig,
                            parameters: {
                              ...healthConfig.aiConfig.parameters,
                              confidence: parseFloat(e.target.value)
                            }
                          };
                          handleUpdateAIConfig(newConfig);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        최대 추천 수
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={healthConfig.aiConfig.parameters.maxRecommendations}
                        onChange={(e) => {
                          const newConfig = {
                            ...healthConfig.aiConfig,
                            parameters: {
                              ...healthConfig.aiConfig.parameters,
                              maxRecommendations: parseInt(e.target.value)
                            }
                          };
                          handleUpdateAIConfig(newConfig);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 기능 설정 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">기능 설정</h3>
                  <div className="space-y-3">
                    {Object.entries(healthConfig.aiConfig.features).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => {
                            const newConfig = {
                              ...healthConfig.aiConfig,
                              features: {
                                ...healthConfig.aiConfig.features,
                                [key]: e.target.checked
                              }
                            };
                            handleUpdateAIConfig(newConfig);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key === 'personalizedRecommendations' && '개인 맞춤형 추천'}
                          {key === 'riskAssessment' && '위험도 평가'}
                          {key === 'progressTracking' && '진행상황 추적'}
                          {key === 'goalSetting' && '목표 설정'}
                          {key === 'socialComparison' && '소셜 비교'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* 개인정보 보호 설정 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                개인정보 보호 설정
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    기본 공개 설정
                  </label>
                  <select
                    value={healthConfig.privacySettings.defaultVisibility}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="private">비공개</option>
                    <option value="instructor">강사만</option>
                    <option value="center">센터 내</option>
                    <option value="public">공개</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    데이터 보존 기간 (일)
                  </label>
                  <input
                    type="number"
                    value={healthConfig.privacySettings.dataRetentionDays}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={healthConfig.privacySettings.allowUserControl}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    사용자가 개별 항목 공개/비공개 설정 가능
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* 권한 설정 */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                권한별 접근 설정
              </h2>
              <div className="space-y-4">
                {Object.entries(healthConfig.permissions).map(([role, permissions]) => (
                  <div key={role} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {role === 'superAdmin' && '최고관리자'}
                      {role === 'centerAdmin' && '센터관리자'}
                      {role === 'instructor' && '강사'}
                      {role === 'student' && '회원'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      권한: {permissions.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default withAuth(HealthConfigPage, { requireTypes: ['superAdmin'] });
