"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const Center_1 = require("../models/Center");
const SwimmingCenter_1 = require("../models/SwimmingCenter");
const User_1 = require("../models/User");
const CenterRegistration_1 = __importDefault(require("../models/CenterRegistration"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { status, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'contact.email': { $regex: search, $options: 'i' } },
                { 'contact.phone': { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { 'address.province': { $regex: search, $options: 'i' } }
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (Number(page) - 1) * Number(limit);
        let centers = [];
        let total = 0;
        try {
            console.log('🔍 센터 조회 시작...');
            const swimmingCenters = await SwimmingCenter_1.SwimmingCenter.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .lean();
            total = await SwimmingCenter_1.SwimmingCenter.countDocuments(filter);
            console.log(`✅ SwimmingCenter ${swimmingCenters.length}개 조회 완료`);
            centers = swimmingCenters.map((sc) => ({
                _id: sc._id,
                name: sc.name,
                shortDescription: sc.shortDescription || sc.description?.substring(0, 100) || '',
                description: sc.description || '',
                status: sc.isActive ? 'active' : 'inactive',
                grade: sc.grade || 'silver',
                address: {
                    address1: sc.address || '',
                    address2: '',
                    city: sc.city || '',
                    province: sc.province || '',
                    postalCode: sc.postalCode || ''
                },
                contact: {
                    email: sc.email || sc.contactInfo?.email || '',
                    phone: sc.phone || sc.contactInfo?.mainNumber || ''
                },
                capacity: sc.currentCapacity || 100,
                facilities: sc.facilities?.amenities ?
                    Object.entries(sc.facilities.amenities)
                        .filter(([key, value]) => value === true && key.startsWith('has'))
                        .map(([key]) => {
                        if (key === 'hasSauna')
                            return '사우나';
                        if (key === 'hasShower')
                            return '샤워실';
                        if (key === 'hasLocker')
                            return '락커룸';
                        if (key === 'hasParking')
                            return '주차장';
                        if (key === 'hasJacuzzi')
                            return '자쿠지';
                        if (key === 'hasSteamRoom')
                            return '스팀룸';
                        if (key === 'hasFitnessRoom')
                            return '헬스장';
                        if (key === 'hasCafeteria')
                            return '카페';
                        return key;
                    })
                    : [],
                operatingHours: sc.operatingHours || sc.businessHours || {},
                poolInfo: sc.facilities?.mainPool ? {
                    size: {
                        length: sc.facilities.mainPool.poolLength || 25,
                        width: sc.facilities.mainPool.poolWidth || 12,
                        depth: sc.facilities.mainPool.poolDepth || 1.5
                    },
                    capacity: 100
                } : {
                    size: { length: 25, width: 12, depth: 1.5 },
                    capacity: 100
                },
                parkingAvailable: sc.facilities?.amenities?.hasParking || false,
                images: sc.images || {
                    mainImage: '',
                    facilityImages: []
                },
                performance: {
                    memberCount: sc.memberCount || 0,
                    instructorCount: sc.instructors?.length || 0,
                    monthlyRevenue: 0,
                    customerSatisfaction: sc.rating || 0,
                    safetyRecord: 0,
                    operatingMonths: 0
                },
                createdAt: sc.createdAt || new Date(),
                updatedAt: sc.updatedAt || new Date()
            }));
            console.log(`📊 더미 센터 데이터 반환: ${centers.length}개`);
        }
        catch (centerError) {
            console.error('❌ Center 조회 오류:', centerError);
            console.error('❌ 오류 상세:', centerError.stack);
            centers = [];
            total = 0;
            console.log('📝 빈 센터 목록 반환');
        }
        const centersWithStats = centers.map(center => ({
            ...center,
            stats: {
                userCount: 0,
                recentRegistrations: 0
            }
        }));
        res.json({
            success: true,
            data: {
                centers: centersWithStats,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'center-admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const centerAdminUser = await User_1.User.findById(user._id);
            const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
            const hasAccess = user.centerId === id || managedCenters.some((c) => {
                const cId = c.toString ? c.toString() : c._id?.toString() || c;
                return cId === id;
            });
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }
        }
        let center = await SwimmingCenter_1.SwimmingCenter.findById(id).lean();
        if (!center) {
            center = await Center_1.Center.findById(id).lean();
        }
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const centerId = center._id;
        const centerIdForStats = centerId?.toString ? centerId.toString() : centerId;
        const [userStats, recentActivity] = await Promise.all([
            User_1.User.aggregate([
                { $match: { centerId: new mongoose_1.default.Types.ObjectId(centerIdForStats) } },
                { $group: { _id: '$userType', count: { $sum: 1 } } }
            ]),
            CenterRegistration_1.default.find({ createdCenterId: new mongoose_1.default.Types.ObjectId(centerIdForStats) })
                .sort({ submittedAt: -1 })
                .limit(5)
                .populate('applicant.userId', 'name email')
        ]);
        const userTypeStats = userStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                center,
                stats: {
                    totalUsers: Object.values(userTypeStats).reduce((sum, count) => sum + count, 0),
                    userTypeStats,
                    recentActivity
                }
            }
        });
    }
    catch (error) {
        console.error('센터 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 상세 조회 중 오류가 발생했습니다.'
        });
    }
});
router.patch('/:id/status', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const validStatuses = ['active', 'inactive', 'suspended', 'maintenance'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태입니다.'
            });
        }
        const center = await Center_1.Center.findByIdAndUpdate(id, {
            status,
            statusReason: reason,
            statusUpdatedAt: new Date(),
            statusUpdatedBy: req.user._id
        }, { new: true, runValidators: true });
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: `센터 상태가 ${status}로 변경되었습니다.`,
            data: { center }
        });
    }
    catch (error) {
        console.error('센터 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 상태 변경 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'center-admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const centerAdminUser = await User_1.User.findById(user._id);
            const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
            const hasAccess = user.centerId === id || managedCenters.some((c) => {
                const cId = c.toString ? c.toString() : c._id?.toString() || c;
                return cId === id;
            });
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const allowedFields = ['description', 'contact', 'facilities', 'operatingHours', 'images'];
            const filteredData = {};
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            });
            Object.assign(updateData, filteredData);
        }
        const center = await Center_1.Center.findByIdAndUpdate(id, {
            ...updateData,
            updatedAt: new Date(),
            updatedBy: user._id
        }, { new: true, runValidators: true });
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '센터 정보가 성공적으로 수정되었습니다.',
            data: { center }
        });
    }
    catch (error) {
        console.error('센터 정보 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 정보 수정 중 오류가 발생했습니다.'
        });
    }
});
router.get('/admins', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const centerAdmins = await User_1.User.find({ userType: 'centerAdmin' })
            .select('name email phone centerAdminInfo')
            .populate('centerAdminInfo.managedCenters', 'name')
            .lean();
        const adminsList = centerAdmins.map((admin) => ({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            managedCenters: admin.centerAdminInfo?.managedCenters || [],
            managedCentersCount: admin.centerAdminInfo?.managedCenters?.length || 0
        }));
        res.json({
            success: true,
            message: '센터 관리자 목록 조회 성공',
            data: { admins: adminsList }
        });
    }
    catch (error) {
        console.error('센터 관리자 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 관리자 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/centers/:centerId/assign-admin', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const { centerId } = req.params;
        const { adminId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(centerId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 센터 ID입니다.'
            });
        }
        if (!adminId) {
            return res.status(400).json({
                success: false,
                message: '관리자 ID가 필요합니다.'
            });
        }
        const center = await SwimmingCenter_1.SwimmingCenter.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const admin = await User_1.User.findById(adminId);
        if (!admin || admin.userType !== 'centerAdmin') {
            return res.status(404).json({
                success: false,
                message: '센터 관리자를 찾을 수 없습니다.'
            });
        }
        if (!admin.centerAdminInfo) {
            admin.centerAdminInfo = {};
        }
        if (!admin.centerAdminInfo.managedCenters) {
            admin.centerAdminInfo.managedCenters = [];
        }
        const alreadyAssigned = admin.centerAdminInfo.managedCenters.some((c) => c.toString() === centerId);
        if (alreadyAssigned) {
            return res.status(400).json({
                success: false,
                message: '이미 해당 센터가 할당되어 있습니다.'
            });
        }
        admin.centerAdminInfo.managedCenters.push(new mongoose_1.default.Types.ObjectId(centerId));
        await admin.save();
        res.json({
            success: true,
            message: '센터 관리자 할당이 완료되었습니다.',
            data: {
                admin: {
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    managedCenters: admin.centerAdminInfo.managedCenters
                },
                center: {
                    _id: center._id,
                    name: center.name
                }
            }
        });
    }
    catch (error) {
        console.error('센터 관리자 할당 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 관리자 할당 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const center = await Center_1.Center.findById(id);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const userCount = await User_1.User.countDocuments({ centerId: id });
        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: '사용자가 있는 센터는 삭제할 수 없습니다. 먼저 사용자를 다른 센터로 이동하거나 삭제해주세요.'
            });
        }
        await Center_1.Center.findByIdAndUpdate(id, {
            status: 'inactive',
            updatedAt: new Date(),
            updatedBy: req.user._id
        });
        res.json({
            success: true,
            message: '센터가 성공적으로 비활성화되었습니다.'
        });
    }
    catch (error) {
        console.error('센터 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const [centerStats, userStats, recentRegistrations] = await Promise.all([
            Center_1.Center.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            User_1.User.aggregate([
                { $group: { _id: '$userType', count: { $sum: 1 } } }
            ]),
            CenterRegistration_1.default.countDocuments({
                submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            })
        ]);
        const centerStatusCounts = centerStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {});
        const userTypeCounts = userStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                centers: {
                    total: Object.values(centerStatusCounts).reduce((sum, count) => sum + count, 0),
                    active: centerStatusCounts.active || 0,
                    inactive: centerStatusCounts.inactive || 0,
                    suspended: centerStatusCounts.suspended || 0,
                    maintenance: centerStatusCounts.maintenance || 0
                },
                users: {
                    total: Object.values(userTypeCounts).reduce((sum, count) => sum + count, 0),
                    students: userTypeCounts.student || 0,
                    instructors: userTypeCounts.instructor || 0,
                    centerAdmins: userTypeCounts.centerAdmin || 0,
                    superAdmins: userTypeCounts.superAdmin || 0
                },
                recentRegistrations
            }
        });
    }
    catch (error) {
        console.error('센터 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:id/users', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin', 'center-admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { userType, page = 1, limit = 10 } = req.query;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        if (user.userType === 'centerAdmin' || user.userType === 'center-admin') {
            const centerAdminUser = await User_1.User.findById(user._id);
            const managedCenters = centerAdminUser?.centerAdminInfo?.managedCenters || [];
            const hasAccess = user.centerId === id || managedCenters.some((c) => {
                const cId = c.toString ? c.toString() : c._id?.toString() || c;
                return cId === id;
            });
            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: '접근 권한이 없습니다.'
                });
            }
        }
        const filter = { centerId: id };
        if (userType)
            filter.userType = userType;
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User_1.User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            User_1.User.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 사용자 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 사용자 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/fix-status', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('🔧 센터 데이터 분석 시작...');
        const allCenters = await Center_1.Center.find({}).lean();
        console.log(`📊 전체 센터 수: ${allCenters.length}개`);
        allCenters.forEach((center, index) => {
            console.log(`${index + 1}. ID: ${center._id}`);
            console.log(`   이름: ${center.name || 'undefined'}`);
            console.log(`   상태: ${center.status || 'undefined'}`);
            console.log(`   필드들: ${Object.keys(center).join(', ')}`);
            console.log('---');
        });
        const statusAnalysis = await Center_1.Center.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, samples: { $push: '$name' } } }
        ]);
        console.log('📊 status 분석:', JSON.stringify(statusAnalysis, null, 2));
        const forceUpdateResult = await Center_1.Center.updateMany({}, { $set: { status: 'active' } });
        console.log(`📊 강제 업데이트: ${forceUpdateResult.modifiedCount}개`);
        const afterUpdate = await Center_1.Center.countDocuments({ status: 'active' });
        console.log(`📊 업데이트 후 활성 센터: ${afterUpdate}개`);
        const testFind = await Center_1.Center.find({ status: 'active' }).lean();
        console.log(`📊 실제 조회 결과: ${testFind.length}개`);
        testFind.forEach((center, index) => {
            console.log(`조회된 센터 ${index + 1}: ${center.name} (${center.status})`);
        });
        res.json({
            success: true,
            message: '센터 데이터 분석 및 수정 완료',
            data: {
                totalCenters: allCenters.length,
                statusAnalysis,
                forceUpdateCount: forceUpdateResult.modifiedCount,
                activeCentersAfter: afterUpdate,
                actualFindResult: testFind.length
            }
        });
    }
    catch (error) {
        console.error('❌ 센터 데이터 분석 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터 데이터 분석 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-management.js.map