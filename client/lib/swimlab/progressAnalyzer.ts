/**
 * 🏊 JJ Swim Lab - 훈련 진척도 분석 및 프로그램 제안
 * 
 * 연동되는 데이터:
 * - 사용자의 프로그램 이력 (MongoDB SwimProgram)
 * - CSS 변화 추이 (영법별 100m 기록)
 * - 프로그램 완료율 (실제 수행 데이터)
 * - 부상/질환 이력
 * 
 * 연동되는 파일:
 * - client/lib/swimlab/utils/programStorage.ts
 * - client/lib/swimlab/engine-v31.ts
 * - server/src/models/SwimProgram.ts
 */

export type ProgressAnalysis = {
  shouldSuggest: boolean;
  currentGoal: string;
  suggestedGoal: string;
  reason: string;
  completedPrograms: number;
  totalPrograms: number;
  readinessScore: number; // 0-100
  cssImprovement: number; // CSS 향상률 (%)
  completionRate: number; // 프로그램 완료율 (%)
  injuryFree: boolean; // 부상 없이 수행 여부
  details: {
    cssChange: string;
    performanceConsistency: string;
    readinessFactors: string[];
  };
};

/**
 * 사용자의 실제 수행 데이터를 분석하여 실력 향상 프로그램 전환을 제안할지 결정
 */
