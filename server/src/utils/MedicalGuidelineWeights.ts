/**
 * 🏥 JJ Swim Lab - 의학적 가이드라인 기반 건강정보 가중치 시스템
 * 
 * 📋 **의학적 근거**
 * - ACSM (American College of Sports Medicine) 가이드라인
 * - AHA (American Heart Association) 운동 처방 지침
 * - 대한스포츠의학회 운동 처방 가이드라인
 * - 심혈관 위험도 계층화 시스템 (Cardiovascular Risk Stratification)
 * 
 * 🔬 **참고 문헌**
 * - ACSM's Guidelines for Exercise Testing and Prescription (11th Edition)
 * - Physical Activity Guidelines for Americans (2nd Edition)
 * - European Society of Cardiology Guidelines
 * - 한국 성인의 신체활동 지침서 (보건복지부)
 * 
 * 📊 **가중치 산정 기준**
 * - 심혈관 질환 위험도 (40%)
 * - 대사 질환 위험도 (30%) 
 * - 근골격계 위험도 (20%)
 * - 기타 위험 요소 (10%)
 */

export interface MedicalRiskFactors {
  age: number;
  gender: 'male' | 'female';
  bmi: number;
  systolicBP: number;
  diastolicBP: number;
  restingHR: number;
  bloodSugar: number;
  cholesterol?: number;
  smokingStatus: 'never' | 'former' | 'current';
  familyHistory: string[];
  medications: string[];
  medicalConditions: string[];
}

export interface ExerciseRiskClassification {
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  riskScore: number;
  primaryRiskFactors: string[];
  exerciseRestrictions: string[];
  recommendedIntensity: 'light' | 'moderate' | 'vigorous';
  medicalClearanceRequired: boolean;
  supervisionRequired: boolean;
}

export interface MedicalWeightingSystem {
  cardiovascularWeight: number;  // 심혈관 위험도 가중치
  metabolicWeight: number;       // 대사 위험도 가중치
  musculoskeletalWeight: number; // 근골격계 위험도 가중치
  overallRiskModifier: number;   // 전체 위험도 수정 계수
}

export class MedicalGuidelineWeights {
  
  /**
   * ACSM 가이드라인 기반 심혈관 위험도 평가
   * 참고: ACSM's Guidelines for Exercise Testing and Prescription
   */
  static assessCardiovascularRisk(factors: MedicalRiskFactors): {
    riskLevel: 'low' | 'moderate' | 'high';
    riskScore: number;
    riskFactors: string[];
  } {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // 1. 연령 위험도 (ACSM 기준)
    if (factors.gender === 'male' && factors.age >= 45) {
      riskScore += 1;
      riskFactors.push('고령 남성 (≥45세)');
    } else if (factors.gender === 'female' && factors.age >= 55) {
      riskScore += 1;
      riskFactors.push('고령 여성 (≥55세)');
    }
    
    // 2. 가족력 (관상동맥질환, 급성 심근경색)
    if (factors.familyHistory.some(h => 
      h.includes('심장병') || h.includes('심근경색') || h.includes('관상동맥')
    )) {
      riskScore += 1;
      riskFactors.push('심혈관 질환 가족력');
    }
    
    // 3. 흡연 (현재 흡연 또는 6개월 이내 금연)
    if (factors.smokingStatus === 'current') {
      riskScore += 1;
      riskFactors.push('현재 흡연');
    }
    
    // 4. 고혈압 (수축기 ≥140 또는 이완기 ≥90 mmHg)
    if (factors.systolicBP >= 140 || factors.diastolicBP >= 90) {
      riskScore += 1;
      riskFactors.push('고혈압');
    }
    
    // 5. 이상지질혈증 (총 콜레스테롤 ≥200 mg/dL)
    if (factors.cholesterol && factors.cholesterol >= 200) {
      riskScore += 1;
      riskFactors.push('이상지질혈증');
    }
    
    // 6. 당뇨병 (공복혈당 ≥126 mg/dL)
    if (factors.bloodSugar >= 126) {
      riskScore += 1;
      riskFactors.push('당뇨병');
    }
    
    // 7. 비만 (BMI ≥30)
    if (factors.bmi >= 30) {
      riskScore += 1;
      riskFactors.push('비만');
    }
    
    // 위험도 분류
    let riskLevel: 'low' | 'moderate' | 'high';
    if (riskScore === 0) {
      riskLevel = 'low';
    } else if (riskScore <= 2) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'high';
    }
    
