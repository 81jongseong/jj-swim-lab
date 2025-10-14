/**
 * @file 홈 페이지 (통합 랜딩 페이지)
 * @description JJ Swim Lab 메인 홈페이지 - 로그인 시 대시보드 리다이렉트, 미로그인 시 랜딩 페이지 표시
 * @date 2025-10-14
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
 * 
 * @주의사항:
 * - /landing 페이지는 제거됨 (중복 방지)
 * - 이용안내는 /guide 페이지에서 별도 관리
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
  const landingContent = {
    title: "JJ Swim Lab",
    subtitle: "AI 기반 수영 교육 플랫폼",
    description: "개인 맞춤형 수영 강습법, 퀴즈, 진도 관리로 더 나은 수영을 경험하세요",
    ctaPrimary: {
      text: "수강생 시작하기",
      href: "/auth/signup?type=student"
    },
    ctaSecondary: {
      text: "강사 등록하기",
      href: "/auth/signup-instructor"
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* 히어로 섹션 */}
      <HeroWave 
        title={landingContent.title}
        subtitle={landingContent.subtitle}
        description={landingContent.description}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* 개인화된 학습 */}
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

            {/* 실시간 피드백 */}
            <motion.div
              variants={motionPresets.appear}
              className="bg-card p-8 rounded-lg shadow-lg text-center"
            >
              <div className="text-5xl text-primary mb-4">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">실시간 피드백</h3>
              <p className="text-muted-foreground">
                강사로부터 즉각적인 피드백을 받아 빠르게 실력을 향상시키세요.
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

      {/* 워터 리플 배경 */}
      <WaterRippleBackground>
        <div></div>
      </WaterRippleBackground>
    </div>
  );
}
