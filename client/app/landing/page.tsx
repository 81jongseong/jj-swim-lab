/**
 * @file 랜딩 페이지 (게스트 전용)
 * @description JJ Swim Lab 랜딩 페이지 - 게스트 사용자를 위한 전용 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 * 
 * @연동되는 데이터:
 * - 랜딩 페이지 콘텐츠 (제목, 부제목, 설명, 버튼 텍스트)
 * 
 * @연동되는 파일:
 * - components/HeroWave.tsx (히어로 섹션)
 * - components/WaterRippleBackground.tsx (배경 애니메이션)
 * - components/LottiePlayer.tsx (Lottie 애니메이션)
 * - lib/motion.ts (애니메이션 프리셋)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionPresets, staggerContainer } from '../../lib/motion';
import HeroWave from '../../components/HeroWave';
import WaterRippleBackground from '../../components/WaterRippleBackground';
import LottiePlayer from '../../components/LottiePlayer';

export default function LandingPage() {
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
      href: "/auth/signup?type=instructor"
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
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
            {/* AI 기반 개인 맞춤형 강습법 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-6 group-hover:shadow-lg transition-shadow">
                <LottiePlayer
                  src="/animations/ai-brain.json"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-foreground mb-3">AI 기반 개인 맞춤형 강습법</h3>
                <p className="text-muted-foreground">
                  개인의 수영 실력과 목표에 맞춘 최적화된 강습법을 AI가 추천합니다.
                </p>
              </div>
            </motion.div>

            {/* 실시간 진도 관리 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 mb-6 group-hover:shadow-lg transition-shadow">
                <LottiePlayer
                  src="/animations/progress-chart.json"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-foreground mb-3">실시간 진도 관리</h3>
                <p className="text-muted-foreground">
                  수영 실력 향상을 실시간으로 추적하고 개선점을 제안합니다.
                </p>
              </div>
            </motion.div>

            {/* 전문 강사진 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 mb-6 group-hover:shadow-lg transition-shadow">
                <LottiePlayer
                  src="/animations/teacher.json"
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-foreground mb-3">전문 강사진</h3>
                <p className="text-muted-foreground">
                  경험이 풍부한 전문 강사들이 체계적인 수영 교육을 제공합니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 배경 애니메이션 */}
      <WaterRippleBackground />
    </div>
  );
}
