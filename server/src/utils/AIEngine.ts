import { AIAnalysis } from '../models/AIAnalysis';
import { Checklist } from '../models/Checklist';
import { User } from '../models/User';

// AI 분석 결과 타입
export interface PostureAnalysisResult {
  technique: string;
  score: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export interface ProgressPredictionResult {
  currentLevel: string;
  predictedNextLevel: string;
  estimatedWeeks: number;
  confidence: number;
  factors: string[];
}

export interface PersonalizedRecommendationResult {
  recommendedExercises: string[];
  focusAreas: string[];
  difficultyAdjustment: 'easier' | 'same' | 'harder';
  estimatedImprovement: string;
}

export interface PerformanceAnalysisResult {
  overallScore: number;
  improvementRate: number;
  consistencyScore: number;
  recommendations: string[];
}

export class AIEngine {
  
  /**
   * 수영 자세 분석 (규칙 기반)
   */
  static async analyzePosture(
    studentId: string,
    technique: string,
    checklistData: any[]
  ): Promise<PostureAnalysisResult> {
    
    // 체크리스트 데이터 기반 자세 분석
    const completedItems = checklistData.filter(item => item.isCompleted);
    const totalItems = checklistData.length;
    const completionRate = (completedItems.length / totalItems) * 100;
    
    // 기술별 분석 규칙
    const techniqueRules = {
      freestyle: {
        keyPoints: ['자세', '호흡', '팔동작', '다리동작', '타이밍'],
        weights: [0.3, 0.25, 0.25, 0.15, 0.05]
      },
      backstroke: {
        keyPoints: ['자세', '팔동작', '다리동작', '호흡', '균형'],
        weights: [0.25, 0.25, 0.2, 0.15, 0.15]
      },
      breaststroke: {
        keyPoints: ['자세', '팔동작', '다리동작', '호흡', '타이밍'],
        weights: [0.2, 0.25, 0.25, 0.2, 0.1]
      },
      butterfly: {
        keyPoints: ['자세', '팔동작', '다리동작', '호흡', '리듬'],
        weights: [0.2, 0.3, 0.2, 0.15, 0.15]
      }
    };
    
    const rules = techniqueRules[technique as keyof typeof techniqueRules];
    let score = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // 각 키 포인트별 점수 계산
    rules.keyPoints.forEach((point, index) => {
      const pointItems = checklistData.filter(item => 
        item.category === point || item.description.includes(point)
      );
      const pointCompletion = pointItems.length > 0 ? 
        (pointItems.filter(item => item.isCompleted).length / pointItems.length) * 100 : 0;
      
      score += pointCompletion * rules.weights[index];
      
      if (pointCompletion >= 80) {
        strengths.push(point);
      } else if (pointCompletion < 50) {
        improvements.push(point);
      }
    });
    
    // 상세 피드백 생성
    const detailedFeedback = this.generateDetailedFeedback(technique, score, strengths, improvements);
    
    return {
      technique,
      score: Math.round(score),
      strengths,
      improvements,
      detailedFeedback
    };
  }
  
  /**
   * 진도 예측 (패턴 분석 기반)
   */
  static async predictProgress(
    studentId: string,
    instructorId: string
  ): Promise<ProgressPredictionResult> {
    
    // 학생의 체크리스트 히스토리 분석
    const checklists = await Checklist.find({
      studentId,
      instructorId,
      status: { $in: ['completed', 'active'] }
    }).sort({ createdAt: -1 }).limit(10);
    
    if (checklists.length === 0) {
      return {
        currentLevel: '초급',
        predictedNextLevel: '초급+',
        estimatedWeeks: 4,
        confidence: 0.3,
        factors: ['데이터 부족']
      };
    }
    
    // 진도 패턴 분석
    const progressPattern = this.analyzeProgressPattern(checklists);
    const currentLevel = this.determineCurrentLevel(progressPattern);
    const predictedNextLevel = this.predictNextLevel(currentLevel, progressPattern);
    const estimatedWeeks = this.estimateWeeksToNextLevel(progressPattern);
    const confidence = this.calculateConfidence(checklists.length, progressPattern);
    const factors = this.identifyProgressFactors(progressPattern);
    
    return {
      currentLevel,
      predictedNextLevel,
      estimatedWeeks,
      confidence,
      factors
    };
  }
  
