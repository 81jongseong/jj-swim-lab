/**
 * @file 주관식 문제 생성 서비스
 * @description 교재 텍스트 내용을 분석하여 주관식/구술 시험 대비용 문제 은행 생성
 * @date 2025-01-22
 * @author JJ Swim Lab
 * 
 * 📋 **서비스 목적**
 * - 교재 텍스트 내용을 분석하여 주관식 문제 생성
 * - 개념 서술, 분류, 기능 나열, 순서/단계, 공식 문제 생성
 * - 코넬 노트 형식의 문제 데이터 생성
 * - 객관식 문제와 함께 한 과목에 저장 가능
 * 
 * ⚠️ **중요**: 이미지 업로드는 저작권 문제로 제외됨
 * - 모든 정답은 텍스트 요약만으로 완벽하게 이해되도록 상세하게 작성
 */

export interface SubjectiveQuestionInput {
  textbookContent: string; // 교재 텍스트 내용
  section?: string; // 섹션/장 이름 (선택사항)
  topic?: string; // 소주제 (선택사항)
  minQuestions?: number; // 최소 문제 개수 (기본 3개)
  category?: string; // 카테고리 (객관식과 같은 과목에 저장하기 위해)
}

export interface SubjectiveQuestion {
  핵심_키워드: string; // 핵심 용어
  문제_유형: '개념 서술' | '분류/종류' | '기능/역할' | '순서/단계' | '공식';
  주관식_질문: string; // 주관식 질문
  정답_상세_내용: string; // 정답 상세 내용 (5줄 이내)
}

export class SubjectiveQuestionGeneratorService {
  /**
   * 교재 텍스트 내용을 분석하여 주관식 문제 생성
   */
  static generateQuestions(input: SubjectiveQuestionInput): SubjectiveQuestion[] {
    const { textbookContent, minQuestions = 3 } = input;
    
    if (!textbookContent || textbookContent.trim().length === 0) {
      throw new Error('교재 내용이 필요합니다.');
    }

    // 텍스트를 문단으로 분리
    const paragraphs = textbookContent
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const questions: AnatomyQuestion[] = [];
    const processedConcepts = new Set<string>();

    // 각 문단에서 핵심 개념 추출 및 문제 생성
    for (const paragraph of paragraphs) {
      // 핵심 용어 추출 (예: "굴곡", "신전", "지레", "관절" 등)
      const keyTerms = this.extractKeyTerms(paragraph);
      
      for (const term of keyTerms) {
        if (processedConcepts.has(term)) continue;
        processedConcepts.add(term);

        // 문제 유형 결정
        const questionType = this.determineQuestionType(paragraph, term);
        
        // 문제 생성
        const question = this.generateQuestionForTerm(paragraph, term, questionType);
        if (question) {
          questions.push(question);
        }

        if (questions.length >= minQuestions * 2) break; // 충분한 문제 생성
      }
      
      if (questions.length >= minQuestions * 2) break;
    }

    // 문제 개수 조정 (최소 개수 이상)
    if (questions.length < minQuestions) {
      // 부족한 경우 전체 텍스트에서 추가 문제 생성
      const additionalQuestions = this.generateAdditionalQuestions(
        textbookContent,
        minQuestions - questions.length,
        processedConcepts
      );
      questions.push(...additionalQuestions);
    }

    // 최종 문제 개수 조정 (최소 개수 이상, 최대 10개)
    return questions.slice(0, Math.max(minQuestions, Math.min(10, questions.length)));
  }

  /**
   * 문단에서 핵심 용어 추출
   */
  private static extractKeyTerms(paragraph: string): string[] {
    const terms: string[] = [];
    
    // 해부학/역학 관련 핵심 용어 패턴
    const patterns = [
      /([가-힣]+(?:관절|근육|뼈|인대|힘줄|운동|작용|기능|역할|종류|분류|단계|순서|과정|메커니즘))/g,
      /([가-힣]+(?:굴곡|신전|내전|외전|회전|내회전|외회전|내측|외측))/g,
      /([가-힣]+(?:지레|모멘트|힘|저항|작용점|지지점))/g,
      /([가-힣]+(?:근육|수축|이완|수동적|능동적))/g,
    ];

    for (const pattern of patterns) {
      const matches = paragraph.match(pattern);
      if (matches) {
        terms.push(...matches.map(m => m.trim()));
      }
    }

    // 중복 제거 및 정리
    return [...new Set(terms)].filter(term => term.length >= 2 && term.length <= 20);
  }

  /**
   * 문단과 용어를 기반으로 문제 유형 결정
   */
  private static determineQuestionType(
    paragraph: string,
    term: string
  ): SubjectiveQuestion['문제_유형'] {
    const lowerParagraph = paragraph.toLowerCase();
    const lowerTerm = term.toLowerCase();

    // 공식 관련
    if (paragraph.includes('공식') || paragraph.includes('계산') || paragraph.includes('=')) {
      return '공식';
    }

    // 순서/단계 관련
    if (
      paragraph.includes('순서') ||
      paragraph.includes('단계') ||
      paragraph.includes('과정') ||
      paragraph.includes('절차') ||
      /[0-9]+[\.\)]\s*[가-힣]/.test(paragraph)
    ) {
      return '순서/단계';
    }

    // 분류/종류 관련
    if (
      paragraph.includes('종류') ||
      paragraph.includes('분류') ||
      paragraph.includes('유형') ||
      paragraph.includes('타입') ||
      paragraph.includes('종류로') ||
      paragraph.includes('나누어')
    ) {
      return '분류/종류';
    }

