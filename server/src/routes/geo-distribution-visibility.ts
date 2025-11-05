/**
 * 🗺️ 회원분포도 공개 여부 설정 API
 * 
 * 📋 **파일 목적**
 * - 센터의 회원분포도 공개 여부 설정 관리
 * - 센터 관리자가 본인 센터의 회원분포도 공개 여부를 설정
 * - 최고관리자는 모든 센터의 공개 여부를 볼 수 있음
 * 
 * 🔄 **주요 기능**
 * 1. GET /api/geo-distribution-visibility/:centerId - 센터의 회원분포도 공개 여부 조회
 * 2. PUT /api/geo-distribution-visibility/:centerId - 센터의 회원분포도 공개 여부 설정
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델 (geoDistributionVisibility 필드)
 * 
 * ⚠️ **권한**
 * - 센터 관리자: 본인 센터만 설정 가능
 * - 최고관리자: 모든 센터 설정 가능
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import Center from '../models/Center';
import { User } from '../models/User';

const router = express.Router();

/**
 * @route GET /api/geo-distribution-visibility/:centerId
 * @desc 센터의 회원분포도 공개 여부 조회
 * @access 센터 관리자 (본인 센터), 최고 관리자 (모든 센터)
 */
router.get('/:centerId', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { centerId } = req.params;

    // 권한 확인
    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
      return res.status(403).json({
        success: false,
        message: '회원분포도 공개 여부 조회 권한이 없습니다.'
      });
    }

    // 센터 조회
    const center = await Center.findById(centerId).select('geoDistributionVisibility');
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 본인 센터만 조회 가능
    if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
      const centerAdminUser = await User.findById(user._id || user.id).select('centerAdminInfo centerId').lean();
      const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
      const viewerCenterId = centerAdminUser?.centerId;
      
      const isManaged = managedCenters.some((c: any) => {
        const cId = c.toString ? c.toString() : c._id?.toString() || c;
        return cId === centerId;
      }) || (viewerCenterId && viewerCenterId.toString() === centerId);

      if (!isManaged) {
        return res.status(403).json({
          success: false,
          message: '본인이 관리하는 센터만 조회할 수 있습니다.'
        });
      }
    }

    // 공개 여부 정보 반환 (기본값 포함)
    const visibility = center.geoDistributionVisibility || {
      isPublic: false,
      showToOtherCenterAdmins: false,
      showToOwnInstructors: false,
      showToOtherInstructors: false,
      showToOwnMembers: false,
      showToOtherMembers: false
    };

    res.json({
      success: true,
      data: {
        centerId,
        visibility
      }
    });
  } catch (error) {
    console.error('회원분포도 공개 여부 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원분포도 공개 여부 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @route PUT /api/geo-distribution-visibility/:centerId
 * @desc 센터의 회원분포도 공개 여부 설정
 * @access 센터 관리자 (본인 센터), 최고 관리자 (모든 센터)
 */
router.put('/:centerId', authMiddleware, async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { centerId } = req.params;
    const { 
      isPublic, 
      showToOtherCenterAdmins, 
      showToOwnInstructors, 
      showToOtherInstructors, 
      showToOwnMembers, 
      showToOtherMembers 
    } = req.body;

    // 권한 확인
    if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
      return res.status(403).json({
        success: false,
        message: '회원분포도 공개 여부 설정 권한이 없습니다.'
      });
    }

    // 센터 조회
    const center = await Center.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 본인 센터만 설정 가능
    if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
      const centerAdminUser = await User.findById(user._id || user.id).select('centerAdminInfo centerId').lean();
      const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
      const viewerCenterId = centerAdminUser?.centerId;
      
      const isManaged = managedCenters.some((c: any) => {
        const cId = c.toString ? c.toString() : c._id?.toString() || c;
        return cId === centerId;
      }) || (viewerCenterId && viewerCenterId.toString() === centerId);

      if (!isManaged) {
        return res.status(403).json({
          success: false,
          message: '본인이 관리하는 센터만 설정할 수 있습니다.'
        });
      }
    }

    // 회원분포도 공개 여부 설정 업데이트
    center.geoDistributionVisibility = {
      isPublic: isPublic || false,
      showToOtherCenterAdmins: showToOtherCenterAdmins || false,
      showToOwnInstructors: showToOwnInstructors || false,
      showToOtherInstructors: showToOtherInstructors || false,
      showToOwnMembers: showToOwnMembers || false,
      showToOtherMembers: showToOtherMembers || false,
      lastUpdated: new Date(),
      updatedBy: user._id || user.id
    };

    await center.save();

    res.json({
      success: true,
      message: '회원분포도 공개 여부가 성공적으로 업데이트되었습니다!',
      data: {
        centerId,
        visibility: center.geoDistributionVisibility
      }
    });
  } catch (error) {
    console.error('회원분포도 공개 여부 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '회원분포도 공개 여부 설정 중 오류가 발생했습니다.'
    });
  }
});

export default router;

