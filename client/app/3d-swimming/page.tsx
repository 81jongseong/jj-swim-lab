'use client';

import { useState } from 'react';
import Link from 'next/link';
import SwimmingPoseViewer from '@/components/3d/SwimmingPoseViewer';
import PoseAnalysis from '@/components/3d/PoseAnalysis';
import MeasurementTools from '@/components/3d/MeasurementTools';

type SwimmingStyle = 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';

interface SwimmingStyleInfo {
  id: SwimmingStyle;
  name: string;
  description: string;
  keyPoints: string[];
  tips: string[];
}

const swimmingStyles: SwimmingStyleInfo[] = [
  {
    id: 'freestyle',
    name: '자유형',
    description: '가장 기본적이고 효율적인 수영법',
    keyPoints: ['팔꿈치 90도 유지', '호흡 타이밍 조절', '다리 동작의 리듬'],
    tips: ['물속에서 코로 부드럽게 숨 내쉬기', '팔을 앞으로 내밀 때 손바닥 아래로']
  },
  {
    id: 'breaststroke',
    name: '평영',
    description: '안정적이고 지구력이 필요한 수영법',
    keyPoints: ['팔 동작의 순서', '다리 동작의 타이밍', '호흡과 동작의 조화'],
    tips: ['팔을 앞으로 내밀 때 손바닥 아래로', '다리를 모을 때 무릎을 벌리기']
  },
  {
    id: 'backstroke',
    name: '배영',
    description: '편안하고 지속적인 수영법',
    keyPoints: ['팔꿈치 구부리기', '다리 동작의 일정성', '몸의 균형 유지'],
    tips: ['팔을 뒤로 젖힐 때 팔꿈치 90도', '몸이 좌우로 흔들리지 않도록']
  },
  {
    id: 'butterfly',
    name: '접영',
    description: '강력하고 아름다운 수영법',
    keyPoints: ['상체의 웨이브 동작', '팔과 다리의 동기화', '호흡 타이밍'],
    tips: ['상체를 물 밖으로 들어올리기', '팔과 다리를 동시에 움직이기']
  }
];

export default function Swimming3DPage() {
  const [selectedStyle, setSelectedStyle] = useState<SwimmingStyle>('freestyle');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showMeasurement, setShowMeasurement] = useState(false);

  const currentStyle = swimmingStyles.find(style => style.id === selectedStyle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <img src="/swim-icon.png" alt="3D 수영" className="w-12 h-12 mr-3" />
            3D 수영 자세 분석
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            인터랙티브 3D 모델로 수영 자세를 자세히 분석하고, 정확한 각도와 동작을 학습하세요.
            마우스로 자유롭게 회전하고 확대하여 모든 각도에서 자세를 확인할 수 있습니다.
          </p>
        </div>

        {/* 수영법 선택 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <img src="/swim-icon.png" alt="수영법" className="w-8 h-8 mr-3" />
            분석할 수영법 선택
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {swimmingStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <img src="/swim-icon.png" alt={style.name} className="w-8 h-8" />
                  </div>
                  <div className="font-semibold text-gray-900">{style.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3D 뷰어 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 3D 뷰어 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <img src="/swim-icon.png" alt="3D 뷰어" className="w-6 h-6 mr-2" />
                {currentStyle?.name} 3D 자세 뷰어
              </h3>
              <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
                <SwimmingPoseViewer swimmingStyle={selectedStyle} />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                💡 마우스로 드래그하여 회전, 스크롤로 확대/축소할 수 있습니다.
              </div>
            </div>
          </div>

          {/* 컨트롤 패널 */}
          <div className="space-y-6">
            {/* 자세 분석 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <img src="/swim-icon.png" alt="분석" className="w-5 h-5 mr-2" />
                자세 분석
              </h3>
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showAnalysis ? '분석 숨기기' : '자세 분석 시작'}
              </button>
              {showAnalysis && (
                <div className="mt-4">
                  <PoseAnalysis swimmingStyle={selectedStyle} />
                </div>
              )}
            </div>

            {/* 측정 도구 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <img src="/swim-icon.png" alt="측정" className="w-5 h-5 mr-2" />
                측정 도구
              </h3>
              <button
                onClick={() => setShowMeasurement(!showMeasurement)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showMeasurement ? '측정 도구 숨기기' : '측정 도구 활성화'}
              </button>
              {showMeasurement && (
                <div className="mt-4">
                  <MeasurementTools swimmingStyle={selectedStyle} />
                </div>
              )}
            </div>

            {/* 핵심 포인트 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <img src="/swim-icon.png" alt="핵심" className="w-5 h-5 mr-2" />
                {currentStyle?.name} 핵심 포인트
              </h3>
              <ul className="space-y-2">
                {currentStyle?.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 수영 팁 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <img src="/swim-icon.png" alt="팁" className="w-5 h-5 mr-2" />
                실전 팁
              </h3>
              <ul className="space-y-2">
                {currentStyle?.tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 추가 기능 안내 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 더 많은 기능을 경험해보세요!
          </h2>
          <p className="text-gray-600 mb-6">
            AI 기반 실시간 자세 분석, 개인 맞춤 피드백, 진도 추적 등
            JJ Swim Lab만의 독특한 기능들을 만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-analysis"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold"
            >
              AI 자세 분석 시작하기
            </Link>
            <Link
              href="/community"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              커뮤니티에서 질문하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
