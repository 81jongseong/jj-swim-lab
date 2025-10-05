/**
 * @file 센터별 매출 관리 페이지
 * @description JJ Swim Lab 센터별 매출 관리 - 각 센터의 실제 운영 수익과 비용을 관리
 * @date 2025-01-13
 * @author JJ Swim Lab
 * 
 * @연동되는 데이터:
 * - 센터별 매출 데이터 (수익원, 비용, 수익성)
 * - 지역별 매출 분포
 * - 기간별 매출 트렌드
 * 
 * @연동되는 파일:
 * - hooks/useAuth.tsx (사용자 권한 확인)
 * - lib/api.ts (API 통신)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCenter, setSelectedCenter] = useState('all');

  // 권한 확인
  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  // 목 데이터
  const mockData = {
    overview: {
      totalRevenue: 125000000,
      netProfit: 45000000,
      growthRate: 12.5,
      targetAchievement: 95.2
    },
    revenueSources: [
      { name: '회원 등록비', amount: 45000000, percentage: 36 },
      { name: '강습비', amount: 60000000, percentage: 48 },
      { name: '개인레슨', amount: 15000000, percentage: 12 },
      { name: '기타 서비스', amount: 5000000, percentage: 4 }
    ],
    costStructure: [
      { name: '인건비', amount: 45000000, percentage: 56.25 },
      { name: '임대료', amount: 20000000, percentage: 25 },
      { name: '제세공과금', amount: 8000000, percentage: 10 },
      { name: '유지보수비', amount: 7000000, percentage: 8.75 }
    ],
    centerPerformance: [
      { name: '강남센터', revenue: 25000000, profit: 8000000, margin: 32 },
      { name: '서초센터', revenue: 22000000, profit: 7000000, margin: 31.8 },
      { name: '송파센터', revenue: 20000000, profit: 6500000, margin: 32.5 },
      { name: '마포센터', revenue: 18000000, profit: 5500000, margin: 30.6 },
      { name: '영등포센터', revenue: 15000000, profit: 4500000, margin: 30 }
    ]
  };

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">매출 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">💰 센터별 매출 관리</h1>
          <p className="text-muted-foreground">각 센터의 실제 운영 수익과 비용을 관리합니다.</p>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">최근 1주</option>
                <option value="month">최근 1개월</option>
                <option value="quarter">최근 3개월</option>
                <option value="year">최근 1년</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">센터</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 센터</option>
                <option value="gangnam">강남센터</option>
                <option value="seocho">서초센터</option>
                <option value="songpa">송파센터</option>
                <option value="mapo">마포센터</option>
                <option value="yeongdeungpo">영등포센터</option>
              </select>
            </div>
          </div>
        </div>

        {/* 개요 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">총 매출</h3>
            <p className="text-2xl font-bold text-foreground">
              {mockData.overview.totalRevenue.toLocaleString()}원
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">순이익</h3>
            <p className="text-2xl font-bold text-green-600">
              {mockData.overview.netProfit.toLocaleString()}원
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">성장률</h3>
            <p className="text-2xl font-bold text-blue-600">
              +{mockData.overview.growthRate}%
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">목표 달성률</h3>
            <p className="text-2xl font-bold text-purple-600">
              {mockData.overview.targetAchievement}%
            </p>
          </div>
        </div>

        {/* 수익원별 분석 */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">수익원별 분석</h2>
          <div className="space-y-4">
            {mockData.revenueSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-foreground">{source.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {source.amount.toLocaleString()}원
                  </p>
                  <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 비용 구조 분석 */}
        <div className="bg-card rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">비용 구조 분석</h2>
          <div className="space-y-4">
            {mockData.costStructure.map((cost, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-foreground">{cost.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {cost.amount.toLocaleString()}원
                  </p>
                  <p className="text-sm text-muted-foreground">{cost.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 센터별 성과 */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-6">센터별 성과</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-foreground">센터명</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">매출</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">순이익</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">수익률</th>
                </tr>
              </thead>
              <tbody>
                {mockData.centerPerformance.map((center, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground">{center.name}</td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {center.revenue.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {center.profit.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600">
                      {center.margin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
