"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Center_1 = require("../models/Center");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.get('/public/:centerId', async (req, res) => {
    try {
        console.log('🔍 센터 소개 정보 조회 (공개용)');
        const { centerId } = req.params;
        const center = await Center_1.Center.findById(centerId)
            .select('name address phone email introduction operatingHours facilities')
            .populate('managerId', 'name');
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        if (!center.introduction?.visibility?.isPublic) {
            return res.status(403).json({
                success: false,
                message: '이 센터는 공개되지 않은 정보입니다.'
            });
        }
        const publicInfo = {
            _id: center._id,
            name: center.name,
            address: center.address,
            phone: center.phone,
            email: center.email,
            operatingHours: center.operatingHours,
            facilities: center.facilities,
            introduction: {
                shortDescription: center.introduction?.shortDescription || '',
                fullDescription: center.introduction?.fullDescription || '',
                features: center.introduction?.features || [],
                certifications: center.introduction?.certifications || [],
                images: center.introduction?.images || [],
                videoUrl: center.introduction?.videoUrl || '',
                achievements: center.introduction?.achievements || [],
                specialPrograms: center.introduction?.specialPrograms || [],
                targetAudience: center.introduction?.targetAudience || [],
                philosophy: center.introduction?.philosophy || '',
                contactInfo: {
                    website: center.introduction?.contactInfo?.website || '',
                    socialMedia: center.introduction?.contactInfo?.socialMedia || {},
                    parkingInfo: center.introduction?.contactInfo?.parkingInfo || '',
                    publicTransport: center.introduction?.contactInfo?.publicTransport || ''
                }
            }
        };
        res.json({
            success: true,
            message: '센터 소개 정보 조회 성공',
            data: publicInfo
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 소개 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 소개 정보를 조회할 수 없습니다.'
        });
    }
});
router.get('/member/:centerId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student', 'instructor', 'centerAdmin']), async (req, res) => {
    try {
        console.log('🔍 센터 소개 정보 조회 (회원/강사용)');
        const { centerId } = req.params;
        const userType = req.user.userType;
        const userCenterId = req.user.centerId;
        const center = await Center_1.Center.findById(centerId)
            .populate('managerId', 'name email')
            .populate('instructors', 'name email instructorInfo')
            .populate('students', 'name email');
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const isOwnCenter = userCenterId && userCenterId.toString() === centerId;
        const canViewMemberInfo = userType === 'centerAdmin' ||
            (userType === 'instructor' && center.introduction?.visibility?.showToInstructors) ||
            (userType === 'student' && center.introduction?.visibility?.showToMembers);
        if (!isOwnCenter && !canViewMemberInfo) {
            return res.status(403).json({
                success: false,
                message: '이 센터 정보에 접근할 권한이 없습니다.'
            });
        }
        const memberInfo = {
            _id: center._id,
            name: center.name,
            address: center.address,
            phone: center.phone,
            email: center.email,
            operatingHours: center.operatingHours,
            facilities: center.facilities,
            manager: center.managerId,
            instructorCount: center.instructors.length,
            studentCount: center.students.length,
            introduction: center.introduction,
            status: center.status,
            capacity: center.capacity
        };
        res.json({
            success: true,
            message: '센터 소개 정보 조회 성공',
            data: memberInfo
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 소개 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 소개 정보를 조회할 수 없습니다.'
        });
    }
});
router.put('/:centerId', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        console.log('🔄 센터 소개 정보 편집 요청');
        const { centerId } = req.params;
        const userId = req.user._id;
        const userType = req.user.userType;
        const userCenterId = req.user.centerId;
        if (userType === 'centerAdmin' && (!userCenterId || userCenterId.toString() !== centerId)) {
            return res.status(403).json({
                success: false,
                message: '자신이 관리하는 센터만 편집할 수 있습니다.'
            });
        }
        const center = await Center_1.Center.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const updateData = req.body;
        if (!center.introduction) {
            center.introduction = {
                shortDescription: '',
                fullDescription: '',
                features: [],
                certifications: [],
                images: [],
                achievements: [],
                specialPrograms: [],
                targetAudience: [],
                philosophy: '',
                history: '',
                staff: [],
                contactInfo: {
                    socialMedia: {}
                },
                pricing: {
                    membershipFees: [],
                    lessonFees: []
                },
                visibility: {
                    isPublic: true,
                    showToMembers: true,
                    showToInstructors: true,
                    lastUpdated: new Date(),
                    updatedBy: userId
                }
            };
        }
        Object.keys(updateData).forEach(key => {
            if (key !== 'visibility') {
                center.introduction[key] = updateData[key];
            }
        });
        if (updateData.visibility) {
            center.introduction.visibility = {
                ...center.introduction.visibility,
                ...updateData.visibility,
                lastUpdated: new Date(),
                updatedBy: userId
            };
        }
        else {
            center.introduction.visibility.lastUpdated = new Date();
            center.introduction.visibility.updatedBy = userId;
        }
        await center.save();
        res.json({
            success: true,
            message: '센터 소개 정보가 성공적으로 업데이트되었습니다.',
            data: center.introduction
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 소개 정보 편집 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 소개 정보를 편집할 수 없습니다.'
        });
    }
});
router.get('/search', async (req, res) => {
    try {
        console.log('🔍 센터 검색 요청');
        const { keyword = '', location = '', features = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const searchConditions = {
            status: 'active',
            'introduction.visibility.isPublic': true
        };
        if (keyword) {
            searchConditions.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { 'introduction.shortDescription': { $regex: keyword, $options: 'i' } },
                { 'introduction.features': { $in: [new RegExp(keyword, 'i')] } }
            ];
        }
        if (location) {
            searchConditions.address = { $regex: location, $options: 'i' };
        }
        if (features) {
            const featureList = features.split(',').map(f => f.trim());
            searchConditions['introduction.features'] = { $in: featureList };
        }
        const centers = await Center_1.Center.find(searchConditions)
            .select('name address phone introduction operatingHours facilities')
            .skip(skip)
            .limit(limitNum)
            .sort({ 'introduction.visibility.lastUpdated': -1 });
        const total = await Center_1.Center.countDocuments(searchConditions);
        const searchResults = centers.map(center => ({
            _id: center._id,
            name: center.name,
            address: center.address,
            phone: center.phone,
            operatingHours: center.operatingHours,
            facilities: center.facilities,
            shortDescription: center.introduction?.shortDescription || '',
            features: center.introduction?.features || [],
            images: center.introduction?.images?.slice(0, 3) || [],
            targetAudience: center.introduction?.targetAudience || []
        }));
        res.json({
            success: true,
            message: '센터 검색 완료',
            data: {
                centers: searchResults,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 검색 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 검색 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:centerId/images', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'superAdmin']), async (req, res) => {
    try {
        console.log('📸 센터 이미지 업로드 요청');
        const { centerId } = req.params;
        const { imageUrl, description } = req.body;
        void description;
        const userId = req.user._id;
        const userType = req.user.userType;
        const userCenterId = req.user.centerId;
        if (userType === 'centerAdmin' && (!userCenterId || userCenterId.toString() !== centerId)) {
            return res.status(403).json({
                success: false,
                message: '자신이 관리하는 센터에만 이미지를 업로드할 수 있습니다.'
            });
        }
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: '이미지 URL이 필요합니다.'
            });
        }
        const center = await Center_1.Center.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        if (!center.introduction) {
            center.introduction = {};
        }
        if (!center.introduction.images) {
            center.introduction.images = [];
        }
        center.introduction.images.push(imageUrl);
        if (!center.introduction.visibility) {
            center.introduction.visibility = {
                isPublic: true,
                showToMembers: true,
                showToInstructors: true,
                lastUpdated: new Date(),
                updatedBy: userId
            };
        }
        else {
            center.introduction.visibility.lastUpdated = new Date();
            center.introduction.visibility.updatedBy = userId;
        }
        await center.save();
        res.json({
            success: true,
            message: '이미지가 성공적으로 업로드되었습니다.',
            data: {
                imageUrl,
                totalImages: center.introduction.images.length
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 이미지 업로드 오류:', error);
        res.status(500).json({
            success: false,
            message: '이미지 업로드 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-introduction.js.map