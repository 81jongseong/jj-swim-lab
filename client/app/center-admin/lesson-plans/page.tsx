/**
 * @file 센터관리자용 강습 계획 관리 페이지
 * @description 템플릿 선택 및 센터별 커스터마이징
 * @date 2025-09-20
 * @author JJ Swim Lab
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function CenterLessonPlansPage() {
  const { user, loading } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [myPlans, setMyPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'myplans'>('templates');

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lesson-plan-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data || []);
        }
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  const loadMyPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lesson-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMyPlans(data.data || []);
        }
      }
    } catch (error) {
      console.error('내 강습 계획 로드 오류:', error);
    }
  };

  useEffect(() => {
    // center@swim.com 계정도 센터 관리자로 인식
    const isCenterAdmin = user && (
      ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
      user.email === 'center@swim.com'
    );
    
    if (isCenterAdmin) {
      setIsLoading(true);
      Promise.all([loadTemplates(), loadMyPlans()]).finally(() => {
        setIsLoading(false);
      });
    }
  }, [user]);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">강습 계획을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );

  if (!isCenterAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">센터관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 강습 계획 관리</h1>
        <p className="text-gray-600">템플릿을 선택하여 우리 센터에 맞는 강습 계획을 만들어보세요</p>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'templates'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            📚 템플릿 선택 ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('myplans')}
            className={`px-4 py-2 font-medium transition-colors duration-200 border-b-2 ${
              activeTab === 'myplans'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            📋 내 강습 계획 ({myPlans.length})
          </button>
        </div>

        {activeTab === 'templates' ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 사용 가능한 템플릿</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.templateName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm">{template.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>⏱️ {template.duration}분</span>
                    <span>📝 {template.activities?.length || 0}개 활동</span>
                    <span>👥 {template.usageCount}회 사용</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      // TODO: 템플릿 기반 강습 계획 생성
                      alert(`"${template.templateName}" 템플릿으로 강습 계획을 생성합니다.`);
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📋 이 템플릿으로 계획 만들기
                  </button>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-600">사용 가능한 템플릿이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 내가 만든 강습 계획</h3>
            <div className="space-y-4">
              {myPlans.map((plan) => (
                <div key={plan._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>⏱️ {plan.duration}분</span>
                        <span>📅 {new Date(plan.date).toLocaleDateString()}</span>
                        <span>📍 {plan.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        ✏️ 수정
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {myPlans.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-600">아직 생성된 강습 계획이 없습니다.</p>
                  <p className="text-sm text-gray-500 mt-2">템플릿을 선택하여 첫 번째 강습 계획을 만들어보세요.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
