/**
 * 🏊‍♂️ JJ Swim Lab - 맞춤형 수영 계획 생성 페이지 (강사용)
 * 
 * 📋 **페이지 목적**
 * - 학생의 건강 상태를 기반으로 맞춤형 수영 계획 생성
 * - 관절질환별 안전한 수영 영법 추천
 * - 과학적 근거 기반 운동량 및 강도 설정
 * - 학생별 진행상황 추적 및 계획 조정
 * 
 * 🔄 **주요 기능**
 * - 학생 건강 정보 입력 및 확인
 * - 자동 수영 계획 생성
 * - 관절질환별 영법 안전도 표시
 * - 주간 계획 조정 및 최적화
 * - 진행상황 모니터링
 * 
 * 🗄️ **데이터 연동**
 * - 수영 트레이닝 엔진 (../swim-training-engine)
 * - 학생 건강 데이터베이스
 * - 관절질환 가이드라인
 * - 운동 기록 및 진행상황
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - shadcn/ui 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 학생 개인정보 보호
 * 2. 의료적 조언과의 구분
 * 3. 안전한 운동 강도 설정
 * 4. 실시간 피드백 수집
 * 5. 계획 조정의 투명성
 * 
 * 📅 **개발 히스토리**
 * - 2024-09-23: 초기 구현
 */

'use client';

import React, { useState } from 'react';

