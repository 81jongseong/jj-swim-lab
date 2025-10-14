/**
 * 💰 JJ Swim Lab - 요금 정책 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 사용자 타입별 차등 요금 정책 설정 및 관리
 * - 강사 센터 소속 여부에 따른 요금 차등 정책 관리
 * - 할인율 및 특별 요금 정책 설정
 * - 요금 정책 변경 이력 관리
 * 
 * 🔄 **주요 기능**
 * - 요금 정책 조회 및 수정
 * - 사용자 타입별 요금 설정
 * - 할인율 및 특별 요금 정책 관리
 * - 요금 정책 변경 이력 추적
 * - 실시간 요금 미리보기
 * 
 * 📅 **개발 히스토리**
 * - 2025-10-14: 초기 요금 정책 관리 페이지 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PricingPolicy {
  student: {
    monthly: number;
    annual: number;
    features: string[];
  };
  instructorPersonal: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
  instructorBusiness: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
  centerManaged: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
}

interface PricingPreview {
  userType: string;
  pricingTier: string;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountReason: string;
  features: string[];
}

export default function PricingPolicyPage() {
  const [pricingPolicy, setPricingPolicy] = useState<PricingPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<PricingPreview[]>([]);
  const [activeTab, setActiveTab] = useState<'policy' | 'preview'>('policy');

  useEffect(() => {
    loadPricingPolicy();
    generatePreview();
  }, []);

  const loadPricingPolicy = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/pricing/policy', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPricingPolicy(data.data);
      }
    } catch (error) {
      console.error('요금 정책 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      // 각 사용자 타입별 요금 미리보기 생성
      const previewData: PricingPreview[] = [
        {
          userType: 'student',
          pricingTier: 'standard',
          baseAmount: 30000,
          discountAmount: 0,
          finalAmount: 30000,
          discountReason: '',
          features: ['기본 프로그램', '진도 추적', '3D 뷰어', '퀴즈']
        },
        {
          userType: 'instructor',
          pricingTier: 'instructor_discount',
          baseAmount: 30000,
          discountAmount: 15000,
          finalAmount: 15000,
          discountReason: '강사 개인 이용 할인',
          features: ['기본 프로그램', '진도 추적', '3D 뷰어']
        },
        {
          userType: 'instructor',
          pricingTier: 'instructor_business',
          baseAmount: 30000,
          discountAmount: 10000,
          finalAmount: 20000,
          discountReason: '프리랜서 강사 할인',
          features: ['전체 기능', '보고서', '학생 관리', '평가 작성']
        },
        {
          userType: 'instructor',
          pricingTier: 'center_managed',
          baseAmount: 30000,
          discountAmount: 30000,
          finalAmount: 0,
          discountReason: '센터 소속 강사 (센터 부담)',
          features: ['전체 기능', '고급 분석', '센터 관리']
        }
      ];
      
      setPreview(previewData);
    } catch (error) {
      console.error('미리보기 생성 오류:', error);
    }
  };

  const savePricingPolicy = async () => {
    if (!pricingPolicy) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/pricing/policy', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricingPolicy)
      });

      if (response.ok) {
        alert('요금 정책이 성공적으로 업데이트되었습니다.');
        generatePreview();
      } else {
        alert('요금 정책 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('요금 정책 저장 오류:', error);
      alert('요금 정책 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const updatePolicy = (section: keyof PricingPolicy, field: string, value: any) => {
    if (!pricingPolicy) return;

    setPricingPolicy(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">요금 정책을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 요금 정책 관리</h1>
          <p className="text-gray-600">사용자 타입별 차등 요금 정책을 설정하고 관리합니다.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('policy')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'policy'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 요금 정책 설정
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👁️ 요금 미리보기
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'policy' && pricingPolicy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* 학생 요금 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🏊 학생 (회원) 요금
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.student.monthly}
                      onChange={(e) => updatePolicy('student', 'monthly', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연 요금 (10개월)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.student.annual}
                      onChange={(e) => updatePolicy('student', 'annual', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제공 기능
                </label>
                <div className="flex flex-wrap gap-2">
                  {pricingPolicy.student.features.map((feature, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 강사 개인 이용 요금 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                👨‍🏫 강사 개인 이용 요금
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.instructorPersonal.monthly}
                      onChange={(e) => updatePolicy('instructorPersonal', 'monthly', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.instructorPersonal.annual}
                      onChange={(e) => updatePolicy('instructorPersonal', 'annual', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    할인율
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={pricingPolicy.instructorPersonal.discountRate}
                      onChange={(e) => updatePolicy('instructorPersonal', 'discountRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 프리랜서 강사 요금 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                💼 프리랜서 강사 요금
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.instructorBusiness.monthly}
                      onChange={(e) => updatePolicy('instructorBusiness', 'monthly', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.instructorBusiness.annual}
                      onChange={(e) => updatePolicy('instructorBusiness', 'annual', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    할인율
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={pricingPolicy.instructorBusiness.discountRate}
                      onChange={(e) => updatePolicy('instructorBusiness', 'discountRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 센터 관리 요금 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🏢 센터 관리 요금
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 요금 (센터 부담)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.centerManaged.monthly}
                      onChange={(e) => updatePolicy('centerManaged', 'monthly', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연 요금
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pricingPolicy.centerManaged.annual}
                      onChange={(e) => updatePolicy('centerManaged', 'annual', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    할인율
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={pricingPolicy.centerManaged.discountRate}
                      onChange={(e) => updatePolicy('centerManaged', 'discountRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={savePricingPolicy}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '요금 정책 저장'}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {preview.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.userType === 'student' ? '🏊 학생' : '👨‍🏫 강사'} 
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({item.pricingTier})
                    </span>
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(item.finalAmount)}
                    </span>
                    {item.discountAmount > 0 && (
                      <span className="text-sm text-green-600 font-semibold">
                        {formatCurrency(item.discountAmount)} 할인
                      </span>
                    )}
                  </div>
                  {item.discountReason && (
                    <p className="text-sm text-gray-600">{item.discountReason}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">제공 기능:</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.features.map((feature, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
