/**
 * 🏊 생존수영 10차시 커리큘럼 편집기
 * 
 * 기능:
 * - 교육부 표준 10차시 커리큘럼 로드
 * - 각 차시별 활동 내용 수정
 * - 세트 수, 시간, 설명 커스터마이징
 * - 안전 수칙 추가/수정
 * - 커스텀 버전 저장
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/survivalSwimCurriculum.ts
 * - server/src/routes/swim-programs.ts
 */

'use client';

import { useState, useEffect } from 'react';
import { SURVIVAL_SWIM_10_SESSIONS, type SurvivalSwimSession, type SurvivalSwimActivity } from '@/lib/swimlab/survivalSwimCurriculum';

interface SurvivalSwimCurriculumEditorProps {
  centerId?: string;
  onSave?: (sessions: SurvivalSwimSession[]) => void;
  readOnly?: boolean;
}

export default function SurvivalSwimCurriculumEditor({
  centerId,
  onSave,
  readOnly = false
}: SurvivalSwimCurriculumEditorProps) {
  const [sessions, setSessions] = useState<SurvivalSwimSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    // 표준 커리큘럼 로드
    setSessions(JSON.parse(JSON.stringify(SURVIVAL_SWIM_10_SESSIONS)));
  }, []);

  const currentSession = sessions[selectedSession];

  const handleActivityUpdate = (activityIndex: number, field: keyof SurvivalSwimActivity, value: any) => {
    const newSessions = [...sessions];
    const activity = newSessions[selectedSession].activities[activityIndex];
    (activity as any)[field] = value;
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleSessionUpdate = (field: keyof SurvivalSwimSession, value: any) => {
    const newSessions = [...sessions];
    (newSessions[selectedSession] as any)[field] = value;
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleAddActivity = () => {
    const newSessions = [...sessions];
    newSessions[selectedSession].activities.push({
      type: 'skill',
      name: '새로운 활동',
      sets: '3×1′, r30″',
      description: '활동 설명을 입력하세요',
      whyPace: '페이스 설명',
      whyRest: '휴식 설명',
      whySet: '세트 설명'
    });
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleRemoveActivity = (activityIndex: number) => {
    const newSessions = [...sessions];
    newSessions[selectedSession].activities.splice(activityIndex, 1);
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleAddSession = () => {
    const lastSession = sessions[sessions.length - 1];
    const newSession: SurvivalSwimSession = {
      week: lastSession ? lastSession.week : 1,
      day: lastSession ? lastSession.day + 1 : 1,
      sessionNumber: sessions.length + 1,
      title: `차시${sessions.length + 1}: 새로운 세션`,
      duration: 50,
      activities: [{
        type: 'skill',
        name: '활동 추가',
        sets: '3×1′, r30″',
        description: '활동 설명',
        whyPace: '페이스 이유',
        whyRest: '휴식 이유',
        whySet: '세트 목적'
      }],
      safetyNotes: ['안전 수칙을 추가하세요']
    };
    setSessions([...sessions, newSession]);
    setSelectedSession(sessions.length);
    setIsModified(true);
  };

  const handleRemoveSession = (sessionIndex: number) => {
    if (sessions.length <= 1) {
      alert('최소 1개의 세션은 유지해야 합니다.');
      return;
    }
    if (confirm(`차시 ${sessions[sessionIndex].sessionNumber}을(를) 삭제하시겠습니까?`)) {
      const newSessions = sessions.filter((_, idx) => idx !== sessionIndex);
      // 차시 번호 재정렬
      newSessions.forEach((session, idx) => {
        session.sessionNumber = idx + 1;
      });
      setSessions(newSessions);
      setSelectedSession(Math.max(0, sessionIndex - 1));
      setIsModified(true);
    }
  };

  const handleAddSafetyNote = () => {
    const newSessions = [...sessions];
    newSessions[selectedSession].safetyNotes.push('새로운 안전 수칙');
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleSafetyNoteUpdate = (index: number, value: string) => {
    const newSessions = [...sessions];
    newSessions[selectedSession].safetyNotes[index] = value;
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleRemoveSafetyNote = (index: number) => {
    const newSessions = [...sessions];
    newSessions[selectedSession].safetyNotes.splice(index, 1);
    setSessions(newSessions);
    setIsModified(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(sessions);
    }
    setIsModified(false);
  };

  const handleReset = () => {
    if (confirm('표준 커리큘럼으로 초기화하시겠습니까?')) {
      setSessions(JSON.parse(JSON.stringify(SURVIVAL_SWIM_10_SESSIONS)));
      setIsModified(false);
    }
  };

  if (!currentSession) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg">
      {/* 좌측 사이드바: 차시 목록 */}
      <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
          <h2 className="font-bold text-lg">📚 생존수영 커리큘럼</h2>
          <p className="text-xs mt-1">{sessions.length}차시 (커스터마이징 가능)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session, index) => (
            <div key={index} className="relative group mb-2">
              <button
                onClick={() => setSelectedSession(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedSession === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm">
                  차시 {session.sessionNumber}
                </div>
                <div className={`text-xs mt-1 ${
                  selectedSession === index ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  Week {session.week}-Day {session.day} · {session.duration}분
                </div>
                <div className={`text-xs mt-1 font-medium line-clamp-2 ${
                  selectedSession === index ? 'text-white' : 'text-gray-600'
                }`}>
                  {session.title.split(': ')[1] || session.title}
                </div>
              </button>
              {!readOnly && sessions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSession(index);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                  title="세션 삭제"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {!readOnly && (
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={handleAddSession}
              className="w-full py-2.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
            >
              + 차시 추가
            </button>
          </div>
        )}
      </div>

      {/* 우측 편집 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Week:</label>
                  <input
                    type="number"
                    min="1"
                    value={currentSession.week}
                    onChange={(e) => handleSessionUpdate('week', parseInt(e.target.value) || 1)}
                    disabled={readOnly}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-medium">Day:</label>
                  <input
                    type="number"
                    min="1"
                    value={currentSession.day}
                    onChange={(e) => handleSessionUpdate('day', parseInt(e.target.value) || 1)}
                    disabled={readOnly}
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-medium">시간:</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    step="10"
                    value={currentSession.duration}
                    onChange={(e) => handleSessionUpdate('duration', parseInt(e.target.value) || 50)}
                    disabled={readOnly}
                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>분</span>
                </div>
              </div>
              <input
                type="text"
                value={currentSession.title}
                onChange={(e) => handleSessionUpdate('title', e.target.value)}
                disabled={readOnly}
                placeholder="세션 제목을 입력하세요"
                className="w-full text-xl font-bold text-gray-800 bg-white border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {!readOnly && (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  🔄 초기화
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isModified}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isModified
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  💾 저장
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 스크롤 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 활동 목록 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">📋 활동 목록</h3>
              {!readOnly && (
                <button
                  onClick={handleAddActivity}
                  className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  + 활동 추가
                </button>
              )}
            </div>

            <div className="space-y-4">
              {currentSession.activities.map((activity, actIndex) => (
                <div
                  key={actIndex}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          value={activity.type}
                          onChange={(e) => handleActivityUpdate(actIndex, 'type', e.target.value)}
                          disabled={readOnly}
                          className="px-2 py-1 text-xs font-medium rounded border border-blue-300 bg-white"
                        >
                          <option value="skill">기술</option>
                          <option value="drill">드릴</option>
                          <option value="scenario">시나리오</option>
                          <option value="evaluation">평가</option>
                        </select>
                        
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => handleActivityUpdate(actIndex, 'name', e.target.value)}
                          disabled={readOnly}
                          className="flex-1 px-3 py-1.5 font-semibold text-gray-800 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      {activity.sets && (
                        <input
                          type="text"
                          value={activity.sets}
                          onChange={(e) => handleActivityUpdate(actIndex, 'sets', e.target.value)}
                          disabled={readOnly}
                          placeholder="세트 (예: 3×3′, r1′)"
                          className="w-full px-3 py-1.5 text-sm font-mono text-blue-700 bg-blue-100 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                      )}
                    </div>
                    
                    {!readOnly && (
                      <button
                        onClick={() => handleRemoveActivity(actIndex)}
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        📝 활동 설명
                      </label>
                      <textarea
                        value={activity.description}
                        onChange={(e) => handleActivityUpdate(actIndex, 'description', e.target.value)}
                        disabled={readOnly}
                        rows={2}
                        className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1">
                          ⏱️ Why Pace? (페이스 이유)
                        </label>
                        <textarea
                          value={activity.whyPace}
                          onChange={(e) => handleActivityUpdate(actIndex, 'whyPace', e.target.value)}
                          disabled={readOnly}
                          rows={1}
                          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-green-700 mb-1">
                          💤 Why Rest? (휴식 이유)
                        </label>
                        <textarea
                          value={activity.whyRest}
                          onChange={(e) => handleActivityUpdate(actIndex, 'whyRest', e.target.value)}
                          disabled={readOnly}
                          rows={1}
                          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-700 mb-1">
                          🎯 Why Set? (세트 목적)
                        </label>
                        <textarea
                          value={activity.whySet}
                          onChange={(e) => handleActivityUpdate(actIndex, 'whySet', e.target.value)}
                          disabled={readOnly}
                          rows={2}
                          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 안전 수칙 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">⚠️ 안전 수칙</h3>
              {!readOnly && (
                <button
                  onClick={handleAddSafetyNote}
                  className="px-3 py-1.5 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                >
                  + 수칙 추가
                </button>
              )}
            </div>

            <div className="space-y-2">
              {currentSession.safetyNotes.map((note, index) => (
                <div key={index} className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <span className="text-yellow-600">⚠️</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleSafetyNoteUpdate(index, e.target.value)}
                    disabled={readOnly}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-700 bg-white border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveSafetyNote(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

