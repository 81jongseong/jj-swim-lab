'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, 
  Timer, 
  Target, 
  Zap, 
  Users, 
  MapPin, 
  Clock,
  Activity,
  Award,
  Droplets,
  Wind,
  Thermometer,
  Car,
  Camera,
  Coffee,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface DetailedMeetupCreatorProps {
  onSubmit?: (meetupData: any) => void;
  onCancel?: () => void;
}

export const DetailedMeetupCreator: React.FC<DetailedMeetupCreatorProps> = ({
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetupType: '',
    location: { preset: '', custom: '' },
    datetime: { date: '', time: '', duration: 60 },
    participants: { min: 2, max: 6 },
    
    // 세분화된 수영 정보
    swimmingDetails: {
      strokes: [] as string[],
      primaryStroke: '',
      pace: {
        type: '',
        description: '',
        targetTime: '',
        restInterval: 60
      },
      training: {
        warmup: { duration: 10, intensity: 'light', strokes: ['freestyle'] },
        main: {
          sets: [{ distance: 100, repetitions: 4, stroke: 'freestyle', pace: 'moderate', rest: 30 }],
          totalDistance: 400
        },
        cooldown: { duration: 10, type: 'easy_swim' }
      },
      focus: [] as string[],
      primaryGoal: '',
      levelRequirements: {
        minimumDistance: 100,
        requiredStrokes: ['freestyle'],
        experienceMonths: 0
      },
      equipment: {
        required: ['수영복', '수경', '수모'],
        recommended: [],
        provided: []
      }
    },
    convenience: {
      carpoolAvailable: false,
      equipmentSharing: false,
      beginnerFriendly: true,
      photoSession: false,
      afterMeetup: ''
    },
    conditions: {
      weatherDependent: false,
      backupPlan: '',
      minTemperature: 15
    }
  });

  // 영법 정보
  const strokesInfo = {
    freestyle: { name: '자유형', icon: '🏊‍♂️', difficulty: 1, description: '가장 기본적이고 빠른 영법' },
    backstroke: { name: '배영', icon: '🏊‍♀️', difficulty: 2, description: '등을 대고 수영하는 영법' },
    breaststroke: { name: '평영', icon: '🐸', difficulty: 2, description: '개구리처럼 수영하는 영법' },
    butterfly: { name: '접영', icon: '🦋', difficulty: 4, description: '가장 어려운 고급 영법' },
    medley: { name: '혼영', icon: '🌊', difficulty: 5, description: '모든 영법을 순서대로' }
  };

  // 페이스 정보
  const paceInfo = {
    easy: { 
      name: '이지 페이스', 
      description: '편안하게 대화하며 수영', 
      icon: '😌', 
      color: 'green',
      examples: ['100m 3분+', '200m 7분+'],
      heartRate: '60-70%',
      restRatio: '1:1'
    },
    moderate: { 
      name: '보통 페이스', 
      description: '적당한 강도로 꾸준히', 
      icon: '🚶‍♂️', 
      color: 'blue',
      examples: ['100m 2-3분', '200m 5-7분'],
      heartRate: '70-80%',
      restRatio: '1:2'
    },
    fast: { 
      name: '빠른 페이스', 
      description: '약간 힘들지만 지속 가능', 
      icon: '🏃‍♂️', 
      color: 'orange',
      examples: ['100m 1:30-2분', '200m 3:30-5분'],
      heartRate: '80-90%',
      restRatio: '1:3'
    },
    sprint: { 
      name: '스프린트', 
      description: '최대한 빠르게 짧은 거리', 
      icon: '⚡', 
      color: 'red',
      examples: ['50m 전력', '100m 최대한 빠르게'],
      heartRate: '90%+',
      restRatio: '1:4'
    },
    mixed: { 
      name: '믹스 페이스', 
      description: '다양한 강도를 섞어서', 
      icon: '🎯', 
      color: 'purple',
      examples: ['이지→보통→빠름', '인터벌 훈련'],
      heartRate: '변동',
      restRatio: '변동'
    }
  };

  // 훈련 초점 정보
  const focusInfo = {
    technique: { name: '기술 향상', icon: '🎯', description: '정확한 자세와 기술 연마' },
    endurance: { name: '지구력', icon: '💪', description: '오래 수영할 수 있는 체력 향상' },
    speed: { name: '스피드', icon: '⚡', description: '빠른 속도로 수영하는 능력 향상' },
    strength: { name: '근력', icon: '🏋️‍♂️', description: '수영 관련 근육 강화' },
    fun: { name: '재미', icon: '🎉', description: '즐겁게 수영하며 스트레스 해소' },
    recovery: { name: '회복', icon: '🧘‍♂️', description: '가벼운 수영으로 피로 회복' }
  };

  // 미리 설정된 훈련 템플릿
  const trainingTemplates = {
    beginner_easy: {
      name: '초급자 편안한 수영',
      warmup: { duration: 10, intensity: 'light', strokes: ['freestyle'] },
      main: {
        sets: [
          { distance: 50, repetitions: 4, stroke: 'freestyle', pace: 'easy', rest: 60 },
          { distance: 25, repetitions: 4, stroke: 'backstroke', pace: 'easy', rest: 45 }
        ],
        totalDistance: 300
      },
      cooldown: { duration: 10, type: 'easy_swim' }
    },
    intermediate_endurance: {
      name: '중급자 지구력 훈련',
      warmup: { duration: 15, intensity: 'moderate', strokes: ['freestyle', 'backstroke'] },
      main: {
        sets: [
          { distance: 100, repetitions: 6, stroke: 'freestyle', pace: 'moderate', rest: 30 },
          { distance: 200, repetitions: 2, stroke: 'breaststroke', pace: 'easy', rest: 60 }
        ],
        totalDistance: 1000
      },
      cooldown: { duration: 15, type: 'both' }
    },
    advanced_speed: {
      name: '고급자 스피드 훈련',
      warmup: { duration: 20, intensity: 'moderate', strokes: ['freestyle', 'butterfly'] },
      main: {
        sets: [
          { distance: 50, repetitions: 8, stroke: 'freestyle', pace: 'fast', rest: 45 },
          { distance: 25, repetitions: 4, stroke: 'butterfly', pace: 'sprint', rest: 90 }
        ],
        totalDistance: 500
      },
      cooldown: { duration: 15, type: 'both' }
    }
  };

  // 자동 제목 생성
  const generateAutoTitle = () => {
    const strokeName = strokesInfo[formData.swimmingDetails.primaryStroke as keyof typeof strokesInfo]?.name;
    const paceName = paceInfo[formData.swimmingDetails.pace.type as keyof typeof paceInfo]?.name;
    const date = formData.datetime.date ? new Date(formData.datetime.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '';
    const time = formData.datetime.time ? formData.datetime.time.slice(0, 5) : '';
    
    if (strokeName && paceName && date && time) {
      const autoTitle = `${date} ${time} ${strokeName} ${paceName} 번개모임 (${formData.participants.min}-${formData.participants.max}명)`;
      setFormData(prev => ({ ...prev, title: autoTitle }));
    }
  };

  // 훈련 템플릿 적용
  const applyTrainingTemplate = (templateKey: string) => {
    const template = trainingTemplates[templateKey as keyof typeof trainingTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        swimmingDetails: {
          ...prev.swimmingDetails,
          training: template
        }
      }));
    }
  };

  // 총 거리 자동 계산
  const calculateTotalDistance = () => {
    const warmupDistance = formData.swimmingDetails.training.warmup.duration * 25; // 분당 25m 추정
    const cooldownDistance = formData.swimmingDetails.training.cooldown.duration * 20; // 분당 20m 추정
    const mainDistance = formData.swimmingDetails.training.main.sets.reduce(
      (total, set) => total + (set.distance * set.repetitions), 0
    );
    
    return warmupDistance + mainDistance + cooldownDistance;
  };

  // 단계별 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Waves className="h-6 w-6 mr-2 text-blue-600" />
              어떤 영법으로 수영할까요?
            </h3>
            
            {/* 주 영법 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">메인 영법</label>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(strokesInfo).map(([key, stroke]) => (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      swimmingDetails: { ...prev.swimmingDetails, primaryStroke: key }
                    }))}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.swimmingDetails.primaryStroke === key
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl mb-2">{stroke.icon}</div>
                    <div className="font-medium text-sm">{stroke.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      난이도 {stroke.difficulty}/5
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 추가 영법 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                추가로 연습할 영법 (선택사항)
              </label>
              <div className="grid md:grid-cols-5 gap-2">
                {Object.entries(strokesInfo).map(([key, stroke]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.swimmingDetails.strokes.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            swimmingDetails: {
                              ...prev.swimmingDetails,
                              strokes: [...prev.swimmingDetails.strokes, key]
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            swimmingDetails: {
                              ...prev.swimmingDetails,
                              strokes: prev.swimmingDetails.strokes.filter(s => s !== key)
                            }
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{stroke.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Timer className="h-6 w-6 mr-2 text-purple-600" />
              어떤 페이스로 수영할까요?
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(paceInfo).map(([key, pace]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    swimmingDetails: {
                      ...prev.swimmingDetails,
                      pace: { ...prev.swimmingDetails.pace, type: key, description: pace.description }
                    }
                  }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.swimmingDetails.pace.type === key
                      ? `border-${pace.color}-500 bg-${pace.color}-50 shadow-md`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{pace.icon}</div>
                  <div className="font-medium">{pace.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{pace.description}</div>
                  <div className="text-xs text-blue-600 mt-2">
                    심박수: {pace.heartRate}
                  </div>
                  <div className="text-xs text-gray-500">
                    예시: {pace.examples[0]}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 페이스 세부 설정 */}
            {formData.swimmingDetails.pace.type && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h4 className="font-medium mb-3">페이스 세부 설정</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">목표 시간 (예: 100m 2분)</label>
                    <input
                      type="text"
                      value={formData.swimmingDetails.pace.targetTime}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        swimmingDetails: {
                          ...prev.swimmingDetails,
                          pace: { ...prev.swimmingDetails.pace, targetTime: e.target.value }
                        }
                      }))}
                      placeholder="100m 2분 30초"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">휴식 시간 (초)</label>
                    <input
                      type="number"
                      value={formData.swimmingDetails.pace.restInterval}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        swimmingDetails: {
                          ...prev.swimmingDetails,
                          pace: { ...prev.swimmingDetails.pace, restInterval: Number(e.target.value) }
                        }
                      }))}
                      min="15"
                      max="300"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-600" />
              무엇에 초점을 맞출까요?
            </h3>
            
            {/* 훈련 초점 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">훈련 초점 (복수 선택 가능)</label>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(focusInfo).map(([key, focus]) => (
                  <label key={key} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.swimmingDetails.focus.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            swimmingDetails: {
                              ...prev.swimmingDetails,
                              focus: [...prev.swimmingDetails.focus, key]
                            }
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            swimmingDetails: {
                              ...prev.swimmingDetails,
                              focus: prev.swimmingDetails.focus.filter(f => f !== key)
                            }
                          }));
                        }
                      }}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{focus.icon}</span>
                      <div>
                        <div className="font-medium">{focus.name}</div>
                        <div className="text-xs text-gray-500">{focus.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 주요 목표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이번 모임의 주요 목표</label>
              <input
                type="text"
                value={formData.swimmingDetails.primaryGoal}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  swimmingDetails: { ...prev.swimmingDetails, primaryGoal: e.target.value }
                }))}
                placeholder="예: 자유형 25m 쉬지 않고 수영하기, 평영 킥 동작 완성하기"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* 훈련 템플릿 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">훈련 구성 템플릿</label>
              <div className="grid md:grid-cols-3 gap-3">
                {Object.entries(trainingTemplates).map(([key, template]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyTrainingTemplate(key)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      총 {template.totalDistance}m • {template.warmup.duration + template.cooldown.duration + 30}분
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Activity className="h-6 w-6 mr-2 text-orange-600" />
              참가 조건을 설정해주세요
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 수준 요구사항 */}
              <div className="space-y-4">
                <h4 className="font-medium">수준 요구사항</h4>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">최소 연속 수영 거리</label>
                  <select
                    value={formData.swimmingDetails.levelRequirements.minimumDistance}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      swimmingDetails: {
                        ...prev.swimmingDetails,
                        levelRequirements: {
                          ...prev.swimmingDetails.levelRequirements,
                          minimumDistance: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={25}>25m (수영장 1바퀴)</option>
                    <option value={50}>50m (수영장 2바퀴)</option>
                    <option value={100}>100m (수영장 4바퀴)</option>
                    <option value={200}>200m (수영장 8바퀴)</option>
                    <option value={400}>400m (수영장 16바퀴)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">수영 경험</label>
                  <select
                    value={formData.swimmingDetails.levelRequirements.experienceMonths}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      swimmingDetails: {
                        ...prev.swimmingDetails,
                        levelRequirements: {
                          ...prev.swimmingDetails.levelRequirements,
                          experienceMonths: Number(e.target.value)
                        }
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value={0}>제한 없음</option>
                    <option value={1}>1개월 이상</option>
                    <option value={3}>3개월 이상</option>
                    <option value={6}>6개월 이상</option>
                    <option value={12}>1년 이상</option>
                  </select>
                </div>
              </div>

              {/* 편의 기능 */}
              <div className="space-y-4">
                <h4 className="font-medium">편의 기능</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.convenience.beginnerFriendly}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        convenience: { ...prev.convenience, beginnerFriendly: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm">초보자 환영</span>
                    <span className="text-xs text-green-600 ml-2">👋</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.convenience.equipmentSharing}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        convenience: { ...prev.convenience, equipmentSharing: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm">장비 공유 가능</span>
                    <span className="text-xs text-blue-600 ml-2">🤝</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.convenience.carpoolAvailable}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        convenience: { ...prev.convenience, carpoolAvailable: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm">카풀 가능</span>
                    <span className="text-xs text-green-600 ml-2">🚗</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.convenience.photoSession}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        convenience: { ...prev.convenience, photoSession: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm">사진 촬영</span>
                    <span className="text-xs text-purple-600 ml-2">📸</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">모임 후 계획</label>
                  <select
                    value={formData.convenience.afterMeetup}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      convenience: { ...prev.convenience, afterMeetup: e.target.value }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">계획 없음</option>
                    <option value="coffee">카페에서 수다</option>
                    <option value="meal">함께 식사</option>
                    <option value="shopping">수영용품 쇼핑</option>
                    <option value="sauna">사우나/찜질방</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-600" />
              훈련 구성을 설정해주세요
            </h3>
            
            {/* 총 거리 및 시간 요약 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{calculateTotalDistance()}m</div>
                  <div className="text-sm text-gray-600">예상 총 거리</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formData.datetime.duration}분</div>
                  <div className="text-sm text-gray-600">예상 소요시간</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(calculateTotalDistance() / formData.datetime.duration)}m/분
                  </div>
                  <div className="text-sm text-gray-600">평균 페이스</div>
                </div>
              </div>
            </div>

            {/* 훈련 구성 */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* 워밍업 */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2 flex items-center text-green-600">
                    <Droplets className="h-4 w-4 mr-1" />
                    워밍업
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <label className="block text-xs text-gray-500">시간 (분)</label>
                      <input
                        type="number"
                        value={formData.swimmingDetails.training.warmup.duration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          swimmingDetails: {
                            ...prev.swimmingDetails,
                            training: {
                              ...prev.swimmingDetails.training,
                              warmup: { ...prev.swimmingDetails.training.warmup, duration: Number(e.target.value) }
                            }
                          }
                        }))}
                        min="5"
                        max="30"
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">강도</label>
                      <select
                        value={formData.swimmingDetails.training.warmup.intensity}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          swimmingDetails: {
                            ...prev.swimmingDetails,
                            training: {
                              ...prev.swimmingDetails.training,
                              warmup: { ...prev.swimmingDetails.training.warmup, intensity: e.target.value as any }
                            }
                          }
                        }))}
                        className="w-full p-1 border rounded text-xs"
                      >
                        <option value="light">가벼움</option>
                        <option value="moderate">보통</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 메인 세트 */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2 flex items-center text-blue-600">
                    <Waves className="h-4 w-4 mr-1" />
                    메인 세트
                  </h5>
                  <div className="space-y-2">
                    {formData.swimmingDetails.training.main.sets.map((set, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <input
                              type="number"
                              value={set.distance}
                              onChange={(e) => {
                                const newSets = [...formData.swimmingDetails.training.main.sets];
                                newSets[index].distance = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  swimmingDetails: {
                                    ...prev.swimmingDetails,
                                    training: { ...prev.swimmingDetails.training, main: { ...prev.swimmingDetails.training.main, sets: newSets } }
                                  }
                                }));
                              }}
                              placeholder="거리(m)"
                              className="w-full p-1 border rounded"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={set.repetitions}
                              onChange={(e) => {
                                const newSets = [...formData.swimmingDetails.training.main.sets];
                                newSets[index].repetitions = Number(e.target.value);
                                setFormData(prev => ({
                                  ...prev,
                                  swimmingDetails: {
                                    ...prev.swimmingDetails,
                                    training: { ...prev.swimmingDetails.training, main: { ...prev.swimmingDetails.training.main, sets: newSets } }
                                  }
                                }));
                              }}
                              placeholder="반복"
                              className="w-full p-1 border rounded"
                            />
                          </div>
                        </div>
                        <div className="mt-1">
                          <select
                            value={set.stroke}
                            onChange={(e) => {
                              const newSets = [...formData.swimmingDetails.training.main.sets];
                              newSets[index].stroke = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                swimmingDetails: {
                                  ...prev.swimmingDetails,
                                  training: { ...prev.swimmingDetails.training, main: { ...prev.swimmingDetails.training.main, sets: newSets } }
                                }
                              }));
                            }}
                            className="w-full p-1 border rounded text-xs"
                          >
                            <option value="freestyle">자유형</option>
                            <option value="backstroke">배영</option>
                            <option value="breaststroke">평영</option>
                            <option value="butterfly">접영</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        swimmingDetails: {
                          ...prev.swimmingDetails,
                          training: {
                            ...prev.swimmingDetails.training,
                            main: {
                              ...prev.swimmingDetails.training.main,
                              sets: [...prev.swimmingDetails.training.main.sets, 
                                { distance: 50, repetitions: 2, stroke: 'freestyle', pace: 'moderate', rest: 30 }]
                            }
                          }
                        }
                      }))}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-300"
                    >
                      + 세트 추가
                    </button>
                  </div>
                </div>

                {/* 쿨다운 */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-2 flex items-center text-purple-600">
                    <Wind className="h-4 w-4 mr-1" />
                    쿨다운
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <label className="block text-xs text-gray-500">시간 (분)</label>
                      <input
                        type="number"
                        value={formData.swimmingDetails.training.cooldown.duration}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          swimmingDetails: {
                            ...prev.swimmingDetails,
                            training: {
                              ...prev.swimmingDetails.training,
                              cooldown: { ...prev.swimmingDetails.training.cooldown, duration: Number(e.target.value) }
                            }
                          }
                        }))}
                        min="5"
                        max="20"
                        className="w-full p-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">방식</label>
                      <select
                        value={formData.swimmingDetails.training.cooldown.type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          swimmingDetails: {
                            ...prev.swimmingDetails,
                            training: {
                              ...prev.swimmingDetails.training,
                              cooldown: { ...prev.swimmingDetails.training.cooldown, type: e.target.value as any }
                            }
                          }
                        }))}
                        className="w-full p-1 border rounded text-xs"
                      >
                        <option value="easy_swim">가벼운 수영</option>
                        <option value="stretching">스트레칭</option>
                        <option value="both">수영 + 스트레칭</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 훈련 미리보기 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                훈련 구성 미리보기
              </h4>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>워밍업:</span>
                  <span>{formData.swimmingDetails.training.warmup.duration}분 ({formData.swimmingDetails.training.warmup.intensity})</span>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">메인 세트:</div>
                  {formData.swimmingDetails.training.main.sets.map((set, index) => (
                    <div key={index} className="pl-4 text-xs text-gray-600">
                      • {set.distance}m × {set.repetitions}회 ({set.stroke}) - 휴식 {set.rest}초
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <span>쿨다운:</span>
                  <span>{formData.swimmingDetails.training.cooldown.duration}분 ({formData.swimmingDetails.training.cooldown.type})</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between font-medium">
                    <span>총 예상 거리:</span>
                    <span className="text-blue-600">{calculateTotalDistance()}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 진행 단계 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">⚡ 전문 번개모임 만들기</h2>
              <p className="text-blue-100 mt-1">영법, 페이스, 훈련까지 세밀하게 설정하세요</p>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-400 text-blue-200'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-100">
            {currentStep === 1 && '영법 선택'}
            {currentStep === 2 && '페이스 설정'}
            {currentStep === 3 && '훈련 초점'}
            {currentStep === 4 && '참가 조건'}
            {currentStep === 5 && '훈련 구성'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다음
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-medium flex items-center"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  번개모임 만들기
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailedMeetupCreator;
