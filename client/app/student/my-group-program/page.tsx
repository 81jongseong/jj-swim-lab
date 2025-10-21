/**
 * 🏊 SwimLab - 회원용 프로그램 조회 페이지 (통합)
 * 
 * 📋 **페이지 목적**
 * - 개인 PT 프로그램 + 단체반 프로그램 통합 조회
 * - 실시간 개인별 맞춤 조정사항 계산 (질환/컨디션 기반)
 * - 주의사항 및 페이스 조정 안내
 * 
 * 🔄 **연동 데이터**
 * - /api/my-programs: 내 모든 프로그램 (개인 PT + 단체반)
 * - 실시간 조정사항 계산 (personalAdjustmentCalculator)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';
import { calculatePersonalAdjustment, calculateAdjustedPace, getStrokeName } from '../../../lib/swimlab/utils/personalAdjustmentCalculator';

interface Program {
  _id: string;
  groupClassName: string;
  programType: string;
  params: any;
  content: {
    summary: string;
    planExplanation?: string;
    totalDuration: number;
    totalMeters: number;
    sessions: any[];
  };
  createdAt: string;
}

export default function MyGroupProgramPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [adjustment, setAdjustment] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyPrograms();
    }
  }, [user]);

  const loadMyPrograms = async () => {
    setLoading(true);
    try {
      console.log('🔍 내 프로그램 조회 시작...');
      
      // 통합 API 호출
      const response = await apiClient.get('/api/my-programs') as any;
      
      if (response.success && response.data?.programs) {
        const progs = response.data.programs;
        console.log(`✅ 총 ${progs.length}개 프로그램 조회 완료`);
        console.log(`  - 개인 PT: ${response.data.individual || 0}개`);
        console.log(`  - 단체반: ${response.data.group || 0}개`);
        
        setPrograms(progs);

        // 가장 최근 프로그램 자동 선택
        if (progs.length > 0) {
          selectProgram(progs[0]);
        }
      }
    } catch (error) {
      console.error('프로그램 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProgram = (program: any) => {
    setSelectedProgram(program);
    
    // 실시간 조정사항 계산
    if (user) {
      const healthProfile = user.studentInfo?.healthProfile || {};
      const swimmingProfile = user.studentInfo?.swimmingProfile || {};
      
      const personalAdj = calculatePersonalAdjustment(healthProfile, swimmingProfile);
      
      console.log(`🎯 ${user.name}님 조정사항:`, personalAdj);
      setAdjustment(personalAdj);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">프로그램 불러오는 중...</div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-xl text-gray-600">아직 등록된 프로그램이 없습니다.</div>
          <div className="text-sm text-gray-500 mt-2">강사님께서 프로그램을 생성하시면 여기에 표시됩니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏊 내 프로그램</h1>
          <p className="text-gray-600">
            {user?.name}님의 모든 프로그램 (개인 PT + 단체반)과 맞춤 안내를 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 프로그램 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-4">프로그램 목록</h3>
              <div className="space-y-2">
                {programs.map((program) => (
                  <button
                    key={program._id}
                    onClick={() => selectProgram(program)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedProgram?._id === program._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {program.programSource === 'group' ? '📚' : '🏊'}
                      </span>
                      <div className="font-semibold text-gray-900">{program.displayName}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(program.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {program.content.totalMeters}m | {program.content.sessions.length}회
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 프로그램 상세 및 조정사항 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProgram && (
              <>
                {/* 프로그램 요약 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📋 프로그램 요약</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">단체반:</span>
                      <span className="font-semibold">{selectedProgram.groupClassName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">총 거리:</span>
                      <span className="font-semibold">{selectedProgram.content.totalMeters}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">총 시간:</span>
                      <span className="font-semibold">{selectedProgram.content.totalDuration}분</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">세션 수:</span>
                      <span className="font-semibold">{selectedProgram.content.sessions.length}회</span>
                    </div>
                  </div>
                  {selectedProgram.content.planExplanation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedProgram.content.planExplanation}</p>
                    </div>
                  )}
                </div>

                {/* 개인별 조정사항 (실시간 계산) */}
                {adjustment && (
                  <>
                    {/* 페이스 조정 */}
                    {adjustment.paceAdjustment !== 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border-2 border-purple-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>⏱️</span>
                          <span>{user?.name}님을 위한 페이스 조정</span>
                        </h3>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700">조정 비율:</span>
                            <span className="text-2xl font-bold text-purple-600">
                              +{adjustment.paceAdjustment}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            이유: {adjustment.paceReason}
                          </p>
                          <div className="mt-3 p-3 bg-purple-50 rounded">
                            <p className="text-sm text-purple-800 font-medium">
                              💡 모든 세트를 {adjustment.paceAdjustment}% 느리게 진행하세요.
                            </p>
                            <p className="text-xs text-purple-700 mt-2">
                              예: 100m를 1:30 대신 1:{Math.round(30 * (1 + adjustment.paceAdjustment / 100))}에 완료
                            </p>
                          </div>
                          {adjustment.restAdjustment > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded">
                              <p className="text-sm text-blue-800">
                                ⏸️ 휴식 시간: 모든 세트에 +{adjustment.restAdjustment}초 추가
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 주의사항 */}
                    {adjustment.warnings.length > 0 && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ 주의사항</h3>
                        <div className="space-y-3">
                          {adjustment.warnings.map((warning: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border-2 ${getSeverityColor(warning.severity)}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-2xl">{getSeverityIcon(warning.severity)}</span>
                                <p className="flex-1">{warning.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 회피 항목 */}
                    {(adjustment.avoidStrokes.length > 0 ||
                      adjustment.avoidDrills.length > 0 ||
                      adjustment.avoidEquipment.length > 0) && (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">🚫 회피해야 할 항목</h3>
                        <div className="space-y-3">
                          {adjustment.avoidStrokes.length > 0 && (
                            <div className="p-3 bg-red-50 rounded-lg">
                              <div className="font-semibold text-red-800 mb-2">영법:</div>
                              <div className="flex flex-wrap gap-2">
                                {adjustment.avoidStrokes.map((stroke: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm">
                                    {getStrokeName(stroke)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {adjustment.avoidDrills.length > 0 && (
                            <div className="p-3 bg-orange-50 rounded-lg">
                              <div className="font-semibold text-orange-800 mb-2">드릴:</div>
                              <div className="flex flex-wrap gap-2">
                                {adjustment.avoidDrills.map((drill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                                    {drill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {adjustment.avoidEquipment.length > 0 && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <div className="font-semibold text-yellow-800 mb-2">장비:</div>
                              <div className="flex flex-wrap gap-2">
                                {adjustment.avoidEquipment.map((equipment: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                                    {equipment}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </>
                )}

                {/* 세션 목록 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📅 세션 목록</h3>
                  <div className="space-y-3">
                    {selectedProgram.content.sessions.map((session, idx) => (
                      <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">
                            {session.day} {session.date && `(${session.date})`}
                          </span>
                          <span className="text-sm text-gray-600">
                            {session.distance}m | {session.duration}분
                          </span>
                        </div>
                        {session.themeDesc && (
                          <p className="text-sm text-gray-600">{session.themeDesc}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

