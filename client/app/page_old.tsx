'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionPresets, staggerContainer } from '@/lib/motion';
import HeroWave from '@/components/HeroWave';
import WaterRippleBackground from '@/components/WaterRippleBackground';
// import ThreeSplash from '@/components/ThreeSplash'; // 컴포넌트 누락으로 임시 비활성화
import LottiePlayer from '@/components/LottiePlayer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 히어로 섹션 */}
      <HeroWave
        title="JJ Swim Lab"
        subtitle="AI 기반 수영 교육 플랫폼"
        description="개인 맞춤형 수영 강습법, 퀴즈, 진도 관리로 더 나은 수영을 경험하세요"
        ctaPrimary={{
          text: "수강생 시작하기",
          href: "/auth/signup?type=student"
        }}
        ctaSecondary={{
          text: "강사 등록하기",
          href: "/auth/signup?type=instructor"
        }}
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

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* AI 자세 분석 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">AI 자세 분석</h3>
                <p className="text-muted-foreground leading-relaxed">
                  실시간 동작 인식 기술로 수영 자세를 정밀 분석하고 개선점을 제시합니다.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>

            {/* 개인화된 학습 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">개인화된 학습</h3>
                <p className="text-muted-foreground leading-relaxed">
                  개별 수준과 목표에 맞춘 맞춤형 커리큘럼과 진도 관리를 제공합니다.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>

            {/* 실시간 피드백 */}
            <motion.div
              variants={motionPresets.slideUp}
              className="group relative overflow-hidden rounded-2xl bg-card p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">실시간 피드백</h3>
                <p className="text-muted-foreground leading-relaxed">
                  즉각적인 분석 결과와 개선 방안을 통해 효과적인 학습을 지원합니다.
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3D 시각화 섹션 */}
      <section className="py-20 bg-muted/30">
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
              <span className="bg-gradient-text">3D 수영 시뮬레이션</span>
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              실제와 같은 3D 환경에서 수영 동작을 시각화하고 분석합니다.
            </motion.p>
          </motion.div>

          <motion.div
            variants={motionPresets.slideUp}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600/10 to-cyan-600/10 p-8 border border-border">
              {/* ThreeSplash 컴포넌트 누락으로 임시 대체 */}
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏊‍♂️</div>
                  <h3 className="text-2xl font-bold text-foreground">3D 수영 시뮬레이션</h3>
                  <p className="text-muted-foreground mt-2">곧 제공될 예정입니다</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 수중 배경 효과 */}
      <WaterRippleBackground />

      {/* 애니메이션 섹션 */}
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
              <span className="bg-gradient-text">스마트 학습 경험</span>
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              인터랙티브 애니메이션과 시각적 피드백으로 더 효과적인 학습을 제공합니다.
            </motion.p>
          </motion.div>

          <motion.div
            variants={motionPresets.slideUp}
            className="relative max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-8 border border-border">
              <LottiePlayer
                src="/animations/swimming-stroke.json"
                style={{ width: '100%', height: '400px' }}
                loop
                autoplay
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8"
          >
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">만족한 수강생</div>
            </motion.div>
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">전문 강사진</div>
            </motion.div>
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">AI 지원</div>
            </motion.div>
            <motion.div
              variants={motionPresets.slideUp}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">만족도</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={motionPresets.slideUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              <span className="bg-gradient-text">지금 시작하세요</span>
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              AI 기반 수영 교육의 새로운 경험을 시작해보세요.
            </motion.p>
            <motion.div
              variants={motionPresets.slideUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/auth/signup?type=student"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                수강생으로 시작하기
              </a>
              <a
                href="/auth/signup?type=instructor"
                className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/25"
              >
                강사로 등록하기
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}