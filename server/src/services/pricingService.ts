/**
 * 💰 JJ Swim Lab - 요금 계산 서비스
 * 
 * 📋 **서비스 목적**
 * - 사용자 타입별 차등 요금 계산
 * - 강사 센터 소속 여부에 따른 요금 차등 적용
 * - 할인 및 특별 요금 정책 관리
 * - 요금 계산 로직의 중앙화 및 일관성 보장
 * 
 * 🔄 **주요 기능**
 * - 사용자 타입별 기본 요금 계산
 * - 강사 센터 소속 여부 확인
 * - 할인율 및 특별 요금 적용
 * - 요금 계산 이력 및 로깅
 * - 요금 정책 관리 및 업데이트
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (사용자 정보)
 * - SwimmingCenter 모델과 연동 (센터 정보)
 * - Payment 모델과 연동 (결제 정보)
 * - 요금 정책 설정 데이터
 * 
 * 📅 **개발 히스토리**
 * - 2025-10-14: 초기 요금 계산 서비스 구현
 * - 2025-10-14: 강사 센터 소속 여부 기반 요금 차등 시스템 구현
 * - 2025-10-14: 할인 및 특별 요금 정책 시스템 구현
 */

import { User } from '../models/User';
import { SwimmingCenter } from '../models/SwimmingCenter';

// 요금 정책 인터페이스
interface PricingPolicy {
  student: {
    monthly: number;
    annual: number;
    features: string[];
  };
  instructorPersonal: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
  instructorBusiness: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
  centerManaged: {
    monthly: number;
    annual: number;
    discountRate: number;
    features: string[];
  };
}

// 요금 계산 결과 인터페이스
export interface PricingResult {
  userType: string;
  pricingTier: string;
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountReason: string;
  centerId?: string;
  isCenterSponsored: boolean;
  features: string[];
}

// 기본 요금 정책
const DEFAULT_PRICING_POLICY: PricingPolicy = {
  student: {
    monthly: 30000,
    annual: 300000, // 10개월 요금
    features: ['기본 프로그램', '진도 추적', '3D 뷰어', '퀴즈']
  },
  instructorPersonal: {
    monthly: 15000, // 50% 할인
    annual: 150000,
    discountRate: 0.5,
    features: ['기본 프로그램', '진도 추적', '3D 뷰어']
  },
  instructorBusiness: {
    monthly: 20000, // 33% 할인
    annual: 200000,
    discountRate: 0.33,
    features: ['전체 기능', '보고서', '학생 관리', '평가 작성']
  },
  centerManaged: {
    monthly: 0, // 무료
    annual: 0,
    discountRate: 1.0,
    features: ['전체 기능', '고급 분석', '센터 관리']
  }
};

/**
 * 사용자의 센터 소속 여부 확인
 */
export async function checkUserCenterAffiliation(userId: string): Promise<{
  hasCenterAffiliation: boolean;
  centerId?: string;
  isCenterSponsored: boolean;
}> {
  try {
    const user = await User.findById(userId).populate('instructorInfo.assignedCenters');
    
    if (!user) {
      return { hasCenterAffiliation: false, isCenterSponsored: false };
    }

    // 강사인 경우 센터 소속 확인
    if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters) {
      const assignedCenters = user.instructorInfo.assignedCenters;
      
      if (assignedCenters.length > 0) {
        // 센터가 JJ Swim Lab 프로그램을 사용하는지 확인
        const center = await SwimmingCenter.findById(assignedCenters[0]);
        const isCenterSponsored = center?.isActive || false;
        
        return {
          hasCenterAffiliation: true,
          centerId: assignedCenters[0].toString(),
          isCenterSponsored
        };
      }
    }

    // 센터 관리자인 경우
    if (user.userType === 'centerAdmin' && user.centerAdminInfo?.managedCenters) {
      const managedCenters = user.centerAdminInfo.managedCenters;
      
      if (managedCenters.length > 0) {
        const center = await SwimmingCenter.findById(managedCenters[0]);
        const isCenterSponsored = center?.isActive || false;
        
        return {
          hasCenterAffiliation: true,
          centerId: managedCenters[0].toString(),
          isCenterSponsored
        };
      }
    }

    return { hasCenterAffiliation: false, isCenterSponsored: false };
  } catch (error) {
    console.error('센터 소속 확인 오류:', error);
    return { hasCenterAffiliation: false, isCenterSponsored: false };
  }
}

/**
 * 사용자 타입별 요금 계산
 */
