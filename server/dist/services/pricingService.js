"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserCenterAffiliation = checkUserCenterAffiliation;
exports.calculatePricing = calculatePricing;
exports.updatePricingPolicy = updatePricingPolicy;
exports.getCurrentPricingPolicy = getCurrentPricingPolicy;
exports.getUserDiscountRate = getUserDiscountRate;
const User_1 = require("../models/User");
const SwimmingCenter_1 = require("../models/SwimmingCenter");
const DEFAULT_PRICING_POLICY = {
    student: {
        monthly: 30000,
        annual: 300000,
        features: ['기본 프로그램', '진도 추적', '3D 뷰어', '퀴즈']
    },
    instructorPersonal: {
        monthly: 15000,
        annual: 150000,
        discountRate: 0.5,
        features: ['기본 프로그램', '진도 추적', '3D 뷰어']
    },
    instructorBusiness: {
        monthly: 20000,
        annual: 200000,
        discountRate: 0.33,
        features: ['전체 기능', '보고서', '학생 관리', '평가 작성']
    },
    centerManaged: {
        monthly: 0,
        annual: 0,
        discountRate: 1.0,
        features: ['전체 기능', '고급 분석', '센터 관리']
    }
};
async function checkUserCenterAffiliation(userId) {
    try {
        const user = await User_1.User.findById(userId).populate('instructorInfo.assignedCenters');
        if (!user) {
            return { hasCenterAffiliation: false, isCenterSponsored: false };
        }
        if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters) {
            const assignedCenters = user.instructorInfo.assignedCenters;
            if (assignedCenters.length > 0) {
                const center = await SwimmingCenter_1.SwimmingCenter.findById(assignedCenters[0]);
                const isCenterSponsored = center?.isActive || false;
                return {
                    hasCenterAffiliation: true,
                    centerId: assignedCenters[0].toString(),
                    isCenterSponsored
                };
            }
        }
        if (user.userType === 'centerAdmin' && user.centerAdminInfo?.managedCenters) {
            const managedCenters = user.centerAdminInfo.managedCenters;
            if (managedCenters.length > 0) {
                const center = await SwimmingCenter_1.SwimmingCenter.findById(managedCenters[0]);
                const isCenterSponsored = center?.isActive || false;
                return {
                    hasCenterAffiliation: true,
                    centerId: managedCenters[0].toString(),
                    isCenterSponsored
                };
            }
        }
        return { hasCenterAffiliation: false, isCenterSponsored: false };
    }
    catch (error) {
        console.error('센터 소속 확인 오류:', error);
        return { hasCenterAffiliation: false, isCenterSponsored: false };
    }
}
async function calculatePricing(userId, billingPeriod = 'monthly') {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        const affiliationInfo = await checkUserCenterAffiliation(userId);
        let pricingResult;
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
                }
                else if (affiliationInfo.hasCenterAffiliation && !affiliationInfo.isCenterSponsored) {
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
                }
                else {
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
                }
                else {
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
    }
    catch (error) {
        console.error('요금 계산 오류:', error);
        throw error;
    }
}
function updatePricingPolicy(newPolicy) {
    Object.assign(DEFAULT_PRICING_POLICY, newPolicy);
}
function getCurrentPricingPolicy() {
    return { ...DEFAULT_PRICING_POLICY };
}
async function getUserDiscountRate(userId) {
    try {
        const user = await User_1.User.findById(userId);
        if (!user) {
            return { discountRate: 0, reason: '' };
        }
        const affiliationInfo = await checkUserCenterAffiliation(userId);
        if (user.userType === 'instructor') {
            if (affiliationInfo.hasCenterAffiliation && affiliationInfo.isCenterSponsored) {
                return { discountRate: 1.0, reason: '센터 소속 강사 (무료)' };
            }
            else if (affiliationInfo.hasCenterAffiliation && !affiliationInfo.isCenterSponsored) {
                return { discountRate: DEFAULT_PRICING_POLICY.instructorBusiness.discountRate, reason: '프리랜서 강사 할인' };
            }
            else {
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
    }
    catch (error) {
        console.error('할인율 조회 오류:', error);
        return { discountRate: 0, reason: '' };
    }
}
//# sourceMappingURL=pricingService.js.map