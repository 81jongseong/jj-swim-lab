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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { motionPresets, staggerContainer } from '../../lib/motion';
import HeroWave from '../../components/HeroWave';
import WaterRippleBackground from '../../components/WaterRippleBackground';
import LottiePlayer from '../../components/LottiePlayer';

export default function LandingPage() {
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
      {/* 편집 모드 버튼 (개발용) - 햄버거 메뉴와 겹치지 않도록 위치 조정 */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
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

      {/* 통계 섹션 */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
            <motion.div variants={motionPresets.slideUp}>
              <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
              <div className="text-muted-foreground">활성 수강생</div>
            </motion.div>
            <motion.div variants={motionPresets.slideUp}>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">전문 강사</div>
            </motion.div>
            <motion.div variants={motionPresets.slideUp}>
              <div className="text-4xl font-bold text-primary mb-2">15</div>
              <div className="text-muted-foreground">센터</div>
            </motion.div>
            <motion.div variants={motionPresets.slideUp}>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">만족도</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.h2
              variants={motionPresets.slideUp}
              className="text-3xl md:text-4xl font-bold text-foreground mb-6"
            >
              지금 시작하세요!
            </motion.h2>
            <motion.p
              variants={motionPresets.slideUp}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              AI 기반 수영 교육의 새로운 경험을 만나보세요.
            </motion.p>
            <motion.div
              variants={motionPresets.slideUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/auth/signup?type=student"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                수강생으로 시작하기
              </a>
              <a
                href="/auth/signup?type=instructor"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                강사로 등록하기
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 배경 애니메이션 */}
      <WaterRippleBackground />
    </div>
  );
}
