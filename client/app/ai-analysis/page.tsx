'use client';

import React, { useState } from 'react';
import RealTimePoseAnalysis from '../../components/RealTimePoseAnalysis';
import { AIDashboard } from '../../components/AIDashboard';
import AdvancedPoseAnalysis from '../../components/AdvancedPoseAnalysis';
import AdvancedMoveNetAnalysis from '../../components/AdvancedMoveNetAnalysis';
import PerformanceOptimizer from '../../components/PerformanceOptimizer';
import AIOptimizer from '../../components/AIOptimizer';
import Link from 'next/link';

interface AnalysisResult {
  confidence: number;
  type: string;
  quality: string;
  timestamp: Date;
}

interface PoseAnalysis {
  confidence: number;
  posture: 'excellent' | 'good' | 'fair' | 'poor';
  corrections: string[];
  score: number;
  recommendations: string[];
}

interface MoveNetAnalysisResult {
  confidence: number;
  posture: 'excellent' | 'good' | 'fair' | 'poor';
  corrections: string[];
  score: number;
  recommendations: string[];
  detailedMetrics: {
    shoulderAlignment: number;
    elbowAngles: { left: number; right: number };
    hipAlignment: number;
    kneeAngles: { left: number; right: number };
    headPosition: number;
  };
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  networkLatency: number;
  cacheHitRate: number;
}

interface OptimizationResult {
  type: 'image' | 'code' | 'cache' | 'memory' | 'network';
  improvement: number;
  description: string;
  applied: boolean;
  timestamp: Date;
}

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisHistory(prev => [...prev, result]);
  };

  const handleAdvancedAnalysisComplete = (analysis: PoseAnalysis) => {
    // PoseAnalysis를 AnalysisResult로 변환
    const result: AnalysisResult = {
      confidence: analysis.confidence,
      type: analysis.posture,
      quality: analysis.posture === 'excellent' ? 'Excellent' : 
               analysis.posture === 'good' ? 'Good' : 
               analysis.posture === 'fair' ? 'Fair' : 'Poor',
      timestamp: new Date()
    };
    setAnalysisHistory(prev => [...prev, result]);
  };

  const handleMoveNetAnalysisComplete = (analysis: MoveNetAnalysisResult) => {
    // MoveNetAnalysisResult를 AnalysisResult로 변환
    const result: AnalysisResult = {
      confidence: analysis.confidence,
      type: `MoveNet-${analysis.posture}`,
      quality: analysis.posture === 'excellent' ? 'Excellent' : 
               analysis.posture === 'good' ? 'Good' : 
               analysis.posture === 'fair' ? 'Fair' : 'Poor',
      timestamp: new Date()
    };
    setAnalysisHistory(prev => [...prev, result]);
  };

  const handlePerformanceOptimization = (metrics: PerformanceMetrics) => {
    setPerformanceMetrics(metrics);
  };

  const handleAIOptimization = (results: OptimizationResult[]) => {
    console.log('AI 최적화 결과:', results);
    // AI 최적화 결과를 대시보드에 전달하거나 저장
  };

  const tabs = [
    { id: 'realtime', label: '실시간 분석', icon: '📹' },
    { id: 'advanced', label: '고급 AI 분석', icon: '🤖' },
    { id: 'movenet', label: 'MoveNet 분석', icon: '🚀' },
    { id: 'dashboard', label: 'AI 대시보드', icon: '📊' },
    { id: 'performance', label: '성능 최적화', icon: '⚡' },
    { id: 'ai-optimizer', label: 'AI 최적화', icon: '🧠' }
  ];

  const analysisOptions = [
    {
      id: 'realtime',
      label: '실시간 자세 분석',
      description: '실시간 카메라 피드에서 수영 자세를 분석합니다.',
      href: '#realtime',
    },
    {
      id: 'advanced',
      label: '고급 AI 자세 분석',
      description: '더 정교한 머신러닝 모델을 사용하여 수영 자세를 분석합니다.',
      href: '#advanced',
    },
    {
      id: 'movenet',
      label: 'MoveNet 고급 자세 분석',
      description: '최신 MoveNet 모델을 활용하여 수영 자세를 분석합니다.',
      href: '#movenet',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <img src="/swim-icon.png" alt="AI 분석" className="w-12 h-12 mr-3" />
            AI 수영 자세 분석 시스템
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            최첨단 AI 기술로 수영 자세를 분석하고 개선점을 제안합니다
          </p>
        </div>

        {/* 분석 옵션 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {analysisOptions.map((option) => (
            <Link
              key={option.id}
              href={option.href}
              className="group block"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                  <img src="/swim-icon.png" alt={option.label} className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {option.label}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="space-y-8">
          {activeTab === 'realtime' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📹 실시간 자세 분석
              </h2>
              <RealTimePoseAnalysis onAnalysisComplete={handleAnalysisComplete} />
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🤖 고급 AI 자세 분석
              </h2>
              <AdvancedPoseAnalysis 
                onAnalysisComplete={handleAdvancedAnalysisComplete}
                swimmingStyle="freestyle"
              />
            </div>
          )}

          {activeTab === 'movenet' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🚀 MoveNet 고급 자세 분석
              </h2>
              <AdvancedMoveNetAnalysis 
                onAnalysisComplete={handleMoveNetAnalysisComplete}
                swimmingStyle="freestyle"
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📊 AI 분석 대시보드
              </h2>
              <AIDashboard onAnalysisResult={handleAnalysisComplete} />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ⚡ 성능 최적화
              </h2>
              <PerformanceOptimizer 
                onOptimizationComplete={handlePerformanceOptimization}
              />
            </div>
          )}

          {activeTab === 'ai-optimizer' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                🧠 AI 기반 자동 최적화
              </h2>
              <AIOptimizer 
                onOptimizationComplete={handleAIOptimization}
              />
            </div>
          )}
        </div>

        {/* 고급 기능 안내 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🚀 차세대 AI 기능
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">TensorFlow.js 통합</h4>
              <p className="text-gray-600 text-sm">
                브라우저에서 직접 실행되는 고급 AI 모델
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">실시간 성능 모니터링</h4>
              <p className="text-gray-600 text-sm">
                FPS, 메모리, 네트워크 지연 시간 실시간 추적
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">자동 최적화</h4>
              <p className="text-gray-600 text-sm">
                AI가 자동으로 성능을 분석하고 최적화
              </p>
            </div>
          </div>
        </div>

        {/* 기술 스택 정보 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🛠️ 사용된 기술</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>TensorFlow.js</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>PoseNet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>MoveNet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>WebGL</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>React Query</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
