/**
 * 🏊 JJ Swim Lab - 프로그램 추천 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 완료율 분석 기반 프로그램 변경 제안 표시
 * - 사용자가 제안을 수락/거부할 수 있는 UI
 * - 제안 이유 및 근거 데이터 시각화
 * 
 * 🔄 **연동되는 데이터**
 * - ProgressAnalysis (progressAnalyzer.ts)
 * 
 * 💡 **주요 기능**
 * - 제안 메시지 표시
 * - 근거 데이터 시각화
 * - 수락/거부 액션
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-XX: 초기 컴포넌트 생성
 */

'use client';

import React from 'react';
import { ProgressAnalysis } from '@/lib/swimlab/progressAnalyzer';

interface ProgramSuggestionCardProps {
  analysis: ProgressAnalysis;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ProgramSuggestionCard({
  analysis,
  onAccept,
  onDecline
}: ProgramSuggestionCardProps) {
  if (!analysis.suggestions || analysis.suggestions.length === 0) {
    return null;
  }

  const suggestion = analysis.suggestions[0]; // 첫 번째 제안만 표시
  const cssImprovement = analysis.metrics.cssImprovement;
  const avgCompletionRate = analysis.metrics.avgCompletionRate;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6 mb-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              프로그램 변경 제안
            </h3>
            <p className="text-sm text-gray-600">
              AI 분석 기반 맞춤 추천
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            신뢰도 {Math.round(suggestion.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* 제안 메시지 */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
        <p className="text-gray-800 leading-relaxed">
          {suggestion.message}
        </p>
      </div>

      {/* 근거 데이터 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">CSS 개선율</div>
          <div className={`text-2xl font-bold ${
            cssImprovement > 0 ? 'text-green-600' : 'text-gray-900'
          }`}>
            {cssImprovement > 0 ? '+' : ''}{cssImprovement.toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">평균 완료율</div>
          <div className={`text-2xl font-bold ${
            avgCompletionRate >= 80 ? 'text-green-600' :
            avgCompletionRate >= 60 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {avgCompletionRate.toFixed(0)}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">분석 기간</div>
          <div className="text-2xl font-bold text-gray-900">
            {analysis.metrics.totalPrograms}주
          </div>
        </div>
      </div>

      {/* 상세 이유 */}
      {suggestion.reasons && suggestion.reasons.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            📊 제안 근거:
          </h4>
          <ul className="space-y-2">
            {suggestion.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          ✓ 제안 수락하기
        </button>
        <button
          onClick={onDecline}
          className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors border-2 border-gray-300"
        >
          현재 목표 유지
        </button>
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>TIP:</strong> 제안을 수락하면 다음 프로그램 생성 시 자동으로 목표가 변경됩니다.
          언제든지 수동으로 목표를 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
}