export default function SwimTrainingPlanPage() {
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState('');

  // 샘플 학생 데이터
  const students = [
    {
      id: '1',
      name: '김수영',
      age: 35,
      conditions: ['lumbar_disc_herniation', 'obesity'],
      level: 'intermediate',
      lastPlan: '2024-09-20'
    },
    {
      id: '2', 
      name: '이영수',
      age: 28,
      conditions: ['shoulder_impingement'],
      level: 'beginner',
      lastPlan: '2024-09-18'
    },
    {
      id: '3',
      name: '박물수',
      age: 45,
      conditions: ['knee_osteoarthritis', 'hypertension'],
      level: 'advanced',
      lastPlan: '2024-09-22'
    }
  ];

  // 샘플 수영 계획
  const samplePlan = {
    weekly_target_min: 180,
    sessions: [
      {
        day: 'Mon',
        focus: ['blood_pressure_control', 'fat_loss'],
        stroke_plan: [
          { stroke: 'freestyle', block: '15\' easy' },
          { stroke: 'backstroke', block: '25\' @RPE 11-13' },
          { stroke: 'elementary_backstroke', block: '10\' easy' }
        ],
        constraints: ['척추 중립 자세 유지', '킥 폭 축소'],
        intensity_cues: { primary: 'RPE 11–13(중등도)', secondary: 'HR: 육상 목표에서 −10~15bpm' },
        stop_rules: ['SBP≥250 or DBP≥115(즉시 중지)', 'chest_pain', 'unusual_dyspnea']
      },
      {
        day: 'Wed',
        focus: ['blood_pressure_control', 'fat_loss'],
        stroke_plan: [
          { stroke: 'freestyle', block: '15\' easy' },
          { stroke: 'backstroke', block: '25\' @RPE 11-13' },
          { stroke: 'elementary_backstroke', block: '10\' easy' }
        ],
        constraints: ['척추 중립 자세 유지', '킥 폭 축소'],
        intensity_cues: { primary: 'RPE 11–13(중등도)', secondary: 'HR: 육상 목표에서 −10~15bpm' },
        stop_rules: ['SBP≥250 or DBP≥115(즉시 중지)', 'chest_pain', 'unusual_dyspnea']
      },
      {
        day: 'Fri',
        focus: ['blood_pressure_control', 'fat_loss'],
        stroke_plan: [
          { stroke: 'freestyle', block: '15\' easy' },
          { stroke: 'backstroke', block: '25\' @RPE 11-13' },
          { stroke: 'elementary_backstroke', block: '10\' easy' }
        ],
        constraints: ['척추 중립 자세 유지', '킥 폭 축소'],
        intensity_cues: { primary: 'RPE 11–13(중등도)', secondary: 'HR: 육상 목표에서 −10~15bpm' },
        stop_rules: ['SBP≥250 or DBP≥115(즉시 중지)', 'chest_pain', 'unusual_dyspnea']
      },
      {
        day: 'Sun',
        focus: ['blood_pressure_control', 'fat_loss'],
        stroke_plan: [
          { stroke: 'freestyle', block: '15\' easy' },
          { stroke: 'backstroke', block: '25\' @RPE 11-13' },
          { stroke: 'elementary_backstroke', block: '10\' easy' }
        ],
        constraints: ['척추 중립 자세 유지', '킥 폭 축소'],
        intensity_cues: { primary: 'RPE 11–13(중등도)', secondary: 'HR: 육상 목표에서 −10~15bpm' },
        stop_rules: ['SBP≥250 or DBP≥115(즉시 중지)', 'chest_pain', 'unusual_dyspnea']
      }
    ],
    next_week_adjustment: 'progress_+5%',
    notes: [
      '수중 HR은 개인차가 큼 — 확실하지 않음',
      '평영 킥 폭 축소 — 추측입니다'
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏊‍♂️ 맞춤형 수영 계획
        </h1>
        <p className="text-gray-600">
          학생의 건강 상태를 기반으로 과학적 근거가 있는 수영 프로그램을 생성합니다
        </p>
      </div>

      {/* 메인 탭 */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 학생 목록
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'plan'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 수영 계획
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'progress'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 진행상황
          </button>
        </div>

        {/* 학생 목록 탭 */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 내 학생 목록</h3>
              <p className="text-gray-600 mb-4">건강 정보가 등록된 학생들의 목록입니다</p>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">
                            {student.age}세 • {student.level} 레벨
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="flex space-x-1 mb-1">
                            {student.conditions.map((condition, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                {condition === 'lumbar_disc_herniation' ? '허리디스크' :
                                 condition === 'obesity' ? '비만' :
                                 condition === 'shoulder_impingement' ? '어깨충돌' :
                                 condition === 'knee_osteoarthritis' ? '무릎골관절염' :
                                 condition === 'hypertension' ? '고혈압' : condition}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            마지막 계획: {student.lastPlan}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedStudent(student.id);
                            setActiveTab('plan');
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          계획 생성
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 수영 계획 탭 */}
        {activeTab === 'plan' && (
          <div className="space-y-6">
            {selectedStudent ? (
              <>
                {/* 학생 정보 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 학생 정보</h3>
                  {(() => {
                    const student = students.find(s => s.id === selectedStudent);
                    return student ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-gray-600">
                            {student.age}세 • {student.level} 레벨
                          </p>
                          <div className="flex space-x-1 mt-1">
                            {student.conditions.map((condition, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                {condition === 'lumbar_disc_herniation' ? '허리디스크' :
                                 condition === 'obesity' ? '비만' :
                                 condition === 'shoulder_impingement' ? '어깨충돌' :
                                 condition === 'knee_osteoarthritis' ? '무릎골관절염' :
                                 condition === 'hypertension' ? '고혈압' : condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* 생성된 수영 계획 */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 주간 수영 계획</h3>
                  <p className="text-gray-600 mb-4">과학적 근거 기반 맞춤형 수영 프로그램</p>
                  <div className="space-y-6">
                    {/* 계획 요약 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-600 rounded-full mx-auto mb-2"></div>
                        <div className="text-2xl font-bold text-blue-600">{samplePlan.weekly_target_min}</div>
                        <div className="text-sm text-gray-600">주간 목표 시간(분)</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-600 rounded-full mx-auto mb-2"></div>
                        <div className="text-2xl font-bold text-green-600">{samplePlan.sessions.length}</div>
                        <div className="text-sm text-gray-600">주간 세션 수</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="w-6 h-6 bg-purple-600 rounded-full mx-auto mb-2"></div>
                        <div className="text-lg font-bold text-purple-600">{samplePlan.next_week_adjustment}</div>
                        <div className="text-sm text-gray-600">다음 주 조정</div>
                      </div>
                    </div>

                    {/* 세션별 계획 */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">📅 세션별 상세 계획</h4>
                      {samplePlan.sessions.map((session, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">{session.day}요일</h5>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {session.stroke_plan.reduce((total, sp) => {
                                const minutes = parseInt(sp.block.match(/\d+/)?.[0] || '0');
                                return total + minutes;
                              }, 0)}분
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {/* 영법 계획 */}
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">🏊‍♂️ 영법 계획</h6>
                              <div className="space-y-1">
                                {session.stroke_plan.map((sp, spIndex) => (
                                  <div key={spIndex} className="flex items-center space-x-2 text-sm">
                                    <span className="w-20 text-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                      {sp.stroke === 'freestyle' ? '자유형' :
                                       sp.stroke === 'backstroke' ? '배영' :
                                       sp.stroke === 'breaststroke' ? '평영' :
                                       sp.stroke === 'butterfly' ? '나비영' :
                                       sp.stroke === 'elementary_backstroke' ? '기본배영' :
                                       sp.stroke === 'sidestroke' ? '측영' : sp.stroke}
                                    </span>
                                    <span>{sp.block}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 강도 지표 */}
                            <div>
                              <h6 className="text-sm font-medium text-gray-700 mb-2">⚡ 강도 지표</h6>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                  <span><strong>주요:</strong> {session.intensity_cues.primary}</span>
                                </div>
                                {session.intensity_cues.secondary && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                    <span><strong>보조:</strong> {session.intensity_cues.secondary}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 주의사항 */}
                            {session.constraints.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-gray-700 mb-2">⚠️ 주의사항</h6>
                                <div className="space-y-1">
                                  {session.constraints.map((constraint, cIndex) => (
                                    <div key={cIndex} className="flex items-center space-x-2 text-sm">
                                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                      <span>{constraint}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 추가 노트 */}
                    {samplePlan.notes.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">📝 추가 노트</h4>
                        <div className="space-y-1">
                          {samplePlan.notes.map((note, index) => (
                            <p key={index} className="text-sm text-yellow-700">{note}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        계획 적용
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                        일정 조정
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  학생을 선택해주세요
                </h3>
                <p className="text-gray-500">
                  학생 목록에서 수영 계획을 생성할 학생을 선택하세요
                </p>
              </div>
            )}
          </div>
        )}

        {/* 진행상황 탭 */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 학생별 진행상황</h3>
              <p className="text-gray-600 mb-4">수영 계획 실행 현황 및 성과 분석</p>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">진행률 85%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>주간 목표 달성</span>
                        <span className="text-green-600">4/4 세션</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>평균 운동 시간</span>
                        <span>48분</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>마지막 운동</span>
                        <span>2일 전</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}