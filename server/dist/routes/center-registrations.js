"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const CenterRegistration_1 = __importDefault(require("../models/CenterRegistration"));
const User_1 = require("../models/User");
const CenterInfo_1 = require("../models/CenterInfo");
const SwimmingCenter_1 = require("../models/SwimmingCenter");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    try {
        const { centerName, businessNumber, representativeName, representativeEmail, representativePhone, password } = req.body;
        if (!centerName || !businessNumber || !representativeName || !representativeEmail || !representativePhone || !password) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다.'
            });
        }
        const registrationData = req.body;
        const existingRegistration = await CenterRegistration_1.default.findOne({
            businessNumber: registrationData.businessNumber
        });
        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: '이미 등록된 사업자등록번호입니다.'
            });
        }
        const existingUser = await User_1.User.findOne({
            email: registrationData.representativeEmail
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 이메일입니다.'
            });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const registration = new CenterRegistration_1.default({
            ...registrationData,
            password: hashedPassword,
            status: 'pending',
            submittedAt: new Date()
        });
        await registration.save();
        res.status(201).json({
            success: true,
            message: '센터 등록 신청이 성공적으로 제출되었습니다.',
            data: { registration }
        });
    }
    catch (error) {
        console.error('센터 등록 신청 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 신청 중 오류가 발생했습니다.'
        });
    }
});
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { centerName: { $regex: search, $options: 'i' } },
                { businessNumber: { $regex: search, $options: 'i' } },
                { representativeName: { $regex: search, $options: 'i' } },
                { 'applicant.name': { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [registrations, total] = await Promise.all([
            CenterRegistration_1.default.find(filter)
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('approvalInfo.reviewedBy', 'name email')
                .populate('approvalInfo.approvedBy', 'name email')
                .populate('approvalInfo.rejectedBy', 'name email'),
            CenterRegistration_1.default.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: {
                registrations,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 등록 신청 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 신청 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const registration = await CenterRegistration_1.default.findById(id)
            .populate('approvalInfo.reviewedBy', 'name email')
            .populate('approvalInfo.approvedBy', 'name email')
            .populate('approvalInfo.rejectedBy', 'name email')
            .populate('createdCenterId')
            .populate('createdCenterAdminId', 'name email');
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: '센터 등록 신청을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: { registration }
        });
    }
    catch (error) {
        console.error('센터 등록 신청 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 신청 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:id/approve', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const registration = await CenterRegistration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: '센터 등록 신청을 찾을 수 없습니다.'
            });
        }
        if (registration.status !== 'pending' && registration.status !== 'under_review') {
            return res.status(400).json({
                success: false,
                message: '승인할 수 없는 상태입니다.'
            });
        }
        const weekdayOpen = registration.centerInfo.operatingHours?.weekdays?.open || '06:00';
        const weekdayClose = registration.centerInfo.operatingHours?.weekdays?.close || '22:00';
        const weekendOpen = registration.centerInfo.operatingHours?.weekends?.open || '08:00';
        const weekendClose = registration.centerInfo.operatingHours?.weekends?.close || '20:00';
        const mainPool = registration.centerInfo.pools?.find(p => p.type === 'main') || registration.centerInfo.pools?.[0];
        const facilityNames = [];
        if (registration.centerInfo.facilities && Array.isArray(registration.centerInfo.facilities)) {
            registration.centerInfo.facilities.forEach((facility) => {
                if (typeof facility === 'object' && facility.enabled) {
                    facilityNames.push(facility.name);
                }
                else if (typeof facility === 'string') {
                    facilityNames.push(facility);
                }
            });
        }
        const latitude = registration.address.latitude || 37.5665;
        const longitude = registration.address.longitude || 126.9780;
        const swimmingCenter = new SwimmingCenter_1.SwimmingCenter({
            name: registration.centerName,
            address: `${registration.address.address1} ${registration.address.address2 || ''}`.trim(),
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            phone: registration.representativePhone,
            email: registration.representativeEmail,
            description: registration.centerInfo.description,
            shortDescription: registration.centerInfo.description.substring(0, 100),
            facilities: {
                availablePoolLengths: mainPool ? [mainPool.length] : [25],
                mainPool: mainPool ? {
                    lanes: mainPool.laneCount || 6,
                    poolLength: mainPool.length || 25,
                    poolDepth: mainPool.depth || 1.5,
                    temperature: 28
                } : {
                    lanes: 6,
                    poolLength: 25,
                    poolDepth: 1.5,
                    temperature: 28
                },
                amenities: {
                    hasSauna: facilityNames.includes('사우나'),
                    hasShower: facilityNames.includes('샤워실') || true,
                    hasLocker: facilityNames.includes('락커룸') || true,
                    hasJacuzzi: facilityNames.includes('체온유지탕(월풀)'),
                    hasSteamRoom: facilityNames.includes('찜질방'),
                    hasFitnessRoom: facilityNames.includes('PT룸'),
                    hasCafeteria: facilityNames.includes('카페'),
                    hasParking: registration.centerInfo.parking?.available || false,
                    parkingSpaces: registration.centerInfo.parking?.spaces || 0,
                    additionalFacilities: facilityNames.join(', ')
                }
            },
            businessHours: {
                monday: `${weekdayOpen}-${weekdayClose}`,
                tuesday: `${weekdayOpen}-${weekdayClose}`,
                wednesday: `${weekdayOpen}-${weekdayClose}`,
                thursday: `${weekdayOpen}-${weekdayClose}`,
                friday: `${weekdayOpen}-${weekdayClose}`,
                saturday: `${weekendOpen}-${weekendClose}`,
                sunday: `${weekendOpen}-${weekendClose}`
            },
            contactInfo: {
                mainNumber: registration.representativePhone,
                email: registration.representativeEmail,
                website: '',
                kakaoChannel: ''
            },
            province: registration.address.province || '',
            city: registration.address.city || '',
            gu: registration.address.gu || '',
            dong: registration.address.dong || '',
            isActive: true,
            instructors: [],
            courses: []
        });
        await swimmingCenter.save();
        console.log('✅ SwimmingCenter 생성 완료:', swimmingCenter._id);
        const centerInfo = new CenterInfo_1.CenterInfo({
            centerId: `center-${Date.now()}`,
            name: registration.centerName,
            shortDescription: registration.centerInfo.description.substring(0, 100),
            address: `${registration.address.address1} ${registration.address.address2 || ''}`.trim(),
            phone: registration.representativePhone,
            email: registration.representativeEmail,
            description: registration.centerInfo.description,
            businessHours: {
                monday: `${weekdayOpen}-${weekdayClose}`,
                tuesday: `${weekdayOpen}-${weekdayClose}`,
                wednesday: `${weekdayOpen}-${weekdayClose}`,
                thursday: `${weekdayOpen}-${weekdayClose}`,
                friday: `${weekdayOpen}-${weekdayClose}`,
                saturday: `${weekendOpen}-${weekendClose}`,
                sunday: `${weekendOpen}-${weekendClose}`
            },
            facilities: facilityNames.length > 0 ? facilityNames : ['샤워실', '락커룸'],
            features: mainPool ? [`메인 수영장: ${mainPool.length}m × ${mainPool.width}m × ${mainPool.depth}m (${mainPool.laneCount || 6}레인)`] : [],
            images: {
                gallery: []
            },
            instructors: [],
            courses: []
        });
        await centerInfo.save();
        console.log('✅ CenterInfo 생성 완료:', centerInfo._id);
        const centerAdmin = new User_1.User({
            userId: `admin-${registration.businessNumber}`,
            email: registration.representativeEmail,
            name: registration.representativeName,
            password: registration.password,
            phone: registration.representativePhone,
            userType: 'centerAdmin',
            centerId: swimmingCenter._id,
            centerAdminInfo: {
                centerName: registration.centerName,
                businessNumber: registration.businessNumber,
                permissions: ['center_management', 'user_management', 'course_management'],
                managedCenters: [swimmingCenter._id]
            },
            isActive: true
        });
        await centerAdmin.save();
        registration.status = 'approved';
        registration.approvalInfo = {
            ...registration.approvalInfo,
            reviewedBy: new mongoose_1.default.Types.ObjectId(user._id),
            reviewedAt: new Date(),
            approvedBy: new mongoose_1.default.Types.ObjectId(user._id),
            approvedAt: new Date(),
            comments: comments || '센터 등록이 승인되었습니다.'
        };
        registration.createdCenterId = centerInfo._id;
        registration.createdCenterAdminId = centerAdmin._id;
        await registration.save();
        res.json({
            success: true,
            message: '센터 등록이 성공적으로 승인되었습니다.',
            data: {
                registration,
                swimmingCenter: {
                    id: swimmingCenter._id,
                    name: swimmingCenter.name,
                    address: swimmingCenter.address,
                    location: swimmingCenter.location
                },
                centerInfo,
                centerAdmin: {
                    id: centerAdmin._id,
                    email: centerAdmin.email,
                    name: centerAdmin.name,
                    centerId: swimmingCenter._id
                }
            }
        });
    }
    catch (error) {
        console.error('센터 등록 승인 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 승인 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:id/reject', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason, comments } = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const registration = await CenterRegistration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: '센터 등록 신청을 찾을 수 없습니다.'
            });
        }
        if (registration.status !== 'pending' && registration.status !== 'under_review') {
            return res.status(400).json({
                success: false,
                message: '거부할 수 없는 상태입니다.'
            });
        }
        registration.status = 'rejected';
        registration.approvalInfo = {
            ...registration.approvalInfo,
            reviewedBy: new mongoose_1.default.Types.ObjectId(user._id),
            reviewedAt: new Date(),
            rejectedBy: new mongoose_1.default.Types.ObjectId(user._id),
            rejectedAt: new Date(),
            rejectionReason,
            comments: comments || '센터 등록이 거부되었습니다.'
        };
        await registration.save();
        res.json({
            success: true,
            message: '센터 등록이 거부되었습니다.',
            data: { registration }
        });
    }
    catch (error) {
        console.error('센터 등록 거부 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 거부 중 오류가 발생했습니다.'
        });
    }
});
router.post('/:id/review', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const registration = await CenterRegistration_1.default.findById(id);
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: '센터 등록 신청을 찾을 수 없습니다.'
            });
        }
        if (registration.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: '검토할 수 없는 상태입니다.'
            });
        }
        registration.status = 'under_review';
        registration.approvalInfo = {
            ...registration.approvalInfo,
            reviewedBy: new mongoose_1.default.Types.ObjectId(user._id),
            reviewedAt: new Date()
        };
        await registration.save();
        res.json({
            success: true,
            message: '센터 등록 신청 검토가 시작되었습니다.',
            data: { registration }
        });
    }
    catch (error) {
        console.error('센터 등록 검토 시작 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 검토 시작 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const stats = await CenterRegistration_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const statusCounts = stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {});
        const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
        res.json({
            success: true,
            data: {
                total,
                pending: statusCounts.pending || 0,
                underReview: statusCounts.under_review || 0,
                approved: statusCounts.approved || 0,
                rejected: statusCounts.rejected || 0,
                cancelled: statusCounts.cancelled || 0
            }
        });
    }
    catch (error) {
        console.error('센터 등록 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 등록 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-registrations.js.map