/**
 * 🏊 SwimLab - 프로그램 목록 뷰
 * 
 * 📋 **컴포넌트 목적**
 * - 생성된 모든 훈련 프로그램을 카드 형식으로 표시
 * - 검색/필터 기능
 * - 클릭 시 상세보기/수정/삭제
 * 
 * 🔄 **주요 기능**
 * - 카드 그리드 레이아웃
 * - 프로그램 타입별 필터 (주간/레이스)
 * - 선수별 필터
 * - 날짜별 정렬
 * - 상세보기 모달
 * - 수정/삭제 기능
 */

'use client';

import React, { useState, useMemo } from 'react';
import { 
  listPrograms, 
  deleteProgram, 
  saveProgram,
  getProgramStats,
  type SavedProgram 
} from '@/lib/swimlab/utils/programStorage';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

export default function ProgramListView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'weekly' | 'race'>('all');
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<SavedProgram | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProgram, setEditedProgram] = useState<SavedProgram | null>(null);
  const [programs, setPrograms] = useState(listPrograms());
  const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
  const [editingSetIdx, setEditingSetIdx] = useState<number | null>(null);
  
  const stats = getProgramStats();

  // 최근 1달 프로그램 계산
  const recentMonthCount = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return programs.filter(p => new Date(p.createdAt) >= oneMonthAgo).length;
  }, [programs]);

  // 필터링된 프로그램 목록
  const filteredPrograms = useMemo(() => {
    let result = programs;
    
    // 타입 필터
    if (filterType !== 'all') {
      result = result.filter(p => p.programType === filterType);
    }
    
    // 최근 1달 필터
    if (showRecentOnly) {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      result = result.filter(p => new Date(p.createdAt) >= oneMonthAgo);
    }
    
    // 검색 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.athleteName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [programs, filterType, showRecentOnly, searchQuery]);

  const handleDelete = (id: string) => {
    if (!confirm('이 프로그램을 삭제하시겠습니까?')) return;
    
    deleteProgram(id);
    setPrograms(listPrograms());
    setSelectedProgram(null);
    alert('프로그램이 삭제되었습니다.');
  };

  const refresh = () => setPrograms(listPrograms());

  return (
    <div className="space-y-6">
      {/* 헤더 및 통계 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">생성된 프로그램 목록</h3>
          <Button
            onClick={refresh}
            variant="ghost"
            size="sm"
          >
            🔄 새로고침
          </Button>
        </div>
        
        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="전체 프로그램"
            value={`${stats.total}개`}
            icon="📋"
            color="blue"
            subtitle={filterType === 'all' ? '전체 보기' : '클릭하여 전체 보기'}
            onClick={() => setFilterType('all')}
          />
          <StatCard
            title="주간 계획"
            value={`${stats.weekly}개`}
            icon="📅"
            color="green"
            subtitle={filterType === 'weekly' ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setFilterType(filterType === 'weekly' ? 'all' : 'weekly')}
          />
          <StatCard
            title="레이스 플랜"
            value={`${stats.race}개`}
            icon="🏁"
            color="purple"
            subtitle={filterType === 'race' ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setFilterType(filterType === 'race' ? 'all' : 'race')}
          />
          <StatCard
            title="최근 1달"
            value={`${recentMonthCount}개`}
            icon="🆕"
            color="orange"
            subtitle={showRecentOnly ? '필터 적용 중' : '클릭하여 필터링'}
            onClick={() => setShowRecentOnly(!showRecentOnly)}
          />
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              선수 이름 검색
            </label>
            <input
              type="text"
              placeholder="이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로그램 타입
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="weekly">주간 계획</option>
              <option value="race">레이스 플랜</option>
            </select>
          </div>
        </div>
      </div>

      {/* 프로그램 카드 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">📭</div>
            <p className="text-gray-500">
              {searchQuery || filterType !== 'all' 
                ? '검색 결과가 없습니다' 
                : '아직 생성된 프로그램이 없습니다'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              컨디션 설정 탭에서 프로그램을 생성하세요
            </p>
          </div>
        ) : (
          filteredPrograms.map((program) => (
            <div
              key={program.id}
              onClick={() => setSelectedProgram(program)}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer p-5"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏊‍♂️</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{program.athleteName}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(program.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  program.programType === 'weekly'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {program.programType === 'weekly' ? '주간' : '레이스'}
                </span>
              </div>

              {/* 요약 정보 */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span>{program.params.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📏</span>
                  <span>{program.content.totalMeters.toLocaleString()}m / {program.params.daysPerWeek}일</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🏊</span>
                  <span>
                    {program.params.stroke === 'FR' ? '자유형' :
                     program.params.stroke === 'BK' ? '배영' :
                     program.params.stroke === 'BR' ? '평영' : '접영'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⚕️</span>
                  <span>{program.params.conditionIds.length}개 컨디션</span>
                </div>
              </div>

              {/* 푸터 */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  클릭하여 상세보기 →
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 프로그램 상세 모달 */}
      {selectedProgram && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏊‍♂️</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProgram.athleteName}의 {selectedProgram.programType === 'weekly' ? '주간 계획' : '레이스 플랜'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    생성일: {new Date(selectedProgram.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 파라미터 정보 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">📋 프로그램 정보</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">시작일:</span>
                    <p className="font-medium">{selectedProgram.params.startDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주당 훈련:</span>
                    <p className="font-medium">{selectedProgram.params.daysPerWeek}일</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주간 거리:</span>
                    <p className="font-medium">{selectedProgram.params.weeklyMeters.toLocaleString()}m</p>
                  </div>
                  <div>
                    <span className="text-gray-600">풀 길이:</span>
                    <p className="font-medium">{selectedProgram.params.pool}m</p>
                  </div>
                  <div>
                    <span className="text-gray-600">주 영법:</span>
                    <p className="font-medium">
                      {selectedProgram.params.stroke === 'FR' ? '자유형' :
                       selectedProgram.params.stroke === 'BK' ? '배영' :
                       selectedProgram.params.stroke === 'BR' ? '평영' : '접영'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">실력:</span>
                    <p className="font-medium">
                      {selectedProgram.params.skill === 'Beginner' ? '초급' :
                       selectedProgram.params.skill === 'Intermediate' ? '중급' : '상급'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">CSS/100m:</span>
                    <p className="font-medium">{selectedProgram.params.cssPer100}초</p>
                  </div>
                  <div>
                    <span className="text-gray-600">신장:</span>
                    <p className="font-medium">{selectedProgram.params.heightCm}cm</p>
                  </div>
                </div>
                
                {/* 레이스 전용 정보 */}
                {selectedProgram.programType === 'race' && selectedProgram.params.raceDate && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600">🏆 대회일:</span>
                      <p className="font-medium">{selectedProgram.params.raceDate}</p>
                    </div>
                    <div>
                      <span className="text-purple-600">📉 테이퍼:</span>
                      <p className="font-medium">{selectedProgram.params.taperWeeks}주</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 컨디션 정보 */}
              {selectedProgram.params.conditionIds.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-3">⚕️ 적용된 컨디션</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.params.conditionIds.map((id) => (
                      <span 
                        key={id} 
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 프로그램 내용 */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3">🏊‍♂️ 훈련 프로그램</h4>
                
                {/* 요약 */}
                <div className="bg-blue-50 p-3 rounded mb-4">
                  <p className="text-sm text-blue-800">{selectedProgram.content.summary}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    총 거리: {selectedProgram.content.totalMeters.toLocaleString()}m
                  </p>
                </div>

                {/* 세션별 상세 - 수정 가능 */}
                <div className="space-y-3">
                  {selectedProgram.content.sessions.map((session, sessionIdx) => (
                    <div key={sessionIdx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{session.day}</h5>
                        <button
                          onClick={() => {
                            setEditedProgram({ ...selectedProgram });
                            setEditingSessionIdx(sessionIdx);
                            setIsEditing(true);
                          }}
                          className="text-xs px-2 py-1 border rounded hover:bg-white"
                        >
                          ✏️ 수정
                        </button>
                      </div>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {session.sets.map((set, setIdx) => (
                          <li 
                            key={setIdx} 
                            className="pl-4 border-l-2 border-blue-300 hover:border-blue-500 cursor-pointer hover:bg-white p-1 rounded"
                            onClick={() => {
                              setEditedProgram({ ...selectedProgram });
                              setEditingSessionIdx(sessionIdx);
                              setEditingSetIdx(setIdx);
                              setIsEditing(true);
                            }}
                            title="클릭하여 수정"
                          >
                            {set}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 푸터 - 액션 버튼 */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <Button
                onClick={() => {
                  setEditedProgram({ ...selectedProgram });
                  setIsEditing(true);
                }}
                variant="primary"
                size="md"
              >
                ✏️ 수정
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // ICS 재다운로드
                    alert('ICS 파일을 다시 다운로드합니다!');
                  }}
                  variant="success"
                  size="md"
                >
                  📥 다운로드
                </Button>
                
                <Button
                  onClick={() => handleDelete(selectedProgram.id)}
                  variant="danger"
                  size="md"
                >
                  🗑️ 삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {isEditing && editedProgram && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsEditing(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">프로그램 수정</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {editingSessionIdx !== null && editingSetIdx !== null ? (
                // 특정 세트 수정
                <>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-1">
                      {editedProgram.content.sessions[editingSessionIdx].day} - 세트 수정
                    </h4>
                    <p className="text-xs text-blue-700">
                      페이스, 휴식시간, 거리 등을 자유롭게 수정하세요
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      세트 내용
                    </label>
                    <textarea
                      value={editedProgram.content.sessions[editingSessionIdx].sets[editingSetIdx]}
                      onChange={(e) => {
                        const newSessions = [...editedProgram.content.sessions];
                        newSessions[editingSessionIdx].sets[editingSetIdx] = e.target.value;
                        setEditedProgram({
                          ...editedProgram,
                          content: { ...editedProgram.content, sessions: newSessions }
                        });
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      placeholder="예: 8×100m 지구력 빌드 @~1:40 per 100m, r 20″"
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h5 className="text-xs font-medium text-yellow-900 mb-2">💡 수정 가능한 항목:</h5>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>• 반복 횟수: 8×100m → 10×100m</li>
                      <li>• 페이스: @~1:40 → @~1:35</li>
                      <li>• 휴식시간: r 20″ → r 30″</li>
                      <li>• 거리: 100m → 150m</li>
                      <li>• 강도: Z3 → Z4</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSessionIdx(null);
                        setEditingSetIdx(null);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      ← 전체 수정으로 돌아가기
                    </button>
                  </div>
                </>
              ) : editingSessionIdx !== null ? (
                // 세션 전체 수정
                <>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-purple-900 mb-1">
                      {editedProgram.content.sessions[editingSessionIdx].day} - 전체 수정
                    </h4>
                    <p className="text-xs text-purple-700">
                      이 날의 모든 세트를 수정하거나, 개별 세트를 클릭하여 수정하세요
                    </p>
                  </div>

                  {editedProgram.content.sessions[editingSessionIdx].sets.map((set, setIdx) => (
                    <div key={setIdx} className="border rounded-lg p-3 bg-white hover:border-blue-400 cursor-pointer" onClick={() => setEditingSetIdx(setIdx)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 font-mono text-sm text-gray-700">{set}</div>
                        <button className="text-xs px-2 py-1 border rounded hover:bg-blue-50">
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newSets = [...editedProgram.content.sessions[editingSessionIdx].sets];
                      newSets.push('새 세트: 클릭하여 수정');
                      const newSessions = [...editedProgram.content.sessions];
                      newSessions[editingSessionIdx].sets = newSets;
                      setEditedProgram({
                        ...editedProgram,
                        content: { ...editedProgram.content, sessions: newSessions }
                      });
                    }}
                    className="w-full px-3 py-2 border-2 border-dashed rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    ➕ 세트 추가
                  </button>

                  <button
                    onClick={() => setEditingSessionIdx(null)}
                    className="w-full px-3 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    ← 기본 정보 수정으로 돌아가기
                  </button>
                </>
              ) : (
                // 기본 파라미터 수정
                <>
                  {/* 시작일 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={editedProgram.params.startDate}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, startDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* 거리 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주간 총 거리 (m)
                    </label>
                    <input
                      type="number"
                      value={editedProgram.params.weeklyMeters}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, weeklyMeters: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                      step={1000}
                    />
                  </div>

                  {/* CSS 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSS/100m (초)
                    </label>
                    <input
                      type="number"
                      value={editedProgram.params.cssPer100}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, cssPer100: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* 영법 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주 영법
                    </label>
                    <select
                      value={editedProgram.params.stroke}
                      onChange={(e) => setEditedProgram({
                        ...editedProgram,
                        params: { ...editedProgram.params, stroke: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="FR">자유형</option>
                      <option value="BK">배영</option>
                      <option value="BR">평영</option>
                      <option value="FL">접영</option>
                    </select>
                  </div>

                  {/* 세션별 수정 바로가기 */}
                  <div className="pt-4 border-t">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">또는 요일별 세부 수정:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {editedProgram.content.sessions.map((session, idx) => (
                        <button
                          key={idx}
                          onClick={() => setEditingSessionIdx(idx)}
                          className="px-3 py-2 border rounded-lg hover:bg-blue-50 text-sm"
                        >
                          {session.day} →
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-2 justify-end">
              <Button
                onClick={() => setIsEditing(false)}
                variant="secondary"
                size="md"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  // 수정 내용 저장
                  saveProgram(editedProgram);
                  setPrograms(listPrograms());
                  setSelectedProgram(editedProgram);
                  setEditingSessionIdx(null);
                  setEditingSetIdx(null);
                  setIsEditing(false);
                  alert('✅ 프로그램이 수정되었습니다!');
                }}
                variant="primary"
                size="md"
              >
                💾 저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