  /**
   * 개인화 추천 (학습 패턴 기반)
   */
  static async generatePersonalizedRecommendation(
    studentId: string,
    instructorId: string
  ): Promise<PersonalizedRecommendationResult> {
    
    // 학생의 학습 데이터 분석
    const recentChecklists = await Checklist.find({
      studentId,
      instructorId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 최근 30일
    });
    
    // 약점 분석
    const weaknesses = this.identifyWeaknesses(recentChecklists);
    const strengths = this.identifyStrengths(recentChecklists);
    
    // 추천 운동 생성
    const recommendedExercises = this.generateExerciseRecommendations(weaknesses, strengths);
    const focusAreas = this.determineFocusAreas(weaknesses);
    const difficultyAdjustment = this.suggestDifficultyAdjustment(recentChecklists);
    const estimatedImprovement = this.estimateImprovement(weaknesses, recommendedExercises);
    
    return {
      recommendedExercises,
      focusAreas,
      difficultyAdjustment,
      estimatedImprovement
    };
  }
  
  /**
   * 성과 분석 (통계 기반)
   */
  static async analyzePerformance(
    studentId: string,
    instructorId: string
  ): Promise<PerformanceAnalysisResult> {
    
    const checklists = await Checklist.find({
      studentId,
      instructorId
    }).sort({ createdAt: -1 });
    
    if (checklists.length === 0) {
      return {
        overallScore: 0,
        improvementRate: 0,
        consistencyScore: 0,
        recommendations: ['더 많은 데이터가 필요합니다']
      };
    }
    
    // 전체 점수 계산
    const overallScore = this.calculateOverallScore(checklists);
    
    // 개선률 계산
    const improvementRate = this.calculateImprovementRate(checklists);
    
    // 일관성 점수 계산
    const consistencyScore = this.calculateConsistencyScore(checklists);
    
    // 추천사항 생성
    const recommendations = this.generatePerformanceRecommendations(
      overallScore, improvementRate, consistencyScore
    );
    
    return {
      overallScore,
      improvementRate,
      consistencyScore,
      recommendations
    };
  }
  
  // 헬퍼 메서드들
  private static generateDetailedFeedback(
    technique: string,
    score: number,
    strengths: string[],
    improvements: string[]
  ): string {
    let feedback = `${technique} 수영 분석 결과입니다.\n\n`;
    
    if (score >= 80) {
      feedback += `전반적으로 우수한 수영 실력을 보여주고 있습니다. `;
    } else if (score >= 60) {
      feedback += `양호한 수영 실력을 보여주고 있습니다. `;
    } else {
      feedback += `기본기를 더욱 다져야 할 필요가 있습니다. `;
    }
    
    if (strengths.length > 0) {
      feedback += `특히 ${strengths.join(', ')} 부분에서 뛰어난 모습을 보여주고 있습니다. `;
    }
    
    if (improvements.length > 0) {
      feedback += `${improvements.join(', ')} 부분에 더 집중하여 연습하시면 좋겠습니다.`;
    }
    
    return feedback;
  }
  
  private static analyzeProgressPattern(checklists: any[]): any {
    // 진도 패턴 분석 로직
    const completionRates = checklists.map(c => c.progress || 0);
    const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    const trend = this.calculateTrend(completionRates);
    
    return {
      avgCompletionRate,
      trend,
      consistency: this.calculateConsistency(completionRates),
      recentPerformance: completionRates.slice(0, 3)
    };
  }
  
  private static determineCurrentLevel(pattern: any): string {
    if (pattern.avgCompletionRate >= 90) return '고급';
    if (pattern.avgCompletionRate >= 70) return '중급';
    if (pattern.avgCompletionRate >= 50) return '초급+';
    return '초급';
  }
  
  private static predictNextLevel(currentLevel: string, pattern: any): string {
    const levelProgression = {
      '초급': '초급+',
      '초급+': '중급',
      '중급': '고급',
      '고급': '전문가'
    };
    
    if (pattern.trend > 0.1) { // 상승 추세
      return levelProgression[currentLevel as keyof typeof levelProgression] || currentLevel;
    }
    
    return currentLevel;
  }
  
  private static estimateWeeksToNextLevel(pattern: any): number {
    if (pattern.trend > 0.2) return 2;
    if (pattern.trend > 0.1) return 4;
    if (pattern.trend > 0) return 6;
    return 8;
  }
  
  private static calculateConfidence(dataPoints: number, pattern: any): number {
    let confidence = Math.min(dataPoints / 10, 1); // 데이터 포인트 기반
    confidence *= pattern.consistency; // 일관성 반영
    return Math.round(confidence * 100) / 100;
  }
  
  private static identifyProgressFactors(pattern: any): string[] {
    const factors: string[] = [];
    
    if (pattern.trend > 0.1) factors.push('지속적인 개선');
    if (pattern.consistency > 0.8) factors.push('안정적인 실력');
    if (pattern.avgCompletionRate > 80) factors.push('높은 완성도');
    
    return factors;
  }
  
