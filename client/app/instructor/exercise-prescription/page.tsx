'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Play, Pause, RotateCcw, Settings, Users, Clock, Target, TrendingUp } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { LoadingState } from '@/components/common';

interface ExerciseSession {
  _id: string;
  studentId: string;
  studentName: string;
  programId: string;
  programName: string;
  exercises: Array<{
    name: string;
    duration: number;
    completed: boolean;
    notes?: string;
  }>;
  startTime: Date;
  endTime?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  totalDuration: number;
  completedDuration: number;
}

function ExercisePrescriptionTool() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<ExerciseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (user) {
      loadCurrentSession();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            handleExerciseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingTime]);

  const loadCurrentSession = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempSession: ExerciseSession = {
        _id: 'session001',
        studentId: 'student001',
        studentName: '김학생',
        programId: 'program001',
        programName: '초급 자유형 프로그램',
        exercises: [
          {
            name: '워밍업 스트레칭',
            duration: 300, // 5분
            completed: false,
            notes: '목, 어깨, 허리 스트레칭'
          },
          {
            name: '자유형 기본 동작',
            duration: 600, // 10분
            completed: false,
            notes: '팔 돌리기, 발차기 연습'
          },
          {
            name: '자유형 수영',
            duration: 900, // 15분
            completed: false,
            notes: '25m 왕복 수영'
          },
          {
            name: '쿨다운',
            duration: 300, // 5분
            completed: false,
            notes: '가벼운 스트레칭'
          }
        ],
        startTime: new Date(),
        status: 'not_started',
        totalDuration: 2100, // 35분
        completedDuration: 0
      };
      setCurrentSession(tempSession);
      setRemainingTime(tempSession.exercises[0].duration);
    } catch (error) {
      logger.error('운동 세션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = () => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'in_progress' } : null);
      setIsRunning(true);
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
    }
  };

  const resumeSession = () => {
    setIsRunning(true);
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'in_progress' } : null);
    }
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentExerciseIndex(0);
    if (currentSession) {
      setRemainingTime(currentSession.exercises[0].duration);
      setCurrentSession(prev => prev ? { 
        ...prev, 
        status: 'not_started',
        completedDuration: 0,
        exercises: prev.exercises.map(ex => ({ ...ex, completed: false }))
      } : null);
    }
  };

  const handleExerciseComplete = () => {
    if (!currentSession) return;

    const updatedExercises = [...currentSession.exercises];
    updatedExercises[currentExerciseIndex].completed = true;

    const newCompletedDuration = currentSession.completedDuration + currentSession.exercises[currentExerciseIndex].duration;

    if (currentExerciseIndex < currentSession.exercises.length - 1) {
      // 다음 운동으로 이동
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setRemainingTime(currentSession.exercises[nextIndex].duration);
      setCurrentSession(prev => prev ? {
        ...prev,
        exercises: updatedExercises,
        completedDuration: newCompletedDuration
      } : null);
    } else {
      // 모든 운동 완료
      setIsRunning(false);
      setCurrentSession(prev => prev ? {
        ...prev,
        status: 'completed',
        exercises: updatedExercises,
        completedDuration: newCompletedDuration,
        endTime: new Date()
      } : null);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!currentSession) return 0;
    return (currentSession.completedDuration / currentSession.totalDuration) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="운동 프로그램을 불러오는 중..." size="lg" />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">활성화된 운동 프로그램이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">운동 프로그램 실행 도구</h1>
        <p className="text-gray-600">학생의 운동 프로그램을 체계적으로 실행하고 관리하세요</p>
      </div>

      {/* 학생 정보 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentSession.studentName}</h2>
            <p className="text-gray-600">{currentSession.programName}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">시작 시간</div>
            <div className="font-medium">{currentSession.startTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 현재 운동 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">현재 운동</h3>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                currentSession.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                currentSession.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                currentSession.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentSession.status === 'in_progress' ? '진행중' :
                 currentSession.status === 'paused' ? '일시정지' :
                 currentSession.status === 'completed' ? '완료' : '대기중'}
              </span>
            </div>

            {currentSession.status !== 'completed' && (
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatTime(remainingTime)}
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  {currentSession.exercises[currentExerciseIndex].name}
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  {currentSession.exercises[currentExerciseIndex].notes}
                </div>

                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((currentSession.exercises[currentExerciseIndex].duration - remainingTime) / currentSession.exercises[currentExerciseIndex].duration) * 100}%` 
                    }}
                  ></div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex justify-center space-x-4">
                  {currentSession.status === 'not_started' && (
                    <button
                      onClick={startSession}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      시작
                    </button>
                  )}
                  
                  {currentSession.status === 'in_progress' && (
                    <button
                      onClick={pauseSession}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      일시정지
                    </button>
                  )}
                  
                  {currentSession.status === 'paused' && (
                    <button
                      onClick={resumeSession}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      재개
                    </button>
                  )}
                  
                  <button
                    onClick={resetSession}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    리셋
                  </button>
                </div>
              </div>
            )}

            {currentSession.status === 'completed' && (
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-4">🎉 완료!</div>
                <div className="text-lg text-gray-700 mb-4">모든 운동을 성공적으로 완료했습니다.</div>
                <div className="text-sm text-gray-500 mb-6">
                  완료 시간: {currentSession.endTime?.toLocaleTimeString()}
                </div>
                <button
                  onClick={resetSession}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  새로 시작
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 운동 목록 및 통계 */}
        <div className="space-y-6">
          {/* 전체 진행률 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 진행률</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(getProgressPercentage())}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {formatTime(currentSession.completedDuration)} / {formatTime(currentSession.totalDuration)}
              </div>
            </div>
          </div>

          {/* 운동 목록 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">운동 목록</h3>
            <div className="space-y-3">
              {currentSession.exercises.map((exercise, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    index === currentExerciseIndex && currentSession.status === 'in_progress'
                      ? 'border-blue-500 bg-blue-50'
                      : exercise.completed
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{exercise.name}</div>
                      <div className="text-sm text-gray-500">{formatTime(exercise.duration)}</div>
                    </div>
                    <div className="flex items-center">
                      {exercise.completed ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : index === currentExerciseIndex && currentSession.status === 'in_progress' ? (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">▶</span>
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 통계 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">통계</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">완료된 운동</span>
                </div>
                <span className="font-medium">
                  {currentSession.exercises.filter(e => e.completed).length} / {currentSession.exercises.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">경과 시간</span>
                </div>
                <span className="font-medium">{formatTime(currentSession.completedDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-600">남은 시간</span>
                </div>
                <span className="font-medium">{formatTime(currentSession.totalDuration - currentSession.completedDuration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ExercisePrescriptionTool, { 
  requireTypes: ['instructor'] 
});