    return { riskLevel, riskScore, riskFactors };
  }
  
  /**
   * 대사 위험도 평가 (당뇨병, 대사증후군 기준)
   * 참고: ADA (American Diabetes Association) 기준
   */
  static assessMetabolicRisk(factors: MedicalRiskFactors): {
    riskLevel: 'low' | 'moderate' | 'high';
    riskScore: number;
    riskFactors: string[];
  } {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // 1. 공복혈당 이상
    if (factors.bloodSugar >= 126) {
      riskScore += 3; // 당뇨병
      riskFactors.push('당뇨병 (공복혈당 ≥126 mg/dL)');
    } else if (factors.bloodSugar >= 100) {
      riskScore += 1; // 공복혈당장애
      riskFactors.push('공복혈당장애 (100-125 mg/dL)');
    }
    
    // 2. 복부비만 (BMI 기준)
    if (factors.bmi >= 30) {
      riskScore += 2;
      riskFactors.push('비만 (BMI ≥30)');
    } else if (factors.bmi >= 25) {
      riskScore += 1;
      riskFactors.push('과체중 (BMI 25-29.9)');
    }
    
    // 3. 고혈압 (대사증후군 기준)
    if (factors.systolicBP >= 130 || factors.diastolicBP >= 85) {
      riskScore += 1;
      riskFactors.push('고혈압 (≥130/85 mmHg)');
    }
    
    // 4. 연령 (당뇨병 위험도)
    if (factors.age >= 45) {
      riskScore += 1;
      riskFactors.push('고령 (≥45세)');
    }
    
    // 5. 가족력 (당뇨병)
    if (factors.familyHistory.some(h => h.includes('당뇨'))) {
      riskScore += 1;
      riskFactors.push('당뇨병 가족력');
    }
    
    // 위험도 분류
    let riskLevel: 'low' | 'moderate' | 'high';
    if (riskScore <= 1) {
      riskLevel = 'low';
    } else if (riskScore <= 3) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'high';
    }
    
    return { riskLevel, riskScore, riskFactors };
  }
  
  /**
   * 근골격계 위험도 평가
   * 참고: 정형외과학회 운동 처방 가이드라인
   */
  static assessMusculoskeletalRisk(factors: MedicalRiskFactors): {
    riskLevel: 'low' | 'moderate' | 'high';
    riskScore: number;
    riskFactors: string[];
  } {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // 1. 연령 (근골격계 퇴행성 변화)
    if (factors.age >= 65) {
      riskScore += 2;
      riskFactors.push('고령 (≥65세) - 근골격계 퇴행');
    } else if (factors.age >= 50) {
      riskScore += 1;
      riskFactors.push('중년 (50-64세) - 근골격계 주의');
    }
    
    // 2. 비만 (관절 부담)
    if (factors.bmi >= 35) {
      riskScore += 3; // 고도비만
      riskFactors.push('고도비만 (BMI ≥35) - 관절 과부하');
    } else if (factors.bmi >= 30) {
      riskScore += 2; // 비만
      riskFactors.push('비만 (BMI ≥30) - 관절 부담');
    } else if (factors.bmi >= 25) {
      riskScore += 1; // 과체중
      riskFactors.push('과체중 (BMI ≥25) - 관절 주의');
    }
    
    // 3. 기존 근골격계 질환
    if (factors.medicalConditions.some(c => 
      c.includes('관절염') || c.includes('디스크') || c.includes('골다공증')
    )) {
      riskScore += 2;
      riskFactors.push('기존 근골격계 질환');
    }
    
    // 위험도 분류
    let riskLevel: 'low' | 'moderate' | 'high';
    if (riskScore <= 1) {
      riskLevel = 'low';
    } else if (riskScore <= 3) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'high';
    }
    
    return { riskLevel, riskScore, riskFactors };
  }
  
  /**
   * 종합 위험도 평가 및 가중치 계산
   * 의학적 가이드라인을 종합한 최종 위험도 산정
   */
  static calculateMedicalWeights(factors: MedicalRiskFactors): {
    classification: ExerciseRiskClassification;
    weighting: MedicalWeightingSystem;
    recommendations: string[];
  } {
    // 각 영역별 위험도 평가
    const cardioRisk = this.assessCardiovascularRisk(factors);
    const metabolicRisk = this.assessMetabolicRisk(factors);
    const musculoRisk = this.assessMusculoskeletalRisk(factors);
    
    // 종합 위험점수 계산 (가중평균)
    const totalRiskScore = 
      (cardioRisk.riskScore * 0.4) +      // 심혈관 40%
      (metabolicRisk.riskScore * 0.3) +   // 대사 30%
      (musculoRisk.riskScore * 0.2) +     // 근골격계 20%
      (factors.age > 70 ? 0.5 : 0);       // 초고령 추가 위험도 10%
    
    // 전체 위험도 분류
    let overallRisk: 'low' | 'moderate' | 'high' | 'very_high';
    if (totalRiskScore <= 1) {
      overallRisk = 'low';
    } else if (totalRiskScore <= 2.5) {
      overallRisk = 'moderate';
    } else if (totalRiskScore <= 4) {
      overallRisk = 'high';
    } else {
      overallRisk = 'very_high';
    }
    
    // 위험 요소 통합
    const allRiskFactors = [
      ...cardioRisk.riskFactors,
      ...metabolicRisk.riskFactors,
      ...musculoRisk.riskFactors
    ];
    
    // 운동 제한사항 결정
    const exerciseRestrictions: string[] = [];
    const recommendations: string[] = [];
    
    if (overallRisk === 'very_high') {
      exerciseRestrictions.push('고강도 운동 금지');
      exerciseRestrictions.push('의료진 감독 하에서만 운동');
      recommendations.push('운동 전 의사 상담 필수');
      recommendations.push('심전도 및 운동부하검사 권장');
    } else if (overallRisk === 'high') {
      exerciseRestrictions.push('중강도 이상 운동 제한');
      exerciseRestrictions.push('운동 중 심박수 모니터링 필수');
      recommendations.push('운동 전 건강검진 권장');
      recommendations.push('전문가 지도 하에 운동 시작');
    } else if (overallRisk === 'moderate') {
      exerciseRestrictions.push('점진적 운동 강도 증가');
      recommendations.push('정기적인 건강상태 확인');
      recommendations.push('운동 중 이상 증상 발생 시 즉시 중단');
    }
    
    // 가중치 시스템 계산
    const weighting: MedicalWeightingSystem = {
      cardiovascularWeight: cardioRisk.riskScore * 0.4,
      metabolicWeight: metabolicRisk.riskScore * 0.3,
      musculoskeletalWeight: musculoRisk.riskScore * 0.2,
      overallRiskModifier: overallRisk === 'very_high' ? 0.3 : 
                          overallRisk === 'high' ? 0.5 :
                          overallRisk === 'moderate' ? 0.8 : 1.0
    };
    
    // 권장 운동 강도 결정
    const recommendedIntensity: 'light' | 'moderate' | 'vigorous' = 
      overallRisk === 'very_high' || overallRisk === 'high' ? 'light' :
      overallRisk === 'moderate' ? 'moderate' : 'vigorous';
    
    const classification: ExerciseRiskClassification = {
      riskLevel: overallRisk,
      riskScore: totalRiskScore,
      primaryRiskFactors: allRiskFactors,
      exerciseRestrictions,
      recommendedIntensity,
      medicalClearanceRequired: overallRisk === 'very_high' || overallRisk === 'high',
      supervisionRequired: overallRisk === 'very_high'
    };
    
    return {
      classification,
      weighting,
      recommendations
    };
  }
  
  /**
   * 수영 특화 위험도 평가
   * 수중 운동의 특성을 고려한 추가 평가
   */
  static assessSwimmingSpecificRisks(factors: MedicalRiskFactors): {
    swimmingRestrictions: string[];
    swimmingBenefits: string[];
    specialConsiderations: string[];
  } {
    const restrictions: string[] = [];
    const benefits: string[] = [];
    const considerations: string[] = [];
    
    // 수영 제한사항 평가
    if (factors.systolicBP >= 180 || factors.diastolicBP >= 110) {
      restrictions.push('중증 고혈압으로 인한 수영 제한');
      considerations.push('혈압 안정화 후 수영 시작');
    }
    
    if (factors.medicalConditions.some(c => c.includes('부정맥'))) {
      restrictions.push('부정맥 환자 - 수영 중 심박수 모니터링 필수');
      considerations.push('응급상황 대비 안전요원 배치');
    }
    
    // 수영의 이점
    if (factors.bmi >= 30) {
      benefits.push('관절 부담 최소화로 안전한 체중 감량');
      benefits.push('부력으로 인한 관절 보호 효과');
    }
    
    if (factors.age >= 65) {
      benefits.push('저충격 운동으로 노인에게 적합');
      benefits.push('전신 근력 강화 및 심폐기능 향상');
    }
    
    if (factors.medicalConditions.some(c => c.includes('관절염'))) {
      benefits.push('관절염 환자에게 권장되는 운동');
      benefits.push('관절 가동범위 개선 효과');
    }
    
    // 특별 고려사항
    if (factors.bloodSugar >= 126) {
      considerations.push('당뇨병 환자 - 운동 전후 혈당 측정');
      considerations.push('저혈당 예방을 위한 간식 준비');
    }
    
    return {
      swimmingRestrictions: restrictions,
      swimmingBenefits: benefits,
      specialConsiderations: considerations
    };
  }
}

