/**
 * 🏊‍♂️ JJ Swim Lab - 훈련법 및 드릴 관리 페이지
 * 
 * 📋 **기능:**
 * - 훈련법 CRUD (생성, 조회, 수정, 삭제)
 * - 드릴 CRUD (생성, 조회, 수정, 삭제)
 * - 카테고리별 분류 및 필터링
 * - 검색 및 정렬 기능
 * - 대량 데이터 관리
 * 
 * 🔗 **연동 파일:**
 * - swim-training-engine/src/training_methods.ts
 * - swim-training-engine/src/drills.ts
 * - swim-training-engine/src/types.ts
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Save, 
  X, 
  Eye,
  Target,
  Activity,
  Clock,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Zap
} from 'lucide-react';

// 타입 정의
interface TrainingMethod {
  id: string;
  name: string;
  description: string;
  purpose: string;
  category: 'endurance' | 'speed' | 'technique' | 'rehabilitation' | 'weight_loss' | 'stress_relief';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  intensity: 'low' | 'moderate' | 'high';
  equipment: string[];
  benefits: string[];
  precautions: string[];
  targetMuscles: string[];
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Drill {
  id: string;
  name: string;
  description: string;
  category: 'warmup' | 'technique' | 'endurance' | 'speed' | 'cooldown';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  equipment: string[];
  benefits: string[];
  instructions: string[];
  variations: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TrainingMethodsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'methods' | 'drills'>('methods');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<TrainingMethod | Drill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TrainingMethod | Drill>>({});

  // 샘플 데이터
  const [trainingMethods, setTrainingMethods] = useState<TrainingMethod[]>([
    {
      id: '1',
      name: '지구력 훈련',
      description: '장시간 지속적인 수영을 통한 심폐지구력 향상',
      purpose: '심폐기능 강화, 지속력 향상, 칼로리 소모',
      category: 'endurance',
      difficulty: 'intermediate',
      duration: '30-60분',
      intensity: 'moderate',
      equipment: ['수영복', '고글'],
      benefits: ['심폐기능 향상', '지구력 증진', '칼로리 소모'],
      precautions: ['충분한 준비운동', '수분 섭취'],
      targetMuscles: ['전신', '심폐기관'],
      instructions: [
        '준비운동 10분 실시',
        '편안한 속도로 20분 연속 수영',
        '5분 휴식',
        '다시 20분 연속 수영',
        '마무리운동 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: '속도 훈련',
      description: '빠른 속도로 단거리 수영을 통한 근력과 속도 향상',
      purpose: '근력 강화, 속도 향상, 폭발력 개발',
      category: 'speed',
      difficulty: 'advanced',
      duration: '20-40분',
      intensity: 'high',
      equipment: ['수영복', '고글', '핀'],
      benefits: ['속도 향상', '근력 강화', '폭발력 개발'],
      precautions: ['충분한 준비운동', '점진적 강도 증가'],
      targetMuscles: ['상체', '하체', '코어'],
      instructions: [
        '준비운동 15분 실시',
        '50m 스프린트 x 8회 (휴식 30초)',
        '100m 스프린트 x 4회 (휴식 1분)',
        '마무리운동 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: '기술 훈련',
      description: '수영 기술 향상을 위한 집중적인 연습',
      purpose: '기술 향상, 효율성 증대, 부상 예방',
      category: 'technique',
      difficulty: 'beginner',
      duration: '25-45분',
      intensity: 'low',
      equipment: ['수영복', '고글', '킥보드', '풀부이'],
      benefits: ['기술 향상', '효율성 증대', '부상 예방'],
      precautions: ['올바른 자세 유지', '과도한 반복 피하기'],
      targetMuscles: ['전신', '코어'],
      instructions: [
        '준비운동 10분 실시',
        '기본 기술 연습 15분',
        '고급 기술 연습 15분',
        '마무리운동 5분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: '재활 수영',
      description: '부상 회복을 위한 저강도 수영 프로그램',
      purpose: '부상 회복, 관절 가동범위 개선, 근력 회복',
      category: 'rehabilitation',
      difficulty: 'beginner',
      duration: '20-40분',
      intensity: 'low',
      equipment: ['수영복', '고글', '풀부이'],
      benefits: ['부상 회복', '관절 가동범위 개선', '근력 회복'],
      precautions: ['의사 상담 필수', '통증 발생 시 중단'],
      targetMuscles: ['부상 부위', '지지근육'],
      instructions: [
        '준비운동 10분 실시',
        '저강도 수영 20분',
        '스트레칭 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      name: '체중감량 수영',
      description: '체중 감량을 위한 고강도 수영 프로그램',
      purpose: '체중 감량, 체지방 감소, 대사 향상',
      category: 'weight_loss',
      difficulty: 'intermediate',
      duration: '45-75분',
      intensity: 'high',
      equipment: ['수영복', '고글', '핀', '패들'],
      benefits: ['체중 감량', '체지방 감소', '대사 향상'],
      precautions: ['충분한 수분 섭취', '점진적 강도 증가'],
      targetMuscles: ['전신', '심폐기관'],
      instructions: [
        '준비운동 15분 실시',
        '고강도 수영 45분',
        '마무리운동 15분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '6',
      name: '스트레스 해소 수영',
      description: '스트레스 해소와 정신 건강을 위한 수영',
      purpose: '스트레스 해소, 정신 건강, 이완',
      category: 'stress_relief',
      difficulty: 'beginner',
      duration: '30-50분',
      intensity: 'low',
      equipment: ['수영복', '고글'],
      benefits: ['스트레스 해소', '정신 건강', '이완'],
      precautions: ['편안한 속도 유지', '무리하지 않기'],
      targetMuscles: ['전신', '심폐기관'],
      instructions: [
        '준비운동 10분 실시',
        '편안한 속도로 수영 30분',
        '이완 운동 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '7',
      name: '인터벌 훈련',
      description: '고강도와 저강도를 번갈아가며 하는 훈련',
      purpose: '심폐기능 향상, 지구력 증진, 칼로리 소모',
      category: 'endurance',
      difficulty: 'advanced',
      duration: '40-60분',
      intensity: 'high',
      equipment: ['수영복', '고글', '핀'],
      benefits: ['심폐기능 향상', '지구력 증진', '칼로리 소모'],
      precautions: ['충분한 준비운동', '점진적 강도 증가'],
      targetMuscles: ['전신', '심폐기관'],
      instructions: [
        '준비운동 15분 실시',
        '고강도 2분, 저강도 1분 반복 20분',
        '휴식 5분',
        '고강도 1분, 저강도 30초 반복 15분',
        '마무리운동 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '8',
      name: '근력 강화 수영',
      description: '근력 향상을 위한 저항 수영 훈련',
      purpose: '근력 강화, 근지구력 향상, 파워 개발',
      category: 'speed',
      difficulty: 'intermediate',
      duration: '35-55분',
      intensity: 'moderate',
      equipment: ['수영복', '고글', '패들', '핀'],
      benefits: ['근력 강화', '근지구력 향상', '파워 개발'],
      precautions: ['올바른 자세 유지', '과도한 저항 피하기'],
      targetMuscles: ['상체', '하체', '코어'],
      instructions: [
        '준비운동 10분 실시',
        '저항 수영 30분',
        '마무리운동 15분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '9',
      name: '유연성 수영',
      description: '유연성 향상을 위한 스트레칭 중심 수영',
      purpose: '유연성 향상, 관절 가동범위 개선, 이완',
      category: 'rehabilitation',
      difficulty: 'beginner',
      duration: '25-40분',
      intensity: 'low',
      equipment: ['수영복', '고글'],
      benefits: ['유연성 향상', '관절 가동범위 개선', '이완'],
      precautions: ['무리한 스트레칭 피하기', '통증 발생 시 중단'],
      targetMuscles: ['전신', '관절'],
      instructions: [
        '준비운동 10분 실시',
        '유연성 수영 20분',
        '스트레칭 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      name: '균형 수영',
      description: '수중 균형감과 조화를 위한 훈련',
      purpose: '균형감 향상, 조화력 증진, 자세 교정',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '30-50분',
      intensity: 'moderate',
      equipment: ['수영복', '고글', '킥보드'],
      benefits: ['균형감 향상', '조화력 증진', '자세 교정'],
      precautions: ['안전한 환경에서 실시', '점진적 난이도 증가'],
      targetMuscles: ['코어', '전신'],
      instructions: [
        '준비운동 10분 실시',
        '균형 수영 30분',
        '마무리운동 10분'
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  const [drills, setDrills] = useState<Drill[]>([
    {
      id: '1',
      name: '자유형 킥 드릴',
      description: '자유형 킥 기술을 향상시키는 기본 드릴',
      category: 'technique',
      difficulty: 'beginner',
      duration: '15-20분',
      equipment: ['킥보드'],
      benefits: ['킥 기술 향상', '하체 근력 강화'],
      instructions: [
        '킥보드를 잡고 수평 자세 유지',
        '발목을 유연하게 움직이며 킥',
        '무릎은 최소한으로 구부리기',
        '15분간 지속'
      ],
      variations: ['한쪽 다리만', '양발 교대', '고강도 킥'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: '배영 풀 드릴',
      description: '배영 풀 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '20-25분',
      equipment: ['풀 부이'],
      benefits: ['배영 기술 향상', '상체 근력 강화'],
      instructions: [
        '풀 부이를 다리 사이에 끼우기',
        '배영 자세로 수평 유지',
        '팔 동작에 집중하여 풀',
        '20분간 지속'
      ],
      variations: ['한쪽 팔만', '양팔 교대', '고강도 풀'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: '캐치업 드릴',
      description: '자유형 캐치업 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'beginner',
      duration: '15-25분',
      equipment: ['수영복', '고글'],
      benefits: ['타이밍 향상', '스트림라인 개선'],
      instructions: [
        '한 팔이 다른 팔을 따라잡을 때까지 기다리기',
        '긴 몸선 유지',
        '균형 잡기',
        '15분간 지속'
      ],
      variations: ['스노클 사용', '한쪽 팔만', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: '핑거팁 드래그 드릴',
      description: '리커버리 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '15-20분',
      equipment: ['수영복', '고글'],
      benefits: ['리커버리 기술 향상', '하이엘보 자세 개선'],
      instructions: [
        '손가락 끝으로 물 표면 드래그',
        '팔꿈치 먼저 움직이기',
        '크로스오버 방지',
        '15분간 지속'
      ],
      variations: ['한쪽 팔만', '양팔 교대', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      name: '6-1-6 사이드킥 드릴',
      description: '측면 킥 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '20-30분',
      equipment: ['수영복', '고글'],
      benefits: ['측면 킥 기술 향상', '균형감 개선'],
      instructions: [
        '6번 킥, 1번 풀, 6번 킥 패턴',
        '측면 자세 유지',
        '호흡 시 정렬 유지',
        '20분간 지속'
      ],
      variations: ['한쪽만', '양쪽 교대', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '6',
      name: '싱글암 드릴',
      description: '한 팔만 사용하는 기술 드릴',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '20-25분',
      equipment: ['수영복', '고글', '스노클'],
      benefits: ['한 팔 기술 향상', '크로스오버 교정'],
      instructions: [
        '한 팔만 사용하여 수영',
        '다른 팔은 몸통에 붙이기',
        '스노클 사용 권장',
        '20분간 지속'
      ],
      variations: ['왼팔만', '오른팔만', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '7',
      name: '스컬링 드릴',
      description: '물 감기 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'beginner',
      duration: '15-20분',
      equipment: ['수영복', '고글'],
      benefits: ['물 감기 기술 향상', '전완 각도 개선'],
      instructions: [
        '작은 8자 궤적으로 스컬링',
        '손목 중립 유지',
        '전완 각도 일정하게',
        '15분간 지속'
      ],
      variations: ['프론트 스컬', '미드 스컬', '백 스컬'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '8',
      name: '타잔 드릴',
      description: '머리 들고 수영하는 드릴',
      category: 'technique',
      difficulty: 'advanced',
      duration: '15-20분',
      equipment: ['수영복', '고글'],
      benefits: ['오픈워터 기술 향상', '사이팅 기술 개선'],
      instructions: [
        '머리를 들고 수영',
        '가슴 살짝 내려 저항 상쇄',
        '짧은 구간만 수행',
        '15분간 지속'
      ],
      variations: ['3스트로크마다', '5스트로크마다', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '9',
      name: '하이폭식 드릴',
      description: '호흡 패턴을 다양화하는 드릴',
      category: 'endurance',
      difficulty: 'advanced',
      duration: '20-30분',
      equipment: ['수영복', '고글'],
      benefits: ['호흡 효율 향상', 'CO₂ 내성 향상'],
      instructions: [
        '3/5/7 래더 패턴으로 호흡',
        '절대 과호흡 금지',
        '현기증 시 즉시 중단',
        '20분간 지속'
      ],
      variations: ['3-5-7 패턴', '5-7-9 패턴', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '10',
      name: '턴 스트림라인 드릴',
      description: '턴과 스트림라인 기술을 향상시키는 드릴',
      category: 'technique',
      difficulty: 'intermediate',
      duration: '20-25분',
      equipment: ['수영복', '고글'],
      benefits: ['턴 기술 향상', '스트림라인 개선'],
      instructions: [
        '벽 턴 후 스트림라인 유지',
        '돌핀 킥 3-5회',
        '브레이크아웃 거리 표준화',
        '20분간 지속'
      ],
      variations: ['15m 유지', '20m 유지', '고강도'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]);

  // 카테고리별 이름 매핑
  const categoryNames = {
    all: '전체',
    endurance: '지구력',
    speed: '속도',
    technique: '기술',
    rehabilitation: '재활',
    weight_loss: '체중감량',
    stress_relief: '스트레스해소',
    warmup: '준비운동',
    cooldown: '마무리운동'
  };

  const difficultyNames = {
    all: '전체',
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  };

  // 필터링된 데이터
  const getFilteredData = () => {
    const data = activeTab === 'methods' ? trainingMethods : drills;
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  // 새 항목 추가
  const handleAdd = () => {
    setFormData({});
    setEditingItem(null);
    setIsEditing(false);
    setShowForm(true);
  };

  // 항목 편집
  const handleEdit = (item: TrainingMethod | Drill) => {
    setFormData(item);
    setEditingItem(item);
    setIsEditing(true);
    setShowForm(true);
  };

  // 항목 삭제
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (activeTab === 'methods') {
        setTrainingMethods(prev => prev.filter(item => item.id !== id));
      } else {
        setDrills(prev => prev.filter(item => item.id !== id));
      }
    }
  };

  // 폼 저장
  const handleSave = () => {
    if (!formData.name || !formData.description) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const newItem = {
      ...formData,
      id: editingItem?.id || Date.now().toString(),
      createdAt: editingItem?.createdAt || now,
      updatedAt: now
    };

    if (activeTab === 'methods') {
      if (editingItem) {
        setTrainingMethods(prev => prev.map(item => 
          item.id === editingItem.id ? newItem as TrainingMethod : item
        ));
      } else {
        setTrainingMethods(prev => [...prev, newItem as TrainingMethod]);
      }
    } else {
      if (editingItem) {
        setDrills(prev => prev.map(item => 
          item.id === editingItem.id ? newItem as Drill : item
        ));
      } else {
        setDrills(prev => [...prev, newItem as Drill]);
      }
    }

    setShowForm(false);
    setFormData({});
    setEditingItem(null);
    setIsEditing(false);
  };

  // 폼 취소
  const handleCancel = () => {
    setShowForm(false);
    setFormData({});
    setEditingItem(null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              훈련법 및 드릴 관리
            </h1>
            <p className="text-gray-600">
              수영 훈련법과 드릴을 체계적으로 관리하고 수정할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            새로 추가
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('methods')}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="h-4 w-4" />
              훈련법 ({trainingMethods.length})
            </button>
            <button
              onClick={() => setActiveTab('drills')}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="h-4 w-4" />
              드릴 ({drills.length})
            </button>
          </nav>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="훈련법 또는 드릴 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(categoryNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(difficultyNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 데이터 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredData().map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {categoryNames[item.category as keyof typeof categoryNames]}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {difficultyNames[item.difficulty as keyof typeof difficultyNames]}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.duration}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {item.updatedAt}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="편집"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 데이터가 없을 때 */}
      {getFilteredData().length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? '검색 결과가 없습니다.' : '새로운 훈련법이나 드릴을 추가해보세요.'}
          </p>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            새로 추가
          </button>
        </div>
      )}

      {/* 편집 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {isEditing ? '편집' : '새로 추가'} - {activeTab === 'methods' ? '훈련법' : '드릴'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 기본 정보 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="훈련법 또는 드릴 이름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="상세 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    {activeTab === 'methods' ? (
                      <>
                        <option value="endurance">지구력</option>
                        <option value="speed">속도</option>
                        <option value="technique">기술</option>
                        <option value="rehabilitation">재활</option>
                        <option value="weight_loss">체중감량</option>
                        <option value="stress_relief">스트레스해소</option>
                      </>
                    ) : (
                      <>
                        <option value="warmup">준비운동</option>
                        <option value="technique">기술</option>
                        <option value="endurance">지구력</option>
                        <option value="speed">속도</option>
                        <option value="cooldown">마무리운동</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                  <select
                    value={formData.difficulty || ''}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소요 시간</label>
                <input
                  type="text"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 30-60분"
                />
              </div>

              {/* 훈련법 전용 필드 */}
              {activeTab === 'methods' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">목적</label>
                    <input
                      type="text"
                      value={(formData as TrainingMethod).purpose || ''}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="훈련 목적"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">강도</label>
                    <select
                      value={(formData as TrainingMethod).intensity || ''}
                      onChange={(e) => setFormData({...formData, intensity: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">선택하세요</option>
                      <option value="low">낮음</option>
                      <option value="moderate">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

