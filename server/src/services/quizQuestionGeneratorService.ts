/**
 * @file 퀴즈 문제 자동 생성 서비스
 * @description 사용자가 제공한 정답 Pool, 오답 Pool, 변형 문제 정보를 기반으로 문제은행에서 문제를 생성하는 서비스
 * @date 2025-01-13
 * @author JJ Swim Lab
 * 
 * 📋 **서비스 목적**
 * - 사용자가 제공한 정답 Pool, 오답 Pool을 기반으로 문제 생성
 * - 변형 문제 정보를 활용하여 실제 퀴즈 문제 생성
 * - 문제은행 로직으로 다양한 문제 조합 생성
 */

export interface QuestionPoolInput {
  id: string;
  topic: string;
  conceptBlock?: {
    title?: string;
    theory?: string[];
  };
  originalExplanation?: {
    summary?: string;
    keyPoints?: string[];
  };
  correctPool: string[]; // 정답 Pool (4개 이상)
  incorrectPool: Array<string | { option: string; whyIncorrect?: string }>; // 오답 Pool (10개 이상) - 문자열 또는 객체
  typeVariants?: {
    correctVersion?: {
      instruction?: string;
      exampleOptions?: string[];
      exampleAnswer?: number;
    };
    incorrectVersion?: {
      instruction?: string;
      exampleOptions?: string[];
      exampleAnswer?: number;
    };
  };
  optionCount?: number; // 보기 개수 (기본 4개)
  type?: '정답찾기' | '오답찾기'; // 문제 유형 (선택사항)
}

export interface GeneratedQuestion {
  id: string;
  topic: string;
  question: string;
  type: '정답찾기' | '오답찾기';
  options: string[];
  correctAnswer: number;
  explanation: string;
  solution?: string;
  sourcePools: {
    correctPool: string[];
    incorrectPool: string[];
  };
}

export class QuizQuestionGeneratorService {
  /**
   * 정답 Pool과 오답 Pool을 기반으로 문제 생성
   */
  static generateQuestionFromPools(input: QuestionPoolInput): GeneratedQuestion {
    // 입력 검증
    if (!input.correctPool || input.correctPool.length < 4) {
      throw new Error('정답 Pool은 최소 4개 이상이어야 합니다.');
    }

    if (!input.incorrectPool || input.incorrectPool.length < 4) {
      throw new Error('오답 Pool은 최소 4개 이상이어야 합니다.');
    }

    const optionCount = input.optionCount || 4;
    const questionType = input.type || '정답찾기';

    if (questionType === '정답찾기') {
      // "옳은 것" 문제 생성
      return this.generateCorrectVersion(input, optionCount);
    } else {
      // "옳지 않은 것" 문제 생성
      return this.generateIncorrectVersion(input, optionCount);
    }
  }

  /**
   * "옳은 것" 문제 생성
   */
  private static generateCorrectVersion(input: QuestionPoolInput, optionCount: number): GeneratedQuestion {
    // 정답 Pool에서 1개 선택
    const correctAnswer = this.selectRandom(input.correctPool);
    
    // 오답 Pool을 문자열 배열로 변환
    const incorrectPoolStrings = input.incorrectPool.map(item => 
      typeof item === 'string' ? item : item.option
    );
    
    // 오답 Pool에서 (optionCount - 1)개 선택
    const incorrectOptions = this.selectRandomMultiple(
      incorrectPoolStrings,
      optionCount - 1
    );

    // 보기 조합 및 셔플
    const allOptions = this.shuffleArray([correctAnswer, ...incorrectOptions]);
    const correctAnswerIndex = allOptions.indexOf(correctAnswer);

    // 문제 문장 결정 (typeVariants가 있으면 사용, 없으면 기본값)
    const questionText = input.typeVariants?.correctVersion?.instruction || '다음 중 옳은 것은?';

    // 풀이 생성
    const solution = input.originalExplanation?.summary || '';
    const keyPoints = input.originalExplanation?.keyPoints || [];

    return {
      id: input.id,
      topic: input.topic,
      question: questionText,
      type: '정답찾기',
      options: allOptions,
      correctAnswer: correctAnswerIndex,
      explanation: `정답: ${correctAnswerIndex + 1}번. ${correctAnswer}`,
      solution: solution + (keyPoints.length > 0 ? '\n\n핵심 포인트:\n' + keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n') : ''),
      sourcePools: {
        correctPool: input.correctPool,
        incorrectPool: input.incorrectPool.map(item => 
          typeof item === 'string' ? item : item.option
        )
      }
    };
  }

  /**
   * "옳지 않은 것" 문제 생성
   */
  private static generateIncorrectVersion(input: QuestionPoolInput, optionCount: number): GeneratedQuestion {
    // 오답 Pool을 문자열 배열로 변환
    const incorrectPoolStrings = input.incorrectPool.map(item => 
      typeof item === 'string' ? item : item.option
    );
    
    // 오답 Pool에서 1개 선택 (정답)
    const incorrectAnswer = this.selectRandom(incorrectPoolStrings);
    
    // 정답 Pool에서 (optionCount - 1)개 선택 (오답)
    const correctOptions = this.selectRandomMultiple(
      input.correctPool,
      optionCount - 1
    );

    // 보기 조합 및 셔플
    const allOptions = this.shuffleArray([incorrectAnswer, ...correctOptions]);
    const incorrectAnswerIndex = allOptions.indexOf(incorrectAnswer);

    // 문제 문장 결정 (typeVariants가 있으면 사용, 없으면 기본값)
    const questionText = input.typeVariants?.incorrectVersion?.instruction || '다음 중 옳지 않은 것은?';

    // 풀이 생성
    const solution = input.originalExplanation?.summary || '';
    const keyPoints = input.originalExplanation?.keyPoints || [];

    return {
      id: input.id,
      topic: input.topic,
      question: questionText,
      type: '오답찾기',
      options: allOptions,
      correctAnswer: incorrectAnswerIndex,
      explanation: `정답: ${incorrectAnswerIndex + 1}번. ${incorrectAnswer}는 잘못된 설명입니다.`,
      solution: solution + (keyPoints.length > 0 ? '\n\n핵심 포인트:\n' + keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n') : ''),
      sourcePools: {
        correctPool: input.correctPool,
        incorrectPool: input.incorrectPool.map(item => 
          typeof item === 'string' ? item : item.option
        )
      }
    };
  }

  /**
   * 여러 문제 생성 (문제은행)
   */
  static generateMultipleQuestions(
    input: QuestionPoolInput,
    count: number = 5
  ): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];

    for (let i = 0; i < count; i++) {
      // 매번 다른 조합으로 문제 생성
      const question = this.generateQuestionFromPools({
        ...input,
        id: `${input.id}_${i + 1}`
      });
      questions.push(question);
    }

    return questions;
  }

  /**
   * 배열에서 랜덤으로 1개 선택
   */
  private static selectRandom<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('배열이 비어있습니다.');
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 배열에서 랜덤으로 여러 개 선택 (중복 없음)
   */
  private static selectRandomMultiple<T>(array: T[], count: number): T[] {
    if (array.length < count) {
      throw new Error(`배열의 길이(${array.length})가 요청한 개수(${count})보다 작습니다.`);
    }

    const shuffled = this.shuffleArray([...array]);
    return shuffled.slice(0, count);
  }

  /**
   * 배열 셔플
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
