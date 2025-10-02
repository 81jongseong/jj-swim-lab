/**
 * 수영 프로그램 생성기 페이지
 * 
 * 연동되는 데이터:
 * - 마스터즈 기준 기록 (CSV 업로드)
 * - 질환별 안전 규칙
 * - 드릴 추천 데이터
 * - A/B 비교 프로필
 * 
 * 연동되는 파일:
 * - /src/SwimProgramGenerator.tsx (메인 컴포넌트)
 * - /data/masters-anchor-template.csv (마스터즈 기준 템플릿)
 */

"use client";

import SwimProgramGenerator from "../../../src/SwimProgramGenerator";

export default function SwimProgramGeneratorPage() {
  return <SwimProgramGenerator />;
}





