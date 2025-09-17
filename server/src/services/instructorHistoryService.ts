/**
 * 👨‍🏫 JJ Swim Lab - 강사 이력관리 서비스
 * 
 * 📋 **서비스 목적**
 * - 강사 근무 이력의 불변성 보장 관리
 * - 자격증 검증 및 만료 알림 시스템
 * - 센터별 강사 자격 검색 및 조회
 * - 이력 변조 방지 및 감사 추적
 */

import { 
  InstructorWorkHistory, 
  InstructorCertification, 
  CERTIFICATION_TYPES,
  IInstructorWorkHistory,
  IInstructorCertification 
} from '../models/InstructorHistory';
import { User } from '../models/User';
import { logInfo, logError } from '../utils/logger';
import crypto from 'crypto';
import mongoose from 'mongoose';

export class InstructorHistoryService {
  private static instance: InstructorHistoryService;

  static getInstance(): InstructorHistoryService {
    if (!InstructorHistoryService.instance) {
      InstructorHistoryService.instance = new InstructorHistoryService();
    }
    return InstructorHistoryService.instance;
  }

  /**
   * 새로운 근무 이력 추가 (불변성 보장)
   */
  async addWorkHistory(historyData: {
    instructorId: string;
    centerId: string;
    position: string;
    startDate: Date;
    workType: 'fulltime' | 'parttime' | 'contract' | 'volunteer';
    responsibilities: string[];
  }, createdBy: string): Promise<IInstructorWorkHistory> {
    try {
      // 1. 기존 활성 이력이 있다면 종료 처리
      await this.endCurrentWorkHistory(historyData.instructorId, historyData.centerId);

      // 2. 새로운 이력 생성 (불변성 보장)
      const newHistory = await (InstructorWorkHistory as any).createNewHistory(historyData, createdBy);

      logInfo(`새로운 근무 이력 추가: 강사 ${historyData.instructorId}, 센터 ${historyData.centerId}`);
      
      return newHistory;

    } catch (error) {
      logError('근무 이력 추가 실패:', error);
      throw new Error('근무 이력 추가 중 오류가 발생했습니다.');
    }
  }

  /**
   * 현재 근무 이력 종료
   */
  async endCurrentWorkHistory(instructorId: string, centerId: string): Promise<void> {
    try {
      // 현재 활성 이력 조회
      const currentHistory = await InstructorWorkHistory.findOne({
        instructorId,
        centerId,
        isActive: true,
        endDate: null
      });

      if (currentHistory) {
        // 종료일 설정 (새로운 문서로 생성 - 불변성 유지)
        const endHistoryData = {
          ...currentHistory.toObject(),
          _id: undefined,
          endDate: new Date(),
          isActive: false,
          hashValue: undefined // 새로 생성됨
        };

        await (InstructorWorkHistory as any).createNewHistory(endHistoryData, currentHistory.createdBy);
        
        logInfo(`근무 이력 종료: 강사 ${instructorId}, 센터 ${centerId}`);
      }

    } catch (error) {
      logError('근무 이력 종료 실패:', error);
      throw new Error('근무 이력 종료 중 오류가 발생했습니다.');
    }
  }

  /**
   * 자격증 등록
   */
  async addCertification(certData: {
    instructorId: string;
    certificationType: string;
    certificationName: string;
    certificationNumber: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    documentUrl?: string;
  }): Promise<IInstructorCertification> {
    try {
      // 1. 중복 자격증 확인
      const existingCert = await InstructorCertification.findOne({
        certificationNumber: certData.certificationNumber
      });

      if (existingCert) {
        throw new Error('이미 등록된 자격증 번호입니다.');
      }

      // 2. 발급기관 검증
      const certType = CERTIFICATION_TYPES[certData.certificationType as keyof typeof CERTIFICATION_TYPES];
      if (certType && !certType.issuingOrgs.includes(certData.issuingOrganization)) {
        throw new Error(`${certType.name} 자격증의 유효한 발급기관이 아닙니다.`);
      }

      // 3. 만료일 자동 계산 (설정되지 않은 경우)
      if (!certData.expiryDate && certType?.validityPeriod) {
        const expiryDate = new Date(certData.issueDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + certType.validityPeriod);
        certData.expiryDate = expiryDate;
      }

      // 4. 문서 해시 생성
      let documentHash;
      if (certData.documentUrl) {
        documentHash = crypto.createHash('sha256')
          .update(`${certData.certificationNumber}${certData.documentUrl}`)
          .digest('hex');
      }

      // 5. 자격증 생성
      const certification = new InstructorCertification({
        ...certData,
        documentHash,
        readonly: true
      });

      await certification.save();

      logInfo(`새로운 자격증 등록: 강사 ${certData.instructorId}, 타입 ${certData.certificationType}`);
      
      return certification;

    } catch (error) {
      logError('자격증 등록 실패:', error);
      throw error;
    }
  }

