/**
 * @file 퀴즈 문제 자동 생성 페이지
 * @description 사용자가 제공한 정답 Pool, 오답 Pool을 기반으로 문제을 생성하는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui';
import { Card } from '../../../components/ui';
import { Input } from '../../../components/ui';
import { Badge } from '../../../components/ui';
import { CardGrid, ConfirmModal, PageHeader } from '@/components/common';

const QUIZ_CATEGORIES = [
  '운동생리학',
  '수영기술',
  '안전수칙',
  '체력향상',
  '기초기술',
  '기타'
] as const;

const CUSTOM_CATEGORY_KEY = '__custom'; // 직접 입력 카테고리 표시용 키


interface GeneratedQuestion {
  id: string;
  topic: string;
  question: string;
  type: '정답찾기' | '오답찾기';
  options: string[];
  correctAnswer: number;
  explanation: string;
  solution?: string;
  sourcePools?: {
    correctPool: string[];
    incorrectPool: string[];
  };
  correctPool?: string[]; // 정답 Pool 전체
  incorrectPool?: string[]; // 오답 Pool 전체
  conceptBlock?: {
    title?: string;
    theory?: string[];
  };
  originalExplanation?: {
    summary?: string;
    keyPoints?: string[];
  };
  incorrectPoolDetails?: Array<{ option: string; whyIncorrect?: string }>;
}

interface SubjectiveQuestion {
  핵심_키워드: string;
  문제_유형: '개념 서술' | '분류/종류' | '기능/역할' | '순서/단계' | '공식';
  주관식_질문: string;
  정답_상세_내용: string;
  // 2단계 답변 구조 (선택사항)
  정답_1차?: string; // 중제목/핵심 답변
  정답_2차?: string; // 세부사항/상세 답변
  isTwoStep?: boolean; // 2단계 답변 여부
}

export default function QuizQuestionGeneratorPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'result' | 'saved'>('input');
  const [loading, setLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<'study' | 'exam'>('exam'); // 공부용: 이론 먼저, 시험용: 문제 먼저
  const [mode, setMode] = useState<'multiple-choice' | 'subjective'>('multiple-choice'); // 객관식 또는 주관식
  const [customCategory, setCustomCategory] = useState(''); // 직접 입력 카테고리 값 (UI 표시용)
  
  // 입력 데이터 (JSON 또는 개별 입력)
  const [inputMode, setInputMode] = useState<'json' | 'form'>('json');
  const [jsonInput, setJsonInput] = useState('');
  const [formInput, setFormInput] = useState({
    id: '',
    topic: '',
    question: '',
    type: '정답찾기' as '정답찾기' | '오답찾기',
    correctPool: '',
    incorrectPool: '',
    solution: '',
    optionCount: 4
  });
  
  // 생성된 문제
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]); // 여러 문제 저장
  
  // 퀴즈 저장 정보
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    category: '운동생리학',
    tags: ''
  });
  
  // 여러 문제 생성 모드
  const [batchMode, setBatchMode] = useState(false);
  
  const [subjectiveJsonInput, setSubjectiveJsonInput] = useState(''); // JSON 입력
  const [subjectiveInput, setSubjectiveInput] = useState({
    textbookContent: '',
    section: '',
    topic: '',
    minQuestions: 3,
    category: '운동생리학' // 객관식과 같은 카테고리 사용
  });
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<SubjectiveQuestion[]>([]);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  // localStorage에서 기존 문제 목록 불러오기
  const loadQuestionsFromStorage = (category: string): GeneratedQuestion[] => {
    try {
      const stored = localStorage.getItem(`quiz-questions-${category}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      logger.warn('저장된 문제 목록 불러오기 실패:', e);
    }
    return [];
  };

  // localStorage에 문제 목록 저장
  const saveQuestionsToStorage = (category: string, questions: GeneratedQuestion[]) => {
    try {
      localStorage.setItem(`quiz-questions-${category}`, JSON.stringify(questions));
    } catch (e) {
      logger.warn('문제 목록 저장 실패:', e);
    }
  };

  // 카테고리 변경 시 기존 목록 불러오기
  useEffect(() => {
    if (quizInfo.category) {
      const stored = loadQuestionsFromStorage(quizInfo.category);
      if (stored.length > 0) {
        setGeneratedQuestions(stored);
        setBatchMode(true);
        setGeneratedQuestion(stored[stored.length - 1]);
      }
    }
  }, [quizInfo.category]);

  // 문제 목록 변경 시 localStorage에 저장
  useEffect(() => {
    if (batchMode && generatedQuestions.length > 0 && quizInfo.category) {
      saveQuestionsToStorage(quizInfo.category, generatedQuestions);
    }
  }, [generatedQuestions, batchMode, quizInfo.category]);

  // 문제 생성
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      let requestData: any;

      if (inputMode === 'json') {
        // JSON 입력 파싱
        try {
          const parsed = JSON.parse(jsonInput);
          const items = Array.isArray(parsed) ? parsed : [parsed];

          // 자동 분류용 배열
          const subjectiveBuffer: any[] = [];
          const objectiveBuffer: any[] = [];

          const pushSubjective = (entry: any, parentTitle?: string, parentType?: string) => {
            const questionText = entry.주관식_질문 || entry.질문;
            const answerDetail = entry.정답_상세_내용 || entry.정답;
            const keyword = entry.핵심_키워드 || entry.target_중제목 || parentTitle;

            if (!keyword || !questionText || !answerDetail) return;

            subjectiveBuffer.push({
              핵심_키워드: keyword,
              문제_유형: entry.문제_유형 || parentType || '개념 서술',
              주관식_질문: questionText,
              정답_상세_내용: answerDetail,
              정답_1차: entry.정답_1차,
              정답_2차: entry.정답_2차
            });
          };

          // 분류: 세부_문항 스키마/주관식/객관식
          for (const item of items) {
            if (item && Array.isArray(item.세부_문항)) {
              const parentTitle = item.대제목;
              const parentType = item.문제_유형;
              const parentCategory = item.과목명 || item.category || item.카테고리;
              if (parentCategory) {
                setQuizInfo(prev => ({ ...prev, category: parentCategory }));
              }
              for (const sub of item.세부_문항) {
                pushSubjective(sub, parentTitle, parentType);
              }
              continue;
            }
            if (item && Array.isArray(item.세_부문항)) {
              const parentTitle = item.대제목;
              const parentType = item.문제_유형;
              const parentCategory = item.과목명 || item.category || item.카테고리;
              if (parentCategory) {
                setQuizInfo(prev => ({ ...prev, category: parentCategory }));
              }
              for (const sub of item.세_부문항) {
                pushSubjective(sub, parentTitle, parentType);
              }
              continue;
            }

            const isSubjective = item?.핵심_키워드 || item?.주관식_질문;
            if (isSubjective) {
              pushSubjective(item);
            } else {
              objectiveBuffer.push(item);
              // 객관식에도 과목명이 있으면 반영
              const cat = item.과목명 || item.category || item.카테고리;
              if (cat) {
                setQuizInfo(prev => ({ ...prev, category: cat }));
              }
            }
          }

          // 주관식 자동 처리 (코넬식 변환 + 2단계 자동화)
          if (subjectiveBuffer.length > 0) {
            const validSubjectives: SubjectiveQuestion[] = [];
            for (const q of subjectiveBuffer) {
              if (!q.핵심_키워드 || !q.주관식_질문 || !q.정답_상세_내용) {
                continue;
              }

              let 정답_1차 = q.정답_1차;
              let 정답_2차 = q.정답_2차;
              let isTwoStep = false;

              if (정답_1차 && 정답_2차) {
                isTwoStep = true;
              } else if (q.정답_상세_내용) {
                정답_1차 = q.핵심_키워드 || q.정답_상세_내용.split(/[\.。\n]/)[0].trim() || '';
                정답_2차 = q.정답_상세_내용;
                isTwoStep = true;
              }

              validSubjectives.push({
                핵심_키워드: q.핵심_키워드,
                문제_유형: q.문제_유형 || '개념 서술',
                주관식_질문: q.주관식_질문,
                정답_상세_내용: q.정답_상세_내용,
                정답_1차,
                정답_2차,
                isTwoStep
              });
            }

            if (validSubjectives.length > 0) {
              setSubjectiveQuestions(validSubjectives);
              // 주관식 카테고리 동기화 (객관식 카테고리와 동일하게 사용)
              setSubjectiveInput(prev => ({
                ...prev,
                category: quizInfo.category || prev.category
              }));
            }
          }

          // 객관식 처리
          if (objectiveBuffer.length > 0) {
            if (items.length > 1) {
              // 여러 문제 생성 모드
              setBatchMode(true);

              const currentCategory = quizInfo.category || '운동생리학';
              const existingQuestions = loadQuestionsFromStorage(currentCategory);
              const questions: GeneratedQuestion[] = [...existingQuestions];

              for (const item of objectiveBuffer) {
                const response = await fetch('http://localhost:5000/api/quiz-question-generator/generate', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(item)
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || `문제 생성 중 오류가 발생했습니다. (${item.id || item.topic})`);
                }

                const data = await response.json();

                // 원본 JSON에서 상세 정보 추출
                let incorrectPoolDetails: Array<{ option: string; whyIncorrect?: string }> = [];
                let conceptBlock: any = undefined;
                let originalExplanation: any = undefined;

                if (item.incorrectPool && Array.isArray(item.incorrectPool)) {
                  incorrectPoolDetails = item.incorrectPool
                    .filter((poolItem: any) => typeof poolItem === 'object' && poolItem.option)
                    .map((poolItem: any) => ({ option: poolItem.option, whyIncorrect: poolItem.whyIncorrect }));
                }

                if (item.conceptBlock) {
                  conceptBlock = item.conceptBlock;
                }

                if (item.originalExplanation) {
                  originalExplanation = item.originalExplanation;
                }

                questions.push({
                  ...data.data,
                  conceptBlock,
                  originalExplanation,
                  incorrectPoolDetails,
                  correctPool: data.data.sourcePools?.correctPool || item.correctPool || [],
                  incorrectPool: data.data.sourcePools?.incorrectPool || (item.incorrectPool ? item.incorrectPool.map((poolItem: any) => typeof poolItem === 'string' ? poolItem : poolItem.option) : [])
                });
              }

              if (questions.length > 0) {
                setGeneratedQuestions(questions);
                setGeneratedQuestion(questions[questions.length - 1] || questions[0]);
                setQuizInfo(prev => ({
                  ...prev,
                  title: `${questions[0]?.topic || '문제'} 관련 문제 세트`,
                  description: `${questions.length}개의 문제가 생성되었습니다.`,
                  category: prev.category || '운동생리학'
                }));
              }
            } else {
              // 단일 문제 생성
              const target = objectiveBuffer[0];

              if (batchMode) {
                // 배치 모드에서 단일 문제 추가
                const response = await fetch('http://localhost:5000/api/quiz-question-generator/generate', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(target)
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || '문제 생성 중 오류가 발생했습니다.');
                }

                const data = await response.json();

                let incorrectPoolDetails: Array<{ option: string; whyIncorrect?: string }> = [];
                let conceptBlock: any = undefined;
                let originalExplanation: any = undefined;

                if (target.incorrectPool && Array.isArray(target.incorrectPool)) {
                  incorrectPoolDetails = target.incorrectPool
                    .filter((poolItem: any) => typeof poolItem === 'object' && poolItem.option)
                    .map((poolItem: any) => ({ option: poolItem.option, whyIncorrect: poolItem.whyIncorrect }));
                }

                if (target.conceptBlock) {
                  conceptBlock = target.conceptBlock;
                }

                if (target.originalExplanation) {
                  originalExplanation = target.originalExplanation;
                }

                const newQuestion: GeneratedQuestion = {
                  ...data.data,
                  conceptBlock,
                  originalExplanation,
                  incorrectPoolDetails,
                  correctPool: data.data.sourcePools?.correctPool || target.correctPool || [],
                  incorrectPool: data.data.sourcePools?.incorrectPool || (target.incorrectPool ? target.incorrectPool.map((item: any) => typeof item === 'string' ? item : item.option) : [])
                };

                const currentCategory = quizInfo.category || '운동생리학';
                const existingQuestions = loadQuestionsFromStorage(currentCategory);
                const updatedQuestions = [...existingQuestions, newQuestion];
                setGeneratedQuestions(updatedQuestions);
                setGeneratedQuestion(newQuestion);
                saveQuestionsToStorage(currentCategory, updatedQuestions);

                setQuizInfo(prev => ({
                  ...prev,
                  title: `${updatedQuestions[0]?.topic || '문제'} 관련 문제 세트`,
                  description: `${updatedQuestions.length}개의 문제가 생성되었습니다.`,
                  category: currentCategory
                }));

                setJsonInput('');
              } else {
                // 단일 문제 생성 (기존 방식)
                setBatchMode(false);
                requestData = target;
              }
            }
          }

          // 결과 단계로 이동 (주관식/객관식 모두 고려)
          if (objectiveBuffer.length > 0) {
            setStep('result');
            setLoading(false);
            return;
          }
          if (subjectiveBuffer.length > 0) {
            setMode('subjective');
            setStep('result');
            setLoading(false);
            return;
          }
        } catch (error) {
          alert('JSON 형식이 올바르지 않습니다. JSON을 확인해주세요.');
          return;
        }
      } else {
        // 폼 입력 변환
        const correctPoolArray = formInput.correctPool.split('\n').filter(line => line.trim());
        const incorrectPoolArray = formInput.incorrectPool.split('\n').filter(line => line.trim());

        if (correctPoolArray.length < 4) {
          alert('정답 Pool은 최소 4개 이상이어야 합니다.');
          return;
        }

        if (incorrectPoolArray.length < 4) {
          alert('오답 Pool은 최소 4개 이상이어야 합니다.');
          return;
        }

        requestData = {
          id: formInput.id || `quiz_${Date.now()}`,
          topic: formInput.topic,
          question: formInput.question,
          type: formInput.type,
          correctPool: correctPoolArray,
          incorrectPool: incorrectPoolArray,
          solution: formInput.solution,
          optionCount: formInput.optionCount
        };
      }

      const response = await fetch('http://localhost:5000/api/quiz-question-generator/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '문제 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // 원본 JSON에서 상세 정보 추출
      let incorrectPoolDetails: Array<{ option: string; whyIncorrect?: string }> = [];
      let conceptBlock: any = undefined;
      let originalExplanation: any = undefined;
      
      try {
        if (inputMode === 'json') {
          const parsedInput = JSON.parse(jsonInput);
          
          // incorrectPool 상세 정보 추출
          if (parsedInput?.incorrectPool && Array.isArray(parsedInput.incorrectPool)) {
            incorrectPoolDetails = parsedInput.incorrectPool
              .filter((item: any) => typeof item === 'object' && item.option)
              .map((item: any) => ({ option: item.option, whyIncorrect: item.whyIncorrect }));
          }
          
          // conceptBlock 추출
          if (parsedInput?.conceptBlock) {
            conceptBlock = parsedInput.conceptBlock;
          }
          
          // originalExplanation 추출
          if (parsedInput?.originalExplanation) {
            originalExplanation = parsedInput.originalExplanation;
          }
        }
      } catch (e) {
        // JSON 파싱 실패 시 무시
        logger.warn('JSON 파싱 중 오류:', e);
      }
      
      // sourcePools에서 correctPool과 incorrectPool 추출
      let correctPool: string[] = [];
      let incorrectPool: string[] = [];
      
      if (data.data.sourcePools) {
        correctPool = data.data.sourcePools.correctPool || [];
        incorrectPool = data.data.sourcePools.incorrectPool || [];
      } else if (inputMode === 'json') {
        // JSON 입력에서 직접 추출
        try {
          const parsedInput = JSON.parse(jsonInput);
          correctPool = parsedInput.correctPool || [];
          incorrectPool = parsedInput.incorrectPool ? parsedInput.incorrectPool.map((item: any) => typeof item === 'string' ? item : item.option) : [];
        } catch (e) {
          // 무시
        }
      } else if (inputMode === 'form') {
        // 폼 입력에서 추출
        correctPool = formInput.correctPool.split('\n').filter(line => line.trim());
        incorrectPool = formInput.incorrectPool.split('\n').filter(line => line.trim());
      }
      
      setGeneratedQuestion({
        ...data.data,
        conceptBlock,
        originalExplanation,
        incorrectPoolDetails,
        correctPool,
        incorrectPool
      });
      
      // 단일 문제 모드
      setBatchMode(false);
      setGeneratedQuestions([]);
      
      // 퀴즈 정보 자동 설정
      setQuizInfo(prev => ({
        ...prev,
        title: `${data.data.topic} 관련 문제`,
        description: `${data.data.topic}에 대한 자동 생성 문제입니다.`,
        category: prev.category || '운동생리학'
      }));
      
      setStep('result');
    } catch (error: any) {
      logger.error('문제 생성 실패:', error);
      alert(error.message || '문제 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 퀴즈 저장
  const handleSaveQuiz = async () => {
    try {
      if (!generatedQuestion || !quizInfo.category) {
        alert('필수 정보를 입력해주세요.');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/quiz-question-generator/save-quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          generatedQuestion,
          title: quizInfo.title || `${generatedQuestion.topic} 관련 문제`,
          description: quizInfo.description || `${generatedQuestion.topic}에 대한 자동 생성 문제입니다.`,
          category: quizInfo.category,
          tags: quizInfo.tags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '퀴즈 저장 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert(result.message || '퀴즈 저장이 완료되었습니다.');
      
      // 저장 후 localStorage에서 해당 카테고리의 문제 목록 삭제 (단일 문제인 경우)
      if (!batchMode) {
        localStorage.removeItem(`quiz-questions-${quizInfo.category}`);
        setGeneratedQuestions([]);
        setBatchMode(false);
      }

      setStep('saved');
    } catch (error: any) {
      logger.error('퀴즈 저장 실패:', error);
      alert(error.message || '퀴즈 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setJsonInput('');
    setFormInput({
      id: '',
      topic: '',
      question: '',
      type: '정답찾기',
      correctPool: '',
      incorrectPool: '',
      solution: '',
      optionCount: 4
    });
    setGeneratedQuestion(null);
    setQuizInfo({
      title: '',
      description: '',
      category: '운동생리학',
      tags: ''
    });
  };

  // JSON 예시
  const jsonExample = `{
  "id": "exPhysio_001",
  "topic": "젖산역치와 피로",
  "conceptBlock": {
    "title": "Lactate Threshold & Fatigue – Concept Summary",
    "theory": [
      "해당과정(glycolysis)이 빠르게 진행되면 피루브산이 모두 미토콘드리아에서 산화되지 못하고 젖산(lactate)으로 전환된다.",
      "젖산 축적은 젖산의 생성 속도가 제거 속도보다 빨라질 때 발생하며 H+ 증가로 대사성 산증이 나타나 피로를 유발한다.",
      "젖산역치(Lactate Threshold)는 안정적으로 유지되던 젖산 농도가 갑자기 증가하기 시작하는 지점이다.",
      "OBLA(4 mmol/L)는 LT와 거의 유사한 개념으로 젖산 급증 지점을 나타낸다.",
      "지구력 훈련 시 산소 이용 능력과 미토콘드리아 밀도가 증가해 LT는 더 높은 강도에서 나타난다.",
      "젖산은 독성 물질이 아니며 근육통을 직접적으로 유발하지 않는다. 오히려 에너지원으로 재사용된다."
    ]
  },
  "originalExplanation": {
    "summary": "젖산은 해당과정 증가와 함께 자연스럽게 생성되며, 축적은 제거 속도를 초과할 때 발생한다. 이는 LT/OBLA와 직결되며 대사적 피로의 주요 요인이다.",
    "keyPoints": [
      "젖산 생성 자체는 정상적인 대사 과정이며, 문제는 축적이다.",
      "피로는 젖산보다 H+ 증가에 의한 산성화와 효소 기능 저하가 더 큰 역할을 한다.",
      "LT는 지구력 수행능력을 나타내는 핵심 지표이며 훈련을 통해 변화한다."
    ]
  },
  "correctPool": [
    "혈중 젖산 농도가 제거 속도보다 빨리 증가하기 시작하는 시점이다.",
    "무산소성 해당과정의 비중이 커지면서 젖산 생성 속도가 빨라지는 순간이다.",
    "고강도 운동에서 H+ 증가로 인해 대사성 산증이 나타나기 시작하는 지점이다.",
    "LT 또는 OBLA와 관련된 젖산 급증 시점을 의미한다.",
    "유산소 대사만으로 ATP 공급이 충분하지 않아 무산소 대사의 비중이 커지는 순간이다.",
    "피로 관련 대사산물이 빠르게 제거되지 못해 운동 지속능력이 저하되기 시작하는 시점이다."
  ],
  "incorrectPool": [
    {
      "option": "젖산은 근육통을 직접적으로 유발하는 독성 물질이다.",
      "whyIncorrect": "젖산은 통증을 유발하지 않는다. 근육통은 미세손상과 염증 반응이 원인이며 젖산은 오히려 에너지원으로 재사용된다."
    },
    {
      "option": "젖산 생성이 완전히 중단되는 시점을 의미한다.",
      "whyIncorrect": "젖산은 운동 강도와 관계없이 지속적으로 생성되며 완전히 중단되는 시점은 없다."
    },
    {
      "option": "유산소 대사가 완전히 멈추어 무산소 대사만 작동하는 단계이다.",
      "whyIncorrect": "유산소·무산소 대사는 동시에 작동하며 유산소 대사가 완전히 멈추는 상황은 생리학적으로 존재하지 않는다."
    },
    {
      "option": "젖산 역치는 훈련과 무관하게 변화하지 않는 고정된 값이다.",
      "whyIncorrect": "LT는 훈련으로 크게 향상될 수 있으며 지구력 훈련 시 높은 강도에서 나타난다."
    },
    {
      "option": "젖산은 운동 중 체내에서 즉시 완전히 제거된다.",
      "whyIncorrect": "제거 속도에는 한계가 있으며 생성 속도가 제거 속도를 초과하면 축적된다."
    },
    {
      "option": "ATP-PC 시스템이 모두 고갈되는 순간을 의미한다.",
      "whyIncorrect": "젖산 축적은 해당과정과 관련된 개념이며 ATP-PC 시스템 고갈과는 직접적 연관이 없다."
    },
    {
      "option": "대사성 산증과 젖산 축적은 서로 무관한 현상이다.",
      "whyIncorrect": "젖산 생성 시 함께 증가하는 H+가 산증을 유발하므로 밀접한 관련이 있다."
    },
    {
      "option": "젖산 수치가 감소하기 시작하는 시점을 의미한다.",
      "whyIncorrect": "LT는 젖산이 '증가하기 시작하는 시점'이며 감소와는 반대 개념이다."
    },
    {
      "option": "피로는 젖산과 관련 없이 신경계 기능 저하로만 발생한다.",
      "whyIncorrect": "피로는 대사적 요인(H+, 산성화, 대사산물 축적)과 신경계 요인이 모두 작용한다."
    },
    {
      "option": "젖산은 근육에서만 생성되는 독성 대사산물이다.",
      "whyIncorrect": "젖산은 다양한 조직에서 생성되며 '독성'이 아니고 에너지원으로 재활용된다."
    }
  ],
  "typeVariants": {
    "correctVersion": {
      "instruction": "다음 중 젖산 증가 시점에 대한 설명으로 옳은 것은?",
      "exampleOptions": [
        "유산소 대사가 완전히 중단되는 시점을 의미한다.",
        "젖산 역치는 훈련으로 변화하지 않는 고정된 값이다.",
        "혈중 젖산 농도가 제거 속도보다 빠르게 증가하는 시점이다.",
        "젖산은 근육통을 유발하는 독성 물질이다."
      ],
      "exampleAnswer": 3
    },
    "incorrectVersion": {
      "instruction": "다음 중 젖산 증가 시점에 대한 설명으로 옳지 않은 것은?",
      "exampleOptions": [
        "무산소성 해당과정의 비중이 커지는 순간이다.",
        "LT 또는 OBLA와 관련된 젖산 증가 지점이다.",
        "피로 관련 대사산물이 축적되기 시작하는 순간이다.",
        "젖산은 근육통을 직접 유발하는 독성 물질이다."
      ],
      "exampleAnswer": 4
    }
  },
  "optionCount": 4
}`;

  // 주관식 문제 생성
  const handleGenerateSubjectiveQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // JSON 입력만 사용
      try {
        const parsed = JSON.parse(subjectiveJsonInput);
        
        // 배열인지 단일 객체인지 확인
        const questionsArray = Array.isArray(parsed) ? parsed : [parsed];
        
        // (신규) 대제목/중제목/세부_문항 스키마도 지원: 세부_문항을 평탄화하여 주관식 스키마로 변환
        const flattenedQuestions: any[] = [];
        for (const entry of questionsArray) {
          if (entry && (Array.isArray(entry.세부_문항) || Array.isArray(entry.세_부문항))) {
            const parentTitle = entry.대제목;
            const parentType = entry.문제_유형;
            const parentCategory = entry.과목명 || entry.category || entry.카테고리;
            const subItems = entry.세부_문항 || entry.세_부문항;
            for (const sub of subItems) {
              const questionText = sub.주관식_질문 || sub.주관식_질움 || sub.질문;
              const answerDetail = sub.정답_상세_내용 || sub.정답_2차 || sub.설명 || sub.정답;
              const keyword = sub.핵심_키워드 || sub.target_중제목 || parentTitle;
              
              if (!keyword || !questionText || !answerDetail) {
                // 필수 필드 누락 시 건너뜀 (검증 단계에서 전체 유효성 체크)
                continue;
              }
              
              flattenedQuestions.push({
                핵심_키워드: keyword,
                문제_유형: sub.문제_유형 || parentType || '개념 서술',
                주관식_질문: questionText,
                정답_상세_내용: answerDetail,
                정답_1차: sub.정답_1차,
                정답_2차: sub.정답_2차
              });
            }
            // 과목명이 포함된 경우 주관식 카테고리를 우선 설정
            if (parentCategory) {
              setSubjectiveInput(prev => ({ ...prev, category: parentCategory }));
            }
          } else {
            flattenedQuestions.push(entry);
          }
        }
        
        // JSON 형식 검증
        const validQuestions: SubjectiveQuestion[] = [];
        for (const q of flattenedQuestions) {
          // 누락 필드 자동 보정
          const filledQuestion = {
            ...q,
            주관식_질문: q.주관식_질문 || q.주관식_질움 || q.질문,
            정답_상세_내용: q.정답_상세_내용 || q.정답_2차 || q.설명 || q.정답,
          };

          if (!filledQuestion.핵심_키워드 || !filledQuestion.주관식_질문 || !filledQuestion.정답_상세_내용) {
            throw new Error('JSON 형식이 올바르지 않습니다. (필수 필드: 핵심_키워드, 주관식_질문, 정답_상세_내용)');
          }
          
          // 2단계 답변 처리: 정답_1차와 정답_2차가 모두 있으면 사용, 없으면 자동 생성
          let 정답_1차 = filledQuestion.정답_1차;
          let 정답_2차 = filledQuestion.정답_2차;
          let isTwoStep = false;
          
          if (정답_1차 && 정답_2차) {
            // 명시적으로 2단계 답변이 제공된 경우
            isTwoStep = true;
          } else if (filledQuestion.정답_상세_내용) {
            // 기존 방식: 정답_상세_내용만 있는 경우 자동으로 2단계로 변환
            // 1차 답변: 핵심_키워드 또는 정답_상세_내용의 첫 문장
            정답_1차 = filledQuestion.핵심_키워드 || filledQuestion.정답_상세_내용.split(/[\.。\n]/)[0].trim() || '';
            // 2차 답변: 정답_상세_내용 전체
            정답_2차 = filledQuestion.정답_상세_내용;
            isTwoStep = true;
          }
          
          validQuestions.push({
            핵심_키워드: filledQuestion.핵심_키워드,
            문제_유형: filledQuestion.문제_유형 || '개념 서술',
            주관식_질문: filledQuestion.주관식_질문,
            정답_상세_내용: filledQuestion.정답_상세_내용,
            정답_1차: 정답_1차,
            정답_2차: 정답_2차,
            isTwoStep: isTwoStep
          });
        }
        
        if (validQuestions.length === 0) {
          throw new Error('유효한 문제가 없습니다.');
        }
        
        setSubjectiveQuestions(validQuestions);
        setStep('result');
        setLoading(false);
        return;
      } catch (error: any) {
        if (error.message.includes('JSON 형식') || error.message.includes('유효한 문제')) {
          throw error;
        }
        alert('JSON 형식이 올바르지 않습니다. JSON을 확인해주세요.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/quiz-question-generator/generate-subjective-questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subjectiveInput)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '문제 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setSubjectiveQuestions(data.data.questions);
      setStep('result');
    } catch (error: any) {
      logger.error('주관식 문제 생성 실패:', error);
      alert(error.message || '문제 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주관식 문제 저장 (객관식과 같은 카테고리로 저장 가능)
  const handleSaveSubjectiveQuiz = async () => {
    try {
      if (!subjectiveQuestions || subjectiveQuestions.length === 0) {
        alert('저장할 문제가 없습니다.');
        return;
      }

      // 직접 입력 카테고리 처리
      const resolvedCategory = subjectiveInput.category === CUSTOM_CATEGORY_KEY
        ? (customCategory || '').trim()
        : subjectiveInput.category;

      if (!resolvedCategory) {
        alert('카테고리를 선택하거나 직접 입력해주세요.');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/quiz-question-generator/save-subjective-quiz', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectiveQuestions: subjectiveQuestions.map(q => ({
            ...q,
            section: subjectiveInput.section,
            topic: subjectiveInput.topic
          })),
          title: `${resolvedCategory} 관련 문제 세트`,
          description: `${subjectiveQuestions.length}개의 주관식 문제가 포함된 세트입니다.`,
          category: resolvedCategory,
          tags: [resolvedCategory, '주관식', '자동생성']
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '퀴즈 저장 중 오류가 발생했습니다.');
      }

      const result = await response.json();
      alert(result.message || '주관식 문제가 저장되었습니다.');
      setStep('saved');
    } catch (error: any) {
      logger.error('주관식 퀴즈 저장 실패:', error);
      alert(error.message || '퀴즈 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // JSON 내보내기
  const handleExportJSON = () => {
    const json = JSON.stringify(subjectiveQuestions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subjective-questions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV 내보내기 (Sheets용)
  const handleExportCSV = () => {
    const headers = ['핵심_키워드', '문제_유형', '주관식_질문', '정답_상세_내용'];
    const rows = subjectiveQuestions.map(q => [
      q.핵심_키워드,
      q.문제_유형,
      q.주관식_질문,
      q.정답_상세_내용.replace(/\n/g, ' ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subjective-questions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PageHeader
        title="퀴즈 문제 자동 생성"
        description={mode === 'multiple-choice' 
          ? "정답 Pool과 오답 Pool을 입력하면 객관식 문제을 자동 생성합니다."
          : "교재 텍스트를 입력하면 주관식/구술 시험 대비용 문제을 자동 생성합니다."}
        className="mb-6"
      />

      {/* 모드 선택 */}
      <div className="mb-6 flex space-x-4">
        <Button
          onClick={() => {
            setMode('multiple-choice');
            setStep('input');
            setSubjectiveQuestions([]);
          }}
          variant={mode === 'multiple-choice' ? 'default' : 'outline'}
        >
          객관식 문제 생성
        </Button>
        <Button
          onClick={() => {
            setMode('subjective');
            setStep('input');
            setSubjectiveQuestions([]);
          }}
          variant={mode === 'subjective' ? 'default' : 'outline'}
        >
          주관식 문제 생성
        </Button>
      </div>

      {/* 단계 표시 */}
      <div className="mb-6 flex items-center justify-center space-x-4">
        <div className={`flex items-center ${step === 'input' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="ml-2">입력</span>
        </div>
        <div className="w-12 h-1 bg-gray-200"></div>
        <div className={`flex items-center ${step === 'result' ? 'text-blue-600 font-bold' : step === 'saved' ? 'text-green-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'result' || step === 'saved' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="ml-2">결과 확인</span>
        </div>
        <div className="w-12 h-1 bg-gray-200"></div>
        <div className={`flex items-center ${step === 'saved' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'saved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="ml-2">저장 완료</span>
        </div>
      </div>

      {/* 1단계: 입력 - 주관식 모드 */}
      {step === 'input' && mode === 'subjective' && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">주관식 문제 생성</h2>
          
          {/* JSON 전용 안내 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>JSON 전용:</strong> 주관식 문제를 JSON 배열 또는 단일 객체로 입력하세요.
              <br />
              <span className="text-xs text-blue-600">
                예시: <code>[{'{'} "핵심_키워드": "...", "문제_유형": "...", "주관식_질문": "...", "정답_상세_내용": "..." {'}'}]</code>
              </span>
            </p>
          </div>

          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리 *</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={subjectiveInput.category || CUSTOM_CATEGORY_KEY}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === CUSTOM_CATEGORY_KEY) {
                        setSubjectiveInput(prev => ({ ...prev, category: CUSTOM_CATEGORY_KEY }));
                        setQuizInfo(prev => ({ ...prev, category: '' }));
                        setCustomCategory('');
                      } else {
                        setSubjectiveInput(prev => ({ ...prev, category: val }));
                        setQuizInfo(prev => ({ ...prev, category: val }));
                        setCustomCategory('');
                      }
                    }}
                  >
                    {QUIZ_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value={CUSTOM_CATEGORY_KEY}>직접 입력</option>
                  </select>
                  {subjectiveInput.category === CUSTOM_CATEGORY_KEY && (
                    <Input
                      className="mt-2"
                      placeholder="직접 입력할 카테고리"
                      value={customCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCategory(val);
                        setQuizInfo(prev => ({ ...prev, category: val }));
                      }}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    💡 객관식 문제와 같은 카테고리를 선택하거나 직접 입력할 수 있습니다.
                  </p>
                </div>
              </div>

            {/* JSON 입력 (전용) */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">JSON 입력 *</label>
                <Button
                  onClick={() => {
                    const example = `[
  {
    "핵심_키워드": "굴곡-신전운동",
    "문제_유형": "개념 서술",
    "주관식_질문": "관절의 운동을 굴곡과 신전으로 나누어 서술하시오.",
    "정답_상세_내용": "굴곡(flexion)은 관절 각도가 감소하는 운동으로, 신체 부위가 몸의 중심 쪽으로 접근하는 움직임이다. 신전(extension)은 관절 각도가 증가하는 운동으로, 굴곡된 부위를 원래 위치로 되돌리는 움직임이다. 이 두 운동은 대부분의 관절에서 기본적인 운동 범위를 형성한다.",
    "정답_1차": "굴곡과 신전",
    "정답_2차": "굴곡(flexion)은 관절 각도가 감소하는 운동으로, 신체 부위가 몸의 중심 쪽으로 접근하는 움직임이다. 신전(extension)은 관절 각도가 증가하는 운동으로, 굴곡된 부위를 원래 위치로 되돌리는 움직임이다."
  },
  {
    "핵심_키워드": "지레의 종류",
    "문제_유형": "분류/종류",
    "주관식_질문": "인체에서 작용하는 지레의 종류를 나열하고 각각의 특징을 설명하시오.",
    "정답_상세_내용": "1급 지레: 힘점과 저항점 사이에 지지점이 위치하며, 균형과 안정성에 유리하다. 2급 지레: 저항점이 힘점과 지지점 사이에 위치하며, 작은 힘으로 큰 저항을 이길 수 있다. 3급 지레: 힘점이 저항점과 지지점 사이에 위치하며, 속도와 범위에 유리하다."
  }
]`;
                    setSubjectiveJsonInput(example);
                  }}
                  variant="outline"
                  size="sm"
                >
                  예시 불러오기
                </Button>
              </div>
              <textarea
                className="w-full p-3 border rounded-lg font-mono text-sm"
                rows={20}
                value={subjectiveJsonInput}
                onChange={(e) => setSubjectiveJsonInput(e.target.value)}
                placeholder="JSON 형식으로 주관식 문제를 입력하세요..."
              />
              <p className="text-xs text-gray-500 mt-1">
                입력된 글자 수: {subjectiveJsonInput.length}자
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateSubjectiveQuestions}
            disabled={
              loading || 
              !subjectiveJsonInput.trim() || !subjectiveInput.category
            }
            className="w-full mt-4"
          >
            {loading 
              ? '처리 중...' 
              : 'JSON에서 문제 불러오기'}
          </Button>
        </Card>
      )}

      {/* 1단계: 입력 - 객관식 모드 */}
      {step === 'input' && mode === 'multiple-choice' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {batchMode && generatedQuestions.length > 0 
                ? `문제 추가 생성 (현재 ${generatedQuestions.length}개)` 
                : 'Pool 데이터 입력'}
            </h2>
            {batchMode && generatedQuestions.length > 0 && (
              <Button
                onClick={() => setStep('result')}
                variant="outline"
                size="sm"
              >
                목록으로 돌아가기
              </Button>
            )}
          </div>
          
          {/* 입력 모드 선택 */}
          <div className="mb-4 flex space-x-4">
            <Button
              onClick={() => setInputMode('json')}
              variant={inputMode === 'json' ? 'default' : 'outline'}
            >
              JSON 입력
            </Button>
            <Button
              onClick={() => setInputMode('form')}
              variant={inputMode === 'form' ? 'default' : 'outline'}
            >
              폼 입력
            </Button>
          </div>

          {inputMode === 'json' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>여러 문제 생성:</strong> JSON을 배열로 입력하면 여러 문제를 한 번에 생성할 수 있습니다.
                <br />
                예: <code className="text-xs bg-blue-100 px-1 rounded">[{'{'} ... {'}'}, {'{'} ... {'}'}]</code>
                <br />
                <span className="text-xs text-blue-600">같은 카테고리에 모든 문제가 저장됩니다.</span>
              </p>
            </div>
          )}

          {inputMode === 'json' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리 *</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={quizInfo.category || CUSTOM_CATEGORY_KEY}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === CUSTOM_CATEGORY_KEY) {
                        setQuizInfo(prev => ({ ...prev, category: '' }));
                        setCustomCategory('');
                      } else {
                        setQuizInfo(prev => ({ ...prev, category: val }));
                        setCustomCategory('');
                      }
                    }}
                  >
                    {QUIZ_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value={CUSTOM_CATEGORY_KEY}>직접 입력</option>
                  </select>
                  {(!quizInfo.category || quizInfo.category === CUSTOM_CATEGORY_KEY) && (
                    <Input
                      className="mt-2"
                      placeholder="직접 입력할 카테고리"
                      value={customCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCategory(val);
                        setQuizInfo(prev => ({ ...prev, category: val }));
                      }}
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    💡 주관식과 같은 카테고리를 선택하거나 직접 입력할 수 있습니다.
                  </p>
                </div>
                <div></div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">JSON 입력</label>
                  <Button
                    onClick={() => setJsonInput(jsonExample)}
                    variant="outline"
                    size="sm"
                  >
                    예시 불러오기
                  </Button>
                </div>
                <textarea
                  className="w-full p-3 border rounded-lg font-mono text-sm"
                  rows={20}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="JSON 형식으로 입력하세요..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ID</label>
                  <Input
                    value={formInput.id}
                    onChange={(e) => setFormInput(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="예: exPhysio_001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">주제</label>
                  <Input
                    value={formInput.topic}
                    onChange={(e) => setFormInput(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="예: 젖산역치/피로"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">문제 문장</label>
                <Input
                  value={formInput.question}
                  onChange={(e) => setFormInput(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="예: 다음 중 옳은 것은?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">문제 유형</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={formInput.type}
                    onChange={(e) => setFormInput(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="정답찾기">정답찾기</option>
                    <option value="오답찾기">오답찾기</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">보기 개수</label>
                  <Input
                    type="number"
                    min="4"
                    max="6"
                    value={formInput.optionCount}
                    onChange={(e) => setFormInput(prev => ({ ...prev, optionCount: parseInt(e.target.value) || 4 }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">정답 Pool (한 줄에 하나씩, 최소 4개 이상)</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={6}
                  value={formInput.correctPool}
                  onChange={(e) => setFormInput(prev => ({ ...prev, correctPool: e.target.value }))}
                  placeholder="정답 문장을 한 줄에 하나씩 입력하세요..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">오답 Pool (한 줄에 하나씩, 최소 4개 이상)</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={10}
                  value={formInput.incorrectPool}
                  onChange={(e) => setFormInput(prev => ({ ...prev, incorrectPool: e.target.value }))}
                  placeholder="오답 문장을 한 줄에 하나씩 입력하세요..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">원문 풀이 (선택사항)</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                  value={formInput.solution}
                  onChange={(e) => setFormInput(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder="원문 풀이를 입력하세요..."
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? '생성 중...' : '문제 생성'}
          </Button>
        </Card>
      )}

      {/* 2단계: 결과 확인 및 저장 */}
      {step === 'result' && generatedQuestion && (
        <div className="space-y-6">
          {/* 여러 문제 모드: 문제 선택 */}
          {batchMode && generatedQuestions.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium text-blue-800 mb-1 block">
                    생성된 문제 목록 ({generatedQuestions.length}개)
                  </label>
                  <p className="text-xs text-blue-600">
                    문제를 선택하여 확인하거나 모두 저장할 수 있습니다.
                    <br />
                    <span className="text-blue-500">💾 카테고리: {quizInfo.category} (로컬 저장됨)</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      if (quizInfo.category) {
                        setConfirmModal({
                          isOpen: true,
                          message: `"${quizInfo.category}" 카테고리의 모든 문제 목록을 초기화하시겠습니까?`,
                          variant: 'warning',
                          onConfirm: () => {
                            localStorage.removeItem(`quiz-questions-${quizInfo.category}`);
                            setGeneratedQuestions([]);
                            setBatchMode(false);
                            setGeneratedQuestion(null);
                            alert('목록이 초기화되었습니다.');
                            setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
                          }
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    🗑️ 목록 초기화
                  </Button>
                  <Button
                    onClick={() => {
                      // 문제 추가 생성 모드로 전환
                      setStep('input');
                      setBatchMode(true); // 배치 모드 유지
                    }}
                    variant="outline"
                    size="sm"
                  >
                    ➕ 문제 추가
                  </Button>
                  <Button
                    onClick={async () => {
                      // 모든 문제를 한 번에 저장
                      try {
                        setLoading(true);
                        const token = localStorage.getItem('token');
                        if (!token) {
                          alert('로그인이 필요합니다.');
                          return;
                        }

                        // 같은 카테고리로 여러 문제를 한 번에 저장
                        const response = await fetch('http://localhost:5000/api/quiz-question-generator/save-quiz', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            generatedQuestions: generatedQuestions,
                            title: quizInfo.title || `${quizInfo.category} 관련 문제 세트`,
                            description: quizInfo.description || `${generatedQuestions.length}개의 문제가 포함된 세트입니다.`,
                            category: quizInfo.category,
                            tags: quizInfo.tags.split(',').map(t => t.trim()).filter(t => t)
                          })
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.message || '문제 저장 중 오류가 발생했습니다.');
                        }

                        const result = await response.json();
                        alert(result.message || `${generatedQuestions.length}개의 문제가 모두 저장되었습니다.`);
                        
                        // 저장 후 localStorage에서 해당 카테고리의 문제 목록 삭제
                        localStorage.removeItem(`quiz-questions-${quizInfo.category}`);
                        setGeneratedQuestions([]);
                        setBatchMode(false);
                        setGeneratedQuestion(null);
                        
                        setStep('saved');
                      } catch (error: any) {
                        logger.error('문제 저장 실패:', error);
                        alert(error.message || '문제 저장 중 오류가 발생했습니다.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    variant="default"
                    size="sm"
                  >
                    {loading ? '저장 중...' : `전체 저장 (${generatedQuestions.length}개)`}
                  </Button>
                </div>
              </div>
              <CardGrid mobileCols={2} desktopCols={4} gap={2} className="max-h-40 overflow-y-auto">
                {generatedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGeneratedQuestion(q)}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${
                      generatedQuestion.id === q.id
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-xs font-medium truncate">{q.topic}</div>
                    <div className="text-xs opacity-75 mt-1">#{idx + 1}</div>
                  </button>
                ))}
              </CardGrid>
            </Card>
          )}

          {/* 모드 선택 */}
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">표시 모드</label>
                <p className="text-xs text-gray-500">공부용: 이론 먼저 표시 / 시험용: 문제 먼저 표시</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setDisplayMode('study')}
                  variant={displayMode === 'study' ? 'default' : 'outline'}
                  size="sm"
                >
                  📚 공부용
                </Button>
                <Button
                  onClick={() => setDisplayMode('exam')}
                  variant={displayMode === 'exam' ? 'default' : 'outline'}
                  size="sm"
                >
                  📝 시험용
                </Button>
              </div>
            </div>
          </Card>

          {/* 공부용: 이론 먼저, 시험용: 문제 먼저 */}
          {displayMode === 'study' && (
            <>
              {/* 개념 블록 */}
              {generatedQuestion.conceptBlock && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-blue-900">
                      {(() => {
                        const title = generatedQuestion.conceptBlock?.title || '';
                        if (title.includes('Lactate Threshold & Fatigue')) {
                          return '젖산역치와 피로 - 개념 요약';
                        }
                        return title || '개념 요약';
                      })()}
                    </h2>
                  </div>
                  {generatedQuestion.conceptBlock.theory && generatedQuestion.conceptBlock.theory.length > 0 && (
                    <div className="space-y-3">
                      {generatedQuestion.conceptBlock.theory.map((theory, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-gray-800 leading-relaxed">{theory}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* 원문 풀이 */}
              {generatedQuestion.originalExplanation && (
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-purple-900">원문 풀이</h2>
                  </div>
                  {generatedQuestion.originalExplanation.summary && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                      <p className="text-gray-800 leading-relaxed font-medium">{generatedQuestion.originalExplanation.summary}</p>
                    </div>
                  )}
                  {generatedQuestion.originalExplanation.keyPoints && generatedQuestion.originalExplanation.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-purple-800 mb-2">핵심 포인트</h3>
                      {generatedQuestion.originalExplanation.keyPoints.map((point, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-purple-100 shadow-sm flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* 생성된 문제 */}
          <Card className="p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-xl font-bold text-blue-900">생성된 문제</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="text-sm font-semibold text-blue-800 mb-2 block">문제</label>
                <p className="text-lg font-medium text-gray-800">{generatedQuestion.question}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">보기</label>
                <div className="space-y-3">
                  {generatedQuestion.options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg border-2 transition-all ${
                        idx === generatedQuestion.correctAnswer 
                          ? 'bg-green-50 border-green-400 shadow-md' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                          idx === generatedQuestion.correctAnswer 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed">{opt}</p>
                        </div>
                        {idx === generatedQuestion.correctAnswer && (
                          <Badge className="ml-2 bg-green-600 text-white px-3 py-1">정답</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <label className="text-sm font-semibold text-yellow-800 mb-2 block">해설</label>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedQuestion.explanation}</p>
              </div>
            </div>
          </Card>

          {/* 시험용: 이론 나중에 표시 */}
          {displayMode === 'exam' && (
            <>
              {/* 개념 블록 */}
              {generatedQuestion.conceptBlock && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-blue-900">
                      {(() => {
                        const title = generatedQuestion.conceptBlock?.title || '';
                        if (title.includes('Lactate Threshold & Fatigue')) {
                          return '젖산역치와 피로 - 개념 요약';
                        }
                        return title || '개념 요약';
                      })()}
                    </h2>
                  </div>
                  {generatedQuestion.conceptBlock.theory && generatedQuestion.conceptBlock.theory.length > 0 && (
                    <div className="space-y-3">
                      {generatedQuestion.conceptBlock.theory.map((theory, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                              {idx + 1}
                            </div>
                            <p className="text-gray-800 leading-relaxed">{theory}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* 원문 풀이 */}
              {generatedQuestion.originalExplanation && (
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                    <h2 className="text-xl font-bold text-purple-900">원문 풀이</h2>
                  </div>
                  {generatedQuestion.originalExplanation.summary && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-purple-100 shadow-sm">
                      <p className="text-gray-800 leading-relaxed font-medium">{generatedQuestion.originalExplanation.summary}</p>
                    </div>
                  )}
                  {generatedQuestion.originalExplanation.keyPoints && generatedQuestion.originalExplanation.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-purple-800 mb-2">핵심 포인트</h3>
                      {generatedQuestion.originalExplanation.keyPoints.map((point, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-purple-100 shadow-sm flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* Pool 정보 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-green-800">
                  정답 Pool 
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({generatedQuestion.sourcePools.correctPool.length}개)
                  </span>
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedQuestion.sourcePools.correctPool.map((item, idx) => (
                  <div key={idx} className="p-3 bg-green-50 border border-green-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-green-800 leading-relaxed flex-1">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6 shadow-md border-red-200">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-red-600 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-red-800">
                  오답 Pool 
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({generatedQuestion.sourcePools.incorrectPool.length}개)
                  </span>
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedQuestion.sourcePools.incorrectPool.map((item, idx) => {
                  const detail = generatedQuestion.incorrectPoolDetails?.find(d => d.option === item);
                  return (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-red-800 leading-relaxed font-medium mb-1">{item}</p>
                          {detail?.whyIncorrect && (
                            <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-400">
                              <p className="text-xs font-semibold text-red-700 mb-1">❌ 왜 틀렸나요?</p>
                              <p className="text-xs text-red-600 leading-relaxed">{detail.whyIncorrect}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* 퀴즈 저장 정보 */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">퀴즈 저장 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  value={quizInfo.title}
                  onChange={(e) => setQuizInfo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="퀴즈 제목"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  value={quizInfo.description}
                  onChange={(e) => setQuizInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="퀴즈 설명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 *</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={quizInfo.category}
                  onChange={(e) => setQuizInfo(prev => ({ ...prev, category: e.target.value }))}
                >
                  {QUIZ_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">태그 (쉼표로 구분)</label>
                <Input
                  value={quizInfo.tags}
                  onChange={(e) => setQuizInfo(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="태그1, 태그2, 태그3"
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleSaveQuiz}
                  disabled={!quizInfo.title || loading}
                  className="flex-1"
                >
                  {loading ? '저장 중...' : '퀴즈로 저장'}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  새로 시작
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 주관식 문제 결과 표시 */}
      {step === 'result' && subjectiveQuestions.length > 0 && (
        <div className="space-y-6">
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  생성된 주관식 문제 ({subjectiveQuestions.length}개)
                </h2>
                <p className="text-sm text-green-600 mt-1">카테고리: {subjectiveInput.category}</p>
                {subjectiveInput.section && (
                  <p className="text-sm text-green-600">섹션: {subjectiveInput.section}</p>
                )}
                {subjectiveInput.topic && (
                  <p className="text-sm text-green-600">주제: {subjectiveInput.topic}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleExportJSON}
                  variant="outline"
                  size="sm"
                >
                  📄 JSON 내보내기
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                >
                  📊 Sheets 내보내기
                </Button>
                <Button
                  onClick={handleSaveSubjectiveQuiz}
                  disabled={loading}
                  variant="default"
                  size="sm"
                >
                  {loading ? '저장 중...' : '퀴즈로 저장'}
                </Button>
                <Button
                  onClick={() => {
                    setStep('input');
                    setSubjectiveQuestions([]);
                    setSubjectiveInput(prev => ({
                      ...prev,
                      textbookContent: '',
                      section: '',
                      topic: ''
                    }));
                  }}
                  variant="outline"
                  size="sm"
                >
                  새로 시작
                </Button>
              </div>
            </div>
          </Card>

          {/* 코넬 노트 형식 표시 */}
          <div className="space-y-4">
            {subjectiveQuestions.map((question, idx) => (
              <Card key={idx} className="p-6 shadow-lg border-2 border-blue-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 핵심(Cue) 영역 */}
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                    <div className="text-xs font-semibold text-blue-600 mb-2">핵심 키워드</div>
                    <div className="text-lg font-bold text-blue-900 mb-4">{question.핵심_키워드}</div>
                    <div className="text-xs font-semibold text-blue-600 mb-2">문제 유형</div>
                    <Badge className="bg-blue-600 text-white mb-4">{question.문제_유형}</Badge>
                    <div className="text-xs font-semibold text-blue-600 mb-2">주관식 질문</div>
                    <div className="text-gray-800 font-medium">{question.주관식_질문}</div>
                  </div>
                  
                  {/* 필기(Note) 영역 */}
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                    {question.isTwoStep ? (
                      <>
                        <div className="text-xs font-semibold text-gray-600 mb-2">1차 답변 (중제목/핵심)</div>
                        <div className="text-gray-800 font-semibold mb-4 bg-yellow-50 p-2 rounded">
                          {question.정답_1차}
                        </div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">2차 답변 (세부사항)</div>
                        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {question.정답_2차}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs font-semibold text-gray-600 mb-2">정답 상세 내용</div>
                        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {question.정답_상세_내용}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 테이블 형식 미리보기 */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">코넬 노트 형식 테이블</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-gray-300 p-3 text-left">핵심 키워드</th>
                    <th className="border border-gray-300 p-3 text-left">문제 유형</th>
                    <th className="border border-gray-300 p-3 text-left">주관식 질문</th>
                    <th className="border border-gray-300 p-3 text-left">
                      {subjectiveQuestions.some(q => q.isTwoStep) ? '1차 답변 / 2차 답변' : '정답 상세 내용'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectiveQuestions.map((question, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-semibold text-blue-900">
                        {question.핵심_키워드}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <Badge>{question.문제_유형}</Badge>
                        {question.isTwoStep && <Badge className="ml-1 bg-green-600">2단계</Badge>}
                      </td>
                      <td className="border border-gray-300 p-3">{question.주관식_질문}</td>
                      <td className="border border-gray-300 p-3 whitespace-pre-wrap text-sm">
                        {question.isTwoStep ? (
                          <div>
                            <div className="font-semibold text-yellow-700 mb-1">1차: {question.정답_1차}</div>
                            <div className="text-gray-600">2차: {question.정답_2차}</div>
                          </div>
                        ) : (
                          question.정답_상세_내용
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3단계: 저장 완료 */}
      {step === 'saved' && (
        <Card className="p-6 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">퀴즈 저장 완료!</h2>
          <p className="text-gray-600 mb-6">
            문제가 성공적으로 퀴즈로 저장되었습니다.
          </p>
          <div className="flex space-x-4 justify-center">
            <Button onClick={handleReset}>새 문제 생성</Button>
            <Button
              onClick={() => window.location.href = '/admin/quiz'}
              variant="outline"
            >
              퀴즈 관리로 이동
            </Button>
          </div>
        </Card>
      )}

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}
