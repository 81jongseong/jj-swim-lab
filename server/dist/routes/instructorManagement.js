"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const User_1 = require("../models/User");
const Center_1 = require("../models/Center");
const Booking_1 = require("../models/Booking");
const Checklist_1 = require("../models/Checklist");
const HealthData_1 = require("../models/HealthData");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const superAdminOnly = (0, role_1.roleMiddleware)(['superAdmin']);
router.get('/overview', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const totalInstructors = await User_1.User.countDocuments({ userType: 'instructor' });
        const activeInstructors = await User_1.User.countDocuments({
            userType: 'instructor',
            status: 'active'
        });
        const totalStudents = await User_1.User.countDocuments({ userType: 'student' });
        const instructors = await User_1.User.find({ userType: 'instructor' });
        const totalRating = instructors.reduce((sum, instructor) => sum + (instructor.rating || 0), 0);
        const averageRating = totalRating / totalInstructors || 0;
        const centerDistribution = await User_1.User.aggregate([
            { $match: { userType: 'instructor' } },
            { $group: { _id: '$centerId', count: { $sum: 1 } } },
            { $lookup: { from: 'centers', localField: '_id', foreignField: '_id', as: 'center' } },
            { $unwind: '$center' },
            { $project: { centerName: '$center.name', count: 1 } }
        ]);
        res.json({
            success: true,
            data: {
                totalInstructors,
                activeInstructors,
                totalStudents,
                averageRating: Math.round(averageRating * 10) / 10,
                centerDistribution
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 현황 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사 현황 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all', center = 'all', sortBy = 'name', sortOrder = 'asc' } = req.query;
        const searchQuery = { userType: 'instructor' };
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        if (status !== 'all') {
            searchQuery.status = status;
        }
        if (center !== 'all') {
            searchQuery.centerId = center;
        }
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const skip = (Number(page) - 1) * Number(limit);
        const instructors = await User_1.User.find(searchQuery)
            .populate('centerId', 'name address')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .select('-password');
        const total = await User_1.User.countDocuments(searchQuery);
        const instructorsWithDetails = await Promise.all(instructors.map(async (instructor) => {
            const totalStudents = await User_1.User.countDocuments({
                instructorId: instructor._id,
                userType: 'student'
            });
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeStudents = await User_1.User.countDocuments({
                instructorId: instructor._id,
                userType: 'student',
                lastActive: { $gte: thirtyDaysAgo }
            });
            const totalBookings = await Booking_1.Booking.countDocuments({
                instructorId: instructor._id,
                status: { $in: ['completed', 'cancelled'] }
            });
            const completedBookings = await Booking_1.Booking.countDocuments({
                instructorId: instructor._id,
                status: 'completed'
            });
            const completionRate = totalBookings > 0
                ? Math.round((completedBookings / totalBookings) * 100)
                : 0;
            return {
                ...instructor.toObject(),
                totalStudents,
                activeStudents,
                completionRate
            };
        }));
        res.json({
            success: true,
            data: {
                instructors: instructorsWithDetails,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalItems: total,
                    itemsPerPage: Number(limit)
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors/:id', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const instructor = await User_1.User.findById(id)
            .populate('centerId', 'name address phone')
            .select('-password');
        if (!instructor || instructor.userType !== 'instructor') {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        const students = await User_1.User.find({
            instructorId: id,
            userType: 'student'
        }).select('name email phone status lastActive');
        const bookings = await Booking_1.Booking.find({ instructorId: id })
            .populate('studentId', 'name')
            .populate('courseId', 'name level')
            .sort({ date: -1 })
            .limit(20);
        const checklists = await Checklist_1.Checklist.find({ instructorId: id })
            .populate('studentId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({
            success: true,
            data: {
                instructor,
                students,
                recentBookings: bookings,
                recentChecklists: checklists
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 상세 정보 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사 상세 정보 조회 중 오류가 발생했습니다.'
        });
    }
});
router.put('/instructors/:id', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const allowedFields = [
            'name', 'email', 'phone', 'specialization', 'experience',
            'status', 'centerId', 'rating', 'bio'
        ];
        const filteredData = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });
        const instructor = await User_1.User.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true }).select('-password');
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '강사 정보가 성공적으로 업데이트되었습니다.',
            data: instructor
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 정보 업데이트 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사 정보 업데이트 중 오류가 발생했습니다.'
        });
    }
});
router.get('/performance/:instructorId', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const totalLessons = await Booking_1.Booking.countDocuments({
            instructorId,
            date: { $gte: startDate, $lte: now }
        });
        const completedLessons = await Booking_1.Booking.countDocuments({
            instructorId,
            date: { $gte: startDate, $lte: now },
            status: 'completed'
        });
        const instructor = await User_1.User.findById(instructorId);
        const studentSatisfaction = instructor?.rating || 0;
        const totalBookings = await Booking_1.Booking.countDocuments({
            instructorId,
            date: { $gte: startDate, $lte: now },
            status: { $in: ['completed', 'cancelled'] }
        });
        const attendanceRate = totalBookings > 0
            ? Math.round((completedLessons / totalBookings) * 100)
            : 0;
        const students = await User_1.User.find({
            instructorId,
            userType: 'student'
        });
        let totalProgress = 0;
        let studentCount = 0;
        for (const student of students) {
            const studentChecklists = await Checklist_1.Checklist.find({
                studentId: student._id,
                instructorId
            });
            if (studentChecklists.length > 0) {
                const completedItems = studentChecklists.reduce((sum, checklist) => {
                    return sum + checklist.items.filter((item) => item.completed).length;
                }, 0);
                const totalItems = studentChecklists.reduce((sum, checklist) => {
                    return sum + checklist.items.length;
                }, 0);
                if (totalItems > 0) {
                    totalProgress += (completedItems / totalItems) * 100;
                    studentCount++;
                }
            }
        }
        const averageProgressRate = studentCount > 0
            ? Math.round(totalProgress / studentCount)
            : 0;
        let previousStartDate;
        switch (period) {
            case 'week':
                previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
                break;
            case 'quarter':
                previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1);
                break;
            case 'year':
                previousStartDate = new Date(startDate.getFullYear() - 1, 0, 1);
                break;
            default:
                previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        }
        const previousLessons = await Booking_1.Booking.countDocuments({
            instructorId,
            date: { $gte: previousStartDate, $lt: startDate }
        });
        const monthlyGrowth = previousLessons > 0
            ? Math.round(((totalLessons - previousLessons) / previousLessons) * 100)
            : 0;
        res.json({
            success: true,
            data: {
                instructorId,
                period,
                totalLessons,
                completedLessons,
                studentSatisfaction,
                progressRate: averageProgressRate,
                attendanceRate,
                monthlyGrowth
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 성과 데이터 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사 성과 데이터 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/students/:instructorId', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const students = await User_1.User.find({
            instructorId,
            userType: 'student'
        }).select('name email phone status lastActive joinDate');
        const studentsWithDetails = await Promise.all(students.map(async (student) => {
            const checklists = await Checklist_1.Checklist.find({
                studentId: student._id,
                instructorId
            });
            const totalChecklistItems = checklists.reduce((sum, checklist) => {
                return sum + checklist.items.length;
            }, 0);
            const completedChecklistItems = checklists.reduce((sum, checklist) => {
                return sum + checklist.items.filter((item) => item.completed).length;
            }, 0);
            const checklistProgress = totalChecklistItems > 0
                ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
                : 0;
            const totalBookings = await Booking_1.Booking.countDocuments({
                studentId: student._id,
                instructorId
            });
            const completedBookings = await Booking_1.Booking.countDocuments({
                studentId: student._id,
                instructorId,
                status: 'completed'
            });
            const courseProgress = totalBookings > 0
                ? Math.round((completedBookings / totalBookings) * 100)
                : 0;
            const healthData = await HealthData_1.HealthData.findOne({
                studentId: student._id
            });
            return {
                ...student.toObject(),
                checklistProgress,
                courseProgress,
                hasHealthData: !!healthData,
                totalChecklists: checklists.length
            };
        }));
        res.json({
            success: true,
            data: {
                instructorId,
                students: studentsWithDetails
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 관리 현황 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '강사별 학생 관리 현황 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/centers', auth_1.auth, superAdminOnly, async (req, res) => {
    try {
        const centers = await Center_1.Center.find().select('name address phone');
        const centersWithInstructors = await Promise.all(centers.map(async (center) => {
            const instructors = await User_1.User.find({
                centerId: center._id,
                userType: 'instructor'
            }).select('name email status rating');
            const students = await User_1.User.find({
                centerId: center._id,
                userType: 'student'
            }).select('name status');
            return {
                ...center.toObject(),
                instructorCount: instructors.length,
                studentCount: students.length,
                instructors,
                students
            };
        }));
        res.json({
            success: true,
            data: centersWithInstructors
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터별 강사 현황 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '센터별 강사 현황 조회 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=instructorManagement.js.map