export async function calculatePricing(
  userId: string, 
  billingPeriod: 'monthly' | 'annual' = 'monthly'
): Promise<PricingResult> {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 센터 소속 여부 확인
    const affiliationInfo = await checkUserCenterAffiliation(userId);
    
    let pricingResult: PricingResult;

    switch (user.userType) {
      case 'student':
        pricingResult = {
          userType: 'student',
          pricingTier: 'standard',
          baseAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
          discountAmount: 0,
          finalAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
          discountReason: '',
          isCenterSponsored: false,
          features: DEFAULT_PRICING_POLICY.student.features
        };
        break;

      case 'instructor':
        if (affiliationInfo.hasCenterAffiliation && affiliationInfo.isCenterSponsored) {
          // 센터 소속 강사 (센터가 프로그램 사용)
          pricingResult = {
            userType: 'instructor',
            pricingTier: 'center_managed',
            baseAmount: DEFAULT_PRICING_POLICY.centerManaged[billingPeriod],
            discountAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
            finalAmount: DEFAULT_PRICING_POLICY.centerManaged[billingPeriod],
            discountReason: '센터 소속 강사 (센터 부담)',
            centerId: affiliationInfo.centerId,
            isCenterSponsored: true,
            features: DEFAULT_PRICING_POLICY.centerManaged.features
          };
        } else if (affiliationInfo.hasCenterAffiliation && !affiliationInfo.isCenterSponsored) {
          // 센터 소속이지만 센터가 프로그램 미사용
          pricingResult = {
            userType: 'instructor',
            pricingTier: 'instructor_business',
            baseAmount: DEFAULT_PRICING_POLICY.instructorBusiness[billingPeriod],
            discountAmount: DEFAULT_PRICING_POLICY.student[billingPeriod] * DEFAULT_PRICING_POLICY.instructorBusiness.discountRate,
            finalAmount: DEFAULT_PRICING_POLICY.instructorBusiness[billingPeriod],
            discountReason: '프리랜서 강사 할인',
            centerId: affiliationInfo.centerId,
            isCenterSponsored: false,
            features: DEFAULT_PRICING_POLICY.instructorBusiness.features
          };
        } else {
          // 개인 강사 (센터 소속 없음)
          pricingResult = {
            userType: 'instructor',
            pricingTier: 'instructor_discount',
            baseAmount: DEFAULT_PRICING_POLICY.instructorPersonal[billingPeriod],
            discountAmount: DEFAULT_PRICING_POLICY.student[billingPeriod] * DEFAULT_PRICING_POLICY.instructorPersonal.discountRate,
            finalAmount: DEFAULT_PRICING_POLICY.instructorPersonal[billingPeriod],
            discountReason: '강사 개인 이용 할인',
            isCenterSponsored: false,
            features: DEFAULT_PRICING_POLICY.instructorPersonal.features
          };
        }
        break;

      case 'centerAdmin':
        if (affiliationInfo.hasCenterAffiliation && affiliationInfo.isCenterSponsored) {
          // 센터 관리자 (센터가 프로그램 사용)
          pricingResult = {
            userType: 'centerAdmin',
            pricingTier: 'center_managed',
            baseAmount: DEFAULT_PRICING_POLICY.centerManaged[billingPeriod],
            discountAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
            finalAmount: DEFAULT_PRICING_POLICY.centerManaged[billingPeriod],
            discountReason: '센터 관리자 (센터 부담)',
            centerId: affiliationInfo.centerId,
            isCenterSponsored: true,
            features: DEFAULT_PRICING_POLICY.centerManaged.features
          };
        } else {
          // 센터 관리자이지만 센터가 프로그램 미사용
          pricingResult = {
            userType: 'centerAdmin',
            pricingTier: 'standard',
            baseAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
            discountAmount: 0,
            finalAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
            discountReason: '',
            isCenterSponsored: false,
            features: DEFAULT_PRICING_POLICY.student.features
          };
        }
        break;

      case 'superAdmin':
        // 슈퍼 관리자는 무료
        pricingResult = {
          userType: 'superAdmin',
          pricingTier: 'free',
          baseAmount: 0,
          discountAmount: DEFAULT_PRICING_POLICY.student[billingPeriod],
          finalAmount: 0,
          discountReason: '슈퍼 관리자 무료',
          isCenterSponsored: false,
          features: ['전체 시스템 접근']
        };
        break;

      default:
        throw new Error('알 수 없는 사용자 타입입니다.');
    }

    return pricingResult;
  } catch (error) {
    console.error('요금 계산 오류:', error);
    throw error;
  }
}

/**
 * 요금 정책 업데이트
 */
export function updatePricingPolicy(newPolicy: Partial<PricingPolicy>): void {
  Object.assign(DEFAULT_PRICING_POLICY, newPolicy);
}

/**
 * 현재 요금 정책 조회
 */
export function getCurrentPricingPolicy(): PricingPolicy {
  return { ...DEFAULT_PRICING_POLICY };
}

/**
 * 사용자별 할인율 조회
 */
export async function getUserDiscountRate(userId: string): Promise<{
  discountRate: number;
  reason: string;
}> {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { discountRate: 0, reason: '' };
    }

    const affiliationInfo = await checkUserCenterAffiliation(userId);

    if (user.userType === 'instructor') {
      if (affiliationInfo.hasCenterAffiliation && affiliationInfo.isCenterSponsored) {
        return { discountRate: 1.0, reason: '센터 소속 강사 (무료)' };
      } else if (affiliationInfo.hasCenterAffiliation && !affiliationInfo.isCenterSponsored) {
        return { discountRate: DEFAULT_PRICING_POLICY.instructorBusiness.discountRate, reason: '프리랜서 강사 할인' };
      } else {
        return { discountRate: DEFAULT_PRICING_POLICY.instructorPersonal.discountRate, reason: '강사 개인 이용 할인' };
      }
    }

    if (user.userType === 'centerAdmin' && affiliationInfo.hasCenterAffiliation && affiliationInfo.isCenterSponsored) {
      return { discountRate: 1.0, reason: '센터 관리자 (무료)' };
    }

    if (user.userType === 'superAdmin') {
      return { discountRate: 1.0, reason: '슈퍼 관리자 (무료)' };
    }

    return { discountRate: 0, reason: '' };
  } catch (error) {
    console.error('할인율 조회 오류:', error);
    return { discountRate: 0, reason: '' };
  }
}
