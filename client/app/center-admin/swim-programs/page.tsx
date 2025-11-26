/**
 * 🏊‍♂️ JJ Swim Lab - 수영 프로그램 관리 페이지 (센터 관리자용)
 * 
 * 📋 **페이지 목적**
 * - 센터 전체 수영 프로그램 관리 및 모니터링
 * - 회원별 맞춤형 수영 계획 현황 파악
 * - 강사별 프로그램 실행 성과 분석
 * - 센터 전체 건강 프로그램 통계 및 인사이트
 * 
 * 🔄 **주요 기능**
 * - 센터 전체 수영 프로그램 현황 대시보드
 * - 회원별 건강 상태 및 수영 계획 통계
 * - 강사별 프로그램 실행 성과 분석
 * - 프로그램 효과성 분석 및 개선 제안
 * - 센터 전체 건강 지표 모니터링
 * 
 * 🗄️ **데이터 연동**
 * - 수영 트레이닝 엔진 (../swim-training-engine)
 * - 센터 회원 데이터베이스
 * - 강사별 프로그램 실행 데이터
 * - 건강 프로그램 통계 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - shadcn/ui 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 개인정보 보호 및 익명화
 * 2. 통계 데이터의 정확성
 * 3. 프로그램 효과성 측정의 객관성
 * 4. 강사별 성과 비교의 공정성
 * 5. 데이터 시각화의 명확성
 * 
 * 📅 **개발 히스토리**
 * - 2024-09-23: 초기 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardGrid, PageHeader } from '@/components/common';

export default function SwimProgramsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  // 샘플 통계 데이터
  const centerStats = {
    totalMembers: 156,
    activePrograms: 23,
    weeklySessions: 89,
    avgAdherence: 78.5,
    healthImprovements: 12
  };

  // 샘플 프로그램 데이터
  const programs = [
    {
      id: '1',
      name: '허리 건강 수영',
      instructor: '김강사',
      members: 12,
      adherence: 85,
      effectiveness: '높음',
      focus: ['허리디스크', '만성요통']
    },
    {
      id: '2',
      name: '무릎 재활 수영',
      instructor: '이강사',
      members: 8,
      adherence: 92,
      effectiveness: '매우 높음',
      focus: ['무릎골관절염', '무릎부상']
    },
    {
      id: '3',
      name: '고혈압 관리 수영',
      instructor: '박강사',
      members: 15,
      adherence: 76,
      effectiveness: '보통',
      focus: ['고혈압', '심혈관질환']
    }
  ];

  // 샘플 회원 통계
  const memberStats = [
    { condition: '허리디스크', count: 45, improvement: 78 },
    { condition: '무릎골관절염', count: 32, improvement: 85 },
    { condition: '어깨충돌증후군', count: 28, improvement: 72 },
    { condition: '고혈압', count: 38, improvement: 68 },
    { condition: '비만', count: 52, improvement: 82 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <PageHeader
        title="🏊‍♂️ 수영 프로그램 관리"
        description="센터 전체 수영 프로그램 현황 및 성과 분석"
        className="mb-8"
      />

      {/* 메인 탭 */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 개요
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'programs'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏊‍♂️ 프로그램
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 회원 현황
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'instructors'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👨‍🏫 강사 성과
          </button>
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <CardGrid gap={6}>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">전체 회원</h3>
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{centerStats.totalMembers}</div>
                <p className="text-xs text-gray-500">활성 프로그램 참여자</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">활성 프로그램</h3>
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{centerStats.activePrograms}</div>
                <p className="text-xs text-gray-500">현재 운영 중인 프로그램</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">주간 세션</h3>
                  <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{centerStats.weeklySessions}</div>
                <p className="text-xs text-gray-500">이번 주 진행된 세션</p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">평균 순응도</h3>
                  <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{centerStats.avgAdherence}%</div>
                <p className="text-xs text-gray-500">프로그램 참여율</p>
              </div>
            </CardGrid>

            {/* 건강 개선 현황 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 건강 개선 현황</h3>
              <p className="text-gray-600 mb-4">관절질환별 회원 수 및 개선률</p>
              <div className="space-y-4">
                {memberStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{stat.condition}</h4>
                        <p className="text-sm text-gray-600">{stat.count}명 참여</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{stat.improvement}%</div>
                      <p className="text-xs text-gray-600">개선률</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🕒 최근 활동</h3>
              <p className="text-gray-600 mb-4">센터 프로그램 관련 최근 활동</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">새로운 수영 프로그램 시작</p>
                    <p className="text-xs text-gray-600">2시간 전</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">허리 건강 프로그램 효과성 증가</p>
                    <p className="text-xs text-gray-600">1일 전</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">5명의 새 회원이 프로그램에 참여</p>
                    <p className="text-xs text-gray-600">2일 전</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 프로그램 탭 */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🏊‍♂️ 활성 수영 프로그램</h3>
              <p className="text-gray-600 mb-4">현재 운영 중인 맞춤형 수영 프로그램 목록</p>
              <div className="space-y-4">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{program.name}</h4>
                        <p className="text-sm text-gray-600">담당 강사: {program.instructor}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          program.effectiveness === '매우 높음' ? 'bg-green-100 text-green-800' : 
                          program.effectiveness === '높음' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {program.effectiveness}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{program.members}</div>
                        <div className="text-sm text-gray-600">참여 회원</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{program.adherence}%</div>
                        <div className="text-sm text-gray-600">순응도</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{program.focus.length}</div>
                        <div className="text-sm text-gray-600">대상 질환</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">대상 질환</h5>
                      <div className="flex space-x-1">
                        {program.focus.map((condition, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        상세 분석
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors">
                        프로그램 수정
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 회원 현황 탭 */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 회원 건강 현황</h3>
              <p className="text-gray-600 mb-4">관절질환별 회원 분포 및 프로그램 참여 현황</p>
              <div className="space-y-6">
                {/* 관절질환별 분포 */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">관절질환별 회원 분포</h4>
                  <div className="space-y-3">
                    {memberStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <span className="font-medium text-gray-900">{stat.condition}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{stat.count}명</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(stat.count / Math.max(...memberStats.map(s => s.count))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 프로그램 참여 현황 */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">프로그램 참여 현황</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-green-800">활성 참여자</h5>
                        <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">124명</div>
                      <p className="text-sm text-green-700">79.5%</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-yellow-800">일시 중단</h5>
                        <div className="w-5 h-5 bg-yellow-600 rounded-full"></div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">32명</div>
                      <p className="text-sm text-yellow-700">20.5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 강사 성과 탭 */}
        {activeTab === 'instructors' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👨‍🏫 강사별 성과 분석</h3>
              <p className="text-gray-600 mb-4">강사별 프로그램 운영 성과 및 회원 만족도</p>
              <div className="space-y-4">
                {[
                  {
                    name: '김강사',
                    programs: 3,
                    members: 35,
                    avgAdherence: 85,
                    satisfaction: 4.8,
                    effectiveness: '매우 높음'
                  },
                  {
                    name: '이강사',
                    programs: 2,
                    members: 28,
                    avgAdherence: 92,
                    satisfaction: 4.9,
                    effectiveness: '매우 높음'
                  },
                  {
                    name: '박강사',
                    programs: 4,
                    members: 42,
                    avgAdherence: 78,
                    satisfaction: 4.6,
                    effectiveness: '높음'
                  }
                ].map((instructor, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{instructor.name}</h4>
                          <p className="text-sm text-gray-600">{instructor.programs}개 프로그램 운영</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        instructor.effectiveness === '매우 높음' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {instructor.effectiveness}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{instructor.members}</div>
                        <div className="text-sm text-gray-600">담당 회원</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{instructor.avgAdherence}%</div>
                        <div className="text-sm text-gray-600">평균 순응도</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{instructor.satisfaction}</div>
                        <div className="text-sm text-gray-600">만족도</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        상세 분석
                      </button>
                      <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300 transition-colors">
                        성과 리포트
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}