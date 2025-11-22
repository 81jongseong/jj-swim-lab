"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const Center_1 = require("../models/Center");
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/center-images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});
router.get('/', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '센터 정보 조회 성공!',
            data: {
                _id: center._id,
                name: center.name,
                address: center.address,
                phone: center.phone,
                email: center.email,
                website: center.website,
                operatingHours: center.operatingHours,
                facilities: center.facilities,
                amenities: center.amenities,
                images: center.images,
                description: center.description,
                contactInfo: center.contactInfo,
                location: center.location,
                capacity: center.capacity,
                policies: center.policies,
                introduction: center.introduction,
                poolConfiguration: center.poolConfiguration,
                availabilitySettings: center.availabilitySettings,
                customLevels: center.customLevels
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 정보 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const allowedFields = [
            'name', 'address', 'phone', 'email', 'website',
            'operatingHours', 'facilities', 'amenities', 'description',
            'contactInfo', 'location', 'capacity', 'policies', 'introduction',
            'poolConfiguration', 'availabilitySettings', 'customLevels'
        ];
        const updateFields = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields[field] = updateData[field];
            }
        });
        updateFields.updatedAt = new Date();
        updateFields.updatedBy = userId;
        const updatedCenter = await Center_1.Center.findByIdAndUpdate(center._id, updateFields, { new: true, runValidators: true });
        res.json({
            success: true,
            message: '센터 정보가 성공적으로 업데이트되었습니다!',
            data: {
                _id: updatedCenter._id,
                name: updatedCenter.name,
                address: updatedCenter.address,
                phone: updatedCenter.phone,
                email: updatedCenter.email,
                operatingHours: updatedCenter.operatingHours,
                facilities: updatedCenter.facilities,
                capacity: updatedCenter.capacity,
                introduction: updatedCenter.introduction,
                updatedAt: updatedCenter.updatedAt
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 정보 수정 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 수정 중 오류가 발생했습니다.'
        });
    }
});
router.post('/images', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), upload.array('images', 5), async (req, res) => {
    try {
        const userId = req.user._id;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '업로드할 이미지가 없습니다.'
            });
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const imageUrls = files.map(file => `/uploads/center-images/${file.filename}`);
        const updatedImages = [...(center.images || []), ...imageUrls];
        await Center_1.Center.findByIdAndUpdate(center._id, {
            images: updatedImages,
            updatedAt: new Date(),
            updatedBy: userId
        }, { new: true });
        res.json({
            success: true,
            message: '이미지가 성공적으로 업로드되었습니다!',
            data: {
                uploadedImages: imageUrls,
                totalImages: updatedImages.length,
                images: updatedImages
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('이미지 업로드 오류', error);
        res.status(500).json({
            success: false,
            message: '이미지 업로드 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/images/:imageUrl', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const { imageUrl } = req.params;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const decodedImageUrl = decodeURIComponent(imageUrl);
        const filename = decodedImageUrl.split('/').pop();
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 이미지 URL입니다.'
            });
        }
        const updatedImages = (center.images || []).filter(img => !img.includes(filename));
        await Center_1.Center.findByIdAndUpdate(center._id, {
            images: updatedImages,
            updatedAt: new Date(),
            updatedBy: userId
        }, { new: true });
        res.json({
            success: true,
            message: '이미지가 성공적으로 삭제되었습니다!',
            data: {
                deletedImage: decodedImageUrl,
                totalImages: updatedImages.length,
                images: updatedImages
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('이미지 삭제 오류', error);
        res.status(500).json({
            success: false,
            message: '이미지 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.get('/settings', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const settingsData = {
            _id: center._id,
            centerId: center._id,
            geoDistributionVisibility: center.geoDistributionVisibility || {
                isPublic: false,
                showToOtherCenterAdmins: false,
                showToInstructors: false,
                showToMembers: false,
                lastUpdated: new Date(),
                updatedBy: userId
            },
            bookingSettings: {
                advanceBookingDays: 7,
                maxBookingPerUser: 3,
                cancellationHours: 24,
                autoApproval: true,
                bookingTimeSlots: [
                    '09:00-10:00',
                    '10:00-11:00',
                    '11:00-12:00',
                    '14:00-15:00',
                    '15:00-16:00',
                    '16:00-17:00',
                    '18:00-19:00',
                    '19:00-20:00',
                    '20:00-21:00'
                ]
            },
            paymentSettings: {
                acceptedMethods: center?.settings?.paymentSettings?.acceptedMethods || ['카드', '계좌이체', '현금'],
                refundPolicy: center?.settings?.paymentSettings?.refundPolicy || null,
                latePaymentFee: center?.settings?.paymentSettings?.latePaymentFee || 10000,
                autoPayment: center?.settings?.paymentSettings?.autoPayment || false
            },
            notificationSettings: {
                emailNotifications: true,
                smsNotifications: true,
                bookingReminders: true,
                paymentReminders: true,
                systemAlerts: true
            },
            operatingPolicy: {
                membershipRequired: false,
                ageRestrictions: '만 12세 이상',
                dressCode: '수영복 착용 필수, 샤워 후 입장',
                safetyRules: [
                    '수영 전 반드시 샤워',
                    '수영장 내에서 뛰지 않기',
                    '음식물 반입 금지',
                    '구급상자 및 구명장비 위치 확인'
                ]
            },
            systemSettings: {
                maintenanceMode: false,
                allowGuestBooking: true,
                requireApproval: false,
                displayCapacity: true
            },
            updatedAt: new Date()
        };
        res.json({
            success: true,
            message: '센터 설정 조회 성공!',
            data: settingsData
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 설정 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 설정 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/settings', auth_1.authMiddleware, (0, auth_2.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        const userId = req.user._id;
        const settingsData = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자 정보를 찾을 수 없습니다.'
            });
        }
        let center;
        if (user.userType === 'superAdmin') {
            center = await Center_1.Center.findOne({});
        }
        else {
            center = await Center_1.Center.findById(user.centerId);
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터 정보를 찾을 수 없습니다.'
            });
        }
        const updateData = {
            updatedAt: new Date()
        };
        if (settingsData.geoDistributionVisibility) {
            updateData.geoDistributionVisibility = {
                isPublic: settingsData.geoDistributionVisibility.isPublic || false,
                showToOtherCenterAdmins: settingsData.geoDistributionVisibility.showToOtherCenterAdmins || false,
                showToInstructors: settingsData.geoDistributionVisibility.showToInstructors || false,
                showToMembers: settingsData.geoDistributionVisibility.showToMembers || false,
                lastUpdated: new Date(),
                updatedBy: userId
            };
        }
        if (settingsData.settings) {
            updateData.settings = { ...center.settings, ...settingsData.settings };
        }
        if (settingsData.paymentSettings) {
            const currentSettings = center.settings || {};
            updateData.settings = {
                ...currentSettings,
                paymentSettings: {
                    ...(currentSettings.paymentSettings || {}),
                    ...settingsData.paymentSettings,
                    ...(settingsData.paymentSettings.refundPolicy !== undefined
                        ? { refundPolicy: settingsData.paymentSettings.refundPolicy }
                        : {})
                }
            };
            console.log('💾 환불 정책 저장:', JSON.stringify(updateData.settings.paymentSettings.refundPolicy, null, 2));
        }
        const updatedCenter = await Center_1.Center.findByIdAndUpdate(center._id, updateData, { new: true });
        res.json({
            success: true,
            message: '센터 설정이 성공적으로 업데이트되었습니다!',
            data: {
                ...settingsData,
                geoDistributionVisibility: updatedCenter.geoDistributionVisibility,
                updatedAt: new Date()
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 설정 수정 오류', error);
        res.status(500).json({
            success: false,
            message: '센터 설정 수정 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-info.js.map