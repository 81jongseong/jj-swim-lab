"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Center_1 = __importDefault(require("../models/Center"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { centerId } = req.params;
        if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
            return res.status(403).json({
                success: false,
                message: '회원분포도 공개 여부 조회 권한이 없습니다.'
            });
        }
        const center = await Center_1.default.findById(centerId).select('geoDistributionVisibility');
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const centerAdminUser = await User_1.User.findById(user._id || user.id).select('centerAdminInfo centerId').lean();
            const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
            const viewerCenterId = centerAdminUser?.centerId;
            const isManaged = managedCenters.some((c) => {
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
    }
    catch (error) {
        (0, logger_1.logError)('회원분포도 공개 여부 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원분포도 공개 여부 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:centerId', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { centerId } = req.params;
        const { isPublic, showToOtherCenterAdmins, showToOwnInstructors, showToOtherInstructors, showToOwnMembers, showToOtherMembers } = req.body;
        if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin' && user.userType !== 'center-admin') {
            return res.status(403).json({
                success: false,
                message: '회원분포도 공개 여부 설정 권한이 없습니다.'
            });
        }
        const center = await Center_1.default.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const centerAdminUser = await User_1.User.findById(user._id || user.id).select('centerAdminInfo centerId').lean();
            const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
            const viewerCenterId = centerAdminUser?.centerId;
            const isManaged = managedCenters.some((c) => {
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
    }
    catch (error) {
        (0, logger_1.logError)('회원분포도 공개 여부 설정 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원분포도 공개 여부 설정 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=geo-distribution-visibility.js.map