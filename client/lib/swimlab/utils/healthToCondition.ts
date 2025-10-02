/**
 * 🏥 SwimLab - 건강정보 → 컨디션 자동 변환
 * 
 * 📋 **파일 목적**
 * - User의 건강 프로필을 분석하여 자동으로 컨디션 ID 생성
 * - 나이, 만성질환, BMI, 알레르기 등을 컨디션으로 매핑
 * - 일관된 변환 규칙 적용
 */

interface UserHealthProfile {
  age?: number;
  height?: number;
  weight?: number;
  bmi?: number;
  chronicConditions?: string[];
  allergies?: string[];
  medications?: string[];
}

/**
 * 건강정보를 컨디션 ID 배열로 변환
 */
export function convertHealthToConditions(healthProfile: UserHealthProfile): {
  auto: string[];      // 자동 변환된 것 (수정 불가)
  suggestions: string[]; // 제안 (선택 가능)
} {
  const auto: string[] = [];
  const suggestions: string[] = [];

  if (!healthProfile) {
    return { auto: [], suggestions: [] };
  }

  // ===== 나이 기반 =====
  if (healthProfile.age) {
    const age = healthProfile.age;
    
    if (age >= 75) {
      auto.push('senior_75plus');
      suggestions.push('balance_issues', 'vision_impairment');
    } else if (age >= 65) {
      auto.push('senior_65plus');
      suggestions.push('joint_stiffness', 'reduced_endurance');
    } else if (age < 18 && age >= 13) {
      auto.push('youth_adolescent');
      suggestions.push('growth_plate_sensitivity');
    } else if (age < 13) {
      auto.push('child');
      suggestions.push('attention_span_short');
    }
  }

  // ===== BMI 기반 =====
  if (healthProfile.bmi) {
    const bmi = healthProfile.bmi;
    
    if (bmi >= 30) {
      auto.push('obesity');
    } else if (bmi >= 25) {
      auto.push('overweight');
    } else if (bmi < 18.5) {
      auto.push('underweight');
    }
  } else if (healthProfile.height && healthProfile.weight) {
    // BMI 계산
    const heightM = healthProfile.height / 100;
    const bmi = healthProfile.weight / (heightM * heightM);
    
    if (bmi >= 30) auto.push('obesity');
    else if (bmi >= 25) auto.push('overweight');
    else if (bmi < 18.5) auto.push('underweight');
  }

  // ===== 만성 질환 기반 =====
  const chronic = healthProfile.chronicConditions || [];
  
  chronic.forEach(condition => {
    const lower = condition.toLowerCase();
    
    // 당뇨
    if (lower.includes('diabetes') || lower.includes('당뇨')) {
      auto.push('diabetes_type2');
    }
    
    // 고혈압
    if (lower.includes('hypertension') || lower.includes('고혈압')) {
      auto.push('hypertension_controlled');
    }
    
    // 천식
    if (lower.includes('asthma') || lower.includes('천식')) {
      auto.push('asthma_exercise');
    }
    
    // 관절염
    if (lower.includes('arthritis') || lower.includes('관절염')) {
      auto.push('arthritis_general');
    }
    
    // 어깨 관련
    if (lower.includes('shoulder') || lower.includes('어깨')) {
      if (lower.includes('impingement') || lower.includes('충돌')) {
        auto.push('shoulder_impingement');
      } else if (lower.includes('rotator') || lower.includes('회전근')) {
        auto.push('rotator_cuff_irritation');
      } else if (lower.includes('frozen') || lower.includes('오십견')) {
        auto.push('frozen_shoulder');
      } else {
        auto.push('shoulder_pain_general');
      }
    }
    
    // 무릎 관련
    if (lower.includes('knee') || lower.includes('무릎')) {
      if (lower.includes('pfps') || lower.includes('슬개')) {
        auto.push('patellofemoral_pain');
      } else if (lower.includes('meniscus') || lower.includes('반월')) {
        auto.push('meniscus_injury');
      } else {
        auto.push('knee_pain_general');
      }
    }
    
    // 허리 관련
    if (lower.includes('back') || lower.includes('허리') || lower.includes('요추')) {
      if (lower.includes('disc') || lower.includes('디스크')) {
        auto.push('disc_herniation');
      } else if (lower.includes('stenosis') || lower.includes('협착')) {
        auto.push('spinal_stenosis');
      } else {
        auto.push('back_pain_general');
      }
    }
  });

  // ===== 알레르기 기반 =====
  const allergies = healthProfile.allergies || [];
  
  allergies.forEach(allergy => {
    const lower = allergy.toLowerCase();
    
    if (lower.includes('chlorine') || lower.includes('염소')) {
      auto.push('chlorine_sensitivity');
    }
    
    if (lower.includes('latex') || lower.includes('라텍스')) {
      suggestions.push('latex_free_equipment');
    }
  });

  // 중복 제거
  return {
    auto: Array.from(new Set(auto)),
    suggestions: Array.from(new Set(suggestions))
  };
}

/**
 * 컨디션을 자동/수동으로 분류
 */
export function categorizeConditions(
  healthProfile: UserHealthProfile,
  currentConditions: string[]
): {
  permanent: string[];  // 건강정보 기반 (회색 표시, 수정 불가)
  temporary: string[];  // 당일 컨디션 (흰색 표시, 자유 선택)
} {
  const { auto } = convertHealthToConditions(healthProfile);
  
  return {
    permanent: currentConditions.filter(id => auto.includes(id)),
    temporary: currentConditions.filter(id => !auto.includes(id))
  };
}

