"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const Approval_1 = require("../models/Approval");
const router = (0, express_1.Router)();
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 대시보드 통계 요청 받음');
        const totalUsers = await User_1.User.countDocuments({ status: 'active' });
        const activeCourses = await Course_1.Course.countDocuments({ status: 'active' });
        const totalRevenue = await Payment_1.Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
        const activeBookings = await Booking_1.Booking.countDocuments({
            status: { $in: ['confirmed', 'pending'] }
        });
        const pendingApprovals = await Approval_1.Approval.countDocuments({ status: 'pending' });
        const instructorStats = await User_1.User.aggregate([
            { $match: { userType: 'instructor', status: 'active' } },
            { $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'instructorId',
                    as: 'students'
                } },
            { $project: {
                    name: 1,
                    studentCount: { $size: '$students' }
                } }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            { $match: { status: 'active' } },
            { $project: {
                    name: 1,
                    enrollmentRate: {
                        $multiply: [
                            { $divide: ['$currentStudents', '$maxStudents'] },
                            100
                        ]
                    }
                } }
        ]);
        const dashboardStats = {
            totalUsers,
            activeCourses,
            totalRevenue: revenue,
            activeBookings,
            pendingApprovals,
            instructorStats,
            courseStats
        };
        console.log('✅ 대시보드 통계 생성 완료:', {
            totalUsers,
            activeCourses,
            totalRevenue: revenue,
            activeBookings,
            pendingApprovals
        });
        res.json(dashboardStats);
    }
    catch (error) {
        console.error('❌ 대시보드 통계 생성 중 오류 발생:', error);
        res.status(500).json({
            error: '대시보드 통계를 가져올 수 없습니다',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map