    // 기능/역할 관련
    if (
      paragraph.includes('기능') ||
      paragraph.includes('역할') ||
      paragraph.includes('작용') ||
      paragraph.includes('효과')
    ) {
      return '기능/역할';
    }

    // 기본값: 개념 서술
    return '개념 서술';
  }

  /**
   * 용어에 대한 문제 생성
   */
  private static generateQuestionForTerm(
    paragraph: string,
    term: string,
    questionType: SubjectiveQuestion['문제_유형']
  ): SubjectiveQuestion | null {
    let question = '';
    let answer = '';

    switch (questionType) {
      case '개념 서술':
        question = `${term}에 대해 상세히 서술하시오.`;
        answer = this.extractConceptDescription(paragraph, term);
        break;

      case '분류/종류':
        question = `${term}의 종류(또는 분류)를 나열하고 각각에 대해 설명하시오.`;
        answer = this.extractClassification(paragraph, term);
        break;

      case '기능/역할':
        question = `${term}의 기능(또는 역할)을 설명하시오.`;
        answer = this.extractFunction(paragraph, term);
        break;

      case '순서/단계':
        question = `${term}의 과정(또는 단계)을 순서대로 설명하시오.`;
        answer = this.extractProcess(paragraph, term);
        break;

      case '공식':
        question = `${term}에 관련된 공식(또는 계산 방법)을 설명하시오.`;
        answer = this.extractFormula(paragraph, term);
        break;
    }

    if (!answer || answer.trim().length < 50) {
      return null; // 답변이 너무 짧으면 문제 생성 안 함
    }

    // 답변을 5줄 이내로 제한
    const answerLines = answer.split('\n').filter(line => line.trim().length > 0);
    const limitedAnswer = answerLines.slice(0, 5).join('\n');

    return {
      핵심_키워드: term,
      문제_유형: questionType,
      주관식_질문: question,
      정답_상세_내용: limitedAnswer
    };
  }

  /**
   * 개념 서술 추출
   */
  private static extractConceptDescription(paragraph: string, term: string): string {
    // 용어가 포함된 문장들을 찾아서 정리
    const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
    
    if (sentences.length === 0) {
      return paragraph.substring(0, 500); // 전체 문단 사용
    }

    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 5)
      .join('. ') + '.';
  }

  /**
   * 분류/종류 추출
   */
  private static extractClassification(paragraph: string, term: string): string {
    const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
    
    // 번호나 항목 기호가 있는 경우 추출
    const items: string[] = [];
    for (const sentence of sentences) {
      // "1.", "①", "-", "•" 등의 패턴 찾기
      if (/[0-9]+[\.\)]\s*/.test(sentence) || /[①②③④⑤]/.test(sentence)) {
        items.push(sentence.trim());
      }
    }

    if (items.length > 0) {
      return items.slice(0, 5).join('\n');
    }

    // 항목이 없으면 문장들을 나열
    return sentences.slice(0, 5).map(s => s.trim()).join('\n');
  }

  /**
   * 기능/역할 추출
   */
  private static extractFunction(paragraph: string, term: string): string {
    const sentences = paragraph
      .split(/[\.。]/)
      .filter(s => s.includes(term) && (s.includes('기능') || s.includes('역할') || s.includes('작용')));
    
    if (sentences.length === 0) {
      return this.extractConceptDescription(paragraph, term);
    }

    return sentences
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 5)
      .join('. ') + '.';
  }

  /**
   * 순서/단계 추출
   */
  private static extractProcess(paragraph: string, term: string): string {
    const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
    
    // 번호가 있는 문장들을 순서대로 정리
    const numberedSentences: Array<{ num: number; text: string }> = [];
    
    for (const sentence of sentences) {
      const numMatch = sentence.match(/([0-9]+)[\.\)]\s*(.+)/);
      if (numMatch) {
        numberedSentences.push({
          num: parseInt(numMatch[1]),
          text: numMatch[2].trim()
        });
      }
    }

    if (numberedSentences.length > 0) {
      numberedSentences.sort((a, b) => a.num - b.num);
      return numberedSentences
        .slice(0, 5)
        .map(item => `${item.num}. ${item.text}`)
        .join('\n');
    }

    // 번호가 없으면 문장들을 순서대로 나열
    return sentences
      .slice(0, 5)
      .map((s, i) => `${i + 1}. ${s.trim()}`)
      .join('\n');
  }

  /**
   * 공식 추출
   */
  private static extractFormula(paragraph: string, term: string): string {
    const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
    
    // 공식이 포함된 문장 찾기
    const formulaSentences = sentences.filter(s => /[=+\-*/]/.test(s) || s.includes('공식'));
    
    if (formulaSentences.length > 0) {
      return formulaSentences
        .map(s => s.trim())
        .slice(0, 5)
        .join('. ') + '.';
    }

    return this.extractConceptDescription(paragraph, term);
  }

  /**
   * 추가 문제 생성 (부족한 경우)
   */
  private static generateAdditionalQuestions(
    fullText: string,
    count: number,
    processedConcepts: Set<string>
  ): SubjectiveQuestion[] {
    const questions: SubjectiveQuestion[] = [];
    const allTerms = this.extractKeyTerms(fullText);
    
    for (const term of allTerms) {
      if (processedConcepts.has(term)) continue;
      if (questions.length >= count) break;

      processedConcepts.add(term);
      const questionType = this.determineQuestionType(fullText, term);
      const question = this.generateQuestionForTerm(fullText, term, questionType);
      
      if (question) {
        questions.push(question);
      }
    }

    return questions;
  }
}

