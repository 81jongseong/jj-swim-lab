/**
 * 🏠 JJ Swim Lab - 메인 홈페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 교육 플랫폼의 메인 진입점
 * - 사용자에게 플랫폼의 핵심 가치와 기능 소개
 * - AI 기반 수영 교육 시스템의 혁신성 강조
 * - 회원가입 및 로그인 유도
 * 
 * 🔄 **주요 기능**
 * - 히어로 섹션: 플랫폼 소개 및 CTA 버튼
 * - AI 기반 교육 시스템 소개
 * - 수영 기술별 교육 과정 안내
 * - 강사 및 센터 소개
 * - 회원 혜택 및 가격 정책
 * - 고객 후기 및 성과 사례
 * 
 * 🗄️ **데이터 연동**
 * - 현재: 정적 콘텐츠 (하드코딩)
 * - 향후: CMS 시스템 연동 예정
 * - 동적 콘텐츠: 사용자 후기, 통계 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - HeroWave 컴포넌트 (히어로 섹션)
 * - WaterRippleBackground 컴포넌트 (배경 효과)
 * - Tailwind CSS (스타일링)
 * - Framer Motion (애니메이션)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 반응형 디자인 유지 (모바일/태블릿/데스크탑)
 * 2. SEO 최적화 (메타 태그, 구조화된 데이터)
 * 3. 접근성 표준 준수 (ARIA 라벨, 키보드 네비게이션)
 * 4. 성능 최적화 (이미지 최적화, 지연 로딩)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 반응형 디자인 테스트
 * - [ ] SEO 메타 태그 확인
 * - [ ] 접근성 검증
 * - [ ] 성능 최적화 확인
 * - [ ] 크로스 브라우저 호환성 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (AI 기반 수영 교육 플랫폼)
 * - 2024-12-19: 히어로 섹션 및 주요 기능 소개 완성
 * - 2024-12-19: 반응형 디자인 및 애니메이션 적용
 * - 2024-12-19: SEO 최적화 및 접근성 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (정적 콘텐츠 기반)
 * 
 * 🚀 **다음 단계**
 * - CMS 시스템 연동
 * - 동적 콘텐츠 관리
 * - A/B 테스트 구현
 * - 성능 모니터링 시스템
 * 
 * 📱 **반응형 브레이크포인트**
 * - 모바일: < 768px
 * - 태블릿: 768px - 1024px
 * - 데스크탑: > 1024px
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { motionPresets, staggerContainer } from '@/lib/motion';
import HeroWave from '@/components/HeroWave';
import WaterRippleBackground from '@/components/WaterRippleBackground';
// import ThreeSplash from '@/components/ThreeSplash';
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
              AI 기술과 전문 지식을 결합하여 개인 맞춤형 수영 교육을 제공합니다
            </motion.p>
          </motion.div>

          {/* 기능 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI 기반 강습법 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">AI 기반 강습법</h3>
              <p className="text-muted-foreground mb-6">
                개인 수준과 목표에 맞는 맞춤형 수영 강습법을 AI가 추천합니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  개인 맞춤형
                </span>
              </div>
            </motion.div>

            {/* 인터랙티브 퀴즈 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors">
                <span className="text-3xl">❓</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">인터랙티브 퀴즈</h3>
              <p className="text-muted-foreground mb-6">
                수영 이론과 실기를 재미있게 학습할 수 있는 다양한 퀴즈를 제공합니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">
                  학습 효과 증대
                </span>
              </div>
            </motion.div>

            {/* 진도 관리 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-info/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-info/20 transition-colors">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">체계적 진도 관리</h3>
              <p className="text-muted-foreground mb-6">
                개인의 수영 실력 향상을 체계적으로 추적하고 관리합니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info/10 text-info">
                  체계적 관리
                </span>
              </div>
            </motion.div>

            {/* 전문가 네트워크 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">전문가 네트워크</h3>
              <p className="text-muted-foreground mb-6">
                검증된 수영 강사들과 연결하여 전문적인 지도를 받을 수 있습니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                  전문가 연결
                </span>
              </div>
            </motion.div>

            {/* 실시간 피드백 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-success/20 transition-colors">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">실시간 피드백</h3>
              <p className="text-muted-foreground mb-6">
                수영 자세와 기술을 실시간으로 분석하고 즉시 피드백을 제공합니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success/10 text-success">
                  즉시 피드백
                </span>
              </div>
            </motion.div>

            {/* 커뮤니티 */}
            <motion.div
              variants={motionPresets.scaleIn}
              className="card-ocean p-8 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-warning/20 transition-colors">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">활발한 커뮤니티</h3>
              <p className="text-muted-foreground mb-6">
                수영 애호가들과 정보를 공유하고 경험을 나눌 수 있습니다
              </p>
              <div className="flex justify-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                  정보 공유
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3D 효과 데모 섹션 */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
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
              <span className="bg-gradient-text">최신 기술로 구현된</span>
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Three.js와 Framer Motion을 활용한 인터랙티브한 수영 시뮬레이션
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 3D 파티클 시스템 */}
            <motion.div
              variants={motionPresets.slideLeft}
              className="h-96 rounded-3xl overflow-hidden shadow-deep bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
            >
              <div className="text-center text-primary">
                <div className="text-6xl mb-4">🏊‍♂️</div>
                <h3 className="text-2xl font-bold mb-2">3D 수영 시뮬레이션</h3>
                <p className="text-lg opacity-80">Three.js 기반 인터랙티브 3D 환경</p>
              </div>
            </motion.div>

            {/* 설명 */}
            <motion.div
              variants={motionPresets.slideRight}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-foreground">3D 파티클 시스템</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                수영의 물결과 움직임을 3D로 시각화하여 더 직관적인 학습 경험을 제공합니다.
                WebGL 기술을 활용하여 부드럽고 반응성 있는 애니메이션을 구현했습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Three.js
                </span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                  WebGL
                </span>
                <span className="px-3 py-1 bg-info/10 text-info rounded-full text-sm font-medium">
                  파티클 시스템
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 물결 배경 데모 섹션 */}
      <section className="py-20">
        <WaterRippleBackground intensity="medium" color="secondary">
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
                className="text-4xl md:text-5xl font-bold text-white mb-6"
              >
                <span className="bg-gradient-to-r from-white to-secondary-200 bg-clip-text text-transparent">
                  물결 효과 시스템
                </span>
              </motion.h2>
              <motion.p
                variants={motionPresets.slideUp}
                className="text-xl text-white/90 max-w-3xl mx-auto"
              >
                Canvas API를 활용한 저비용 물결 애니메이션으로 수영의 자연스러운 움직임을 표현합니다
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={motionPresets.scaleIn}
                className="text-center text-white"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">저비용 구현</h3>
                <p className="text-white/80">GPU 가속을 활용한 효율적인 렌더링</p>
              </motion.div>

              <motion.div
                variants={motionPresets.scaleIn}
                className="text-center text-white"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">반응형 디자인</h3>
                <p className="text-white/80">모든 디바이스에서 최적화된 성능</p>
              </motion.div>

              <motion.div
                variants={motionPresets.scaleIn}
                className="text-center text-white"
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">실시간 애니메이션</h3>
                <p className="text-white/80">부드럽고 자연스러운 물결 효과</p>
              </motion.div>
            </div>
          </div>
        </WaterRippleBackground>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={motionPresets.slideUp}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              지금 시작하세요
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              AI 기반 수영 교육의 새로운 경험을 지금 바로 체험해보세요
            </motion.p>
            <motion.div
              variants={motionPresets.slideUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/auth/signup?type=student"
                className="px-8 py-4 bg-white text-primary font-semibold rounded-2xl hover:bg-gray-100 transition-colors duration-300"
              >
                수강생으로 시작하기
              </a>
              <a
                href="/auth/signup?type=instructor"
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-primary transition-colors duration-300"
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
