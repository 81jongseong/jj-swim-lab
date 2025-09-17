/**
 * 의학적 운동 처방 API 라우트
 * 건강 상태 기반 안전한 운동 추천 시스템
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
  MedicalExercisePrescriptionService, 
  IMedicalExercisePrescriptionRequest 
} from '../services/medicalExercisePrescriptionService';
import { HealthAssessment, ChronicCondition, HealthRiskLevel } from '../models/HealthAssessment';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * POST /api/medical-exercise-prescription/assessment
 * 건강 상태 평가 등록
 */
router.post('/assessment', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      basicHealth,
      vitalSigns,
      chronicConditions,
      medicalHistory,
      currentSymptoms,
      physicalLimitations,
      emergencyContact,
      medicalTeam
    } = req.body;

    // 입력값 검증
    if (!basicHealth || !emergencyContact) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['basicHealth', 'emergencyContact']
      });
    }

    // 기존 활성 평가 비활성화
    await HealthAssessment.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isActive: true },
      { isActive: false }
    );

    // 위험도 계산
    const riskAssessment = calculateRiskAssessment(basicHealth, chronicConditions || [], vitalSigns || []);

    // 새로운 건강 평가 생성
    const healthAssessment = new HealthAssessment({
      userId: new mongoose.Types.ObjectId(userId),
      assessmentDate: new Date(),
      basicHealth: {
        age: parseInt(basicHealth.age) || 25,
        gender: basicHealth.gender || 'other',
        height: parseFloat(basicHealth.height) || 170,
        weight: parseFloat(basicHealth.weight) || 70,
        bmi: 0, // 자동 계산됨
        smokingStatus: basicHealth.smokingStatus || 'never',
        alcoholConsumption: basicHealth.alcoholConsumption || 'none',
        sleepHours: parseFloat(basicHealth.sleepHours) || 8,
        stressLevel: parseInt(basicHealth.stressLevel) || 5,
        activityLevel: basicHealth.activityLevel || 'lightly_active'
      },
      vitalSigns: (vitalSigns || []).map((vs: any) => ({
        date: new Date(vs.date),
        systolicBP: parseInt(vs.systolicBP) || 120,
        diastolicBP: parseInt(vs.diastolicBP) || 80,
        restingHR: parseInt(vs.restingHR) || 70,
        bloodGlucose: vs.bloodGlucose ? parseFloat(vs.bloodGlucose) : undefined,
        weight: parseFloat(vs.weight) || basicHealth.weight,
        bodyFat: vs.bodyFat ? parseFloat(vs.bodyFat) : undefined,
        temperature: vs.temperature ? parseFloat(vs.temperature) : undefined,
        oxygenSaturation: vs.oxygenSaturation ? parseFloat(vs.oxygenSaturation) : undefined,
        notes: vs.notes || ''
      })),
      chronicConditions: (chronicConditions || []).map((cc: any) => ({
        condition: cc.condition,
        diagnosedDate: new Date(cc.diagnosedDate),
        severity: cc.severity || 'mild',
        controlled: cc.controlled !== undefined ? cc.controlled : true,
        lastCheckup: new Date(cc.lastCheckup),
        doctorNotes: cc.doctorNotes || '',
        medications: (cc.medications || []).map((med: any) => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timing: med.timing || [],
          sideEffects: med.sideEffects || [],
          exerciseImpact: med.exerciseImpact || 'none',
          precautions: med.precautions || []
        }))
      })),
      medicalHistory: (medicalHistory || []).map((mh: any) => ({
        condition: mh.condition,
        date: new Date(mh.date),
        severity: mh.severity || 'mild',
        treatment: mh.treatment,
        currentStatus: mh.currentStatus || 'resolved',
        restrictions: mh.restrictions || []
      })),
      currentSymptoms: (currentSymptoms || []).map((cs: any) => ({
        symptom: cs.symptom,
        severity: parseInt(cs.severity) || 5,
        frequency: cs.frequency || 'sometimes',
        triggers: cs.triggers || [],
        duration: cs.duration || ''
      })),
      physicalLimitations: (physicalLimitations || []).map((pl: any) => ({
        bodyPart: pl.bodyPart,
        limitation: pl.limitation,
        severity: pl.severity || 'mild',
        cause: pl.cause,
        recommendations: pl.recommendations || []
      })),
      exerciseRestrictions: req.body.exerciseRestrictions || [],
      emergencyContact: {
        name: emergencyContact.name,
        relationship: emergencyContact.relationship,
        phone: emergencyContact.phone,
        email: emergencyContact.email
      },
      medicalTeam: (medicalTeam || []).map((mt: any) => ({
        doctorName: mt.doctorName,
        specialty: mt.specialty,
        hospital: mt.hospital,
        phone: mt.phone,
        email: mt.email,
        lastConsultation: new Date(mt.lastConsultation),
        nextAppointment: mt.nextAppointment ? new Date(mt.nextAppointment) : undefined
      })),
      riskAssessment,
      exerciseRecommendations: [], // 별도 API로 생성
      monitoringPlan: {
        vitalSignsFrequency: riskAssessment.overallRisk === HealthRiskLevel.HIGH ? 'weekly' : 'monthly',
        medicalCheckupFrequency: riskAssessment.overallRisk === HealthRiskLevel.HIGH ? 'quarterly' : 'biannually',
        parametersToMonitor: getMonitoringParameters(chronicConditions || []),
        alertThresholds: getAlertThresholds(chronicConditions || []),
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1개월 후
      },
      assessedBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      version: 1
    });

    const savedAssessment = await healthAssessment.save();

    res.status(201).json({
      message: '건강 상태 평가가 성공적으로 등록되었습니다.',
      data: savedAssessment
    });

  } catch (error) {
    console.error('건강 평가 등록 오류:', error);
    res.status(500).json({ 
      error: '건강 평가 등록에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }

  // 위험도 계산 헬퍼 함수
  function calculateRiskAssessment(basicHealth: any, chronicConditions: any[], vitalSigns: any[]) {
    let cardiovascularRisk = 0;
    let metabolicRisk = 0;
    let musculoskeletalRisk = 0;
    let respiratoryRisk = 0;
    const riskFactors = [];

    // 기본 위험 요인
    if (basicHealth.age >= 65) {
      cardiovascularRisk += 15;
      riskFactors.push({ factor: '고령 (65세 이상)', severity: 7, modifiable: false });
    } else if (basicHealth.age >= 45) {
      cardiovascularRisk += 10;
      riskFactors.push({ factor: '중년 (45세 이상)', severity: 5, modifiable: false });
    }

    // BMI 계산 및 위험도
    const height = parseFloat(basicHealth.height) / 100;
    const weight = parseFloat(basicHealth.weight);
    const bmi = weight / (height * height);

    if (bmi >= 35) {
      metabolicRisk += 25;
      cardiovascularRisk += 15;
      riskFactors.push({ factor: '고도비만 (BMI ≥35)', severity: 8, modifiable: true });
    } else if (bmi >= 30) {
      metabolicRisk += 20;
      cardiovascularRisk += 10;
      riskFactors.push({ factor: '비만 (BMI 30-34.9)', severity: 6, modifiable: true });
    } else if (bmi >= 25) {
      metabolicRisk += 10;
      riskFactors.push({ factor: '과체중 (BMI 25-29.9)', severity: 4, modifiable: true });
    }

    // 흡연
    if (basicHealth.smokingStatus === 'current') {
      cardiovascularRisk += 25;
      respiratoryRisk += 20;
      riskFactors.push({ factor: '현재 흡연', severity: 9, modifiable: true });
    } else if (basicHealth.smokingStatus === 'former') {
      cardiovascularRisk += 10;
      riskFactors.push({ factor: '과거 흡연', severity: 4, modifiable: false });
    }

    // 만성 질환별 위험도
    chronicConditions.forEach(condition => {
      switch (condition.condition) {
        case ChronicCondition.HYPERTENSION:
          cardiovascularRisk += condition.controlled ? 15 : 30;
          riskFactors.push({ 
            factor: `고혈압 (${condition.controlled ? '조절됨' : '조절안됨'})`, 
            severity: condition.controlled ? 6 : 9, 
            modifiable: true 
          });
          break;
        case ChronicCondition.DIABETES_TYPE2:
          metabolicRisk += condition.controlled ? 20 : 35;
          cardiovascularRisk += 15;
          riskFactors.push({ 
            factor: `제2형 당뇨병 (${condition.controlled ? '조절됨' : '조절안됨'})`, 
            severity: condition.controlled ? 7 : 9, 
            modifiable: true 
          });
          break;
        case ChronicCondition.HEART_DISEASE:
          cardiovascularRisk += 40;
          riskFactors.push({ factor: '심장질환', severity: 10, modifiable: false });
          break;
        case ChronicCondition.ASTHMA:
          respiratoryRisk += condition.controlled ? 15 : 25;
          riskFactors.push({ 
            factor: `천식 (${condition.controlled ? '조절됨' : '조절안됨'})`, 
            severity: condition.controlled ? 5 : 8, 
            modifiable: true 
          });
          break;
        case ChronicCondition.ARTHRITIS:
          musculoskeletalRisk += 20;
          riskFactors.push({ factor: '관절염', severity: 6, modifiable: true });
          break;
      }
    });

    // 생체신호 기반 위험도 (최신 데이터)
    if (vitalSigns.length > 0) {
      const latest = vitalSigns[vitalSigns.length - 1];
      
      // 혈압
      if (latest.systolicBP >= 180 || latest.diastolicBP >= 110) {
        cardiovascularRisk += 30;
        riskFactors.push({ factor: '고혈압 위기', severity: 10, modifiable: true });
      } else if (latest.systolicBP >= 160 || latest.diastolicBP >= 100) {
        cardiovascularRisk += 20;
        riskFactors.push({ factor: '고혈압 2단계', severity: 8, modifiable: true });
      }

      // 혈당
      if (latest.bloodGlucose && latest.bloodGlucose >= 200) {
        metabolicRisk += 25;
        riskFactors.push({ factor: '혈당 매우 높음', severity: 9, modifiable: true });
      }
    }

    // 종합 위험도 계산
    const avgRisk = (cardiovascularRisk + metabolicRisk + musculoskeletalRisk + respiratoryRisk) / 4;
    let overallRisk: HealthRiskLevel;

    if (avgRisk >= 70 || cardiovascularRisk >= 80) {
      overallRisk = HealthRiskLevel.CRITICAL;
    } else if (avgRisk >= 55 || cardiovascularRisk >= 65) {
      overallRisk = HealthRiskLevel.VERY_HIGH;
    } else if (avgRisk >= 40 || cardiovascularRisk >= 50) {
      overallRisk = HealthRiskLevel.HIGH;
    } else if (avgRisk >= 25) {
      overallRisk = HealthRiskLevel.MODERATE;
    } else if (avgRisk >= 15) {
      overallRisk = HealthRiskLevel.LOW;
    } else {
      overallRisk = HealthRiskLevel.VERY_LOW;
    }

    return {
      overallRisk,
      cardiovascularRisk: Math.min(cardiovascularRisk, 100),
      metabolicRisk: Math.min(metabolicRisk, 100),
      musculoskeletalRisk: Math.min(musculoskeletalRisk, 100),
      respiratoryRisk: Math.min(respiratoryRisk, 100),
      riskFactors,
      clearanceRequired: overallRisk === HealthRiskLevel.HIGH || 
                        overallRisk === HealthRiskLevel.VERY_HIGH ||
                        overallRisk === HealthRiskLevel.CRITICAL,
      clearanceObtained: false
    };
  }

  // 모니터링 파라미터 헬퍼 함수
  function getMonitoringParameters(chronicConditions: any[]) {
    const parameters = ['체중', '활동 수준'];
    
    chronicConditions.forEach(condition => {
      switch (condition.condition) {
        case ChronicCondition.HYPERTENSION:
          parameters.push('혈압', '심박수');
          break;
        case ChronicCondition.DIABETES_TYPE1:
        case ChronicCondition.DIABETES_TYPE2:
          parameters.push('혈당', '체중');
          break;
        case ChronicCondition.HEART_DISEASE:
          parameters.push('심박수', '운동능력');
          break;
        case ChronicCondition.ASTHMA:
          parameters.push('호흡기능', '증상 빈도');
          break;
      }
    });

    return [...new Set(parameters)];
  }

  // 알림 임계값 헬퍼 함수
  function getAlertThresholds(chronicConditions: any[]) {
    const thresholds = [];
    
    chronicConditions.forEach(condition => {
      switch (condition.condition) {
        case ChronicCondition.HYPERTENSION:
          thresholds.push({
            parameter: '수축기혈압',
            maxValue: 180,
            action: '즉시 운동 중단 및 의료진 연락'
          });
          thresholds.push({
            parameter: '이완기혈압',
            maxValue: 110,
            action: '즉시 운동 중단 및 의료진 연락'
          });
          break;
        case ChronicCondition.DIABETES_TYPE2:
          thresholds.push({
            parameter: '혈당',
            minValue: 70,
            maxValue: 250,
            action: '혈당 조절 후 운동 재개'
          });
          break;
        case ChronicCondition.HEART_DISEASE:
          thresholds.push({
            parameter: '심박수',
            maxValue: 150,
            action: '운동 강도 즉시 감소'
          });
          break;
      }
    });

    return thresholds;
  }
});

/**
 * POST /api/medical-exercise-prescription/prescription
 * 의학적 운동 처방 생성
 */
router.post('/prescription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      healthAssessmentId,
      goals,
      preferences,
      environmentalFactors
    } = req.body;

    // 입력값 검증
    if (!healthAssessmentId || !goals || !preferences) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['healthAssessmentId', 'goals', 'preferences']
      });
    }

    // 건강 평가 존재 및 권한 확인
    const healthAssessment = await HealthAssessment.findById(healthAssessmentId);
    if (!healthAssessment) {
      return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
    }

    if (healthAssessment.userId.toString() !== userId && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 운동 처방 요청 객체 생성
    const prescriptionRequest: IMedicalExercisePrescriptionRequest = {
      userId: new mongoose.Types.ObjectId(userId),
      healthAssessmentId: new mongoose.Types.ObjectId(healthAssessmentId),
      goals: goals,
      preferences: {
        exerciseTypes: preferences.exerciseTypes || [],
        timeAvailable: parseInt(preferences.timeAvailable) || 30,
        daysPerWeek: parseInt(preferences.daysPerWeek) || 3,
        intensity: preferences.intensity || 'moderate'
      },
      environmentalFactors: {
        poolAvailable: environmentalFactors?.poolAvailable || false,
        gymAccess: environmentalFactors?.gymAccess || false,
        homeEquipment: environmentalFactors?.homeEquipment || [],
        weatherRestrictions: environmentalFactors?.weatherRestrictions || []
      }
    };

    // 의학적 운동 처방 생성
    const prescription = await MedicalExercisePrescriptionService.createMedicalPrescription(
      prescriptionRequest
    );

    res.status(201).json({
      message: '의학적 운동 처방이 성공적으로 생성되었습니다.',
      data: prescription
    });

  } catch (error) {
    console.error('운동 처방 생성 오류:', error);
    res.status(500).json({ 
      error: '운동 처방 생성에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/medical-exercise-prescription/clearance/:assessmentId
 * 운동 허가 상태 확인
 */
router.get('/clearance/:assessmentId', authMiddleware, async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
    }

    // 권한 확인
    const assessment = await HealthAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
    }

    if (assessment.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 운동 허가 확인
    const clearanceResult = await MedicalExercisePrescriptionService.checkExerciseClearance(
      new mongoose.Types.ObjectId(assessmentId)
    );

    res.json({
      message: '운동 허가 상태를 성공적으로 확인했습니다.',
      data: clearanceResult
    });

  } catch (error) {
    console.error('운동 허가 확인 오류:', error);
    res.status(500).json({ 
      error: '운동 허가 확인에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/medical-exercise-prescription/user/:userId/assessments
 * 사용자별 건강 평가 목록 조회
 */
router.get('/user/:userId/assessments', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?._id;

    // 본인 또는 관리자만 조회 가능
    if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const assessments = await MedicalExercisePrescriptionService.getUserHealthAssessments(
      new mongoose.Types.ObjectId(userId)
    );

    res.json({
      message: '건강 평가 목록을 성공적으로 조회했습니다.',
      data: assessments
    });

  } catch (error) {
    console.error('건강 평가 목록 조회 오류:', error);
    res.status(500).json({ 
      error: '건강 평가 목록 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/medical-exercise-prescription/high-risk-patients
 * 고위험군 환자 목록 조회 (의료진용)
 */
router.get('/high-risk-patients', authMiddleware, async (req, res) => {
  try {
    // 의료진 권한 확인
    if (req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin' && 
        req.user?.userType !== 'instructor') {
      return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
    }

    const highRiskPatients = await MedicalExercisePrescriptionService.getHighRiskPatients();

    res.json({
      message: '고위험군 환자 목록을 성공적으로 조회했습니다.',
      data: highRiskPatients
    });

  } catch (error) {
    console.error('고위험군 조회 오류:', error);
    res.status(500).json({ 
      error: '고위험군 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/medical-exercise-prescription/pending-clearances
 * 의료진 승인 대기 목록 조회
 */
router.get('/pending-clearances', authMiddleware, async (req, res) => {
  try {
    // 의료진 권한 확인
    if (req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin' && 
        req.user?.userType !== 'instructor') {
      return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
    }

    const pendingClearances = await MedicalExercisePrescriptionService.getPendingClearances();

    res.json({
      message: '승인 대기 목록을 성공적으로 조회했습니다.',
      data: pendingClearances
    });

  } catch (error) {
    console.error('승인 대기 목록 조회 오류:', error);
    res.status(500).json({ 
      error: '승인 대기 목록 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * PUT /api/medical-exercise-prescription/:assessmentId/approve
 * 의료진 승인 처리
 */
router.put('/:assessmentId/approve', authMiddleware, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { approved, notes } = req.body;

    // 의료진 권한 확인
    if (req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin' && 
        req.user?.userType !== 'instructor') {
      return res.status(403).json({ error: '의료진 권한이 필요합니다.' });
    }

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
    }

    const assessment = await HealthAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
    }

    // 승인 처리
    assessment.riskAssessment.clearanceObtained = approved;
    if (approved) {
      assessment.riskAssessment.clearanceDate = new Date();
      assessment.riskAssessment.clearanceDoctor = req.user?.name || '의료진';
    }

    assessment.reviewedBy = new mongoose.Types.ObjectId(req.user?._id);
    if (approved) {
      assessment.approvedBy = new mongoose.Types.ObjectId(req.user?._id);
    }

    // 승인 노트 추가 (의료진 팀에 추가)
    if (notes) {
      assessment.medicalTeam.push({
        doctorName: req.user?.name || '의료진',
        specialty: '운동의학',
        hospital: '수영장',
        phone: '000-0000-0000',
        email: req.user?.email,
        lastConsultation: new Date(),
        nextAppointment: undefined
      });
    }

    await assessment.save();

    res.json({
      message: `건강 평가가 성공적으로 ${approved ? '승인' : '거부'}되었습니다.`,
      data: assessment
    });

  } catch (error) {
    console.error('승인 처리 오류:', error);
    res.status(500).json({ 
      error: '승인 처리에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/medical-exercise-prescription/statistics/health
 * 건강 통계 조회 (관리자용)
 */
router.get('/statistics/health', authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    const healthStatistics = await (HealthAssessment as any).getHealthStatistics();

    // 추가 통계 계산
    const totalAssessments = await HealthAssessment.countDocuments({ isActive: true });
    const highRiskCount = await HealthAssessment.countDocuments({
      isActive: true,
      'riskAssessment.overallRisk': { $in: [HealthRiskLevel.HIGH, HealthRiskLevel.VERY_HIGH, HealthRiskLevel.CRITICAL] }
    });
    const pendingApprovalCount = await HealthAssessment.countDocuments({
      isActive: true,
      'riskAssessment.clearanceRequired': true,
      'riskAssessment.clearanceObtained': false
    });

    res.json({
      message: '건강 통계를 성공적으로 조회했습니다.',
      data: {
        overview: {
          totalAssessments,
          highRiskCount,
          pendingApprovalCount,
          highRiskPercentage: (highRiskCount / totalAssessments) * 100
        },
        riskLevelDistribution: healthStatistics
      }
    });

  } catch (error) {
    console.error('건강 통계 조회 오류:', error);
    res.status(500).json({ 
      error: '건강 통계 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * POST /api/medical-exercise-prescription/:assessmentId/vital-signs
 * 생체신호 추가
 */
router.post('/:assessmentId/vital-signs', authMiddleware, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const vitalSignsData = req.body;

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return res.status(400).json({ error: '유효하지 않은 평가 ID입니다.' });
    }

    const assessment = await HealthAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: '건강 평가를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (assessment.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 생체신호 추가
    assessment.vitalSigns.push({
      date: new Date(),
      systolicBP: parseInt(vitalSignsData.systolicBP) || 120,
      diastolicBP: parseInt(vitalSignsData.diastolicBP) || 80,
      restingHR: parseInt(vitalSignsData.restingHR) || 70,
      bloodGlucose: vitalSignsData.bloodGlucose ? parseFloat(vitalSignsData.bloodGlucose) : undefined,
      weight: parseFloat(vitalSignsData.weight) || assessment.basicHealth.weight,
      bodyFat: vitalSignsData.bodyFat ? parseFloat(vitalSignsData.bodyFat) : undefined,
      temperature: vitalSignsData.temperature ? parseFloat(vitalSignsData.temperature) : undefined,
      oxygenSaturation: vitalSignsData.oxygenSaturation ? parseFloat(vitalSignsData.oxygenSaturation) : undefined,
      notes: vitalSignsData.notes || ''
    });

    // 위험도 재계산
    const newRiskLevel = (assessment as any).recalculateRisk();
    if (newRiskLevel !== assessment.riskAssessment.overallRisk) {
      assessment.riskAssessment.overallRisk = newRiskLevel;
      
      // 위험도 상승시 승인 재검토 필요
      if (newRiskLevel === HealthRiskLevel.HIGH || 
          newRiskLevel === HealthRiskLevel.VERY_HIGH ||
          newRiskLevel === HealthRiskLevel.CRITICAL) {
        assessment.riskAssessment.clearanceRequired = true;
        assessment.riskAssessment.clearanceObtained = false;
      }
    }

    await assessment.save();

    res.json({
      message: '생체신호가 성공적으로 추가되었습니다.',
      data: {
        latestVitalSigns: assessment.vitalSigns[assessment.vitalSigns.length - 1],
        riskLevel: assessment.riskAssessment.overallRisk,
        clearanceRequired: assessment.riskAssessment.clearanceRequired
      }
    });

  } catch (error) {
    console.error('생체신호 추가 오류:', error);
    res.status(500).json({ 
      error: '생체신호 추가에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;
