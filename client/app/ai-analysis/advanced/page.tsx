'use client';

import React, { useState } from 'react';
import SwimmingPoseAnalysis from '../../../components/SwimmingPoseAnalysis';

type SwimmingStyle = 'freestyle' | 'butterfly' | 'breaststroke' | 'backstroke';

export default function AdvancedAIAnalysisPage() {
  const [selectedStyle, setSelectedStyle] = useState<SwimmingStyle>('freestyle');
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const swimmingStyles = {
    freestyle: { name: '자유형', description: '가장 기본적이고 효율적인 수영법', icon: '🏊‍♂️' },
    butterfly: { name: '접영', description: '강력하고 아름다운 수영법', icon: '🦋' },
    breaststroke: { name: '평영', description: '안정적이고 지구력이 필요한 수영법', icon: '🐸' },
    backstroke: { name: '혼영', description: '등을 대고 하는 수영법', icon: '🔄' }
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResults(prev => [result, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🚀 고급 AI 수영 분석
              </h1>
              <p className="mt-2 text-gray-600">
                수영 동작별 상세 분석 및 전문적인 피드백
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">고급 AI 모델 활성화됨</span>
            </div>
          </div>
        </div>
      </div>

      {/* 수영 동작 선택 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🏊‍♂️ 분석할 수영 동작 선택</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(swimmingStyles).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStyle(key as SwimmingStyle)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedStyle === key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="mb-2">
                      <img src="/swim-icon.png" alt={style.name} className="w-12 h-12 mx-auto" />
                    </div>
                    <div className="font-semibold text-gray-800">{style.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 고급 분석 컴포넌트 */}
          <SwimmingPoseAnalysis
            swimmingStyle={selectedStyle}
            onAnalysisComplete={handleAnalysisComplete}
            showCamera={true}
            autoStart={false}
          />

          {/* 분석 결과 요약 */}
          {analysisResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                📈 {swimmingStyles[selectedStyle].name} 분석 결과 요약
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResults.length}
                  </div>
                  <div className="text-sm text-gray-600">총 분석 횟수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      analysisResults.reduce((sum, r) => sum + r.analysis.confidence, 0) / 
                      analysisResults.length
                    )}%
                  </div>
                  <div className="text-sm text-gray-600">평균 신뢰도</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysisResults.filter(r => r.analysis.quality === 'Good' || r.analysis.quality === 'Excellent').length}
                  </div>
                  <div className="text-sm text-gray-600">우수한 기술</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      analysisResults.reduce((sum, r) => sum + r.analysis.timing.coordination, 0) / 
                      analysisResults.length
                    )}%
                  </div>
                  <div className="text-sm text-gray-600">평균 동기화</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 고급 기능 안내 */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔬 고급 AI 분석 기능
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">정밀한 각도 분석</h3>
                <p className="text-gray-600">
                  어깨, 팔꿈치, 엉덩이, 무릎의 정확한 각도를 측정하여 자세를 과학적으로 분석합니다
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">타이밍 분석</h3>
                <p className="text-gray-600">
                  스트로크 속도, 리듬감, 동작 동기화를 분석하여 수영의 효율성을 측정합니다
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">동작별 맞춤 분석</h3>
                <p className="text-gray-600">
                  자유형, 접영, 평영, 혼영 각각의 특성에 맞는 전문적인 분석과 피드백을 제공합니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기술 수준별 가이드 */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            📊 기술 수준별 개선 가이드
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-2">Poor</div>
              <div className="text-sm text-red-700">기본 자세 연습 필요</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">Needs Improvement</div>
              <div className="text-sm text-orange-700">주요 개선점 집중</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">Fair</div>
              <div className="text-sm text-yellow-700">기술 정교화 필요</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">Good</div>
              <div className="text-sm text-green-700">고급 기술 도전</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">Excellent</div>
              <div className="text-sm text-blue-700">완벽한 기술 유지</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
