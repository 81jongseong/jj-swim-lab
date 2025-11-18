/**
 * 🏥 건강 데이터 OCR 추출 유틸리티
 * 
 * PDF/이미지에서 건강 정보를 자동으로 인식하여 추출합니다.
 * 
 * 인식 항목:
 * - 혈압 (수축기/이완기)
 * - 체중
 * - 심박수
 * - 근육량
 * - 체지방률
 * - 콜레스테롤 (총, LDL, HDL, 중성지방)
 * - 당뇨/혈당 (공복, 식후, 당화혈색소)
 * - BMI
 * - 키
 */

export interface ExtractedHealthData {
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
  };
  weight?: number;
  heartRate?: number;
  muscleMass?: number; // kg
  bodyFatPercentage?: number; // %
  cholesterol?: {
    total?: number; // mg/dL
    ldl?: number; // mg/dL
    hdl?: number; // mg/dL
    triglycerides?: number; // mg/dL
  };
  bloodSugar?: {
    fasting?: number; // mg/dL
    postprandial?: number; // mg/dL
    hba1c?: number; // %
  };
  bmi?: number;
  height?: number; // cm
  date?: string; // 측정 날짜
}

/**
 * OCR 텍스트에서 건강 정보를 추출합니다.
 */
export function extractHealthDataFromText(text: string): ExtractedHealthData {
  const result: ExtractedHealthData = {};
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();

  // 날짜 추출
  const datePatterns = [
    /(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/g,
    /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/g,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[0].replace(/[년월일]/g, '').replace(/[.\-\/]/g, '-');
      result.date = dateStr;
      break;
    }
  }

  // 혈압 추출 (120/80, 수축기 120 이완기 80 등)
  const bloodPressurePatterns = [
    /(?:혈압|blood\s*pressure|bp)[\s:]*(\d{2,3})\s*[\/\-]\s*(\d{2,3})/gi,
    /(?:수축기|systolic)[\s:]*(\d{2,3})[^\d]*(?:이완기|diastolic)[\s:]*(\d{2,3})/gi,
    /(\d{2,3})\s*[\/\-]\s*(\d{2,3})\s*(?:mmhg|mmHg)/gi,
  ];
  for (const pattern of bloodPressurePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d{2,3}/g);
      if (numbers && numbers.length >= 2) {
        const systolic = parseInt(numbers[0]);
        const diastolic = parseInt(numbers[1]);
        if (systolic >= 80 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
          result.bloodPressure = { systolic, diastolic };
          break;
        }
      }
    }
  }

  // 체중 추출 (70kg, 70.5kg, 체중 70 등)
  const weightPatterns = [
    /(?:체중|weight|wt)[\s:]*(\d+\.?\d*)\s*(?:kg|킬로그램)/gi,
    /(\d+\.?\d*)\s*kg/gi,
  ];
  for (const pattern of weightPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+\.?\d*/g);
      if (numbers) {
        const weight = parseFloat(numbers[0]);
        if (weight >= 20 && weight <= 300) {
          result.weight = weight;
          break;
        }
      }
    }
  }

  // 심박수 추출 (75bpm, 심박수 75 등)
  const heartRatePatterns = [
    /(?:심박수|heart\s*rate|hr|pulse)[\s:]*(\d{2,3})\s*(?:bpm|회\/분)?/gi,
    /(\d{2,3})\s*bpm/gi,
  ];
  for (const pattern of heartRatePatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d{2,3}/g);
      if (numbers) {
        const hr = parseInt(numbers[0]);
        if (hr >= 40 && hr <= 200) {
          result.heartRate = hr;
          break;
        }
      }
    }
  }

  // 근육량 추출 (근육량 50kg, muscle mass 50 등)
  const muscleMassPatterns = [
    /(?:근육량|muscle\s*mass|근육)[\s:]*(\d+\.?\d*)\s*(?:kg|킬로그램)?/gi,
  ];
  for (const pattern of muscleMassPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+\.?\d*/g);
      if (numbers) {
        const muscle = parseFloat(numbers[0]);
        if (muscle >= 10 && muscle <= 150) {
          result.muscleMass = muscle;
          break;
        }
      }
    }
  }

  // 체지방률 추출 (체지방 20%, body fat 20% 등)
  const bodyFatPatterns = [
    /(?:체지방|body\s*fat|체지방률)[\s:]*(\d+\.?\d*)\s*%/gi,
    /(\d+\.?\d*)\s*%\s*(?:체지방|body\s*fat)/gi,
  ];
  for (const pattern of bodyFatPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+\.?\d*/g);
      if (numbers) {
        const bodyFat = parseFloat(numbers[0]);
        if (bodyFat >= 3 && bodyFat <= 50) {
          result.bodyFatPercentage = bodyFat;
          break;
        }
      }
    }
  }

  // 콜레스테롤 추출
  result.cholesterol = {};
  
  // 총 콜레스테롤
  const tcPatterns = [
    /(?:총\s*콜레스테롤|total\s*cholesterol|tc|콜레스테롤)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg|mg\/dl)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:총\s*콜레스테롤|total\s*cholesterol)/gi,
  ];
  for (const pattern of tcPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const total = parseInt(numbers[0]);
        if (total >= 100 && total <= 500) {
          result.cholesterol.total = total;
          break;
        }
      }
    }
  }

  // LDL 콜레스테롤
  const ldlPatterns = [
    /(?:ldl|나쁜\s*콜레스테롤|저밀도)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:ldl|나쁜\s*콜레스테롤)/gi,
  ];
  for (const pattern of ldlPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const ldl = parseInt(numbers[0]);
        if (ldl >= 50 && ldl <= 300) {
          result.cholesterol.ldl = ldl;
          break;
        }
      }
    }
  }

  // HDL 콜레스테롤
  const hdlPatterns = [
    /(?:hdl|좋은\s*콜레스테롤|고밀도)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:hdl|좋은\s*콜레스테롤)/gi,
  ];
  for (const pattern of hdlPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const hdl = parseInt(numbers[0]);
        if (hdl >= 20 && hdl <= 150) {
          result.cholesterol.hdl = hdl;
          break;
        }
      }
    }
  }

  // 중성지방
  const tgPatterns = [
    /(?:중성지방|triglycerides|tg|트리글리세라이드)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:중성지방|triglycerides)/gi,
  ];
  for (const pattern of tgPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const tg = parseInt(numbers[0]);
        if (tg >= 30 && tg <= 500) {
          result.cholesterol.triglycerides = tg;
          break;
        }
      }
    }
  }

  // 당뇨/혈당 추출
  result.bloodSugar = {};
  
  // 공복 혈당
  const fastingPatterns = [
    /(?:공복\s*혈당|fasting\s*blood\s*sugar|fbs|공복\s*혈당수치)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:공복\s*혈당|fasting)/gi,
  ];
  for (const pattern of fastingPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const fasting = parseInt(numbers[0]);
        if (fasting >= 50 && fasting <= 300) {
          result.bloodSugar.fasting = fasting;
          break;
        }
      }
    }
  }

  // 식후 혈당
  const postprandialPatterns = [
    /(?:식후\s*혈당|postprandial|ppbs|식후\s*혈당수치)[\s:]*(\d+)\s*(?:mg\/dl|mg\/dL|mg)?/gi,
    /(\d+)\s*(?:mg\/dl|mg\/dL)\s*(?:식후\s*혈당|postprandial)/gi,
  ];
  for (const pattern of postprandialPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+/g);
      if (numbers) {
        const postprandial = parseInt(numbers[0]);
        if (postprandial >= 70 && postprandial <= 400) {
          result.bloodSugar.postprandial = postprandial;
          break;
        }
      }
    }
  }

  // 당화혈색소
  const hba1cPatterns = [
    /(?:당화혈색소|hba1c|hba1|hba-1c)[\s:]*(\d+\.?\d*)\s*%/gi,
    /(\d+\.?\d*)\s*%\s*(?:당화혈색소|hba1c)/gi,
  ];
  for (const pattern of hba1cPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d+\.?\d*/g);
      if (numbers) {
        const hba1c = parseFloat(numbers[0]);
        if (hba1c >= 4 && hba1c <= 15) {
          result.bloodSugar.hba1c = hba1c;
          break;
        }
      }
    }
  }

  // BMI 추출
  const bmiMatch = normalizedText.match(/(?:bmi|체질량지수)[\s:]*(\d+\.?\d*)/gi);
  if (bmiMatch) {
    const numbers = bmiMatch[0].match(/\d+\.?\d*/g);
    if (numbers) {
      const bmi = parseFloat(numbers[0]);
      if (bmi >= 10 && bmi <= 50) {
        result.bmi = bmi;
      }
    }
  }

  // 키 추출 (170cm, 키 170 등)
  const heightPatterns = [
    /(?:키|height|신장)[\s:]*(\d{3})\s*(?:cm|센티미터)?/gi,
    /(\d{3})\s*cm/gi,
  ];
  for (const pattern of heightPatterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      const numbers = match[0].match(/\d{3}/g);
      if (numbers) {
        const height = parseInt(numbers[0]);
        if (height >= 100 && height <= 250) {
          result.height = height;
          break;
        }
      }
    }
  }

  return result;
}

