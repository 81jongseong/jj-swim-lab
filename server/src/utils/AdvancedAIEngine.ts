import { Checklist } from '../models/Checklist';
import { AIAnalysis } from '../models/AIAnalysis';
import { AIEvaluationResult, EvaluationCriteria, ExerciseRecommendation, IExerciseRecommendation } from '../models/AIEvaluationCriteria';

// AI 평가 입력 데이터 인터페이스
export interface ComprehensiveEvaluationInput {
  studentId: string;
  instructorId: string;
  technique: string;
  level: string;
  performanceMetrics: {
    speed?: number;
    endurance?: number;
    strokeCount?: number;
    heartRate?: number;
    distance?: number;
  };
  instructorObservations: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
}

// AI 평가 결과 인터페이스
export interface IAIEvaluationResult {
  overallScore: number;
  categoryScores: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
  levelAssessment: string;
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  recommendations: {
    exercises: {
      name: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      duration: number;
    }[];
    workoutPlan: {
      name: string;
      description: string;
      duration: number;
      frequency: number;
    };
    nextEvaluationDate: Date;
  };
  feedback: {
    summary: string;
    detailedFeedback: string;
    encouragement: string;
    goals: string[];
  };
}

/**
 * 고급 AI 엔진 - 자체 데이터베이스 기반 평가 시스템
 */
export class AdvancedAIEngine {
  
  /**
   * 종합적인 AI 평가 수행
   */
  static async performComprehensiveEvaluation(input: ComprehensiveEvaluationInput): Promise<{ success: boolean; data: IAIEvaluationResult | null; message?: string }> {
    try {
      console.log('🤖 고급 AI 엔진 - 종합 평가 시작:', input.technique, input.level);
      
      // 1. 평가 기준 조회
      const criteria = await EvaluationCriteria.findOne({
        technique: input.technique,
        level: input.level,
        isActive: true
      });
      
      if (!criteria) {
        return {
          success: false,
          data: null,
          message: `${input.technique} ${input.level} 레벨의 평가 기준을 찾을 수 없습니다.`
        };
      }
      
      // 2. 성과 지표 분석
      const performanceAnalysis = this.analyzePerformanceMetrics(input.performanceMetrics, criteria.performanceMetrics, input.level);
      
      // 3. 강사 관찰 분석
      const observationAnalysis = this.analyzeInstructorObservations(input.instructorObservations, criteria.categories);
      
      // 4. 종합 점수 계산
      const overallScore = this.calculateOverallScore(performanceAnalysis, observationAnalysis, criteria.categories);
      
      // 5. 카테고리별 점수 계산
      const categoryScores = this.calculateCategoryScores(performanceAnalysis, observationAnalysis, criteria.categories);
      
      // 6. 레벨 평가
      const levelAssessment = this.assessLevel(overallScore, input.level);
      
      // 7. 강점/약점 분석
      const { strengths, weaknesses, improvementAreas } = this.analyzeStrengthsAndWeaknesses(categoryScores, criteria);
      
      // 8. 운동 추천 생성
      const exerciseRecommendations = await this.generateExerciseRecommendations(input.technique, input.level, improvementAreas);
      
      // 9. 피드백 생성
      const feedback = this.generateFeedback(overallScore, strengths, weaknesses);
      
      // 10. 결과 구성
      const result: IAIEvaluationResult = {
        overallScore,
        categoryScores,
        levelAssessment,
        strengths,
        weaknesses,
        improvementAreas,
        recommendations: {
          exercises: exerciseRecommendations.exercises,
          workoutPlan: exerciseRecommendations.workoutPlan,
          nextEvaluationDate: this.calculateNextEvaluationDate(input.level, overallScore)
        },
        feedback
      };
      
      // 11. 결과 저장
      await this.saveEvaluationResult(input, result);
      
      console.log('✅ 고급 AI 엔진 - 종합 평가 완료:', overallScore);
      
      return {
        success: true,
        data: result,
        message: 'AI 평가가 성공적으로 완료되었습니다.'
      };
      
    } catch (error) {
      console.error('❌ 고급 AI 엔진 오류:', error);
      return {
        success: false,
        data: null,
        message: 'AI 평가 중 오류가 발생했습니다.'
      };
    }
  }
  