export function analyzeProgress(
  athleteId: string,
  programHistory: any[], // SwimProgram[]
  currentCSS: Record<string, number>, // 현재 CSS (영법별)
  initialCSS?: Record<string, number> // 초기 CSS (옵션)
): ProgressAnalysis {
  // 기본값
  const result: ProgressAnalysis = {
    shouldSuggest: false,
    currentGoal: '',
    suggestedGoal: '실력 향상',
    reason: '',
    completedPrograms: 0,
    totalPrograms: programHistory.length,
    readinessScore: 0,
    cssImprovement: 0,
    completionRate: 0,
    injuryFree: true,
    details: {
      cssChange: '',
      performanceConsistency: '',
      readinessFactors: []
    }
  };

  if (!programHistory || programHistory.length === 0) {
    return result;
  }

  // 최근 프로그램 목표 파악 (최근 8주)
  const recentPrograms = programHistory.slice(-8);
  const goalCounts: Record<string, number> = {};
  
  recentPrograms.forEach(p => {
    const goal = p.metadata?.goal || p.goal || '기타';
    goalCounts[goal] = (goalCounts[goal] || 0) + 1;
  });

  // 가장 많이 한 목표
  const mostFrequentGoal = Object.keys(goalCounts).reduce((a, b) => 
    goalCounts[a] > goalCounts[b] ? a : b, '기타'
  );

  result.currentGoal = mostFrequentGoal;

  // ==========================================
  // 사례 1: 기술/체력 → 실력 향상 제안
  // ==========================================
  if (mostFrequentGoal !== '실력 향상' && 
      (mostFrequentGoal === '기술 연마' || mostFrequentGoal === '체력 향상')) {
    
    let score = 0;
    const readinessFactors: string[] = [];

    // ==========================================
    // 1. CSS 향상도 분석 (최대 35점)
    // ==========================================
    if (initialCSS && Object.keys(initialCSS).length > 0) {
      // 주 영법의 CSS 변화 계산
      const cssChanges: number[] = [];
      const mainStrokes = ['freestyle', 'backstroke', 'breaststroke', 'butterfly'];
      
      mainStrokes.forEach(stroke => {
        if (initialCSS[stroke] && currentCSS[stroke]) {
          // CSS는 시간이므로, 작을수록 좋음 (개선율 = (초기-현재)/초기 * 100)
          const improvement = ((initialCSS[stroke] - currentCSS[stroke]) / initialCSS[stroke]) * 100;
          cssChanges.push(improvement);
        }
      });

      if (cssChanges.length > 0) {
        const avgImprovement = cssChanges.reduce((a, b) => a + b, 0) / cssChanges.length;
        result.cssImprovement = Math.round(avgImprovement * 10) / 10;

        if (avgImprovement >= 5) {
          score += 35;
          readinessFactors.push(`CSS ${avgImprovement.toFixed(1)}% 향상 (우수)`);
          result.details.cssChange = `평균 ${avgImprovement.toFixed(1)}% 향상 - 기록이 크게 개선되었습니다!`;
        } else if (avgImprovement >= 3) {
          score += 25;
          readinessFactors.push(`CSS ${avgImprovement.toFixed(1)}% 향상 (양호)`);
          result.details.cssChange = `평균 ${avgImprovement.toFixed(1)}% 향상 - 꾸준한 발전이 있습니다.`;
        } else if (avgImprovement >= 1) {
          score += 15;
          readinessFactors.push(`CSS ${avgImprovement.toFixed(1)}% 향상 (진행중)`);
          result.details.cssChange = `평균 ${avgImprovement.toFixed(1)}% 향상 - 발전 중입니다.`;
        } else if (avgImprovement >= 0) {
          score += 5;
          result.details.cssChange = `변화 미미 - 좀 더 훈련이 필요합니다.`;
        } else {
          result.details.cssChange = `CSS가 느려졌습니다 - 휴식이 필요할 수 있습니다.`;
        }
      }
    }

    // ==========================================
    // 2. 프로그램 완료율 분석 (최대 35점)
    // ==========================================
    const programsWithCompletion = recentPrograms.filter(p => 
      p.completionRate !== undefined || p.actualSessions !== undefined
    );

    if (programsWithCompletion.length >= 3) {
      let totalCompletionRate = 0;
      let completedCount = 0;

      programsWithCompletion.forEach(p => {
        if (p.completionRate !== undefined) {
          totalCompletionRate += p.completionRate;
          if (p.completionRate >= 80) completedCount++;
        } else if (p.actualSessions && p.totalSessions) {
          const rate = (p.actualSessions / p.totalSessions) * 100;
          totalCompletionRate += rate;
          if (rate >= 80) completedCount++;
        }
      });

      const avgCompletionRate = totalCompletionRate / programsWithCompletion.length;
      result.completionRate = Math.round(avgCompletionRate);
      result.completedPrograms = completedCount;

      if (avgCompletionRate >= 90) {
        score += 35;
        readinessFactors.push(`프로그램 ${avgCompletionRate.toFixed(0)}% 완료 (우수)`);
        result.details.performanceConsistency = `평균 ${avgCompletionRate.toFixed(0)}% 완료 - 훈련을 매우 성실히 수행했습니다!`;
      } else if (avgCompletionRate >= 75) {
        score += 25;
        readinessFactors.push(`프로그램 ${avgCompletionRate.toFixed(0)}% 완료 (양호)`);
        result.details.performanceConsistency = `평균 ${avgCompletionRate.toFixed(0)}% 완료 - 꾸준히 훈련을 소화했습니다.`;
      } else if (avgCompletionRate >= 60) {
        score += 15;
        result.details.performanceConsistency = `평균 ${avgCompletionRate.toFixed(0)}% 완료 - 조금 더 일관성이 필요합니다.`;
      } else {
        result.details.performanceConsistency = `완료율 낮음 - 현재 목표를 더 진행하세요.`;
      }
    } else {
      result.details.performanceConsistency = '완료 데이터 부족 - 최소 3주 이상 수행 기록 필요';
    }

    // ==========================================
    // 3. 부상/질환 이력 분석 (최대 30점)
    // ==========================================
    const recentInjuries = recentPrograms.filter(p => {
      const conditions = p.metadata?.conditionIds || [];
      // 심각한 부상 여부 (shoulder_impingement, knee_pain 등)
      return conditions.some((c: string) => 
        c.includes('pain') || c.includes('injury') || c.includes('impingement')
      );
    });

    const injuryRate = recentInjuries.length / recentPrograms.length;
    result.injuryFree = injuryRate === 0;

    if (injuryRate === 0) {
      score += 30;
      readinessFactors.push('부상 없이 훈련 수행 (우수)');
    } else if (injuryRate <= 0.2) {
      score += 20;
      readinessFactors.push('부상 거의 없음 (양호)');
    } else if (injuryRate <= 0.4) {
      score += 10;
      readinessFactors.push('일부 부상 이력 있음');
    } else {
      readinessFactors.push('부상이 잦음 - 현재 목표로 기초 다지기 필요');
    }

    result.readinessScore = score;
    result.details.readinessFactors = readinessFactors;

    // ==========================================
    // 제안 조건: 준비도 70점 이상
    // ==========================================
    if (score >= 70) {
      result.shouldSuggest = true;
      
      if (mostFrequentGoal === '기술 연마') {
        result.reason = `CSS가 ${result.cssImprovement > 0 ? result.cssImprovement.toFixed(1) + '% 향상' : '안정화'}되고, 프로그램을 ${result.completionRate}% 완료하며 기술이 체화되었습니다. 부상 없이 훈련을 소화하고 있으니, 이제 실력 향상 프로그램으로 기술+체력+스피드를 종합 발전시켜 기록 향상을 노려보는 것은 어떨까요?`;
      } else if (mostFrequentGoal === '체력 향상') {
        result.reason = `CSS가 ${result.cssImprovement > 0 ? result.cssImprovement.toFixed(1) + '% 향상' : '안정화'}되고, 프로그램을 ${result.completionRate}% 완료하며 심폐 기능이 강화되었습니다. 부상 없이 훈련을 소화하고 있으니, 이제 실력 향상 프로그램으로 체력을 바탕으로 기술과 스피드를 더해 기록 향상을 노려보는 것은 어떨까요?`;
      }
    }
  }

  // ==========================================
  // 사례 2: 실력 향상 → 기초(기술/체력) 복귀 제안
  // ==========================================
  if (mostFrequentGoal === '실력 향상') {
    let score = 0;
    const readinessFactors: string[] = [];

    // CSS 정체 또는 하락 확인
    if (initialCSS && Object.keys(initialCSS).length > 0) {
      const cssChanges: number[] = [];
      const mainStrokes = ['freestyle', 'backstroke', 'breaststroke', 'butterfly'];
      
      mainStrokes.forEach(stroke => {
        if (initialCSS[stroke] && currentCSS[stroke]) {
          const improvement = ((initialCSS[stroke] - currentCSS[stroke]) / initialCSS[stroke]) * 100;
          cssChanges.push(improvement);
        }
      });

      if (cssChanges.length > 0) {
        const avgImprovement = cssChanges.reduce((a, b) => a + b, 0) / cssChanges.length;
        result.cssImprovement = Math.round(avgImprovement * 10) / 10;

        // CSS 정체 또는 하락 시 기초 복귀 제안
        if (avgImprovement < 1) {
          score += 40;
          readinessFactors.push('CSS 정체/하락 - 기초 다지기 필요');
          result.details.cssChange = `CSS 변화 미미 (${avgImprovement.toFixed(1)}%) - 기초 훈련으로 재정비가 필요합니다.`;
        }
      }
    }

    // 완료율 저조 확인
    const programsWithCompletion = recentPrograms.filter(p => 
      p.completionRate !== undefined || p.actualSessions !== undefined
    );

    if (programsWithCompletion.length >= 2) {
      let totalCompletionRate = 0;

      programsWithCompletion.forEach(p => {
        if (p.completionRate !== undefined) {
          totalCompletionRate += p.completionRate;
        } else if (p.actualSessions && p.totalSessions) {
          totalCompletionRate += (p.actualSessions / p.totalSessions) * 100;
        }
      });

      const avgCompletionRate = totalCompletionRate / programsWithCompletion.length;
      result.completionRate = Math.round(avgCompletionRate);

      // 완료율 낮으면 강도가 너무 높다는 신호
      if (avgCompletionRate < 70) {
        score += 30;
        readinessFactors.push('완료율 저조 - 강도 조절 필요');
        result.details.performanceConsistency = `평균 ${avgCompletionRate.toFixed(0)}% 완료 - 현재 강도가 과할 수 있습니다.`;
      }
    }

    // 부상 발생 확인
    const recentInjuries = recentPrograms.filter(p => {
      const conditions = p.metadata?.conditionIds || [];
      return conditions.some((c: string) => 
        c.includes('pain') || c.includes('injury') || c.includes('impingement')
      );
    });

    if (recentInjuries.length > 0) {
      score += 30;
      readinessFactors.push('부상 발생 - 회복과 폼 교정 필요');
      result.injuryFree = false;
    }

    result.readinessScore = score;
    result.details.readinessFactors = readinessFactors;

    // 제안 조건: 준비도 50점 이상 (기초 복귀는 낮은 임계값)
    if (score >= 50) {
      result.shouldSuggest = true;
      
      // CSS 정체면 기술, 부상이면 체력/기술, 완료율 저조면 체력
      if (result.cssImprovement < 0.5 && recentInjuries.length > 0) {
        result.suggestedGoal = '기술 연마';
        result.reason = `실력 향상 프로그램 중 CSS 정체와 부상이 발생했습니다. 이럴 때는 기술 연마로 복귀하여 폼을 교정하고 효율성을 높이며 부상을 회복하는 것이 좋습니다. 기초를 다시 다진 후 더 높은 수준의 실력 향상에 도전하세요!`;
      } else if (recentInjuries.length > 0) {
        result.suggestedGoal = '체력 향상';
        result.reason = `실력 향상 프로그램 중 부상이 발생했습니다. 체력 향상으로 복귀하여 저강도 지구력 훈련으로 회복하고 기초 체력을 재정비한 후, 다시 실력 향상에 도전하세요!`;
      } else if (result.completionRate < 70) {
        result.suggestedGoal = '체력 향상';
        result.reason = `실력 향상 프로그램의 완료율이 ${result.completionRate}%로 낮습니다. 이는 현재 강도가 과할 수 있다는 신호입니다. 체력 향상으로 복귀하여 기초 체력을 더 다진 후, 더 여유있게 실력 향상에 도전하세요!`;
      } else {
        result.suggestedGoal = '기술 연마';
        result.reason = `실력 향상 프로그램 후 CSS가 ${Math.abs(result.cssImprovement).toFixed(1)}% 정체되었습니다. 이럴 때는 기술 연마로 복귀하여 동작을 재점검하고 효율성을 높이는 것이 좋습니다. 더 나은 폼으로 다시 실력 향상에 도전하면 돌파구가 열립니다!`;
      }
    }
  }

  return result;
}