  private static identifyWeaknesses(checklists: any[]): string[] {
    // 약점 식별 로직
    const allItems = checklists.flatMap(c => c.items || []);
    const incompleteItems = allItems.filter(item => !item.isCompleted);
    
    // 카테고리별 미완료 비율 계산
    const categoryStats: { [key: string]: number } = {};
    incompleteItems.forEach(item => {
      const category = item.category || '기타';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    return Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }
  
  private static identifyStrengths(checklists: any[]): string[] {
    // 강점 식별 로직
    const allItems = checklists.flatMap(c => c.items || []);
    const completeItems = allItems.filter(item => item.isCompleted);
    
    const categoryStats: { [key: string]: number } = {};
    completeItems.forEach(item => {
      const category = item.category || '기타';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    return Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
  }
  
  private static generateExerciseRecommendations(weaknesses: string[], strengths: string[]): string[] {
    const exerciseMap: { [key: string]: string[] } = {
      '자세': ['플랭크', '코어 스트레칭', '자세 교정 운동'],
      '호흡': ['호흡 연습', '수중 호흡', '호흡 타이밍 연습'],
      '팔동작': ['팔 스트로크 연습', '풀링 연습', '리커버리 연습'],
      '다리동작': ['킥 연습', '다리 근력 운동', '플렉서빌리티'],
      '타이밍': ['리듬 연습', '타이밍 연습', '조화 운동']
    };
    
    const recommendations: string[] = [];
    weaknesses.forEach(weakness => {
      if (exerciseMap[weakness]) {
        recommendations.push(...exerciseMap[weakness]);
      }
    });
    
    return [...new Set(recommendations)]; // 중복 제거
  }
  
  private static determineFocusAreas(weaknesses: string[]): string[] {
    return weaknesses.slice(0, 2); // 상위 2개 약점에 집중
  }
  
  private static suggestDifficultyAdjustment(checklists: any[]): 'easier' | 'same' | 'harder' {
    if (checklists.length === 0) return 'same';
    
    const recentAvgProgress = checklists.slice(0, 3)
      .reduce((sum, c) => sum + (c.progress || 0), 0) / Math.min(checklists.length, 3);
    
    if (recentAvgProgress >= 90) return 'harder';
    if (recentAvgProgress < 60) return 'easier';
    return 'same';
  }
  
  private static estimateImprovement(weaknesses: string[], exercises: string[]): string {
    const weeks = Math.ceil(weaknesses.length * 2);
    return `${weeks}주 후 ${weaknesses[0]} 영역에서 20-30% 개선 예상`;
  }
  
  private static calculateOverallScore(checklists: any[]): number {
    if (checklists.length === 0) return 0;
    
    const totalProgress = checklists.reduce((sum, c) => sum + (c.progress || 0), 0);
    return Math.round(totalProgress / checklists.length);
  }
  
  private static calculateImprovementRate(checklists: any[]): number {
    if (checklists.length < 2) return 0;
    
    const recent = checklists.slice(0, 3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
    const older = checklists.slice(-3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
    
    return Math.round(((recent - older) / older) * 100);
  }
  
  private static calculateConsistencyScore(checklists: any[]): number {
    if (checklists.length < 2) return 0;
    
    const progresses = checklists.map(c => c.progress || 0);
    const mean = progresses.reduce((a, b) => a + b, 0) / progresses.length;
    const variance = progresses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / progresses.length;
    const stdDev = Math.sqrt(variance);
    
    // 표준편차가 낮을수록 일관성이 높음
    return Math.max(0, 1 - (stdDev / 100));
  }
  
  private static generatePerformanceRecommendations(
    overallScore: number,
    improvementRate: number,
    consistencyScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (overallScore < 70) {
      recommendations.push('기본기 연습을 더욱 강화하세요');
    }
    
    if (improvementRate < 0) {
      recommendations.push('학습 방법을 재검토해보세요');
    }
    
    if (consistencyScore < 0.7) {
      recommendations.push('꾸준한 연습이 필요합니다');
    }
    
    if (overallScore >= 80 && improvementRate > 10) {
      recommendations.push('다음 단계로 도전해보세요');
    }
    
    return recommendations.length > 0 ? recommendations : ['현재 잘하고 있습니다!'];
  }
  
  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }
    
    return trend / (values.length - 1);
  }
  
  private static calculateConsistency(values: number[]): number {
    if (values.length < 2) return 1;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, 1 - (stdDev / 100));
  }
}

