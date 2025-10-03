/**
 * 🗺️ JJ Swim Lab - VWorld API 키 만료 뱃지
 * 
 * 📋 **컴포넌트 목적**
 * - VWorld API 키 만료일 카운트다운 표시
 * - 만료 임박 시 경고 배너
 * - Admin 페이지에서 사전 알림
 * 
 * 🔄 **주요 기능**
 * - D-Day 카운터 (D-xx 형식)
 * - 색상 코드 (30일 이상: 초록, 7~30일: 노랑, 7일 미만: 빨강)
 * - 만료일 표시
 * - VWorld 포털 링크
 * 
 * 🗄️ **데이터 연동**
 * - NEXT_PUBLIC_VWORLD_EXPIRES_AT 환경변수
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 만료일은 .env.local에서 관리
 * 2. 포털에서 확인한 날짜를 정확히 입력
 * 3. D-14/7/3/1일에 알림 강조
 */

'use client';

import React, { useEffect, useState } from 'react';

export default function VWorldKeyBadge() {
  const expiresAt = process.env.NEXT_PUBLIC_VWORLD_EXPIRES_AT;
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiresAt) return;

    // 만료일까지 남은 일수 계산
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysLeft(diffDays);

    // 1분마다 업데이트 (하루가 바뀔 때를 대비)
    const interval = setInterval(() => {
      const newDiffTime = expiryDate.getTime() - new Date().getTime();
      const newDiffDays = Math.ceil(newDiffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(newDiffDays);
    }, 60000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (daysLeft === null || !expiresAt) return null;

  // 색상 결정
  const getTone = () => {
    if (daysLeft <= 0) return 'bg-red-600 text-white';
    if (daysLeft <= 7) return 'bg-red-100 text-red-800 border border-red-300';
    if (daysLeft <= 30) return 'bg-amber-100 text-amber-800 border border-amber-300';
    return 'bg-green-100 text-green-800 border border-green-300';
  };

  // 아이콘 결정
  const getIcon = () => {
    if (daysLeft <= 0) return '🚨';
    if (daysLeft <= 7) return '⚠️';
    if (daysLeft <= 30) return '⏰';
    return '✅';
  };

  // D-Day 텍스트
  const getDDayText = () => {
    if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
    if (daysLeft === 0) return 'D-DAY';
    return `D-${daysLeft}`;
  };

  return (
    <a
      href="https://www.vworld.kr/dev/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md ${getTone()}`}
      title="VWorld 개발자센터에서 키 관리"
    >
      <span>{getIcon()}</span>
      <span>VWorld 키 만료</span>
      <span className="font-bold">{getDDayText()}</span>
      <span className="opacity-75">({expiresAt})</span>
    </a>
  );
}

/**
 * 만료 임박 배너 컴포넌트
 * Admin 페이지 상단에 표시
 */
export function VWorldExpiryBanner() {
  const expiresAt = process.env.NEXT_PUBLIC_VWORLD_EXPIRES_AT;
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const diffDays = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);

    // 로컬 스토리지에서 배너 해제 상태 확인
    const dismissKey = `vworld-banner-dismissed-${expiresAt}`;
    const isDismissed = localStorage.getItem(dismissKey) === 'true';
    setDismissed(isDismissed);
  }, [expiresAt]);

  const handleDismiss = () => {
    const dismissKey = `vworld-banner-dismissed-${expiresAt}`;
    localStorage.setItem(dismissKey, 'true');
    setDismissed(true);
  };

  // 14일, 7일, 3일, 1일 이내일 때만 표시
  if (
    dismissed ||
    daysLeft === null ||
    daysLeft > 14 ||
    daysLeft < 0
  ) {
    return null;
  }

  const getBannerStyle = () => {
    if (daysLeft <= 3) return 'bg-red-50 border-red-200 text-red-900';
    if (daysLeft <= 7) return 'bg-orange-50 border-orange-200 text-orange-900';
    return 'bg-yellow-50 border-yellow-200 text-yellow-900';
  };

  const getUrgency = () => {
    if (daysLeft <= 3) return '긴급';
    if (daysLeft <= 7) return '중요';
    return '안내';
  };

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${getBannerStyle()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <h3 className="font-bold text-sm">
              [{getUrgency()}] VWorld API 키 만료 임박
            </h3>
          </div>
          
          <p className="text-sm mb-3">
            VWorld API 키가 <strong>{daysLeft}일 후</strong> ({expiresAt})에 만료됩니다.
            만료 시 지도 타일 및 주소 검색 기능이 작동하지 않습니다.
          </p>

          <div className="space-y-2 text-sm">
            <div className="font-semibold">📋 조치 방법:</div>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                <a
                  href="https://www.vworld.kr/dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:font-semibold"
                >
                  VWorld 개발자센터
                </a>
                에 로그인
              </li>
              <li>인증키 관리에서 현재 키 연장 또는 새 키 발급</li>
              <li>
                <code className="bg-white/50 px-1 py-0.5 rounded">client/.env.local</code> 파일 업데이트:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li><code className="bg-white/50 px-1 py-0.5 rounded">NEXT_PUBLIC_VWORLD_KEY</code></li>
                  <li><code className="bg-white/50 px-1 py-0.5 rounded">VWORLD_SERVER_KEY</code></li>
                  <li><code className="bg-white/50 px-1 py-0.5 rounded">NEXT_PUBLIC_VWORLD_EXPIRES_AT</code></li>
                </ul>
              </li>
              <li>개발 서버 재시작: <code className="bg-white/50 px-1 py-0.5 rounded">npm run dev</code></li>
            </ol>
          </div>

          <div className="mt-3 text-xs opacity-75">
            💡 개발키는 최대 3회까지 연장 가능 (3개월씩)
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
          title="오늘 하루 숨기기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
