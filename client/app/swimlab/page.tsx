/**
 * SwimLab Data Pack v4 - 프로그램 생성기 페이지
 * 
 * Next.js App Router 페이지
 * Q1: 앱 초기화 시 CONDITIONS id 자동 시드
 * Q2: URL 파라미터로 컨디션 자동 설정
 * 
 * 관련 파일:
 * - client/src/swimlab/components/SwimProgramGenerator.tsx
 * - client/src/swimlab/utils/idmap.ts
 * - client/src/swimlab/data/conditions_msk28_index.ts
 * - client/app/swimlab-demo/page.tsx (컨디션 전달)
 */

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SwimProgramGenerator from '../../src/swimlab/components/SwimProgramGenerator';
import { seedConditionIds } from '../../src/swimlab/utils/idmap';
import { MSK_28_IDS } from '../../src/swimlab/data/conditions_msk28_index';
import { LoadingState } from '@/components/common';

export default function Page() {
  // 리다이렉트: 기존 swimlab 페이지를 수영엔진으로 이동
  useEffect(() => {
    window.location.href = '/admin/swim-training-engine';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <LoadingState message="수영엔진으로 이동 중..." size="lg" />
    </div>
  );
}


