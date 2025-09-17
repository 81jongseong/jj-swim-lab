'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Volume2,
  VolumeX,
  Settings,
  Pause,
  Play
} from 'lucide-react';

// 실시간 피드백 인터페이스
interface RealTimeFeedback {
  timestamp: string;
  feedbackType: 'immediate' | 'correction' | 'encouragement';
  messages: FeedbackMessage[];
  score: number;
  improvements: string[];
}

interface FeedbackMessage {
  type: 'technique' | 'correction' | 'encouragement' | 'warning';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  duration?: number; // 표시 시간 (초)
}

interface RealTimeFeedbackProps {
  isActive?: boolean;
  onFeedbackReceived?: (feedback: RealTimeFeedback) => void;
}

export const RealTimeFeedback: React.FC<RealTimeFeedbackProps> = ({
  isActive = false,
  onFeedbackReceived
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<RealTimeFeedback | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<RealTimeFeedback[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [currentScore, setCurrentScore] = useState(0);
  const [activeFeedbacks, setActiveFeedbacks] = useState<FeedbackMessage[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 실시간 피드백 시뮬레이션 데이터
  const mockFeedbacks = [
    {
      type: 'technique' as const,
      message: '팔 동작이 매우 좋습니다! 이 리듬을 유지하세요.',
      urgency: 'low' as const,
      duration: 3
    },
    {
      type: 'correction' as const,
      message: '호흡 시 머리를 조금 더 낮게 유지해보세요.',
      urgency: 'medium' as const,
      duration: 5
    },
    {
      type: 'encouragement' as const,
      message: '훌륭합니다! 스트로크 효율성이 개선되고 있어요.',
      urgency: 'low' as const,
      duration: 4
    },
    {
      type: 'warning' as const,
      message: '어깨에 무리가 갈 수 있습니다. 스트로크 각도를 조절하세요.',
      urgency: 'high' as const,
      duration: 6
    },
    {
      type: 'technique' as const,
      message: '킥 타이밍이 완벽합니다! 계속 이 패턴을 유지하세요.',
      urgency: 'low' as const,
      duration: 3
    }
  ];

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsRecording(true);
      startFeedbackGeneration();
    } catch (error) {
      console.error('카메라 시작 실패:', error);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    stopFeedbackGeneration();
  };

  // 실시간 피드백 생성 시작
  const startFeedbackGeneration = () => {
    intervalRef.current = setInterval(() => {
      generateRealTimeFeedback();
    }, 3000 + Math.random() * 4000); // 3-7초마다 피드백 생성
  };

  // 실시간 피드백 생성 중지
  const stopFeedbackGeneration = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 실시간 피드백 생성
  const generateRealTimeFeedback = () => {
    const randomFeedback = mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)];
    const newScore = Math.max(0, Math.min(100, currentScore + (Math.random() - 0.5) * 10));
    
    const feedback: RealTimeFeedback = {
      timestamp: new Date().toISOString(),
      feedbackType: 'immediate',
      messages: [randomFeedback],
      score: Math.round(newScore),
      improvements: ['호흡 리듬', '스트로크 효율성']
    };

    setCurrentFeedback(feedback);
    setCurrentScore(newScore);
    setActiveFeedbacks(prev => [...prev, randomFeedback]);
    setFeedbackHistory(prev => [feedback, ...prev.slice(0, 9)]); // 최근 10개만 유지

    // 음성 피드백
    if (isSpeechEnabled) {
      speakFeedback(randomFeedback.message);
    }

    // 피드백 자동 제거
    setTimeout(() => {
      setActiveFeedbacks(prev => prev.filter(f => f !== randomFeedback));
    }, (randomFeedback.duration || 5) * 1000);

    onFeedbackReceived?.(feedback);
  };

  // 음성 피드백
  const speakFeedback = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // 피드백 타입별 스타일
  const getFeedbackStyle = (type: string, urgency: string) => {
    const baseStyle = "rounded-lg p-4 mb-2 shadow-md border-l-4 ";
    
    switch (type) {
      case 'technique':
        return baseStyle + "bg-blue-50 border-blue-500 text-blue-800";
      case 'correction':
        return baseStyle + (urgency === 'high' ? "bg-red-50 border-red-500 text-red-800" : "bg-orange-50 border-orange-500 text-orange-800");
      case 'encouragement':
        return baseStyle + "bg-green-50 border-green-500 text-green-800";
      case 'warning':
        return baseStyle + "bg-red-50 border-red-500 text-red-800";
      default:
        return baseStyle + "bg-gray-50 border-gray-500 text-gray-800";
    }
  };

  // 피드백 아이콘
  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'technique':
        return <Activity className="h-5 w-5" />;
      case 'correction':
        return <AlertCircle className="h-5 w-5" />;
      case 'encouragement':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  // 점수 색상
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚡ 실시간 AI 피드백 시스템
        </h1>
        <p className="text-gray-600">
          수영하는 동안 실시간으로 AI 분석과 음성 피드백을 받으세요
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 비디오 및 제어 패널 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 비디오 화면 */}
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 md:h-80 object-cover"
            />
            
            {/* 실시간 점수 오버레이 */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore}
                </div>
                <div className="text-xs">실시간 점수</div>
              </div>
            )}

            {/* 녹화 상태 표시 */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">LIVE</span>
              </div>
            )}
          </div>

          {/* 제어 버튼들 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={isRecording ? stopCamera : startCamera}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="h-5 w-5 mr-2 inline" />
                  피드백 중지
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2 inline" />
                  피드백 시작
                </>
              )}
            </button>

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-3 rounded-lg ${
                isVideoEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-3 rounded-lg ${
                isAudioEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`p-3 rounded-lg ${
                isSpeechEnabled ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'
              }`}
            >
              {isSpeechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 실시간 피드백 패널 */}
        <div className="space-y-4">
          {/* 현재 점수 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="font-semibold mb-2">현재 점수</h3>
            <div className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {currentScore >= 80 ? '우수' : currentScore >= 70 ? '양호' : currentScore >= 60 ? '보통' : '개선 필요'}
            </div>
          </div>

          {/* 활성 피드백 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-4">실시간 피드백</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {activeFeedbacks.map((feedback, index) => (
                  <motion.div
                    key={`${feedback.message}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={getFeedbackStyle(feedback.type, feedback.urgency)}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {getFeedbackIcon(feedback.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{feedback.message}</p>
                        <div className="text-xs opacity-75 mt-1">
                          {feedback.urgency === 'high' ? '긴급' : feedback.urgency === 'medium' ? '중요' : '일반'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {activeFeedbacks.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  {isRecording ? '피드백을 기다리는 중...' : '피드백을 시작하려면 녹화를 시작하세요'}
                </div>
              )}
            </div>
          </div>

          {/* 피드백 히스토리 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-4">피드백 히스토리</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {feedbackHistory.map((feedback, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-3 py-2">
                  <div className="text-xs text-gray-500">
                    {new Date(feedback.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-sm">
                    점수: <span className={getScoreColor(feedback.score)}>{feedback.score}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {feedback.messages[0]?.message}
                  </div>
                </div>
              ))}
              
              {feedbackHistory.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  아직 피드백 히스토리가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 설정 패널 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          피드백 설정
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비디오 품질
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="high">고화질</option>
              <option value="medium">보통</option>
              <option value="low">저화질</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              피드백 빈도
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="high">자주 (2-3초)</option>
              <option value="medium">보통 (5-7초)</option>
              <option value="low">가끔 (10-15초)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              음성 속도
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              defaultValue="0.9"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeFeedback;
