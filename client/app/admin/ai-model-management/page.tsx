/**
 * @file 관리자용 AI 모델 관리 페이지
 * @description 관리자가 AI 모델을 등록, 수정, 삭제하고 관리할 수 있는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui';
import { Card } from '../../../components/ui';
import { Input } from '../../../components/ui';
import { Badge } from '../../../components/ui';
import { ConfirmModal, ErrorState, LoadingState, PageHeader } from '@/components/common';

// AI 모델 카테고리 상수
const AI_MODEL_CATEGORIES = [
  '자세분석',
  '진도예측',
  '추천시스템',
  '성과분석',
  '호흡분석',
  '동작분석',
  '효율성분석',
  '기타'
] as const;

// AI 모델 타입 상수
const AI_MODEL_TYPES = [
  { value: 'classification', label: '분류', icon: '🏷️', color: 'bg-blue-100 text-blue-800' },
  { value: 'regression', label: '회귀', icon: '📈', color: 'bg-green-100 text-green-800' },
  { value: 'clustering', label: '클러스터링', icon: '🔗', color: 'bg-purple-100 text-purple-800' },
  { value: 'recommendation', label: '추천', icon: '💡', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'prediction', label: '예측', icon: '🔮', color: 'bg-red-100 text-red-800' }
] as const;

// AI 모델 상태 상수
const AI_MODEL_STATUS = [
  { value: 'active', label: '활성', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: '비활성', color: 'bg-gray-100 text-gray-800' },
  { value: 'training', label: '학습중', color: 'bg-blue-100 text-blue-800' },
  { value: 'testing', label: '테스트중', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'error', label: '오류', color: 'bg-red-100 text-red-800' }
] as const;

interface AIModel {
  _id: string;
  name: string;
  description: string;
  category: string;
  type: 'classification' | 'regression' | 'clustering' | 'recommendation' | 'prediction';
  status: 'active' | 'inactive' | 'training' | 'testing' | 'error';
  version: string;
  accuracy?: number;
  parameters: { [key: string]: any };
  inputSchema: { [key: string]: any };
  outputSchema: { [key: string]: any };
  trainingData?: string;
  modelPath?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTrained?: string;
  performance?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export default function AIModelManagementPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<AIModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<AIModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    byCategory: { [key: string]: number };
    byType: { [key: string]: number };
    byStatus: { [key: string]: number };
    averageAccuracy: number;
  }>({ total: 0, byCategory: {}, byType: {}, byStatus: {}, averageAccuracy: 0 });

  useEffect(() => {
    if (user?.userType === 'superAdmin' || user?.userType === 'centerAdmin') {
      fetchModels();
    }
  }, [user]);

  useEffect(() => {
    filterModels();
    calculateStats();
  }, [models, searchTerm, selectedCategory, selectedType, selectedStatus]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('JWT 토큰이 없습니다. 로그인이 필요합니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/ai/models', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('AI 모델을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const apiModels = data.data || data;
      
      if (Array.isArray(apiModels)) {
        setModels(apiModels);
      } else {
        throw new Error('AI 모델 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err: any) {
      logger.error('❌ AI 모델 조회 중 오류:', err);
      setError(err.message || 'AI 모델을 불러오는데 실패했습니다.');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = models;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model => model.category === selectedCategory);
    }

    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(model => model.type === selectedType);
    }

    // 상태 필터
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(model => model.status === selectedStatus);
    }

    setFilteredModels(filtered);
  };

  const calculateStats = () => {
    const byCategory: { [key: string]: number } = {};
    const byType: { [key: string]: number } = {};
    const byStatus: { [key: string]: number } = {};
    let totalAccuracy = 0;
    let accuracyCount = 0;

    models.forEach(model => {
      // 카테고리별 통계
      byCategory[model.category] = (byCategory[model.category] || 0) + 1;
      
      // 타입별 통계
      const typeKey = AI_MODEL_TYPES.find(t => t.value === model.type)?.label || model.type;
      byType[typeKey] = (byType[typeKey] || 0) + 1;
      
      // 상태별 통계
      const statusKey = AI_MODEL_STATUS.find(s => s.value === model.status)?.label || model.status;
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
      
      // 정확도 통계
      if (model.accuracy !== undefined) {
        totalAccuracy += model.accuracy;
        accuracyCount++;
      }
    });

    setStats({
      total: models.length,
      byCategory,
      byType,
      byStatus,
      averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0
    });
  };

  const handleFormSubmit = async (modelData: Partial<AIModel>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const url = editingModel 
        ? `http://localhost:5000/api/ai/models/${editingModel._id}`
        : 'http://localhost:5000/api/ai/models';
      
      const method = editingModel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modelData)
      });

      if (response.ok) {
        alert(editingModel ? 'AI 모델이 수정되었습니다!' : 'AI 모델이 추가되었습니다!');
        setIsFormOpen(false);
        setEditingModel(null);
        fetchModels();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || 'AI 모델 저장에 실패했습니다.'}`);
      }
    } catch (error) {
      logger.error('❌ AI 모델 저장 중 오류:', error);
      alert('AI 모델 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (modelId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '이 AI 모델을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            alert('로그인이 필요합니다.');
            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
            return;
          }

          const response = await fetch(`http://localhost:5000/api/ai/models/${modelId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            alert('AI 모델이 삭제되었습니다!');
            fetchModels();
            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
          } else {
            const errorData = await response.json();
            alert(`오류: ${errorData.message || 'AI 모델 삭제에 실패했습니다.'}`);
            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
          }
        } catch (error) {
          logger.error('❌ AI 모델 삭제 중 오류:', error);
          alert('AI 모델 삭제 중 오류가 발생했습니다.');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const handleTrain = async (modelId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/ai/models/${modelId}/train`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('AI 모델 학습이 시작되었습니다!');
        fetchModels();
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.message || 'AI 모델 학습 시작에 실패했습니다.'}`);
      }
    } catch (error) {
      logger.error('❌ AI 모델 학습 중 오류:', error);
      alert('AI 모델 학습 중 오류가 발생했습니다.');
    }
  };

  const handleCardClick = (model: AIModel) => {
    setSelectedModel(model);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (model: AIModel) => {
    setEditingModel(model);
    setIsFormOpen(true);
  };

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <LoadingState message="AI 모델 정보를 불러오는 중..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <ErrorState 
          message={error}
          onRetry={() => {
            setError(null);
            fetchModels();
          }}
          retryText="다시 시도"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <PageHeader
          title="🤖 AI 모델 관리 시스템"
          description="수영 교육을 위한 AI 모델을 등록하고 관리합니다."
        />

        {/* 통계 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">총 모델</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}개</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">평균 정확도</p>
                  <p className="text-2xl font-bold text-green-900">{stats.averageAccuracy.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">카테고리</p>
                  <p className="text-2xl font-bold text-purple-900">{Object.keys(stats.byCategory).length}개</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">타입</p>
                  <p className="text-2xl font-bold text-orange-900">{Object.keys(stats.byType).length}종류</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-500 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">활성 모델</p>
                  <p className="text-2xl font-bold text-red-900">{stats.byStatus['활성'] || 0}개</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 카테고리별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{category}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 타입별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{type}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 상태별 분포</h3>
              <div className="space-y-3">
                {Object.entries(stats.byStatus)
                  .sort(([,a], [,b]) => b - a)
                  .map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{status}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === '활성' ? 'bg-green-500' :
                              status === '학습중' ? 'bg-blue-500' :
                              status === '테스트중' ? 'bg-yellow-500' :
                              status === '오류' ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="AI 모델 이름, 설명, 카테고리로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  {AI_MODEL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 타입</option>
                  {AI_MODEL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 상태</option>
                  {AI_MODEL_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ➕ 새 AI 모델 추가
            </Button>
          </div>
        </div>

        {/* AI 모델 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <Card key={model._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                  <div className="flex gap-2">
                    <Badge className={AI_MODEL_TYPES.find(t => t.value === model.type)?.color || 'bg-gray-100 text-gray-800'}>
                      {AI_MODEL_TYPES.find(t => t.value === model.type)?.icon} {AI_MODEL_TYPES.find(t => t.value === model.type)?.label}
                    </Badge>
                    <Badge className={AI_MODEL_STATUS.find(s => s.value === model.status)?.color || 'bg-gray-100 text-gray-800'}>
                      {AI_MODEL_STATUS.find(s => s.value === model.status)?.label}
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {model.description}
                </p>

                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-500">
                    📂 카테고리: {model.category}
                  </div>
                  <div className="text-sm text-gray-500">
                    🔢 버전: {model.version}
                  </div>
                  {model.accuracy !== undefined && (
                    <div className="text-sm text-gray-500">
                      🎯 정확도: {model.accuracy.toFixed(1)}%
                    </div>
                  )}
                  {model.lastTrained && (
                    <div className="text-sm text-gray-500">
                      📅 마지막 학습: {new Date(model.lastTrained).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <div>생성일: {new Date(model.createdAt).toLocaleDateString()}</div>
                    <div className={model.isActive ? 'text-green-600' : 'text-red-600'}>
                      {model.isActive ? '활성' : '비활성'}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleCardClick(model)}
                    variant="outline"
                    className="flex-1 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    👁️ 상세보기
                  </Button>
                  <Button
                    onClick={() => handleEdit(model)}
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleTrain(model._id)}
                    variant="outline"
                    className="flex-1 bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    🎓 학습
                  </Button>
                  <Button
                    onClick={() => handleDelete(model._id)}
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredModels.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              등록된 AI 모델이 없습니다.
            </div>
          </div>
        )}

        {/* AI 모델 상세보기 모달 */}
        {isDetailModalOpen && selectedModel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedModel.name}</h3>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedModel(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900">설명</h4>
                    <p className="text-gray-600">{selectedModel.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">카테고리</h4>
                      <p className="text-gray-600">{selectedModel.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">타입</h4>
                      <p className="text-gray-600">{AI_MODEL_TYPES.find(t => t.value === selectedModel.type)?.label}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">상태</h4>
                      <p className="text-gray-600">{AI_MODEL_STATUS.find(s => s.value === selectedModel.status)?.label}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">버전</h4>
                      <p className="text-gray-600">{selectedModel.version}</p>
                    </div>
                    {selectedModel.accuracy !== undefined && (
                      <div>
                        <h4 className="font-medium text-gray-900">정확도</h4>
                        <p className="text-gray-600">{selectedModel.accuracy.toFixed(1)}%</p>
                      </div>
                    )}
                    {selectedModel.lastTrained && (
                      <div>
                        <h4 className="font-medium text-gray-900">마지막 학습</h4>
                        <p className="text-gray-600">{new Date(selectedModel.lastTrained).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {selectedModel.performance && (
                    <div>
                      <h4 className="font-medium text-gray-900">성능 지표</h4>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>정확도:</strong> {(selectedModel.performance.accuracy * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-sm text-green-800">
                            <strong>정밀도:</strong> {(selectedModel.performance.precision * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>재현율:</strong> {(selectedModel.performance.recall * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                          <p className="text-sm text-purple-800">
                            <strong>F1 점수:</strong> {(selectedModel.performance.f1Score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => handleTrain(selectedModel._id)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      🎓 학습 시작
                    </Button>
                    <Button
                      onClick={() => handleEdit(selectedModel)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✏️ 수정
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedModel._id)}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI 모델 추가/수정 폼 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingModel ? 'AI 모델 수정' : '새 AI 모델 추가'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingModel(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const modelData = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    category: formData.get('category') as string,
                    type: formData.get('type') as 'classification' | 'regression' | 'clustering' | 'recommendation' | 'prediction',
                    version: formData.get('version') as string,
                    accuracy: parseFloat(formData.get('accuracy') as string) || undefined,
                    parameters: editingModel?.parameters || {},
                    inputSchema: editingModel?.inputSchema || {},
                    outputSchema: editingModel?.outputSchema || {},
                    trainingData: formData.get('trainingData') as string,
                    modelPath: formData.get('modelPath') as string
                  };
                  handleFormSubmit(modelData);
                }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        AI 모델 이름 *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingModel?.name}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 *
                      </label>
                      <select
                        id="category"
                        name="category"
                        defaultValue={editingModel?.category || '자세분석'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {AI_MODEL_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      설명 *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      defaultValue={editingModel?.description}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        타입 *
                      </label>
                      <select
                        id="type"
                        name="type"
                        defaultValue={editingModel?.type || 'classification'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {AI_MODEL_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                        버전 *
                      </label>
                      <Input
                        id="version"
                        name="version"
                        defaultValue={editingModel?.version || '1.0.0'}
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="accuracy" className="block text-sm font-medium text-gray-700 mb-2">
                        정확도 (%)
                      </label>
                      <Input
                        id="accuracy"
                        name="accuracy"
                        type="number"
                        defaultValue={editingModel?.accuracy?.toString()}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="trainingData" className="block text-sm font-medium text-gray-700 mb-2">
                        학습 데이터 경로
                      </label>
                      <Input
                        id="trainingData"
                        name="trainingData"
                        defaultValue={editingModel?.trainingData}
                        placeholder="/path/to/training/data"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="modelPath" className="block text-sm font-medium text-gray-700 mb-2">
                        모델 파일 경로
                      </label>
                      <Input
                        id="modelPath"
                        name="modelPath"
                        defaultValue={editingModel?.modelPath}
                        placeholder="/path/to/model/file"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingModel(null);
                      }}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      {editingModel ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}
