/**
 * @file 홈 페이지 (게스트 랜딩 페이지)
 * @description JJ Swim Lab 메인 홈페이지 - 게스트 사용자를 위한 랜딩 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 * 
 * @연동되는 데이터:
 * - useAuth 훅 (사용자 인증 상태)
 * - 사용자 유형별 대시보드 라우팅
 * 
 * @연동되는 파일:
 * - hooks/useAuth.tsx (인증 상태 관리)
 * - components/HeroWave.tsx (히어로 섹션)
 * - components/WaterRippleBackground.tsx (배경 애니메이션)
 * - components/LottiePlayer.tsx (Lottie 애니메이션)
 * - lib/motion.ts (애니메이션 프리셋)
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { motionPresets, staggerContainer } from '../lib/motion';
import HeroWave from 'components/HeroWave';
import WaterRippleBackground from 'components/WaterRippleBackground';
import LottiePlayer from 'components/LottiePlayer';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!loading) {
      if (user) {
        // 계정 유형별 대시보드로 리다이렉트
        const dashboardRoutes = {
          superAdmin: '/admin/dashboard',
          centerAdmin: '/center-admin/dashboard', 
          instructor: '/instructor/dashboard',
          student: '/student/dashboard',
        };

        const targetRoute = dashboardRoutes[user.userType as keyof typeof dashboardRoutes];
        
        if (targetRoute) {
          console.log(`🏠 홈페이지 리다이렉트: ${user.userType} → ${targetRoute}`);
          router.push(targetRoute);
        } else {
          console.warn(`⚠️ 알 수 없는 사용자 유형: ${user.userType}`);
          // 알 수 없는 유형은 랜딩 페이지 유지
          setShowLanding(true);
        }
      } else {
        // 미로그인 사용자에게는 랜딩 페이지 표시
        setShowLanding(true);
      }
    }
  }, [user, loading, router]);

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 랜딩 페이지 표시
  if (showLanding) {
    return <LandingPage />;
  }

  // 기본 로딩 화면
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">페이지를 준비 중입니다...</p>
      </div>
    </div>
  );
}

function LandingPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [landingContent, setLandingContent] = useState({
    title: "JJ Swim Lab",
    subtitle: "AI 기반 수영 교육 플랫폼",
    description: "개인 맞춤형 수영 강습법, 퀴즈, 진도 관리로 더 나은 수영을 경험하세요",
    ctaPrimary: {
      text: "수강생 시작하기",
      href: "/auth/signup?type=student"
    },
    ctaSecondary: {
      text: "강사 등록하기",
      href: "/auth/signup?type=instructor"
    }
  });

  // 편집 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 내용 저장
  const saveContent = () => {
    // 실제로는 API 호출로 저장
    console.log('랜딩 페이지 내용 저장:', landingContent);
    setIsEditing(false);
    alert('랜딩 페이지 내용이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* 편집 모드 버튼 (개발용) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleEditMode}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? '편집 완료' : '랜딩 페이지 편집'}
        </button>
      </div>

      {/* 편집 모달 */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">랜딩 페이지 편집</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={landingContent.title}
                  onChange={(e) => setLandingContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">부제목</label>
                <input
                  type="text"
                  value={landingContent.subtitle}
                  onChange={(e) => setLandingContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <textarea
                  value={landingContent.description}
                  onChange={(e) => setLandingContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">주요 버튼 텍스트</label>
                  <input
                    type="text"
                    value={landingContent.ctaPrimary.text}
                    onChange={(e) => setLandingContent(prev => ({ 
                      ...prev, 
                      ctaPrimary: { ...prev.ctaPrimary, text: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">보조 버튼 텍스트</label>
                  <input
                    type="text"
                    value={landingContent.ctaSecondary.text}
                    onChange={(e) => setLandingContent(prev => ({ 
                      ...prev, 
                      ctaSecondary: { ...prev.ctaSecondary, text: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={saveContent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 히어로 섹션 */}
      <HeroWave
        title={landingContent.title}
        subtitle={landingContent.subtitle}
        description={landingContent.description}
        ctaPrimary={landingContent.ctaPrimary}
        ctaSecondary={landingContent.ctaSecondary}
      />

      {/* 기능 소개 섹션 */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={motionPresets.slideUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              <span className="bg-gradient-text">왜 JJ Swim Lab인가요?</span>
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              AI 기술과 전문 지식을 결합하여 개인 맞춤형 수영 교육을 제공합니다.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* 기능 카드 1 */}
            <motion.div
              variants={motionPresets.appear}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <div className="text-5xl text-primary mb-4">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">AI 자세 분석</h3>
              <p className="text-muted-foreground">
                실시간 AI 분석으로 정확한 자세 피드백을 받아보세요.
              </p>
            </motion.div>

            {/* 기능 카드 2 */}
            <motion.div
              variants={motionPresets.appear}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <div className="text-5xl text-primary mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">개인화된 학습</h3>
              <p className="text-muted-foreground">
                개인의 실력과 목표에 맞춰 최적화된 학습 계획을 제공합니다.
              </p>
            </motion.div>

            {/* 기능 카드 3 */}
            <motion.div
              variants={motionPresets.appear}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <div className="text-5xl text-primary mb-4">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">실시간 피드백</h3>
              <p className="text-muted-foreground">
                강사 및 AI로부터 즉각적인 피드백을 받아 빠르게 실력을 향상시키세요.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3D 시뮬레이션 섹션 */}
      <section className="py-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            3D 수영 시뮬레이션으로 몰입감 있는 학습
          </motion.h2>
          <motion.p
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-xl mb-12 max-w-3xl mx-auto"
          >
            고급 3D 기술을 활용하여 실제와 같은 수영 환경에서 연습하고 분석합니다.
          </motion.p>
          <motion.div
            variants={motionPresets.appear}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="relative w-full h-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* 3D 시뮬레이션 임시 대체 UI */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏊‍♂️</div>
                <h3 className="text-2xl font-bold text-white">3D 수영 시뮬레이션</h3>
                <p className="text-gray-300 mt-2">곧 제공될 예정입니다</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 스마트 학습 경험 섹션 */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={motionPresets.slideRight}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">
                스마트한 학습 경험
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                JJ Swim Lab은 단순한 강습을 넘어, AI 기반의 스마트한 학습 경험을 제공합니다.
                개인화된 퀴즈, 맞춤형 운동 추천, 그리고 상세한 진도 보고서로
                당신의 수영 실력을 한 단계 업그레이드하세요.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-primary mr-3"></i>
                  개인 맞춤형 퀴즈로 이론 완벽 마스터
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-primary mr-3"></i>
                  AI 기반 운동 추천으로 효율적인 훈련
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check-circle text-primary mr-3"></i>
                  상세한 진도 보고서로 성장 과정 한눈에 확인
                </li>
              </ul>
            </motion.div>
            <motion.div
              variants={motionPresets.slideLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative w-full h-80 md:h-96"
            >
              <div className="w-full h-64 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🏊‍♂️</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-12"
          >
            JJ Swim Lab의 놀라운 성과
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              variants={motionPresets.appear}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-lg"
            >
              <div className="text-6xl font-bold text-primary mb-3">95%</div>
              <p className="text-xl text-muted-foreground">정확한 자세 분석</p>
            </motion.div>
            <motion.div
              variants={motionPresets.appear}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-lg"
            >
              <div className="text-6xl font-bold text-primary mb-3">80%</div>
              <p className="text-xl text-muted-foreground">실력 향상</p>
            </motion.div>
            <motion.div
              variants={motionPresets.appear}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-card p-8 rounded-lg shadow-lg"
            >
              <div className="text-6xl font-bold text-primary mb-3">10K+</div>
              <p className="text-xl text-muted-foreground">만족한 사용자</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            지금 바로 JJ Swim Lab과 함께하세요!
          </motion.h2>
          <motion.p
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-3xl mx-auto"
          >
            AI 기반의 혁신적인 수영 교육을 경험하고, 당신의 잠재력을 최대한 발휘하세요.
          </motion.p>
          <motion.div
            variants={motionPresets.slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <a
              href="/auth/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300"
            >
              무료로 시작하기
            </a>
          </motion.div>
        </div>
      </section>

      {/* 워터 리플 배경 */}
      <WaterRippleBackground>
        <div></div>
      </WaterRippleBackground>
    </div>
  );
}
