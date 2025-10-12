/**
 * 🆘 인명구조원 프로그램 편집기
 * 
 * 기능:
 * - 공식 5일 집중 과정 편집
 * - 4주 준비 프로그램 편집
 * - 세트 처방, 설명 커스터마이징
 * - 육상 훈련 추가/수정
 * - 커스텀 버전 저장
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/lifeguardProgram.ts
 * - server/src/routes/swim-programs.ts
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  LIFEGUARD_5DAY_COURSE, 
  LIFEGUARD_4WEEK_PREP,
  type LifeguardSession,
  type LifeguardActivity,
  type PrepWeek,
  type PrepSession,
  type PrepSet
} from '@/lib/swimlab/lifeguardProgram';

interface LifeguardProgramEditorProps {
  centerId?: string;
  onSave?: (data: { fiveDayCourse?: LifeguardSession[]; fourWeekPrep?: PrepWeek[] }) => void;
  readOnly?: boolean;
}

type ViewMode = '5day' | '4week';

export default function LifeguardProgramEditor({
  centerId,
  onSave,
  readOnly = false
}: LifeguardProgramEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('5day');
  
  // 5일 과정
  const [fiveDaySessions, setFiveDaySessions] = useState<LifeguardSession[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  
  // 4주 준비
  const [fourWeekProgram, setFourWeekProgram] = useState<PrepWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    // 표준 프로그램 로드
    setFiveDaySessions(JSON.parse(JSON.stringify(LIFEGUARD_5DAY_COURSE)));
    setFourWeekProgram(JSON.parse(JSON.stringify(LIFEGUARD_4WEEK_PREP)));
  }, []);

  const currentFiveDaySession = fiveDaySessions[selectedDay];
  const currentWeekPrep = fourWeekProgram[selectedWeek];

  // 5일 과정 수정 핸들러
  const handleFiveDayActivityUpdate = (activityIndex: number, field: keyof LifeguardActivity, value: any) => {
    const newSessions = [...fiveDaySessions];
    const activity = newSessions[selectedDay].activities[activityIndex];
    (activity as any)[field] = value;
    setFiveDaySessions(newSessions);
    setIsModified(true);
  };

  const handleAddFiveDayActivity = () => {
    const newSessions = [...fiveDaySessions];
    newSessions[selectedDay].activities.push({
      type: 'swim',
      name: '새로운 활동',
      description: '활동 설명을 입력하세요',
      whySet: '목적 설명'
    });
    setFiveDaySessions(newSessions);
    setIsModified(true);
  };

  const handleRemoveFiveDayActivity = (activityIndex: number) => {
    const newSessions = [...fiveDaySessions];
    newSessions[selectedDay].activities.splice(activityIndex, 1);
    setFiveDaySessions(newSessions);
    setIsModified(true);
  };

  const handleAddFiveDaySession = () => {
    const lastSession = fiveDaySessions[fiveDaySessions.length - 1];
    const newSession: LifeguardSession = {
      day: fiveDaySessions.length + 1,
      title: `Day ${fiveDaySessions.length + 1}: 새로운 세션`,
      duration: 480,
      category: 'pool',
      activities: [{
        type: 'swim',
        name: '활동 추가',
        description: '활동 설명',
        whySet: '목적'
      }],
      prerequisites: []
    };
    setFiveDaySessions([...fiveDaySessions, newSession]);
    setSelectedDay(fiveDaySessions.length);
    setIsModified(true);
  };

  const handleRemoveFiveDaySession = (dayIndex: number) => {
    if (fiveDaySessions.length <= 1) {
      alert('최소 1일은 유지해야 합니다.');
      return;
    }
    if (confirm(`Day ${fiveDaySessions[dayIndex].day}를 삭제하시겠습니까?`)) {
      const newSessions = fiveDaySessions.filter((_, idx) => idx !== dayIndex);
      // Day 번호 재정렬
      newSessions.forEach((session, idx) => {
        session.day = idx + 1;
      });
      setFiveDaySessions(newSessions);
      setSelectedDay(Math.max(0, dayIndex - 1));
      setIsModified(true);
    }
  };

  // 4주 준비 수정 핸들러
  const handlePrepSetUpdate = (poolIndex: number, setIndex: number, field: keyof PrepSet, value: any) => {
    const newProgram = [...fourWeekProgram];
    const set = newProgram[selectedWeek].poolSessions[poolIndex].sets[setIndex];
    (set as any)[field] = value;
    setFourWeekProgram(newProgram);
    setIsModified(true);
  };

  const handleAddPrepSet = (poolIndex: number) => {
    const newProgram = [...fourWeekProgram];
    newProgram[selectedWeek].poolSessions[poolIndex].sets.push({
      name: '새로운 세트',
      prescription: '8×100m @ Z2, r20″',
      whySet: '세트 목적'
    });
    setFourWeekProgram(newProgram);
    setIsModified(true);
  };

  const handleRemovePrepSet = (poolIndex: number, setIndex: number) => {
    const newProgram = [...fourWeekProgram];
    newProgram[selectedWeek].poolSessions[poolIndex].sets.splice(setIndex, 1);
    setFourWeekProgram(newProgram);
    setIsModified(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        fiveDayCourse: fiveDaySessions,
        fourWeekPrep: fourWeekProgram
      });
    }
    setIsModified(false);
  };

  const handleReset = () => {
    if (confirm('표준 프로그램으로 초기화하시겠습니까?')) {
      setFiveDaySessions(JSON.parse(JSON.stringify(LIFEGUARD_5DAY_COURSE)));
      setFourWeekProgram(JSON.parse(JSON.stringify(LIFEGUARD_4WEEK_PREP)));
      setIsModified(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg">
      {/* 좌측 사이드바 */}
      <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <h2 className="font-bold text-lg">🆘 인명구조원</h2>
          <p className="text-xs mt-1">라이프가드 프로그램</p>
        </div>

        {/* 탭 선택 */}
        <div className="p-2 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setViewMode('5day')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === '5day'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              5일 집중
            </button>
            <button
              onClick={() => setViewMode('4week')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === '4week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              4주 준비
            </button>
          </div>
        </div>

        {/* 5일 과정 목록 */}
        {viewMode === '5day' && (
          <>
            <div className="flex-1 overflow-y-auto p-2">
              {fiveDaySessions.map((session, index) => (
                <div key={index} className="relative group mb-2">
                  <button
                    onClick={() => setSelectedDay(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDay === index
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-sm">Day {session.day}</div>
                    <div className={`text-xs mt-1 ${
                      selectedDay === index ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {session.duration}분 · {session.category}
                    </div>
                    <div className={`text-xs mt-1 font-medium line-clamp-2 ${
                      selectedDay === index ? 'text-white' : 'text-gray-600'
                    }`}>
                      {session.title}
                    </div>
                  </button>
                  {!readOnly && fiveDaySessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFiveDaySession(index);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                      title="Day 삭제"
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
                  onClick={handleAddFiveDaySession}
                  className="w-full py-2.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors shadow-md"
                >
                  + Day 추가
                </button>
              </div>
            )}
          </>
        )}

        {/* 4주 준비 목록 */}
        {viewMode === '4week' && (
          <div className="p-2">
            {fourWeekProgram.map((week, index) => (
              <button
                key={index}
                onClick={() => setSelectedWeek(index)}
                className={`w-full text-left p-3 mb-2 rounded-lg transition-colors ${
                  selectedWeek === index
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm">Week {week.week}</div>
                <div className={`text-xs mt-1 font-medium ${
                  selectedWeek === index ? 'text-white' : 'text-gray-600'
                }`}>
                  {week.focus}
                </div>
                <div className={`text-xs mt-1 ${
                  selectedWeek === index ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  Pool {week.poolSessions.length}회 + Land 1회
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 우측 편집 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div>
              {viewMode === '5day' && currentFiveDaySession && (
                <>
                  <div className="text-sm text-gray-500">
                    Day {currentFiveDaySession.day} · {currentFiveDaySession.duration}분 · {currentFiveDaySession.category}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentFiveDaySession.title}
                  </h2>
                </>
              )}
              {viewMode === '4week' && currentWeekPrep && (
                <>
                  <div className="text-sm text-gray-500">Week {currentWeekPrep.week}</div>
                  <h2 className="text-xl font-bold text-gray-800">{currentWeekPrep.focus}</h2>
                </>
              )}
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
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
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
          {/* 5일 과정 편집 */}
          {viewMode === '5day' && currentFiveDaySession && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">📋 활동 목록</h3>
                {!readOnly && (
                  <button
                    onClick={handleAddFiveDayActivity}
                    className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    + 활동 추가
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {currentFiveDaySession.activities.map((activity, actIndex) => (
                  <div
                    key={actIndex}
                    className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <select
                            value={activity.type}
                            onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'type', e.target.value)}
                            disabled={readOnly}
                            className="px-2 py-1 text-xs font-medium rounded border border-orange-300 bg-white"
                          >
                            <option value="swim">수영</option>
                            <option value="rescue">구조</option>
                            <option value="theory">이론</option>
                            <option value="cpr">CPR</option>
                            <option value="scenario">시나리오</option>
                          </select>

                          <input
                            type="text"
                            value={activity.name}
                            onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'name', e.target.value)}
                            disabled={readOnly}
                            className="flex-1 px-3 py-1.5 font-semibold text-gray-800 bg-white border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        {activity.sets && (
                          <input
                            type="text"
                            value={activity.sets}
                            onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'sets', e.target.value)}
                            disabled={readOnly}
                            placeholder="세트 (예: 8×50m @ Z2, r20″)"
                            className="w-full px-3 py-1.5 text-sm font-mono text-orange-700 bg-orange-100 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                          />
                        )}
                      </div>

                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveFiveDayActivity(actIndex)}
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
                          onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'description', e.target.value)}
                          disabled={readOnly}
                          rows={2}
                          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      {activity.whyPace && (
                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1">
                            ⏱️ Why Pace?
                          </label>
                          <textarea
                            value={activity.whyPace}
                            onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'whyPace', e.target.value)}
                            disabled={readOnly}
                            rows={1}
                            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {activity.whyRest && (
                        <div>
                          <label className="block text-xs font-semibold text-green-700 mb-1">
                            💤 Why Rest?
                          </label>
                          <textarea
                            value={activity.whyRest}
                            onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'whyRest', e.target.value)}
                            disabled={readOnly}
                            rows={1}
                            className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-purple-700 mb-1">
                          🎯 Why Set? (목적)
                        </label>
                        <textarea
                          value={activity.whySet}
                          onChange={(e) => handleFiveDayActivityUpdate(actIndex, 'whySet', e.target.value)}
                          disabled={readOnly}
                          rows={2}
                          className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4주 준비 편집 */}
          {viewMode === '4week' && currentWeekPrep && (
            <div className="space-y-6">
              {/* Pool Sessions */}
              {currentWeekPrep.poolSessions.map((poolSession, poolIndex) => (
                <div key={poolIndex} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{poolSession.day}: {poolSession.title}</h4>
                    {!readOnly && (
                      <button
                        onClick={() => handleAddPrepSet(poolIndex)}
                        className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded"
                      >
                        + 세트
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poolSession.sets.map((set, setIndex) => (
                      <div key={setIndex} className="bg-white rounded p-3 border border-blue-200">
                        <div className="flex items-start justify-between mb-2">
                          <input
                            type="text"
                            value={set.name}
                            onChange={(e) => handlePrepSetUpdate(poolIndex, setIndex, 'name', e.target.value)}
                            disabled={readOnly}
                            className="flex-1 px-2 py-1 font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {!readOnly && (
                            <button
                              onClick={() => handleRemovePrepSet(poolIndex, setIndex)}
                              className="ml-2 text-red-500 hover:bg-red-50 p-1 rounded"
                            >
                              🗑️
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          value={set.prescription}
                          onChange={(e) => handlePrepSetUpdate(poolIndex, setIndex, 'prescription', e.target.value)}
                          disabled={readOnly}
                          placeholder="세트 처방 (예: 8×100m @ Z2, r20″)"
                          className="w-full px-2 py-1 text-sm font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {set.whyPace && (
                          <textarea
                            value={set.whyPace}
                            onChange={(e) => handlePrepSetUpdate(poolIndex, setIndex, 'whyPace', e.target.value)}
                            disabled={readOnly}
                            placeholder="Why Pace?"
                            rows={1}
                            className="w-full px-2 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {set.whyRest && (
                          <textarea
                            value={set.whyRest}
                            onChange={(e) => handlePrepSetUpdate(poolIndex, setIndex, 'whyRest', e.target.value)}
                            disabled={readOnly}
                            placeholder="Why Rest?"
                            rows={1}
                            className="w-full px-2 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        <textarea
                          value={set.whySet}
                          onChange={(e) => handlePrepSetUpdate(poolIndex, setIndex, 'whySet', e.target.value)}
                          disabled={readOnly}
                          placeholder="Why Set? (목적)"
                          rows={2}
                          className="w-full px-2 py-1 text-xs text-gray-700 bg-gray-50 border border-purple-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Land Session */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-gray-800 mb-3">🏋️ Land: {currentWeekPrep.landSession.title}</h4>
                <ul className="space-y-2">
                  {currentWeekPrep.landSession.activities.map((activity, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span>✓</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