/**
 * 제안 메시지 생성 (양방향: 기초→실력 or 실력→기초)
 */
export function generateSuggestionMessage(analysis: ProgressAnalysis): string {
  if (!analysis.shouldSuggest) return '';

  const isAdvancingToPerformance = analysis.suggestedGoal === '실력 향상';
  const isReturningToBasics = !isAdvancingToPerformance;

  let programFeatures = '';
  if (analysis.suggestedGoal === '실력 향상') {
    programFeatures = `**실력 향상 프로그램의 특징:**
✅ 기술 (50%) + 지구력 (30%) + 고강도 (20%) 균형 배치
✅ 역치 인터벌, LSD, 스프린트 등 다양한 훈련법
✅ 종합적인 실력 발전으로 기록 향상 가능`;
  } else if (analysis.suggestedGoal === '기술 연마') {
    programFeatures = `**기술 연마 프로그램의 특징:**
✅ 동작 효율성과 폼 교정에 집중
✅ 기술 드릴, 스컬링, 캐치업 등 세밀한 훈련
✅ 부상 회복과 CSS 재향상의 기반 마련`;
  } else if (analysis.suggestedGoal === '체력 향상') {
    programFeatures = `**체력 향상 프로그램의 특징:**
✅ 저강도 장거리(LSD)로 심폐 기능 강화
✅ 부상 회복과 기초 체력 재정비
✅ 지속 가능한 훈련 강도로 안정적 발전`;
  }

  return `
🎯 **프로그램 전환 제안 - ${analysis.suggestedGoal}**

${analysis.reason}

**현재 분석:**
- 현재 목표: ${analysis.currentGoal}
- CSS 변화: ${analysis.cssImprovement > 0 ? '+' : ''}${analysis.cssImprovement.toFixed(1)}%
- 완료율: ${analysis.completionRate}%
- 부상 여부: ${analysis.injuryFree ? '없음 ✅' : '있음 ⚠️'}
- 준비도: ${analysis.readinessScore}/100

${programFeatures}

**주기화 훈련의 원리 (Periodization):**
${isAdvancingToPerformance 
  ? `기초 훈련으로 체력과 기술을 다진 후 실력 향상에 도전하면 더 큰 성과를 냅니다!` 
  : `실력 향상 후 다시 기초로 복귀하여 폼을 교정하고 CSS를 더 개선한 후, 더 높은 수준의 실력 향상에 도전하세요!`}

📈 **순환 훈련 주기:**
기술 연마 → 실력 향상 → 기술 연마 (더 높은 수준) → 실력 향상 (더 높은 강도) 🔄
         ↓             ↓
    폼 교정       기록 향상
    CSS 개선     스피드 발전

${isReturningToBasics 
  ? `💡 **팁:** 기초로 복귀하는 것은 후퇴가 아닙니다. 이는 더 높은 도약을 위한 준비입니다!` 
  : `💡 **팁:** 실력 향상 후에는 다시 기초로 돌아가 순환 훈련을 계속하세요!`}

지금 **${analysis.suggestedGoal}** 프로그램으로 전환하시겠습니까?
  `.trim();
}

