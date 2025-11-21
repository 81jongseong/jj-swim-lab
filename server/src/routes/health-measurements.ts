/**
 * 🏥 JJ Swim Lab - 건강 측정 데이터 API 라우트
 * 
 * 📋 **API 목적**
 * - 건강 측정 데이터의 CRUD 작업을 처리하는 API 엔드포인트
 * - 개인정보 공개 설정 관리
 * - 센터/최고관리자 통계용 데이터 제공 (비공개 정보 제외)
 * - 강사/센터관리자 조회 시 비공개 정보 필터링
 * 
 * 🗄️ **데이터 연동**
 * - User 모델의 healthProfile 및 healthHistory
 * - User 모델의 privacySettings
 * 
 * 📅 **생성일**: 2025-01-17
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * 건강 측정 데이터 저장
 * POST /api/health/measurements
 */
router.post('/measurements', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const { type, value, date, isPublic } = req.body;

    if (!type || value === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: '측정 항목, 측정값, 측정일은 필수입니다.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // healthHistory에 추가
    if (!user.studentInfo) {
      user.studentInfo = {};
    }
    if (!user.studentInfo.healthProfile) {
      user.studentInfo.healthProfile = {};
    }
    if (!user.studentInfo.healthProfile.healthHistory) {
      user.studentInfo.healthProfile.healthHistory = [];
    }

    const measurementDate = new Date(date);
    const healthHistoryEntry: any = {
      date: measurementDate,
      notes: `측정 항목: ${type}, 값: ${value}`
    };

    // 측정 항목에 따라 적절한 필드에 저장
    switch (type) {
      case 'weight':
        healthHistoryEntry.weight = parseFloat(value);
        if (user.studentInfo.healthProfile.height) {
          const heightInMeters = user.studentInfo.healthProfile.height / 100;
          healthHistoryEntry.bmi = parseFloat((parseFloat(value) / (heightInMeters * heightInMeters)).toFixed(1));
        }
        user.studentInfo.healthProfile.weight = parseFloat(value);
        break;
      case 'height':
        user.studentInfo.healthProfile.height = parseFloat(value);
        if (user.studentInfo.healthProfile.weight) {
          const heightInMeters = parseFloat(value) / 100;
          user.studentInfo.healthProfile.bmi = parseFloat((user.studentInfo.healthProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));
        }
        break;
      case 'bmi':
        healthHistoryEntry.bmi = parseFloat(value);
        user.studentInfo.healthProfile.bmi = parseFloat(value);
        break;
      case 'blood_pressure_systolic':
        if (!healthHistoryEntry.bloodPressure) {
          healthHistoryEntry.bloodPressure = {};
        }
        healthHistoryEntry.bloodPressure.systolic = parseFloat(value);
        if (!user.studentInfo.healthProfile.bloodPressure) {
          user.studentInfo.healthProfile.bloodPressure = {};
        }
        user.studentInfo.healthProfile.bloodPressure.systolic = parseFloat(value);
        user.studentInfo.healthProfile.bloodPressure.measuredAt = measurementDate;
        break;
      case 'blood_pressure_diastolic':
        if (!healthHistoryEntry.bloodPressure) {
          healthHistoryEntry.bloodPressure = {};
        }
        healthHistoryEntry.bloodPressure.diastolic = parseFloat(value);
        if (!user.studentInfo.healthProfile.bloodPressure) {
          user.studentInfo.healthProfile.bloodPressure = {};
        }
        user.studentInfo.healthProfile.bloodPressure.diastolic = parseFloat(value);
        user.studentInfo.healthProfile.bloodPressure.measuredAt = measurementDate;
        break;
      case 'cholesterol_total':
        if (!healthHistoryEntry.cholesterol) {
          healthHistoryEntry.cholesterol = {};
        }
        healthHistoryEntry.cholesterol.total = parseFloat(value);
        if (!user.studentInfo.healthProfile.cholesterol) {
          user.studentInfo.healthProfile.cholesterol = {};
        }
        user.studentInfo.healthProfile.cholesterol.total = parseFloat(value);
        user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
        break;
      case 'cholesterol_ldl':
        if (!healthHistoryEntry.cholesterol) {
          healthHistoryEntry.cholesterol = {};
        }
        healthHistoryEntry.cholesterol.ldl = parseFloat(value);
        if (!user.studentInfo.healthProfile.cholesterol) {
          user.studentInfo.healthProfile.cholesterol = {};
        }
        user.studentInfo.healthProfile.cholesterol.ldl = parseFloat(value);
        user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
        break;
      case 'cholesterol_hdl':
        if (!healthHistoryEntry.cholesterol) {
          healthHistoryEntry.cholesterol = {};
        }
        healthHistoryEntry.cholesterol.hdl = parseFloat(value);
        if (!user.studentInfo.healthProfile.cholesterol) {
          user.studentInfo.healthProfile.cholesterol = {};
        }
        user.studentInfo.healthProfile.cholesterol.hdl = parseFloat(value);
        user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
        break;
      case 'cholesterol_triglycerides':
        if (!healthHistoryEntry.cholesterol) {
          healthHistoryEntry.cholesterol = {};
        }
        healthHistoryEntry.cholesterol.triglycerides = parseFloat(value);
        if (!user.studentInfo.healthProfile.cholesterol) {
          user.studentInfo.healthProfile.cholesterol = {};
        }
        user.studentInfo.healthProfile.cholesterol.triglycerides = parseFloat(value);
        user.studentInfo.healthProfile.cholesterol.measuredAt = measurementDate;
        break;
      case 'blood_sugar_fasting':
        if (!healthHistoryEntry.bloodSugar) {
          healthHistoryEntry.bloodSugar = {};
        }
        healthHistoryEntry.bloodSugar.fasting = parseFloat(value);
        if (!user.studentInfo.healthProfile.bloodSugar) {
          user.studentInfo.healthProfile.bloodSugar = {};
        }
        user.studentInfo.healthProfile.bloodSugar.fasting = parseFloat(value);
        user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
        break;
      case 'blood_sugar_postprandial':
        if (!healthHistoryEntry.bloodSugar) {
          healthHistoryEntry.bloodSugar = {};
        }
        healthHistoryEntry.bloodSugar.postprandial = parseFloat(value);
        if (!user.studentInfo.healthProfile.bloodSugar) {
          user.studentInfo.healthProfile.bloodSugar = {};
        }
        user.studentInfo.healthProfile.bloodSugar.postprandial = parseFloat(value);
        user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
        break;
      case 'blood_sugar_hba1c':
        if (!healthHistoryEntry.bloodSugar) {
          healthHistoryEntry.bloodSugar = {};
        }
        healthHistoryEntry.bloodSugar.hba1c = parseFloat(value);
        if (!user.studentInfo.healthProfile.bloodSugar) {
          user.studentInfo.healthProfile.bloodSugar = {};
        }
        user.studentInfo.healthProfile.bloodSugar.hba1c = parseFloat(value);
        user.studentInfo.healthProfile.bloodSugar.measuredAt = measurementDate;
        break;
      case 'muscle_mass':
        if (!user.studentInfo.healthProfile.fitnessMetrics) {
          user.studentInfo.healthProfile.fitnessMetrics = {};
        }
        user.studentInfo.healthProfile.fitnessMetrics.muscleMass = parseFloat(value);
        user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
        break;
      case 'body_fat':
        if (!user.studentInfo.healthProfile.fitnessMetrics) {
          user.studentInfo.healthProfile.fitnessMetrics = {};
        }
        user.studentInfo.healthProfile.fitnessMetrics.bodyFatPercentage = parseFloat(value);
        user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
        break;
      case 'heart_rate':
        if (!user.studentInfo.healthProfile.fitnessMetrics) {
          user.studentInfo.healthProfile.fitnessMetrics = {};
        }
        user.studentInfo.healthProfile.fitnessMetrics.restingHeartRate = parseFloat(value);
        user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
        break;
      case 'max_heart_rate':
        if (!user.studentInfo.healthProfile.fitnessMetrics) {
          user.studentInfo.healthProfile.fitnessMetrics = {};
        }
        user.studentInfo.healthProfile.fitnessMetrics.maxHeartRate = parseFloat(value);
        user.studentInfo.healthProfile.fitnessMetrics.measuredAt = measurementDate;
        break;
    }

    // healthHistory에 추가
    user.studentInfo.healthProfile.healthHistory.unshift(healthHistoryEntry);
    user.studentInfo.healthProfile.lastHealthCheck = measurementDate;

    await user.save();

    res.json({
      success: true,
      message: '측정 데이터가 저장되었습니다.',
      data: {
        type,
        value: parseFloat(value),
        date: measurementDate,
        isPublic: isPublic !== undefined ? isPublic : true
      }
    });

  } catch (error) {
    console.error('건강 측정 데이터 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '측정 데이터 저장 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 건강 측정 데이터 조회 (본인)
 * GET /api/health/measurements
 */
router.get('/measurements', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const user = await User.findById(userId).select('studentInfo.healthProfile studentInfo.healthProfile.privacySettings');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const healthProfile = user.studentInfo?.healthProfile || {};
    const healthHistory = healthProfile.healthHistory || [];
    const privacySettings = healthProfile.privacySettings || {};

    res.json({
      success: true,
      data: {
        healthProfile,
        healthHistory,
        privacySettings
      }
    });

  } catch (error) {
    console.error('건강 측정 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '측정 데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 개인정보 공개 설정 저장
 * PUT /api/health/measurements/privacy
 */
router.put('/measurements/privacy', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const { privacySettings } = req.body;

    if (!privacySettings || typeof privacySettings !== 'object') {
      return res.status(400).json({
        success: false,
        message: '공개 설정 데이터가 필요합니다.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    if (!user.studentInfo) {
      user.studentInfo = {};
    }
    if (!user.studentInfo.healthProfile) {
      user.studentInfo.healthProfile = {};
    }

    // 공개 설정 업데이트
    user.studentInfo.healthProfile.privacySettings = {
      ...user.studentInfo.healthProfile.privacySettings,
      ...privacySettings
    };

    await user.save();

    res.json({
      success: true,
      message: '공개 설정이 저장되었습니다.',
      data: {
        privacySettings: user.studentInfo.healthProfile.privacySettings
      }
    });

  } catch (error) {
    console.error('공개 설정 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '공개 설정 저장 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 회원 건강 정보 조회 (센터관리자/강사용 - 비공개 정보 필터링)
 * GET /api/health/measurements/:userId
 */
router.get('/measurements/:userId', authMiddleware, requireRole(['centerAdmin', 'center-admin', 'instructor', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const viewerId = req.user?._id || req.user?.userId;
    // const viewerType = req.user?.userType; // 사용하지 않음

    if (!userId || !viewerId) {
      return res.status(400).json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      });
    }

    const user = await User.findById(userId).select('studentInfo.healthProfile studentInfo.healthProfile.privacySettings');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const healthProfile = user.studentInfo?.healthProfile || {};
    const privacySettings = healthProfile.privacySettings || {};

    // 비공개 정보 필터링
    const filteredHealthProfile: any = {};
    
    // 기본 정보 (항상 공개)
    if (healthProfile.height !== undefined && (privacySettings.height !== false)) {
      filteredHealthProfile.height = healthProfile.height;
    }
    if (healthProfile.weight !== undefined && (privacySettings.weight !== false)) {
      filteredHealthProfile.weight = healthProfile.weight;
    }
    if (healthProfile.bmi !== undefined && (privacySettings.bmi !== false)) {
      filteredHealthProfile.bmi = healthProfile.bmi;
    }

    // 혈압
    if (healthProfile.bloodPressure) {
      const bpPublic = privacySettings.blood_pressure_systolic !== false && privacySettings.blood_pressure_diastolic !== false;
      if (bpPublic) {
        filteredHealthProfile.bloodPressure = healthProfile.bloodPressure;
      }
    }

    // 콜레스테롤
    if (healthProfile.cholesterol) {
      const cholPublic = 
        (privacySettings.cholesterol_total !== false && healthProfile.cholesterol.total !== undefined) ||
        (privacySettings.cholesterol_ldl !== false && healthProfile.cholesterol.ldl !== undefined) ||
        (privacySettings.cholesterol_hdl !== false && healthProfile.cholesterol.hdl !== undefined) ||
        (privacySettings.cholesterol_triglycerides !== false && healthProfile.cholesterol.triglycerides !== undefined);
      
      if (cholPublic) {
        filteredHealthProfile.cholesterol = {};
        if (privacySettings.cholesterol_total !== false && healthProfile.cholesterol.total !== undefined) {
          filteredHealthProfile.cholesterol.total = healthProfile.cholesterol.total;
        }
        if (privacySettings.cholesterol_ldl !== false && healthProfile.cholesterol.ldl !== undefined) {
          filteredHealthProfile.cholesterol.ldl = healthProfile.cholesterol.ldl;
        }
        if (privacySettings.cholesterol_hdl !== false && healthProfile.cholesterol.hdl !== undefined) {
          filteredHealthProfile.cholesterol.hdl = healthProfile.cholesterol.hdl;
        }
        if (privacySettings.cholesterol_triglycerides !== false && healthProfile.cholesterol.triglycerides !== undefined) {
          filteredHealthProfile.cholesterol.triglycerides = healthProfile.cholesterol.triglycerides;
        }
      }
    }

    // 혈당
    if (healthProfile.bloodSugar) {
      const sugarPublic = 
        (privacySettings.blood_sugar_fasting !== false && healthProfile.bloodSugar.fasting !== undefined) ||
        (privacySettings.blood_sugar_postprandial !== false && healthProfile.bloodSugar.postprandial !== undefined) ||
        (privacySettings.blood_sugar_hba1c !== false && healthProfile.bloodSugar.hba1c !== undefined);
      
      if (sugarPublic) {
        filteredHealthProfile.bloodSugar = {};
        if (privacySettings.blood_sugar_fasting !== false && healthProfile.bloodSugar.fasting !== undefined) {
          filteredHealthProfile.bloodSugar.fasting = healthProfile.bloodSugar.fasting;
        }
        if (privacySettings.blood_sugar_postprandial !== false && healthProfile.bloodSugar.postprandial !== undefined) {
          filteredHealthProfile.bloodSugar.postprandial = healthProfile.bloodSugar.postprandial;
        }
        if (privacySettings.blood_sugar_hba1c !== false && healthProfile.bloodSugar.hba1c !== undefined) {
          filteredHealthProfile.bloodSugar.hba1c = healthProfile.bloodSugar.hba1c;
        }
      }
    }

    // 체성분
    if (healthProfile.fitnessMetrics) {
      filteredHealthProfile.fitnessMetrics = {};
      if (privacySettings.muscle_mass !== false && healthProfile.fitnessMetrics.muscleMass !== undefined) {
        filteredHealthProfile.fitnessMetrics.muscleMass = healthProfile.fitnessMetrics.muscleMass;
      }
      if (privacySettings.body_fat !== false && healthProfile.fitnessMetrics.bodyFatPercentage !== undefined) {
        filteredHealthProfile.fitnessMetrics.bodyFatPercentage = healthProfile.fitnessMetrics.bodyFatPercentage;
      }
      if (privacySettings.heart_rate !== false && healthProfile.fitnessMetrics.restingHeartRate !== undefined) {
        filteredHealthProfile.fitnessMetrics.restingHeartRate = healthProfile.fitnessMetrics.restingHeartRate;
      }
      if (privacySettings.max_heart_rate !== false && healthProfile.fitnessMetrics.maxHeartRate !== undefined) {
        filteredHealthProfile.fitnessMetrics.maxHeartRate = healthProfile.fitnessMetrics.maxHeartRate;
      }
    }

    // 수영 프로필 (기본 공개)
    if (user.studentInfo?.swimmingProfile) {
      filteredHealthProfile.swimmingProfile = user.studentInfo.swimmingProfile;
    }

    res.json({
      success: true,
      data: {
        healthProfile: filteredHealthProfile,
        hasPrivateData: Object.keys(filteredHealthProfile).length < Object.keys(healthProfile).length
      },
      message: '건강 정보를 조회했습니다. (비공개 정보는 제외되었습니다)'
    });

  } catch (error) {
    console.error('회원 건강 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 센터 전체 건강 통계 (센터관리자/최고관리자용)
 * GET /api/health/measurements/center/statistics
 * 비공개 정보도 통계에는 포함되지만, 개별 정보는 볼 수 없음
 */
router.get('/measurements/center/statistics', authMiddleware, requireRole(['centerAdmin', 'center-admin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const centerId = req.user?.centerId;
    const viewerType = req.user?.userType;

    if (!centerId && viewerType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '센터 관리자 권한이 필요합니다.'
      });
    }

    // 센터의 모든 회원 조회
    const filter: any = { userType: 'student' };
    if (viewerType !== 'superAdmin') {
      filter.centerId = new mongoose.Types.ObjectId(centerId);
    }

    const members = await User.find(filter).select('studentInfo.healthProfile');

    // 통계 계산 (비공개 정보도 포함)
    const statistics = {
      totalMembers: members.length,
      membersWithHealthData: members.filter(m => m.studentInfo?.healthProfile).length,
      averageBMI: 0,
      averageWeight: 0,
      averageHeight: 0,
      bloodPressureStats: {
        averageSystolic: 0,
        averageDiastolic: 0,
        count: 0
      },
      cholesterolStats: {
        averageTotal: 0,
        averageLDL: 0,
        averageHDL: 0,
        count: 0
      },
      bloodSugarStats: {
        averageFasting: 0,
        averageHba1c: 0,
        count: 0
      },
      fitnessStats: {
        averageMuscleMass: 0,
        averageBodyFat: 0,
        averageHeartRate: 0,
        count: 0
      }
    };

    let bmiSum = 0;
    let bmiCount = 0;
    let weightSum = 0;
    let weightCount = 0;
    let heightSum = 0;
    let heightCount = 0;
    let bpSystolicSum = 0;
    let bpDiastolicSum = 0;
    let bpCount = 0;
    let cholTotalSum = 0;
    let cholLDLSum = 0;
    let cholHDLSum = 0;
    let cholCount = 0;
    let sugarFastingSum = 0;
    let sugarHba1cSum = 0;
    let sugarCount = 0;
    let muscleSum = 0;
    let bodyFatSum = 0;
    let heartRateSum = 0;
    let fitnessCount = 0;

    members.forEach(member => {
      const healthProfile = member.studentInfo?.healthProfile;
      if (!healthProfile) return;

      // BMI 통계 (비공개 정보도 포함)
      if (healthProfile.bmi !== undefined) {
        bmiSum += healthProfile.bmi;
        bmiCount++;
      }

      // 체중 통계
      if (healthProfile.weight !== undefined) {
        weightSum += healthProfile.weight;
        weightCount++;
      }

      // 키 통계
      if (healthProfile.height !== undefined) {
        heightSum += healthProfile.height;
        heightCount++;
      }

      // 혈압 통계
      if (healthProfile.bloodPressure?.systolic && healthProfile.bloodPressure?.diastolic) {
        bpSystolicSum += healthProfile.bloodPressure.systolic;
        bpDiastolicSum += healthProfile.bloodPressure.diastolic;
        bpCount++;
      }

      // 콜레스테롤 통계
      if (healthProfile.cholesterol?.total) {
        cholTotalSum += healthProfile.cholesterol.total;
        if (healthProfile.cholesterol.ldl) cholLDLSum += healthProfile.cholesterol.ldl;
        if (healthProfile.cholesterol.hdl) cholHDLSum += healthProfile.cholesterol.hdl;
        cholCount++;
      }

      // 혈당 통계
      if (healthProfile.bloodSugar?.fasting) {
        sugarFastingSum += healthProfile.bloodSugar.fasting;
        if (healthProfile.bloodSugar.hba1c) sugarHba1cSum += healthProfile.bloodSugar.hba1c;
        sugarCount++;
      }

      // 체성분 통계
      if (healthProfile.fitnessMetrics) {
        if (healthProfile.fitnessMetrics.muscleMass) {
          muscleSum += healthProfile.fitnessMetrics.muscleMass;
          fitnessCount++;
        }
        if (healthProfile.fitnessMetrics.bodyFatPercentage) {
          bodyFatSum += healthProfile.fitnessMetrics.bodyFatPercentage;
        }
        if (healthProfile.fitnessMetrics.restingHeartRate) {
          heartRateSum += healthProfile.fitnessMetrics.restingHeartRate;
        }
      }
    });

    statistics.averageBMI = bmiCount > 0 ? parseFloat((bmiSum / bmiCount).toFixed(1)) : 0;
    statistics.averageWeight = weightCount > 0 ? parseFloat((weightSum / weightCount).toFixed(1)) : 0;
    statistics.averageHeight = heightCount > 0 ? parseFloat((heightSum / heightCount).toFixed(1)) : 0;
    statistics.bloodPressureStats.averageSystolic = bpCount > 0 ? Math.round(bpSystolicSum / bpCount) : 0;
    statistics.bloodPressureStats.averageDiastolic = bpCount > 0 ? Math.round(bpDiastolicSum / bpCount) : 0;
    statistics.bloodPressureStats.count = bpCount;
    statistics.cholesterolStats.averageTotal = cholCount > 0 ? Math.round(cholTotalSum / cholCount) : 0;
    statistics.cholesterolStats.averageLDL = cholCount > 0 ? Math.round(cholLDLSum / cholCount) : 0;
    statistics.cholesterolStats.averageHDL = cholCount > 0 ? Math.round(cholHDLSum / cholCount) : 0;
    statistics.cholesterolStats.count = cholCount;
    statistics.bloodSugarStats.averageFasting = sugarCount > 0 ? Math.round(sugarFastingSum / sugarCount) : 0;
    statistics.bloodSugarStats.averageHba1c = sugarCount > 0 ? parseFloat((sugarHba1cSum / sugarCount).toFixed(1)) : 0;
    statistics.bloodSugarStats.count = sugarCount;
    statistics.fitnessStats.averageMuscleMass = fitnessCount > 0 ? parseFloat((muscleSum / fitnessCount).toFixed(1)) : 0;
    statistics.fitnessStats.averageBodyFat = fitnessCount > 0 ? parseFloat((bodyFatSum / fitnessCount).toFixed(1)) : 0;
    statistics.fitnessStats.averageHeartRate = fitnessCount > 0 ? Math.round(heartRateSum / fitnessCount) : 0;
    statistics.fitnessStats.count = fitnessCount;

    res.json({
      success: true,
      data: statistics,
      message: '센터 건강 통계를 조회했습니다. (비공개 정보도 통계에 포함됨)'
    });

  } catch (error) {
    console.error('센터 건강 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;