  /**
   * 자격증 검증
   */
  async verifyCertification(
    certificationId: string, 
    verifiedBy: string, 
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<IInstructorCertification> {
    try {
      const certification = await InstructorCertification.findByIdAndUpdate(
        certificationId,
        {
          $set: {
            verificationStatus: status,
            verifiedBy,
            verifiedAt: new Date(),
            verificationNotes: notes,
            isValid: status === 'verified'
          }
        },
        { new: true }
      );

      if (!certification) {
        throw new Error('자격증을 찾을 수 없습니다.');
      }

      logInfo(`자격증 검증 완료: ${certificationId}, 상태: ${status}`);
      
      return certification;

    } catch (error) {
      logError('자격증 검증 실패:', error);
      throw error;
    }
  }

  /**
   * 센터별 강사 자격증 검색
   */
  async searchInstructorsByCenterAndCertification(
    centerId: string,
    filters: {
      certificationType?: string;
      verificationStatus?: string;
      isExpired?: boolean;
      issuingOrganization?: string;
    } = {}
  ): Promise<any[]> {
    try {
      const results = await (InstructorCertification as any).findByCenterAndType(
        centerId, 
        filters.certificationType
      );

      // 추가 필터링
      let filteredResults = results;

      if (filters.verificationStatus) {
        filteredResults = filteredResults.filter(
          (r: any) => r.verificationStatus === filters.verificationStatus
        );
      }

      if (filters.isExpired !== undefined) {
        filteredResults = filteredResults.filter(
          (r: any) => r.isExpired === filters.isExpired
        );
      }

      if (filters.issuingOrganization) {
        filteredResults = filteredResults.filter(
          (r: any) => r.issuingOrganization === filters.issuingOrganization
        );
      }

      return filteredResults;

    } catch (error) {
      logError('센터별 강사 검색 실패:', error);
      throw new Error('강사 검색 중 오류가 발생했습니다.');
    }
  }

  /**
   * 강사별 전체 이력 조회
   */
  async getInstructorCompleteHistory(instructorId: string): Promise<{
    workHistory: IInstructorWorkHistory[];
    certifications: IInstructorCertification[];
    summary: any;
  }> {
    try {
      // 1. 근무 이력 조회
      const workHistory = await InstructorWorkHistory.find({ instructorId })
        .populate('centerId', 'name address phone')
        .populate('createdBy', 'name email')
        .sort({ startDate: -1 });

      // 2. 자격증 조회
      const certifications = await InstructorCertification.find({ instructorId })
        .populate('verifiedBy', 'name email')
        .sort({ issueDate: -1 });

      // 3. 요약 정보 생성
      const summary = {
        totalWorkPlaces: workHistory.length,
        currentWorkPlace: workHistory.find(h => h.isActive && !h.endDate),
        totalExperience: this.calculateTotalExperience(workHistory),
        validCertifications: certifications.filter(c => c.isValid && !(c as any).isExpired()),
        expiringSoon: certifications.filter(c => (c as any).shouldRenew()),
        certificationSummary: this.summarizeCertifications(certifications)
      };

      return {
        workHistory,
        certifications,
        summary
      };

    } catch (error) {
      logError('강사 이력 조회 실패:', error);
      throw new Error('강사 이력 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 만료 예정 자격증 알림
   */
  async getExpiringCertifications(days: number = 30): Promise<any[]> {
    try {
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + days);

      const expiringCerts = await InstructorCertification.find({
        expiryDate: { $lte: alertDate, $gte: new Date() },
        isValid: true,
        verificationStatus: 'verified'
      })
      .populate('instructorId', 'name email phone')
      .sort({ expiryDate: 1 });

      return expiringCerts.map(cert => ({
        instructor: cert.instructorId,
        certification: {
          type: cert.certificationType,
          name: cert.certificationName,
          number: cert.certificationNumber,
          expiryDate: cert.expiryDate,
          daysUntilExpiry: Math.ceil(
            (cert.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        }
      }));

    } catch (error) {
      logError('만료 예정 자격증 조회 실패:', error);
      throw new Error('만료 예정 자격증 조회 중 오류가 발생했습니다.');
    }
  }

  /**
   * 이력 무결성 검증
   */
  async verifyHistoryIntegrity(instructorId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    try {
      const histories = await InstructorWorkHistory.find({ instructorId })
        .sort({ createdAt: 1 });

      const issues: string[] = [];

      // 1. 각 이력의 해시 검증
      for (const history of histories) {
        if (!(history as any).verifyIntegrity()) {
          issues.push(`이력 ID ${history._id}: 해시 불일치 감지`);
        }
      }

      // 2. 이력 체인 검증
      for (let i = 1; i < histories.length; i++) {
        if (histories[i].previousHash !== histories[i-1].hashValue) {
          issues.push(`이력 ID ${histories[i]._id}: 이전 이력과의 연결 해시 불일치`);
        }
      }

      // 3. 날짜 논리 검증
      for (const history of histories) {
        if (history.endDate && history.endDate <= history.startDate) {
          issues.push(`이력 ID ${history._id}: 종료일이 시작일보다 빠름`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues
      };

    } catch (error) {
      logError('이력 무결성 검증 실패:', error);
      throw new Error('이력 무결성 검증 중 오류가 발생했습니다.');
    }
  }

  /**
   * 자격증 자동 검증 (외부 API 연동 시뮬레이션)
   */
  async autoVerifyCertification(certificationId: string): Promise<{
    success: boolean;
    verificationResult: any;
  }> {
    try {
      const certification = await InstructorCertification.findById(certificationId);
      
      if (!certification) {
        throw new Error('자격증을 찾을 수 없습니다.');
      }

      // 외부 API 검증 시뮬레이션
      const verificationResult = await this.simulateExternalVerification(certification);

      // 검증 결과 업데이트
      if (verificationResult.isValid) {
        await this.verifyCertification(
          certificationId,
          'system',
          'verified',
          '자동 검증 완료'
        );
      } else {
        await this.verifyCertification(
          certificationId,
          'system',
          'rejected',
          verificationResult.reason
        );
      }

      return {
        success: verificationResult.isValid,
        verificationResult
      };

    } catch (error) {
      logError('자격증 자동 검증 실패:', error);
      throw error;
    }
  }

  /**
   * 센터별 강사 자격 현황 대시보드
   */
  async getCenterInstructorDashboard(centerId: string): Promise<{
    totalInstructors: number;
    activeInstructors: number;
    certificationStats: any;
    expiringCerts: any[];
    complianceRate: number;
  }> {
    try {
      // 1. 센터의 전체 강사 수
      const totalInstructors = await InstructorWorkHistory.distinct('instructorId', {
        centerId
      });

      // 2. 현재 활성 강사 수
      const activeInstructors = await InstructorWorkHistory.countDocuments({
        centerId,
        isActive: true,
        endDate: null
      });

      // 3. 자격증 통계
      const certificationStats = await this.getCertificationStatsByCenter(centerId);

      // 4. 만료 예정 자격증
      const expiringCerts = await this.getExpiringCertificationsByCenter(centerId);

      // 5. 컴플라이언스 비율 계산
      const complianceRate = await this.calculateCenterComplianceRate(centerId);

      return {
        totalInstructors: totalInstructors.length,
        activeInstructors,
        certificationStats,
        expiringCerts,
        complianceRate
      };

    } catch (error) {
      logError('센터 강사 대시보드 조회 실패:', error);
      throw new Error('센터 대시보드 조회 중 오류가 발생했습니다.');
    }
  }

  // Private 헬퍼 메서드들
  private async simulateExternalVerification(certification: IInstructorCertification): Promise<{
    isValid: boolean;
    reason?: string;
    verifiedData?: any;
  }> {
    // 실제 환경에서는 공공기관 API 연동
    // 시뮬레이션: 자격증 번호 패턴 검증
    const certNumber = certification.certificationNumber;
    
    // 생활체육지도사 번호 패턴 (예: SPT-2023-001234)
    if (certification.certificationType === 'sports_instructor') {
      const pattern = /^SPT-\d{4}-\d{6}$/;
      if (!pattern.test(certNumber)) {
        return {
          isValid: false,
          reason: '생활체육지도사 자격증 번호 형식이 올바르지 않습니다.'
        };
      }
    }

    // 인명구조원 번호 패턴 (예: LG-2023-001234)
    if (certification.certificationType === 'lifeguard') {
      const pattern = /^LG-\d{4}-\d{6}$/;
      if (!pattern.test(certNumber)) {
        return {
          isValid: false,
          reason: '인명구조원 자격증 번호 형식이 올바르지 않습니다.'
        };
      }
    }

    return {
      isValid: true,
      verifiedData: {
        verificationDate: new Date(),
        verificationMethod: 'api',
        externalId: `ext_${certNumber}`
      }
    };
  }

  private calculateTotalExperience(workHistory: IInstructorWorkHistory[]): number {
    let totalDays = 0;
    
    for (const history of workHistory) {
      const startDate = new Date(history.startDate);
      const endDate = history.endDate ? new Date(history.endDate) : new Date();
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    }

    return Math.round(totalDays / 365 * 10) / 10; // 년 단위, 소수점 1자리
  }

  private summarizeCertifications(certifications: IInstructorCertification[]): any {
    const summary = {
      total: certifications.length,
      verified: 0,
      pending: 0,
      expired: 0,
      byType: {} as any
    };

    certifications.forEach(cert => {
      // 상태별 카운트
      if (cert.verificationStatus === 'verified') summary.verified++;
      if (cert.verificationStatus === 'pending') summary.pending++;
      if ((cert as any).isExpired()) summary.expired++;

      // 타입별 카운트
      if (!summary.byType[cert.certificationType]) {
        summary.byType[cert.certificationType] = 0;
      }
      summary.byType[cert.certificationType]++;
    });

    return summary;
  }

  private async getCertificationStatsByCenter(centerId: string): Promise<any> {
    const pipeline = [
      {
        $lookup: {
          from: 'instructor_work_histories',
          localField: 'instructorId',
          foreignField: 'instructorId',
          as: 'workHistory'
        }
      },
      {
        $match: {
          'workHistory': {
            $elemMatch: {
              centerId: new mongoose.Types.ObjectId(centerId),
              isActive: true
            }
          }
        }
      },
      {
        $group: {
          _id: '$certificationType',
          total: { $sum: 1 },
          verified: {
            $sum: {
              $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$expiryDate', null] },
                    { $lt: ['$expiryDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    return InstructorCertification.aggregate(pipeline);
  }

  private async getExpiringCertificationsByCenter(centerId: string, days: number = 30): Promise<any[]> {
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + days);

    const pipeline = [
      {
        $match: {
          expiryDate: { $lte: alertDate, $gte: new Date() },
          isValid: true,
          verificationStatus: 'verified'
        }
      },
      {
        $lookup: {
          from: 'instructor_work_histories',
          localField: 'instructorId',
          foreignField: 'instructorId',
          as: 'workHistory'
        }
      },
      {
        $match: {
          'workHistory': {
            $elemMatch: {
              centerId: new mongoose.Types.ObjectId(centerId),
              isActive: true
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $project: {
          instructorName: { $arrayElemAt: ['$instructor.name', 0] },
          instructorEmail: { $arrayElemAt: ['$instructor.email', 0] },
          certificationType: 1,
          certificationName: 1,
          expiryDate: 1,
          daysUntilExpiry: {
            $ceil: {
              $divide: [
                { $subtract: ['$expiryDate', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $sort: { expiryDate: 1 as 1 }
      }
    ];

    return InstructorCertification.aggregate(pipeline);
  }

  private async calculateCenterComplianceRate(centerId: string): Promise<number> {
    try {
      // 센터의 활성 강사 수
      const activeInstructors = await InstructorWorkHistory.distinct('instructorId', {
        centerId,
        isActive: true,
        endDate: null
      });

      if (activeInstructors.length === 0) return 100;

      // 필수 자격증을 모두 보유한 강사 수
      let compliantInstructors = 0;

      for (const instructorId of activeInstructors) {
        const hasRequiredCerts = await this.hasAllRequiredCertifications(instructorId.toString());
        if (hasRequiredCerts) {
          compliantInstructors++;
        }
      }

      return Math.round((compliantInstructors / activeInstructors.length) * 100);

    } catch (error) {
      logError('컴플라이언스 비율 계산 실패:', error);
      return 0;
    }
  }

  private async hasAllRequiredCertifications(instructorId: string): Promise<boolean> {
    const requiredTypes = Object.entries(CERTIFICATION_TYPES)
      .filter(([_, config]) => config.required)
      .map(([type, _]) => type);

    for (const certType of requiredTypes) {
      const validCert = await InstructorCertification.findOne({
        instructorId,
        certificationType: certType,
        verificationStatus: 'verified',
        isValid: true,
        $or: [
          { expiryDate: null },
          { expiryDate: { $gt: new Date() } }
        ]
      });

      if (!validCert) {
        return false;
      }
    }

    return true;
  }
}

export default InstructorHistoryService;
