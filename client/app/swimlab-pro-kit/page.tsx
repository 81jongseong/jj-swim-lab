/**
 * SwimLab PRO Kit Q3 페이지
 * 
 * 연동되는 데이터:
 * - 건강·질환 규칙 (관절계, 피부, 일반질환, 정신, 특수상황)
 * - 훈련법 카탈로그 (16가지 훈련법)
 * - 드릴 데이터 (30+개 드릴)
 * - 마스터즈 기준 (CSV 업로드)
 * 
 * 연동되는 파일:
 * - /src/swimlab/components/SwimProgramGenerator.tsx (메인 컴포넌트)
 * - /src/swimlab/data/ (모든 데이터 파일)
 * - /public/samples/masters-anchor-template.csv (CSV 템플릿)
 */

"use client";

import dynamic from 'next/dynamic';

const SwimProgramGenerator = dynamic(() => import('../../src/swimlab/components/SwimProgramGenerator'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">SwimLab PRO Kit Q3 로딩 중...</div>
});

export default function SwimLabPROKitPage() {
  return <SwimProgramGenerator />;
}
