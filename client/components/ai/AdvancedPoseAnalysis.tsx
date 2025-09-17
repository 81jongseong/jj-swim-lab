'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity
} from 'lucide-react';

// 고급 AI 분석 인터페이스
interface SwimmingAnalysis {
  timestamp: string;
  strokeType: string;
  overallScore: number;
  analysis: {
    technique: {
      overall: number;
      armTechnique: number;
      legTechnique: number;
      bodyPosition: number;
      timing: number;
      details: {
        strengths: string[];
        weaknesses: string[];
        criticalIssues: string[];
      };
    };
    efficiency: {
      overall: number;
      energyWaste: number;
      propulsionEfficiency: number;
      dragReduction: number;
      strokeLength: number;
      strokeRate: number;
    };
    rhythm: {
      consistency: number;
      strokeTiming: number;
      breathingTiming: number;
      kickTiming: number;
      synchronization: number;
    };
    breathing: {
      frequency: number;
      timing: number;
      headPosition: number;
      efficiency: number;
      issues: string[];
    };
  };
  recommendations: Recommendation[];
}

interface Recommendation {
  type: 'technique' | 'training' | 'conditioning' | 'mental';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImprovement: number;
  timeframe: string;
}

interface AdvancedPoseAnalysisProps {
  onAnalysisComplete?: (analysis: SwimmingAnalysis) => void;
}

export const AdvancedPoseAnalysis: React.FC<AdvancedPoseAnalysisProps> = ({
  onAnalysisComplete
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SwimmingAnalysis | null>(null);
  const [selectedStroke, setSelectedStroke] = useState<string>('freestyle');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const strokeTypes = [
    { value: 'freestyle', label: '자유형', icon: '🏊‍♂️' },
    { value: 'backstroke', label: '배영', icon: '🏊‍♀️' },
    { value: 'breaststroke', label: '평영', icon: '🏊' },
    { value: 'butterfly', label: '접영', icon: '🦋' }
  ];

  // 비디오 업로드 처리
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      
      // 비디오 미리보기 설정
      if (videoRef.current) {
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
      }
    }
  };

  // AI 분석 실행
  const handleAnalyzeVideo = async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('strokeType', selectedStroke);

      const response = await fetch('/api/advanced-ai/analyze-pose', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result.data.analysis);
        onAnalysisComplete?.(result.data.analysis);
      } else {
        console.error('분석 실패:', await response.text());
      }
    } catch (error) {
      console.error('분석 중 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 점수에 따른 색상 반환
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // 우선순위에 따른 색상 반환
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 고급 AI 수영 자세 분석
        </h1>
        <p className="text-gray-600">
          첨단 AI 기술로 수영 자세를 정밀 분석하고 개인 맞춤 피드백을 제공합니다
        </p>
      </div>

      {/* 영법 선택 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">영법 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {strokeTypes.map((stroke) => (
            <button
              key={stroke.value}
              onClick={() => setSelectedStroke(stroke.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStroke === stroke.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{stroke.icon}</div>
              <div className="font-medium">{stroke.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 비디오 업로드 & 분석 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">비디오 업로드 및 분석</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 비디오 업로드 영역 */}
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                수영 비디오를 업로드하세요
              </p>
              <p className="text-sm text-gray-500">
                MP4, MOV, AVI 파일 지원 (최대 100MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            {videoFile && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  선택된 파일: {videoFile.name}
                </p>
                <button
                  onClick={handleAnalyzeVideo}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center mx-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5 mr-2" />
                      AI 분석 시작
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 비디오 미리보기 */}
          <div className="space-y-4">
            <video
              ref={videoRef}
              controls
              className="w-full rounded-lg border"
              style={{ maxHeight: '300px' }}
            >
              비디오를 지원하지 않는 브라우저입니다.
            </video>
          </div>
        </div>
      </div>

      {/* 분석 결과 */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 종합 점수 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">종합 분석 결과</h2>
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}
                </div>
                <div className="text-lg text-gray-600">종합 점수</div>
                <div className="mt-4 text-sm text-gray-500">
                  분석 완료: {new Date(analysis.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* 세부 분석 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 기술 점수 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  기술 점수
                </h3>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.analysis.technique.overall)}`}>
                  {analysis.analysis.technique.overall}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>팔 기술:</span>
                    <span className={getScoreColor(analysis.analysis.technique.armTechnique)}>
                      {analysis.analysis.technique.armTechnique}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>다리 기술:</span>
                    <span className={getScoreColor(analysis.analysis.technique.legTechnique)}>
                      {analysis.analysis.technique.legTechnique}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>자세:</span>
                    <span className={getScoreColor(analysis.analysis.technique.bodyPosition)}>
                      {analysis.analysis.technique.bodyPosition}
                    </span>
                  </div>
                </div>
              </div>

              {/* 효율성 점수 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  효율성
                </h3>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.analysis.efficiency.overall)}`}>
                  {analysis.analysis.efficiency.overall}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>추진 효율:</span>
                    <span>{Math.round(analysis.analysis.efficiency.propulsionEfficiency * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>저항 감소:</span>
                    <span>{Math.round(analysis.analysis.efficiency.dragReduction * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>스트로크 길이:</span>
                    <span>{analysis.analysis.efficiency.strokeLength}m</span>
                  </div>
                </div>
              </div>

              {/* 리듬 분석 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-500" />
                  리듬
                </h3>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.analysis.rhythm.consistency * 100)}`}>
                  {Math.round(analysis.analysis.rhythm.consistency * 100)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>일관성:</span>
                    <span>{Math.round(analysis.analysis.rhythm.consistency * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>스트로크 타이밍:</span>
                    <span>{Math.round(analysis.analysis.rhythm.strokeTiming * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>동기화:</span>
                    <span>{Math.round(analysis.analysis.rhythm.synchronization * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* 호흡 분석 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-cyan-500" />
                  호흡
                </h3>
                <div className={`text-3xl font-bold mb-2 ${getScoreColor(analysis.analysis.breathing.efficiency * 100)}`}>
                  {Math.round(analysis.analysis.breathing.efficiency * 100)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>빈도:</span>
                    <span>{analysis.analysis.breathing.frequency}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span>타이밍:</span>
                    <span>{Math.round(analysis.analysis.breathing.timing * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>머리 위치:</span>
                    <span>{Math.round(analysis.analysis.breathing.headPosition * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 강점과 약점 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  강점
                </h3>
                <ul className="space-y-2">
                  {analysis.analysis.technique.details.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4 flex items-center text-orange-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  개선점
                </h3>
                <ul className="space-y-2">
                  {analysis.analysis.technique.details.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 맞춤 추천사항 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">맞춤 추천사항</h3>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority === 'high' ? '높음' : rec.priority === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>예상 개선도: {rec.expectedImprovement}%</span>
                      <span>예상 기간: {rec.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedPoseAnalysis;
