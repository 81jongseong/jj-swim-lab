/**
 * 🗺️ 지도 페이지 헤더 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 수영 센터 찾기 타이틀
 * - 그라디언트 히어로 섹션
 * - 주요 기능 아이콘 표시
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 */

'use client';

export default function MapHeader() {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-2xl shadow-xl p-8">
      <div className="text-center">
        <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-full mb-4">
          <div className="text-6xl">🏊‍♂️</div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
          수영 센터 찾기
        </h1>
        <p className="text-lg text-blue-50 mb-4">
          전국 JJ Swim Lab 제휴 센터를 한눈에!
        </p>
        <div className="flex items-center justify-center gap-6 text-white text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">📍</div>
            <span>실시간 위치 기반</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">⭐</div>
            <span>리뷰 & 평점</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🏊</div>
            <span>프로그램 정보</span>
          </div>
        </div>
      </div>
    </div>
  );
}

