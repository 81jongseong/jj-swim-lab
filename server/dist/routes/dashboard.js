"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const Approval_1 = require("../models/Approval");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 대시보드 통계 요청 받음');
        const totalUsers = await User_1.User.countDocuments({ isActive: true });
        const activeCourses = await Course_1.Course.countDocuments({ isActive: true });
        const totalRevenue = await Payment_1.Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
        const activeBookings = await Booking_1.Booking.countDocuments({
            status: { $in: ['confirmed', 'pending'] }
        });
        const pendingApprovals = await Approval_1.Approval.countDocuments({ status: 'pending' });
        const instructorStats = await User_1.User.find({
            userType: 'instructor',
            isActive: true
        }).select('name instructorInfo.currentStudents').lean();
        const instructorStatsFormatted = instructorStats.map(instructor => ({
            name: instructor.name,
            studentCount: instructor.instructorInfo?.currentStudents || 0
        }));
        const courseStats = await Course_1.Course.find({
            isActive: true
        }).select('name classInfo.currentEnrollment classInfo.maxCapacity').lean();
        const courseStatsFormatted = courseStats.map(course => ({
            name: course.name,
            enrollmentRate: course.classInfo?.maxCapacity > 0 ?
                Math.round((course.classInfo?.currentEnrollment || 0) / course.classInfo.maxCapacity * 100) : 0
        }));
        const dashboardStats = {
            totalUsers,
            activeCourses,
            totalRevenue: revenue,
            activeBookings,
            pendingApprovals,
            instructorStats: instructorStatsFormatted,
            courseStats: courseStatsFormatted
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
        (0, logger_1.logError)('❌ 대시보드 통계 생성 중 오류 발생:', error);
        res.status(500).json({
            error: '대시보드 통계를 가져올 수 없습니다',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map