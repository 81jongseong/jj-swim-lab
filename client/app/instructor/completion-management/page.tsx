/**
 * 🏊 JJ Swim Lab - 강사용 완료율 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 PT 학생/단체반 학생들의 완료율 입력
 * - 미입력 세션 조회 및 일괄 입력
 * - 학생별 완료율 이력 조회
 * 
 * 🔄 **연동되는 데이터**
 * - /api/swim-programs/instructors/:instructorId/incomplete-sessions
 * - /api/swim-programs/:programId/sessions/:sessionIndex/completion
 * - /api/group-classes
 * 
 * 💡 **주요 기능**
 * - PT 학생 미입력 세션 조회
 * - 단체반 학생 미입력 세션 조회
 * - 완료율 일괄 입력
 * - 학생별 완료율 이력 차트
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-XX: 초기 페이지 생성
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/utils/api';
import CompletionInputModal, { CompletionData } from '@/components/swimlab/CompletionInputModal';
import { LoadingState } from '@/components/common';

interface IncompleteSession {
  programId: string;
  programTitle: string;
  athleteId: string;
  athleteName: string;
  sessionIndex: number;
  sessionDay: string;
  sessionDate: string;
  isPast: boolean;
}

interface GroupClass {
  _id: string;
  className: string;
  students: {
    userId: { _id: string; name: string };
    status: string;
  }[];
}

export default function InstructorCompletionManagementPage() {
  const { user } = useAuth();
  const [incompleteSessions, setIncompleteSessions] = useState<IncompleteSession[]>([]);
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<IncompleteSession | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pt' | 'group'>('all');

  useEffect(() => {
    if (user && user.userType === 'instructor') {
      fetchIncompleteSessions();
      fetchGroupClasses();
    }
  }, [user]);

  const fetchIncompleteSessions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/swim-programs/instructors/${user?._id}/incomplete-sessions`);
      setIncompleteSessions((response as any).data?.data?.incompleteSessions || []);
    } catch (error) {
      logger.error('미입력 세션 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupClasses = async () => {
    try {
      const response = await apiClient.get(`/api/group-classes?instructorId=${user?._id}&status=active`);
      setGroupClasses((response as any).data?.data?.groupClasses || []);
    } catch (error) {
      logger.error('단체반 조회 실패:', error);
    }
  };

  const handleCompletionSubmit = async (data: CompletionData) => {
    if (!selectedSession) return;

    try {
      await apiClient.post(
        `/api/swim-programs/${selectedSession.programId}/sessions/${selectedSession.sessionIndex}/completion`,
        data
      );

      alert('완료율이 성공적으로 입력되었습니다.');
      setShowCompletionModal(false);
      setSelectedSession(null);
      fetchIncompleteSessions();
    } catch (error) {
      logger.error('완료율 입력 실패:', error);
      alert('완료율 입력에 실패했습니다.');
    }
  };

  const filteredSessions = incompleteSessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'pt') {
      // PT는 단체반에 속하지 않은 학생
      return !groupClasses.some(gc => 
        gc.students.some(s => s.userId._id === session.athleteId)
      );
    }
    if (filter === 'group') {
      // 단체반은 단체반에 속한 학생
      return groupClasses.some(gc => 
        gc.students.some(s => s.userId._id === session.athleteId)
      );
    }
    return true;
  });

  if (!user || user.userType !== 'instructor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">강사만 접근 가능한 페이지입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 완료율 관리
          </h1>
          <p className="text-gray-600">
            담당 학생들의 훈련 완료율을 입력하고 관리하세요
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            전체 ({incompleteSessions.length})
          </button>
          <button
            onClick={() => setFilter('pt')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pt'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            PT 학생
          </button>
          <button
            onClick={() => setFilter('group')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'group'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            단체반 학생
          </button>
        </div>

        {/* 미입력 세션 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingState message="로딩 중..." size="lg" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">✅ 미입력 세션이 없습니다!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    학생 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    프로그램
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    세션
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.athleteName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.programTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.sessionDay}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{session.sessionDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.isPast ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          기한 지남
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          대기 중
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedSession(session);
                          setShowCompletionModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        입력하기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 단체반 정보 */}
        {groupClasses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📚 담당 단체반
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupClasses.map((gc) => (
                <div key={gc._id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {gc.className}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    학생 수: {gc.students.filter(s => s.status === 'active').length}명
                  </p>
                  <button
                    onClick={() => {
                      // 단체반 상세 페이지로 이동
                      window.location.href = `/instructor/group-classes/${gc._id}`;
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    자세히 보기 →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 완료율 입력 모달 */}
      {showCompletionModal && selectedSession && (
        <CompletionInputModal
          programId={selectedSession.programId}
          sessionIndex={selectedSession.sessionIndex}
          sessionDay={selectedSession.sessionDay}
          sessionDate={selectedSession.sessionDate}
          onClose={() => {
            setShowCompletionModal(false);
            setSelectedSession(null);
          }}
          onSubmit={handleCompletionSubmit}
        />
      )}
    </div>
  );
}