  /**
   * 성과 지표 분석
   */
  private static analyzePerformanceMetrics(
    metrics: any,
    criteria: any,
    level: string
  ): { [key: string]: number } {
    const analysis: { [key: string]: number } = {};
    
    Object.keys(metrics).forEach(metric => {
      if (metrics[metric] !== undefined && criteria[metric]) {
        const levelCriteria = criteria[metric][level];
        if (levelCriteria) {
          // 정규화된 점수 계산 (0-100)
          const normalizedScore = this.normalizeMetricScore(
            metrics[metric],
            levelCriteria.min,
            levelCriteria.max
          );
          analysis[metric] = normalizedScore;
        }
      }
    });
    
    return analysis;
  }
  
  /**
   * 강사 관찰 분석
   */
  private static analyzeInstructorObservations(
    observations: any,
    categories: any
  ): { [key: string]: number } {
    const analysis: { [key: string]: number } = {};
    
    Object.keys(observations).forEach(category => {
      if (observations[category] !== undefined) {
        // 강사 관찰 점수를 그대로 사용 (이미 0-100 범위)
        analysis[category] = observations[category];
      }
    });
    
    return analysis;
  }
  
  /**
   * 종합 점수 계산
   */
  private static calculateOverallScore(
    performanceAnalysis: { [key: string]: number },
    observationAnalysis: { [key: string]: number },
    categories: any
  ): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    // 카테고리별 가중치 적용
    Object.keys(categories).forEach(category => {
      const weight = categories[category].weight;
      const score = observationAnalysis[category] || 0;
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    // 성과 지표 가중치 (30%)
    const performanceWeight = 0.3;
    const performanceScore = Object.values(performanceAnalysis).reduce((sum, score) => sum + score, 0) / Object.keys(performanceAnalysis).length || 0;
    
    totalScore += performanceScore * performanceWeight;
    totalWeight += performanceWeight;
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }
  
  /**
   * 카테고리별 점수 계산
   */
  private static calculateCategoryScores(
    performanceAnalysis: { [key: string]: number },
    observationAnalysis: { [key: string]: number },
    categories: any
  ): { posture: number; breathing: number; movement: number; efficiency: number } {
    return {
      posture: observationAnalysis.posture || 0,
      breathing: observationAnalysis.breathing || 0,
      movement: observationAnalysis.movement || 0,
      efficiency: observationAnalysis.efficiency || 0
    };
  }
  
  /**
   * 레벨 평가
   */
  private static assessLevel(overallScore: number, currentLevel: string): string {
    if (overallScore >= 90) return 'expert';
    if (overallScore >= 75) return 'advanced';
    if (overallScore >= 60) return 'intermediate';
    return 'beginner';
  }
  
  /**
   * 강점/약점 분석
   */
  private static analyzeStrengthsAndWeaknesses(
    categoryScores: any,
    criteria: any
  ): { strengths: string[]; weaknesses: string[]; improvementAreas: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvementAreas: string[] = [];
    
    Object.keys(categoryScores).forEach(category => {
      const score = categoryScores[category];
      const categoryName = this.getCategoryKoreanName(category);
      
      if (score >= 80) {
        strengths.push(categoryName);
      } else if (score < 60) {
        weaknesses.push(categoryName);
        improvementAreas.push(categoryName);
      }
    });
    
    return { strengths, weaknesses, improvementAreas };
  }
  
  /**
   * 운동 추천 생성
   */
  private static async generateExerciseRecommendations(
    technique: string,
    level: string,
    improvementAreas: string[]
  ): Promise<{ exercises: any[]; workoutPlan: any }> {
    const exercises: any[] = [];
    let workoutPlan: any = null;
    
    // 개선 영역별 운동 추천
    for (const area of improvementAreas) {
      const recommendations = await ExerciseRecommendation.find({
        technique,
        level,
        category: this.getCategoryEnglishName(area),
        isActive: true
      });
      
      recommendations.forEach(rec => {
        if (rec.instructions) {
          rec.instructions.forEach(instruction => {
            exercises.push({
              name: instruction,
              priority: this.determinePriority(area, rec.difficulty),
              reason: `${area} 개선을 위한 ${instruction}`,
              duration: rec.duration
            });
          });
        }
      });
      
      // 첫 번째 개선 영역의 운동 계획 사용
      if (!workoutPlan && recommendations.length > 0) {
        const rec = recommendations[0];
        workoutPlan = {
          name: rec.name,
          description: rec.description,
          duration: rec.duration,
          frequency: 'daily'
        };
      }
    }
    
    // 기본 운동 계획이 없는 경우
    if (!workoutPlan) {
      workoutPlan = {
        name: `${technique} 기본 훈련 계획`,
        description: '기본적인 수영 기술 향상을 위한 훈련 계획',
        duration: 60,
        frequency: 3
      };
    }
    
    return { exercises, workoutPlan };
  }
  
  /**
   * 피드백 생성
   */
  private static generateFeedback(
    overallScore: number,
    strengths: string[],
    weaknesses: string[]
  ): { summary: string; detailedFeedback: string; encouragement: string; goals: string[] } {
    let feedbackLevel: string;
    if (overallScore >= 90) feedbackLevel = 'excellent';
    else if (overallScore >= 75) feedbackLevel = 'good';
    else if (overallScore >= 60) feedbackLevel = 'average';
    else feedbackLevel = 'poor';
    
    const feedbackTemplates = {
      excellent: ['훌륭한 실력을 보여주고 있습니다!', '완벽에 가까운 기술을 보여주고 있습니다!'],
      good: ['좋은 실력을 보여주고 있습니다!', '꾸준한 노력이 보입니다!'],
      average: ['기본기를 잘 다지고 있습니다!', '조금 더 연습하면 더 좋아질 것입니다!'],
      poor: ['기본기를 다시 한번 점검해보세요!', '꾸준한 연습이 필요합니다!']
    };
    
    const template = feedbackTemplates[feedbackLevel] || feedbackTemplates.average;
    const randomTemplate = template[Math.floor(Math.random() * template.length)] || '좋은 노력을 보이고 있습니다.';
    
    return {
      summary: `전체 점수: ${overallScore}점 (${this.getLevelKoreanName(feedbackLevel)})`,
      detailedFeedback: randomTemplate,
      encouragement: this.generateEncouragement(overallScore, strengths),
      goals: this.generateGoals(weaknesses)
    };
  }
  
  /**
   * 평가 결과 저장
   */
  private static async saveEvaluationResult(input: ComprehensiveEvaluationInput, result: IAIEvaluationResult): Promise<void> {
    const evaluationResult = new AIEvaluationResult({
      studentId: input.studentId,
      instructorId: input.instructorId,
      technique: input.technique,
      level: input.level,
      inputData: {
        performanceMetrics: input.performanceMetrics,
        instructorObservations: input.instructorObservations
      },
      analysisResult: {
        overallScore: result.overallScore,
        categoryScores: result.categoryScores,
        levelAssessment: result.levelAssessment,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        improvementAreas: result.improvementAreas
      },
      recommendations: result.recommendations,
      feedback: result.feedback,
      evaluationDate: new Date()
    });
    
    await evaluationResult.save();
  }
  
  // 유틸리티 메서드들
  private static normalizeMetricScore(value: number, min: number, max: number): number {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return Math.round(((value - min) / (max - min)) * 100);
  }
  
  private static getCategoryKoreanName(category: string): string {
    const names: { [key: string]: string } = {
      'posture': '자세',
      'breathing': '호흡',
      'movement': '동작',
      'efficiency': '효율성'
    };
    return names[category] || category;
  }
  
  private static getCategoryEnglishName(category: string): string {
    const names: { [key: string]: string } = {
      '자세': 'posture',
      '호흡': 'breathing',
      '동작': 'movement',
      '효율성': 'efficiency'
    };
    return names[category] || category;
  }
  
  private static getLevelKoreanName(level: string): string {
    const names: { [key: string]: string } = {
      'excellent': '우수',
      'good': '양호',
      'average': '보통',
      'poor': '개선 필요'
    };
    return names[level] || level;
  }
  
  private static determinePriority(area: string, difficulty: string): 'high' | 'medium' | 'low' {
    if (area === '자세' || area === '호흡') return 'high';
    if (difficulty === 'hard') return 'low';
    return 'medium';
  }
  
  private static calculateNextEvaluationDate(level: string, score: number): Date {
    const days = score >= 80 ? 14 : score >= 60 ? 7 : 3; // 점수에 따른 평가 주기
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  }
  
  private static generateEncouragement(score: number, strengths: string[]): string {
    if (score >= 80) {
      return `훌륭한 실력을 보여주고 있습니다! ${strengths.join(', ')} 영역에서 특히 우수합니다.`;
    } else if (score >= 60) {
      return `꾸준한 발전을 보이고 있습니다. 계속 노력하시면 더욱 향상될 것입니다.`;
    } else {
      return `기초를 탄탄히 다지면 빠르게 향상될 수 있습니다. 포기하지 마세요!`;
    }
  }
  
  private static generateGoals(weaknesses: string[]): string[] {
    return weaknesses.map(weakness => `${weakness} 개선하기`);
  }
}