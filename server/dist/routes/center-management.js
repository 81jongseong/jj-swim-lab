"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const CenterInfo_1 = require("../models/CenterInfo");
const User_1 = require("../models/User");
const CenterRegistration_1 = __importDefault(require("../models/CenterRegistration"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
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
        const [centers, total] = await Promise.all([
            CenterInfo_1.CenterInfo.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(Number(limit))
                .populate('createdBy', 'name email')
                .populate('centerId', 'name email'),
            CenterInfo_1.CenterInfo.countDocuments(filter)
        ]);
        const centersWithStats = await Promise.all(centers.map(async (center) => {
            const [userCount, recentRegistrations] = await Promise.all([
                User_1.User.countDocuments({ centerId: center._id }),
                CenterRegistration_1.default.countDocuments({
                    createdCenterId: center._id,
                    submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                })
            ]);
            return {
                ...center.toObject(),
                stats: {
                    userCount,
                    recentRegistrations
                }
            };
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
router.get('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        if (user.userType === 'centerAdmin' && user.centerId !== id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        const center = await CenterInfo_1.CenterInfo.findById(id)
            .populate('createdBy', 'name email')
            .populate('centerId', 'name email');
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        const [userStats, recentActivity] = await Promise.all([
            User_1.User.aggregate([
                { $match: { centerId: center._id } },
                { $group: { _id: '$userType', count: { $sum: 1 } } }
            ]),
            CenterRegistration_1.default.find({ createdCenterId: center._id })
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
router.patch('/:id/status', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
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
        const center = await CenterInfo_1.CenterInfo.findByIdAndUpdate(id, {
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
router.put('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin']), async (req, res) => {
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
        if (user.userType === 'centerAdmin' && user.centerId !== id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
        }
        if (user.userType === 'centerAdmin') {
            const allowedFields = ['description', 'contact', 'facilities', 'operatingHours', 'images'];
            const filteredData = {};
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            });
            Object.assign(updateData, filteredData);
        }
        const center = await CenterInfo_1.CenterInfo.findByIdAndUpdate(id, {
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
router.delete('/:id', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }
        const center = await CenterInfo_1.CenterInfo.findById(id);
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
        await CenterInfo_1.CenterInfo.findByIdAndUpdate(id, {
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
router.get('/stats/overview', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin']), async (req, res) => {
    try {
        const [centerStats, userStats, recentRegistrations] = await Promise.all([
            CenterInfo_1.CenterInfo.aggregate([
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
router.get('/:id/users', auth_1.auth, (0, auth_1.requireRole)(['superAdmin', 'admin', 'centerAdmin']), async (req, res) => {
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
        if (user.userType === 'centerAdmin' && user.centerId !== id) {
            return res.status(403).json({
                success: false,
                message: '접근 권한이 없습니다.'
            });
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
exports.default = router;
//# sourceMappingURL=center-management.js.map