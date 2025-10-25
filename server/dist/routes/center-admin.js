"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const Payment_1 = require("../models/Payment");
const Notice_1 = require("../models/Notice");
const Review_1 = require("../models/Review");
const Report_1 = require("../models/Report");
const Center_1 = require("../models/Center");
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
const router = express_1.default.Router();
const requireCenterAdmin = (0, auth_1.requireRole)(['centerAdmin', 'center-admin']);
router.get('/dashboard', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        console.log('🔍 센터 관리자 정보:', centerAdmin);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        console.log('🏢 센터 ID:', centerId);
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const totalMembers = await User_1.User.countDocuments({
            $or: [
                { 'studentInfo.centerId': centerId },
                { 'instructorInfo.assignedCenters': centerId }
            ],
            isActive: true
        });
        const activeInstructors = await User_1.User.countDocuments({
            userType: 'instructor',
            'instructorInfo.assignedCenters': centerId,
            isActive: true
        });
        const activeCourses = await Course_1.Course.countDocuments({
            centerId,
            status: 'active'
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    centerId,
                    status: 'completed',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.Booking.countDocuments({
            centerId,
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: 'confirmed'
        });
        const pendingApprovals = await Booking_1.Booking.countDocuments({
            centerId,
            status: 'pending'
        });
        res.json({
            success: true,
            message: '센터 관리자 대시보드 데이터 조회 성공!',
            data: {
                totalMembers,
                activeInstructors,
                activeCourses,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                todayBookings,
                pendingApprovals,
                monthlyGrowth: 12.5,
                averageRating: 4.7
            }
        });
    }
    catch (error) {
        console.error('센터 관리자 대시보드 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/center-info', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const center = await Center_1.Center.findById(centerId);
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        console.log('🏊 센터 정보 조회:', {
            centerName: center.name,
            poolConfiguration: center.poolConfiguration
        });
        return res.json({
            success: true,
            message: '센터 정보 조회 성공!',
            data: center
        });
    }
    catch (error) {
        console.error('센터 정보 조회 오류:', error);
        return res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/users', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, search = '', userType = 'all' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {
            $or: [
                { 'studentInfo.centerId': centerId },
                { 'instructorInfo.assignedCenters': centerId }
            ],
            isActive: true
        };
        if (userType !== 'all') {
            query.userType = userType;
        }
        if (search) {
            query.$and = [
                query,
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }
        const users = await User_1.User.find(query)
            .select('-password +studentInfo +instructorInfo')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
        console.log('📊 회원 목록 조회 결과:', {
            totalUsers: users.length,
            sampleUser: users.length > 0 ? {
                name: users[0].name,
                studentInfo: users[0].studentInfo,
                userType: users[0].userType
            } : null
        });
        users.forEach((user, index) => {
            console.log(`👤 회원 ${index + 1} (${user.name}):`, {
                userType: user.userType,
                studentInfo: user.studentInfo,
                hasStudentInfo: !!user.studentInfo
            });
        });
        console.log('🔧 currentLevel 필드 추가 시작...');
        const usersWithLevel = users.map((user, index) => {
            const userObj = user.toObject();
            console.log(`🔧 회원 ${index + 1} (${userObj.name}) 처리 중:`, {
                userType: userObj.userType,
                studentInfo: userObj.studentInfo,
                hasStudentInfo: !!userObj.studentInfo,
                studentInfoLevel: userObj.studentInfo?.level
            });
            if (userObj.userType === 'student' && userObj.studentInfo?.level) {
                userObj.currentLevel = userObj.studentInfo.level;
                console.log(`✅ 회원 ${index + 1} (${userObj.name}) currentLevel 추가됨:`, userObj.currentLevel);
            }
            else {
                console.log(`❌ 회원 ${index + 1} (${userObj.name}) currentLevel 추가 실패:`, {
                    isStudent: userObj.userType === 'student',
                    hasStudentInfo: !!userObj.studentInfo,
                    hasLevel: !!userObj.studentInfo?.level
                });
            }
            return userObj;
        });
        console.log('🔧 currentLevel 필드 추가 완료. 결과:', usersWithLevel.map(u => ({
            name: u.name,
            currentLevel: u.currentLevel
        })));
        res.json({
            success: true,
            message: '센터 회원 목록 조회 성공!',
            data: {
                users: usersWithLevel,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: usersWithLevel.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 회원 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors/stats', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        console.log('📊 강사 통계 조회 시작');
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const instructors = await User_1.User.find({
            userType: 'instructor',
            centerId: centerId
        });
        const instructorStats = await Promise.all(instructors.map(async (instructor) => {
            try {
                const groupCoursesWithStudents = await Course_1.Course.find({
                    instructorId: instructor._id,
                    centerId: centerId,
                    isPersonalLesson: { $ne: true },
                    'enrolledStudents.0': { '$exists': true }
                }).select('_id enrolledStudents');
                const groupStudentsCount = groupCoursesWithStudents.reduce((acc, course) => acc + course.enrolledStudents.length, 0);
                const personalStudentsCount = await mongoose_1.default.connection.db.collection('personallessons').countDocuments({
                    instructorId: instructor._id,
                    centerId: centerId
                });
                const groupCoursesCount = await Course_1.Course.countDocuments({
                    instructorId: instructor._id,
                    centerId: centerId,
                    isPersonalLesson: { $ne: true }
                });
                const personalLessonsCount = await mongoose_1.default.connection.db.collection('personallessons').countDocuments({
                    instructorId: instructor._id,
                    centerId: centerId
                });
                const completedPersonalLessonsCount = await mongoose_1.default.connection.db.collection('personallessons').countDocuments({
                    instructorId: instructor._id,
                    centerId: centerId,
                    status: 'completed'
                });
                return {
                    instructorId: instructor._id,
                    name: instructor.name,
                    totalStudents: groupStudentsCount + personalStudentsCount,
                    groupStudents: groupStudentsCount,
                    personalStudents: personalStudentsCount,
                    totalLessons: groupCoursesCount + personalLessonsCount,
                    groupCourses: groupCoursesCount,
                    activePersonalLessons: personalLessonsCount,
                    completedPersonalLessons: completedPersonalLessonsCount
                };
            }
            catch (error) {
                console.error(`강사 ${instructor.name} 통계 계산 오류:`, error);
                return {
                    instructorId: instructor._id,
                    name: instructor.name,
                    totalStudents: 0,
                    groupStudents: 0,
                    personalStudents: 0,
                    totalLessons: 0,
                    groupCourses: 0,
                    activePersonalLessons: 0,
                    completedPersonalLessons: 0
                };
            }
        }));
        res.json({
            success: true,
            message: '강사 통계 조회 성공',
            data: instructorStats
        });
    }
    catch (error) {
        console.error('강사 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        console.log('📋 센터 강사 목록 조회 요청');
        console.log('🔍 req.user 정보:', req.user);
        const centerAdmin = await User_1.User.findById(req.user._id);
        console.log('🔍 데이터베이스에서 조회한 사용자:', centerAdmin);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        console.log('👤 센터 관리자:', {
            name: centerAdmin?.name,
            email: centerAdmin?.email,
            centerId: centerId?.toString()
        });
        if (!centerId) {
            console.error('❌ 센터 ID 없음');
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = {
            userType: 'instructor',
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        };
        console.log('🔍 검색 조건:', query);
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const instructors = await User_1.User.find(query)
            .select('-password')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await User_1.User.countDocuments(query);
        console.log('📊 조회 결과:', {
            강사수: instructors.length,
            총계: total,
            강사목록: instructors.map(i => ({ name: i.name, id: i._id.toString() }))
        });
        const responseData = {
            success: true,
            message: '센터 강사 목록 조회 성공!',
            data: {
                instructors,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: instructors.length,
                    totalCount: total
                }
            }
        };
        console.log('📤 응답 데이터:', {
            success: responseData.success,
            instructorsCount: responseData.data.instructors.length,
            instructorNames: responseData.data.instructors.map(i => i.name)
        });
        res.json(responseData);
    }
    catch (error) {
        console.error('센터 강사 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/instructors/:instructorId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        console.log('📝 강사 정보 수정 요청:', {
            instructorId,
            userId: req.user._id,
            bodyKeys: Object.keys(req.body),
            body: req.body
        });
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        console.log('🏢 센터 관리자:', {
            name: centerAdmin?.name,
            centerId: centerId?.toString()
        });
        if (!centerId) {
            console.error('❌ 센터 ID 없음');
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const instructor = await User_1.User.findOne({
            _id: instructorId,
            userType: 'instructor',
            centerId: centerId
        });
        console.log('👨‍🏫 강사 검색 결과:', instructor ? `${instructor.name} 찾음` : '찾지 못함');
        if (!instructor) {
            console.error('❌ 강사 없음 또는 권한 없음');
            return res.status(404).json({
                success: false,
                message: '해당 강사를 찾을 수 없거나 권한이 없습니다.'
            });
        }
        const { phone, instructorInfo } = req.body;
        const updateData = {};
        if (phone !== undefined) {
            updateData.phone = phone;
        }
        if (instructorInfo) {
            if (instructorInfo.instructorLevel) {
                updateData['instructorInfo.instructorLevel'] = instructorInfo.instructorLevel;
            }
            if (instructorInfo.maxStudents !== undefined) {
                updateData['instructorInfo.maxStudents'] = instructorInfo.maxStudents;
            }
            if (instructorInfo.workSchedule) {
                updateData['instructorInfo.workSchedule'] = instructorInfo.workSchedule;
            }
            if (instructorInfo.salaryInfo) {
                updateData['instructorInfo.salaryInfo'] = instructorInfo.salaryInfo;
            }
            if (instructorInfo.memo !== undefined) {
                updateData['instructorInfo.memo'] = instructorInfo.memo;
            }
            if (instructorInfo.hiredAt) {
                updateData['instructorInfo.hiredAt'] = new Date(instructorInfo.hiredAt);
            }
            if (instructorInfo.contractType) {
                updateData['instructorInfo.contractType'] = instructorInfo.contractType;
            }
            if (instructorInfo.specialties) {
                updateData['instructorInfo.specialties'] = instructorInfo.specialties;
            }
            if (instructorInfo.certifications) {
                updateData['instructorInfo.certifications'] = instructorInfo.certifications;
            }
        }
        console.log('📊 업데이트 데이터:', updateData);
        console.log('📋 원본 요청 데이터:', {
            phone: req.body.phone,
            instructorInfo: req.body.instructorInfo
        });
        const updatedInstructor = await User_1.User.findByIdAndUpdate(instructorId, { $set: updateData }, { new: true, runValidators: true }).select('-password');
        console.log('✅ 강사 정보 업데이트 성공:', updatedInstructor?.name);
        console.log('📋 업데이트된 강사 정보:', {
            name: updatedInstructor?.name,
            instructorLevel: updatedInstructor?.instructorInfo?.instructorLevel,
            maxStudents: updatedInstructor?.instructorInfo?.maxStudents,
            memo: updatedInstructor?.instructorInfo?.memo
        });
        res.json({
            success: true,
            message: '강사 정보가 성공적으로 수정되었습니다!',
            data: updatedInstructor
        });
    }
    catch (error) {
        console.error('❌ 강사 정보 수정 오류:', error.message);
        console.error('📋 에러 상세:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});
router.get('/bookings/dashboard', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.Booking.countDocuments({
            centerId,
            date: { $gte: today, $lt: tomorrow }
        });
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        const weekBookings = await Booking_1.Booking.countDocuments({
            centerId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });
        const pendingPersonalLessons = await PersonalLesson_1.PersonalLesson.countDocuments({
            centerId,
            status: 'pending'
        });
        const pendingLaneRentals = await LaneRental_1.LaneRental.countDocuments({
            centerId,
            status: 'pending'
        });
        res.json({
            success: true,
            message: '예약 대시보드 데이터 조회 성공!',
            data: {
                todayBookings,
                weekBookings,
                pendingPersonalLessons,
                pendingLaneRentals,
                pendingApprovals: pendingPersonalLessons + pendingLaneRentals,
                totalRevenue: 0,
                personalLessons: pendingPersonalLessons,
                laneRentals: pendingLaneRentals
            }
        });
    }
    catch (error) {
        console.error('예약 대시보드 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/bookings', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, status = 'all', date, type } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const personalLessons = await PersonalLesson_1.PersonalLesson.find({ centerId })
            .populate('studentId', 'name email phone')
            .populate('instructorId', 'name')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const laneRentals = await LaneRental_1.LaneRental.find({ centerId })
            .populate('userId', 'name email phone')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const allBookings = [
            ...personalLessons.map(lesson => ({
                _id: lesson._id,
                type: 'personal-lesson',
                memberId: lesson.studentId._id,
                memberName: lesson.studentId.name,
                instructorId: lesson.instructorId?._id,
                instructorName: lesson.instructorId?.name,
                date: lesson.date,
                time: lesson.time,
                duration: lesson.duration,
                status: lesson.status,
                price: lesson.price || 0,
                createdAt: lesson.createdAt
            })),
            ...laneRentals.map(rental => ({
                _id: rental._id,
                type: 'lane-rental',
                memberId: rental.userId._id,
                memberName: rental.userId.name,
                date: rental.date,
                time: rental.startTime,
                duration: rental.duration,
                status: rental.status,
                price: rental.price || 0,
                createdAt: rental.createdAt
            }))
        ];
        res.json({
            success: true,
            message: '센터 예약 목록 조회 성공!',
            data: {
                bookings: allBookings,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(allBookings.length / Number(limit)),
                    count: allBookings.length,
                    totalCount: allBookings.length
                }
            }
        });
    }
    catch (error) {
        console.error('센터 예약 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/payments', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { page = 1, limit = 10, status = 'all', startDate, endDate } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const query = { centerId };
        if (status !== 'all') {
            query.status = status;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const payments = await Payment_1.Payment.find(query)
            .populate('userId', 'name email')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Payment_1.Payment.countDocuments(query);
        res.json({
            success: true,
            message: '센터 결제 목록 조회 성공!',
            data: {
                payments,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    count: payments.length,
                    totalCount: total
                }
            }
        });
    }
    catch (error) {
        console.error('센터 결제 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/courses', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const courses = await Course_1.Course.find({
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        }).populate('instructor', 'name email');
        console.log('🔍 강습 과정 조회 결과 (원본):', courses.length, '개');
        courses.forEach((course, index) => {
            console.log(`📋 강습 과정 ${index + 1}:`, {
                _id: course._id,
                name: course.name,
                instructor: course.instructor,
                instructorId: course.instructorId,
                instructorName: course.instructorName,
                centerId: course.centerId
            });
        });
        const coursesData = courses.map((course) => {
            const courseData = {
                _id: course._id,
                name: course.name,
                description: course.description,
                level: course.level,
                maxStudents: course.maxStudents,
                currentStudents: course.currentStudents || 0,
                price: course.price,
                instructorId: course.instructorId || course.instructor?._id || course.instructor,
                instructorName: course.instructorName || course.instructor?.name || '미배정',
                instructorEmail: course.instructor?.email || '',
                schedule: course.schedule,
                isPersonalLesson: course.isPersonalLesson || false,
                courseType: course.courseType || 'group',
                startDate: course.startDate,
                endDate: course.endDate,
                lanes: course.lanes || [1],
                poolType: course.poolType || 'main',
                enrolledStudents: course.enrolledStudents || [],
                isActive: course.isActive,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
            };
            console.log('🔄 변환된 강습 과정 데이터:', {
                _id: courseData._id,
                name: courseData.name,
                instructorId: courseData.instructorId,
                instructorName: courseData.instructorName
            });
            return courseData;
        });
        res.json({
            success: true,
            message: '센터 강습 과정 조회 성공!',
            data: coursesData
        });
    }
    catch (error) {
        console.error('센터 강습 과정 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/schedules', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const courses = await Course_1.Course.find({
            centerId: centerId
        }).populate('instructor', 'name');
        const schedules = courses.map((course) => ({
            _id: course._id,
            title: course.name,
            type: course.isPersonalLesson ? 'personal_lesson' : 'group_class',
            date: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '11:00',
            instructorName: course.instructor?.name || course.instructorName || '미배정',
            maxStudents: course.maxStudents,
            currentStudents: course.currentStudents || 0,
            status: 'confirmed',
            lanes: course.lanes || [1],
            poolType: course.poolType || 'main'
        }));
        res.json({
            success: true,
            message: '센터 스케줄 조회 성공!',
            data: schedules
        });
    }
    catch (error) {
        console.error('센터 스케줄 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/reports', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const monthlyRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    centerId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            {
                $match: { centerId }
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: '_id',
                    foreignField: 'courseId',
                    as: 'bookings'
                }
            },
            {
                $project: {
                    name: 1,
                    level: 1,
                    studentCount: { $size: '$bookings' }
                }
            }
        ]);
        res.json({
            success: true,
            message: '센터 통계 조회 성공!',
            data: {
                monthlyRevenue,
                courseStats
            }
        });
    }
    catch (error) {
        console.error('센터 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/courses', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { name, description, level, maxStudents, price, isPersonalLesson, courseType, startDate, endDate, schedule, lanes, poolType } = req.body;
        if (!name || !description || !level || !maxStudents || price === undefined) {
            return res.status(400).json({
                success: false,
                message: '필수 필드가 누락되었습니다. (name, description, level, maxStudents, price)'
            });
        }
        const course = new Course_1.Course({
            name,
            description,
            level,
            duration: 60,
            maxStudents,
            currentStudents: 0,
            price,
            instructor: centerId,
            centerId,
            classInfo: {
                className: name,
                classType: 'regular',
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                maxCapacity: maxStudents,
                currentEnrollment: 0
            },
            isPersonalLesson: isPersonalLesson || false,
            courseType: courseType || 'group',
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            schedule,
            lanes,
            poolType,
            enrolledStudents: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await course.save();
        console.log('✅ 강습 과정 생성 완료:', course.name);
        res.status(201).json({
            success: true,
            message: '강습 과정이 성공적으로 생성되었습니다.',
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/notices', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const notices = await Notice_1.Notice.find({ centerId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({
            success: true,
            data: notices
        });
    }
    catch (error) {
        console.error('공지사항 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/notices', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { title, content, isImportant } = req.body;
        const notice = new Notice_1.Notice({
            title,
            content,
            author: centerAdmin.name || '센터 관리자',
            isImportant: isImportant || false,
            status: 'published',
            centerId
        });
        await notice.save();
        res.json({
            success: true,
            data: notice
        });
    }
    catch (error) {
        console.error('공지사항 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/payments', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const payments = await Payment_1.Payment.find({ centerId })
            .sort({ paymentDate: -1 })
            .limit(100);
        res.json({
            success: true,
            data: payments
        });
    }
    catch (error) {
        console.error('결제 내역 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/reviews', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const reviews = await Review_1.Review.find({ centerId })
            .sort({ date: -1 })
            .limit(100);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        console.error('리뷰 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/reports', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { period = 'month' } = req.query;
        let report = await Report_1.Report.findOne({ centerId, period });
        if (!report) {
            report = new Report_1.Report({
                period,
                totalStudents: 0,
                totalRevenue: 0,
                totalClasses: 0,
                averageRating: 0,
                newStudents: 0,
                retentionRate: 0,
                centerId
            });
            await report.save();
        }
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('리포트 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.post('/add-sample-data', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        await Notice_1.Notice.deleteMany({ centerId });
        await Payment_1.Payment.deleteMany({ centerId });
        await Review_1.Review.deleteMany({ centerId });
        await Report_1.Report.deleteMany({ centerId });
        const notices = [
            {
                title: '수영장 이용 안내',
                content: '수영장 이용 시 안전수칙을 준수해 주시기 바랍니다.\n\n1. 수영 전 충분한 준비운동을 해주세요.\n2. 수영장 내에서는 뛰지 마세요.\n3. 개인 소지품은 락커에 보관해주세요.',
                author: '센터 관리자',
                isImportant: true,
                status: 'published',
                centerId
            },
            {
                title: '강의 일정 변경 안내',
                content: '다음 주 강의 일정이 변경되었습니다. 확인해 주세요.\n\n- 월요일: 자유형 기초 (오후 2시 → 오후 3시)\n- 수요일: 배영 중급 (오후 4시 → 오후 5시)\n- 금요일: 접영 고급 (오후 6시 → 오후 7시)',
                author: '센터 관리자',
                isImportant: false,
                status: 'published',
                centerId
            },
            {
                title: '새로운 강사 합류',
                content: '새로운 강사가 합류했습니다. 환영해 주세요.\n\n김수영 강사님\n- 전국대회 우승 경력\n- 자유형 전문\n- 친절하고 체계적인 지도',
                author: '센터 관리자',
                isImportant: false,
                status: 'published',
                centerId
            }
        ];
        await Notice_1.Notice.insertMany(notices);
        const payments = [
            {
                studentName: '김학생',
                courseName: '자유형 기초',
                amount: 150000,
                paymentMethod: '카드',
                status: 'completed',
                transactionId: 'TXN123456789',
                centerId
            },
            {
                studentName: '박학생',
                courseName: '배영 중급',
                amount: 200000,
                paymentMethod: '계좌이체',
                status: 'pending',
                transactionId: 'TXN123456790',
                centerId
            },
            {
                studentName: '정학생',
                courseName: '접영 고급',
                amount: 250000,
                paymentMethod: '카드',
                status: 'failed',
                transactionId: 'TXN123456791',
                centerId
            }
        ];
        await Payment_1.Payment.insertMany(payments);
        const reviews = [
            {
                studentName: '김학생',
                instructorName: '이강사',
                courseName: '자유형 기초',
                rating: 5,
                comment: '정말 좋은 강의였습니다. 강사님이 친절하시고 설명도 잘 해주셔요.',
                status: 'approved',
                centerId
            },
            {
                studentName: '박학생',
                instructorName: '최강사',
                courseName: '배영 중급',
                rating: 4,
                comment: '배영 기술이 많이 향상되었어요. 감사합니다.',
                status: 'pending',
                centerId
            },
            {
                studentName: '정학생',
                instructorName: '김강사',
                courseName: '접영 고급',
                rating: 3,
                comment: '강의는 괜찮지만 시간이 좀 부족했어요.',
                status: 'rejected',
                centerId
            }
        ];
        await Review_1.Review.insertMany(reviews);
        const reports = [
            {
                period: 'month',
                totalStudents: 156,
                totalRevenue: 23400000,
                totalClasses: 89,
                averageRating: 4.7,
                newStudents: 23,
                retentionRate: 87.5,
                centerId
            },
            {
                period: 'week',
                totalStudents: 45,
                totalRevenue: 6750000,
                totalClasses: 23,
                averageRating: 4.8,
                newStudents: 8,
                retentionRate: 92.0,
                centerId
            }
        ];
        await Report_1.Report.insertMany(reports);
        res.json({
            success: true,
            message: '예시 데이터가 성공적으로 추가되었습니다.',
            data: {
                notices: notices.length,
                payments: payments.length,
                reviews: reviews.length,
                reports: reports.length
            }
        });
    }
    catch (error) {
        console.error('예시 데이터 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors/:instructorId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        console.log('📋 개별 강사 정보 조회:', instructorId);
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const instructor = await User_1.User.findOne({
            _id: instructorId,
            userType: 'instructor',
            centerId: centerId
        });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '강사 정보 조회 성공',
            data: instructor
        });
    }
    catch (error) {
        console.error('강사 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors/:instructorId/students-list', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        console.log('🔥🔥🔥 강사별 학생 목록 조회 API 호출됨:', instructorId);
        console.log('🔥🔥🔥 요청 URL:', req.url);
        console.log('🔥🔥🔥 요청 메서드:', req.method);
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        console.log('🏢 센터 ID:', centerId);
        if (!centerId) {
            console.log('❌ 센터 ID 없음');
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const groupCourses = await Course_1.Course.find({
            instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            centerId: new mongoose_1.default.Types.ObjectId(centerId),
            isPersonalLesson: { $ne: true }
        });
        console.log(`📚 조회된 단체반 수업: ${groupCourses.length}개`);
        const groupStudents = [];
        for (const course of groupCourses) {
            console.log(`📚 Course: ${course.name}, Students:`, course.students);
            console.log(`📚 Course: ${course.name}, EnrolledStudents:`, course.enrolledStudents);
            const studentIds = [];
            if (course.students && course.students.length > 0) {
                console.log(`🔍 students 필드에서 조회할 학생 ID들:`, course.students);
                studentIds.push(...course.students.map(id => typeof id === 'string' ? new mongoose_1.default.Types.ObjectId(id) : id));
            }
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                console.log(`🔍 enrolledStudents 필드에서 조회할 학생 ID들:`, course.enrolledStudents);
                studentIds.push(...course.enrolledStudents.map(enrollment => typeof enrollment.student === 'string' ? new mongoose_1.default.Types.ObjectId(enrollment.student) : enrollment.student));
            }
            if (studentIds.length > 0) {
                console.log(`🔍 최종 조회할 학생 ID들:`, studentIds);
                const courseStudents = await User_1.User.find({ _id: { $in: studentIds } });
                console.log(`👥 조회된 학생들:`, courseStudents.map(s => ({ name: s.name, _id: s._id })));
                for (const student of courseStudents) {
                    groupStudents.push({
                        _id: student._id,
                        name: student.name,
                        courseId: course._id,
                        courseName: course.name,
                        isPersonalLesson: false,
                        status: 'active',
                        enrollmentDate: student.createdAt || new Date(),
                        phone: student.phone || '010-0000-0000',
                        email: student.email || `${student.name}@example.com`,
                        progress: Math.floor(Math.random() * 100),
                        currentPackage: {
                            name: course.name,
                            remainingSessions: 10,
                            expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                        }
                    });
                }
            }
            else {
                console.log(`⚠️ ${course.name}: 실제 학생 데이터 없음`);
            }
        }
        const personalLessons = await mongoose_1.default.connection.db.collection('personallessons').find({
            instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        }).toArray();
        const studentIds = personalLessons.map(lesson => lesson.studentId).filter(Boolean);
        const students = await User_1.User.find({ _id: { $in: studentIds } });
        const personalStudents = personalLessons.map(lesson => {
            const student = students.find(s => s._id.toString() === lesson.studentId?.toString());
            if (student) {
                return {
                    _id: lesson._id,
                    name: student.name,
                    courseId: lesson._id,
                    courseName: '개인레슨',
                    isPersonalLesson: true,
                    status: lesson.status || 'active',
                    enrollmentDate: lesson.schedule?.date || lesson.createdAt || new Date(),
                    phone: student.phone || '',
                    email: student.email || '',
                    progress: lesson.progress || 0,
                    currentPackage: {
                        name: '개인레슨 패키지',
                        remainingSessions: lesson.remainingSessions || 0,
                        expirationDate: lesson.expirationDate || new Date()
                    },
                    personalLessonInfo: {
                        lessonType: lesson.lessonType || '1:1',
                        completedSessions: lesson.completedSessions || 0,
                        remainingSessions: lesson.remainingSessions || 0,
                        totalSessions: lesson.totalSessions || 0,
                        pricePerSession: lesson.pricePerSession || 0,
                        endDate: lesson.expirationDate || new Date()
                    }
                };
            }
            return null;
        }).filter(Boolean);
        const allStudents = [...groupStudents, ...personalStudents];
        res.json({
            success: true,
            message: '강사별 학생 목록 조회 성공',
            data: allStudents
        });
    }
    catch (error) {
        console.error('강사별 학생 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/members/:memberId/memo', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { memberId } = req.params;
        const { memo, memoType } = req.body;
        const member = await User_1.User.findOne({
            _id: memberId,
            userType: 'student',
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        if (!member.studentInfo.centerMemos) {
            member.studentInfo.centerMemos = [];
        }
        const newMemo = {
            _id: new mongoose_1.default.Types.ObjectId(),
            content: memo,
            type: memoType || 'info',
            createdAt: new Date(),
            createdBy: req.user._id,
            createdByName: centerAdmin.name || '센터 관리자'
        };
        member.studentInfo.centerMemos.push(newMemo);
        member.studentInfo.centerMemo = memo;
        await member.save();
        res.json({
            success: true,
            message: '메모가 저장되었습니다.',
            data: member
        });
    }
    catch (error) {
        console.error('회원 메모 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.delete('/members/:memberId/memo/:memoId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { memberId, memoId } = req.params;
        const member = await User_1.User.findOne({
            _id: memberId,
            userType: 'student',
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        if (!member.studentInfo.centerMemos) {
            member.studentInfo.centerMemos = [];
        }
        member.studentInfo.centerMemos = member.studentInfo.centerMemos.filter((memo) => memo._id.toString() !== memoId);
        await member.save();
        res.json({
            success: true,
            message: '메모가 삭제되었습니다.',
            data: member
        });
    }
    catch (error) {
        console.error('회원 메모 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/members/:memberId/memo/:memoId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { memberId, memoId } = req.params;
        const { content, type } = req.body;
        if (!content || !type) {
            return res.status(400).json({
                success: false,
                message: '메모 내용과 타입을 입력해주세요.'
            });
        }
        const member = await User_1.User.findOne({
            _id: memberId,
            userType: 'student',
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        if (!member.studentInfo.centerMemos) {
            member.studentInfo.centerMemos = [];
        }
        const memoIndex = member.studentInfo.centerMemos.findIndex((memo) => memo._id.toString() === memoId);
        if (memoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: '메모를 찾을 수 없습니다.'
            });
        }
        member.studentInfo.centerMemos[memoIndex].content = content;
        member.studentInfo.centerMemos[memoIndex].type = type;
        member.studentInfo.centerMemos[memoIndex].updatedAt = new Date();
        await member.save();
        res.json({
            success: true,
            message: '메모가 수정되었습니다.'
        });
    }
    catch (error) {
        console.error('메모 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/members', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        console.log('👥 회원 목록 조회 시작');
        const { courseId } = req.query;
        console.log('📋 요청된 courseId:', courseId);
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const members = await User_1.User.find({
            userType: 'student',
            centerId: centerId
        }).select('name email phone userType status createdAt studentInfo');
        console.log('🔍 조회된 회원 수:', members.length);
        members.forEach((member, index) => {
            console.log(`${index + 1}. ${member.name}:`, {
                level: member.studentInfo?.level,
                studentInfo: member.studentInfo
            });
        });
        const membersWithCourses = await Promise.all(members.map(async (member) => {
            const assignedCourses = await Course_1.Course.find({
                centerId: centerId,
                'enrolledStudents.student': member._id,
                isPersonalLesson: { $ne: true }
            }).select('name instructorId');
            const courseDetails = await Promise.all(assignedCourses.map(async (course) => {
                const instructor = await User_1.User.findById(course.instructorId).select('name');
                return {
                    courseId: course._id,
                    courseName: course.name,
                    instructorName: instructor?.name || '미배정',
                    enrollmentDate: new Date(),
                    status: 'active'
                };
            }));
            let isEnrolledInSpecificCourse = false;
            if (courseId) {
                isEnrolledInSpecificCourse = courseDetails.some(course => course.courseId.toString() === courseId.toString());
            }
            return {
                _id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone || '',
                userType: member.userType,
                status: member.status || 'active',
                enrollmentDate: member.createdAt || new Date(),
                assignedCourses: courseDetails,
                totalLessonsCompleted: 0,
                lastLessonDate: null,
                centerMemo: member.studentInfo?.centerMemo || '',
                centerMemos: member.studentInfo?.centerMemos || [],
                currentLevel: member.studentInfo?.level || '레벨 미설정',
                studentInfo: {
                    level: member.studentInfo?.level || '레벨 미설정',
                    emergencyContact: member.studentInfo?.emergencyContact || '',
                    medicalConditions: member.studentInfo?.medicalConditions || '',
                    goals: member.studentInfo?.goals || [],
                    centerMemo: member.studentInfo?.centerMemo || '',
                    centerMemos: member.studentInfo?.centerMemos || []
                },
                isEnrolledInSpecificCourse: isEnrolledInSpecificCourse,
                currentCourses: courseDetails.map(course => ({
                    courseId: course.courseId,
                    courseName: course.courseName,
                    courseType: 'group',
                    instructorName: course.instructorName,
                    startDate: course.enrollmentDate,
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: course.status,
                    remainingSessions: 10,
                    totalSessions: 12
                })),
                personalLessons: [],
                membershipType: 'regular',
                emergencyContact: member.studentInfo?.emergencyContact || '',
                medicalConditions: member.studentInfo?.medicalConditions || '',
                swimmingGoals: member.studentInfo?.goals || [],
                preferredTimes: member.studentInfo?.preferredTimes || [],
                notes: member.studentInfo?.centerMemo || ''
            };
        }));
        res.json({
            success: true,
            message: '회원 목록 조회 성공',
            data: membersWithCourses
        });
    }
    catch (error) {
        console.error('회원 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/members/stats/summary', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const totalMembers = await User_1.User.countDocuments({
            userType: 'student',
            centerId: centerId
        });
        const activeMembers = await User_1.User.countDocuments({
            userType: 'student',
            centerId: centerId,
            status: 'active'
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newMembersThisMonth = await User_1.User.countDocuments({
            userType: 'student',
            centerId: centerId,
            createdAt: { $gte: startOfMonth }
        });
        const expiringTicketsCount = 0;
        res.json({
            success: true,
            message: '회원 통계 조회 성공',
            data: {
                totalMembers,
                activeMembers,
                newMembersThisMonth,
                expiringTicketsCount
            }
        });
    }
    catch (error) {
        console.error('회원 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/members/:memberId/course', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { memberId } = req.params;
        const { courseId } = req.body;
        console.log('📝 회원 과정 배정 시작:', { memberId, courseId });
        console.log('📝 요청 본문:', req.body);
        console.log('📝 요청 헤더:', req.headers);
        console.log('📝 사용자 정보:', req.user);
        if (!courseId) {
            console.log('❌ courseId가 없습니다.');
            return res.status(400).json({
                success: false,
                message: '과정 ID가 필요합니다.'
            });
        }
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        console.log('🏢 센터 관리자 정보:', {
            centerAdminId: centerAdmin?._id,
            centerId: centerId,
            managedCenters: centerAdmin?.centerAdminInfo?.managedCenters
        });
        if (!centerId) {
            console.log('❌ 관리하는 센터가 없습니다.');
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const member = await User_1.User.findById(memberId);
        console.log('👤 회원 정보:', {
            memberId: member?._id,
            userType: member?.userType,
            name: member?.name,
            email: member?.email
        });
        if (!member || member.userType !== 'student') {
            console.log('❌ 학생 회원을 찾을 수 없습니다.');
            return res.status(404).json({
                success: false,
                message: '학생 회원을 찾을 수 없습니다.'
            });
        }
        if (member.studentInfo?.emergencyContact && typeof member.studentInfo.emergencyContact === 'object') {
            const contact = member.studentInfo.emergencyContact;
            member.studentInfo.emergencyContact = `${contact.name || ''} (${contact.phone || ''})`;
            console.log('🔄 emergencyContact 필드 변환:', member.studentInfo.emergencyContact);
        }
        console.log('🔍 과정 조회 조건:', {
            courseId: courseId,
            centerId: centerId,
            isPersonalLesson: { $ne: true }
        });
        const course = await Course_1.Course.findOne({
            _id: courseId,
            centerId: centerId,
            isPersonalLesson: { $ne: true }
        });
        console.log('📚 과정 조회 결과:', course ? '찾음' : '찾지 못함');
        console.log('📚 과정 정보:', {
            courseId: course?._id,
            courseName: course?.name,
            centerId: course?.centerId,
            maxStudents: course?.maxStudents,
            enrolledStudents: course?.enrolledStudents?.length
        });
        if (!course) {
            console.log('❌ 과정을 찾을 수 없습니다.');
            return res.status(404).json({
                success: false,
                message: '과정을 찾을 수 없습니다.'
            });
        }
        const enrolledStudents = course.enrolledStudents || [];
        console.log('📊 현재 등록된 학생들:', enrolledStudents);
        const alreadyEnrolled = enrolledStudents.some((enrollment) => {
            if (!enrollment || !enrollment.student) {
                console.log('⚠️ 잘못된 등록 데이터:', enrollment);
                return false;
            }
            return enrollment.student.toString() === memberId;
        });
        console.log('🔍 이미 배정되어 있는지 확인:', alreadyEnrolled);
        if (alreadyEnrolled) {
            console.log('❌ 이미 해당 과정에 배정되어 있습니다.');
            return res.status(400).json({
                success: false,
                message: '이미 해당 과정에 배정되어 있습니다.'
            });
        }
        if (enrolledStudents.length >= course.maxStudents) {
            console.log('❌ 과정 정원이 가득 찼습니다.');
            return res.status(400).json({
                success: false,
                message: '과정 정원이 가득 찼습니다.'
            });
        }
        const validEnrolledStudents = enrolledStudents.filter((enrollment) => enrollment && enrollment.student);
        console.log('🧹 정리된 등록된 학생들:', validEnrolledStudents);
        const newEnrollment = {
            student: memberId,
            enrollmentDate: new Date(),
            status: 'active'
        };
        validEnrolledStudents.push(newEnrollment);
        course.enrolledStudents = validEnrolledStudents;
        console.log('✅ 업데이트할 enrolledStudents:', course.enrolledStudents);
        await course.save();
        console.log('💾 강습 과정 저장 완료');
        console.log('🔄 회원 레벨 업데이트 시작:', {
            memberId: memberId,
            currentLevel: member.studentInfo?.level,
            courseLevel: course.level
        });
        let updatedLevel = course.level;
        const levelMapping = {
            'level1': '초급',
            'level2': '중급',
            'level3': '고급',
            'beginner': '초급',
            'intermediate': '중급',
            'advanced': '고급',
            'all': '전체'
        };
        if (levelMapping[course.level]) {
            updatedLevel = levelMapping[course.level];
        }
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        const oldLevel = member.studentInfo.level;
        member.studentInfo.level = updatedLevel;
        if (member.studentInfo.emergencyContact && typeof member.studentInfo.emergencyContact === 'object') {
            const contact = member.studentInfo.emergencyContact;
            member.studentInfo.emergencyContact = `${contact.name || ''} (${contact.phone || ''})`;
        }
        const memberToSave = member.toObject();
        if (memberToSave.studentInfo?.emergencyContact && typeof memberToSave.studentInfo.emergencyContact === 'object') {
            delete memberToSave.studentInfo.emergencyContact;
        }
        await User_1.User.findByIdAndUpdate(memberId, {
            'studentInfo.level': updatedLevel,
            'studentInfo.emergencyContact': member.studentInfo.emergencyContact || ''
        });
        console.log('✅ 회원 레벨 업데이트 완료:', {
            memberName: member.name,
            oldLevel: oldLevel,
            newLevel: updatedLevel
        });
        res.json({
            success: true,
            message: '과정 배정이 완료되었습니다.',
            data: {
                memberId: memberId,
                courseId: courseId,
                courseName: course.name,
                levelUpdated: {
                    oldLevel: oldLevel,
                    newLevel: updatedLevel
                }
            }
        });
    }
    catch (error) {
        console.error('❌ 회원 과정 배정 오류:', error);
        console.error('❌ 오류 스택:', error.stack);
        console.error('❌ 오류 타입:', typeof error);
        console.error('❌ 오류 메시지:', error.message);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});
router.get('/courses', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        console.log('📚 센터 관리자용 강습 과정 목록 조회 시작');
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const courses = await Course_1.Course.find({
            centerId: centerId
        }).populate('instructorId', 'name email');
        const coursesData = courses.map(course => ({
            _id: course._id,
            name: course.name,
            description: course.description,
            level: course.level,
            duration: course.duration,
            maxStudents: course.maxStudents,
            currentStudents: course.enrolledStudents?.length || 0,
            instructorId: course.instructorId,
            instructor: course.instructorId,
            price: course.price,
            schedule: course.schedule,
            status: course.status,
            createdAt: course.createdAt,
            tags: course.tags || [],
            poolType: course.poolType,
            lanes: course.lanes,
            laneInfo: course.laneInfo,
            courseType: course.courseType,
            isPersonalLesson: course.isPersonalLesson,
            enrolledStudents: course.enrolledStudents,
            startDate: course.startDate,
            endDate: course.endDate
        }));
        res.json({
            success: true,
            message: '강습 과정 목록 조회 성공',
            data: coursesData
        });
    }
    catch (error) {
        console.error('강습 과정 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/members/:memberId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const { memberId } = req.params;
        const updateData = req.body;
        const member = await User_1.User.findOne({
            _id: memberId,
            userType: 'student',
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        });
        if (!member) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }
        const allowedFields = [
            'name', 'email', 'phone', 'status', 'currentLevel',
            'emergencyContact', 'medicalConditions', 'swimmingGoals',
            'centerMemo', 'membershipType', 'notes'
        ];
        if (updateData.name)
            member.name = updateData.name;
        if (updateData.email)
            member.email = updateData.email;
        if (updateData.phone !== undefined)
            member.phone = updateData.phone;
        if (updateData.status)
            member.status = updateData.status;
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        if (updateData.currentLevel !== undefined)
            member.studentInfo.currentLevel = updateData.currentLevel;
        if (updateData.emergencyContact !== undefined)
            member.studentInfo.emergencyContact = updateData.emergencyContact;
        if (updateData.medicalConditions !== undefined)
            member.studentInfo.medicalConditions = updateData.medicalConditions;
        if (updateData.swimmingGoals !== undefined)
            member.studentInfo.goals = updateData.swimmingGoals;
        if (updateData.centerMemo !== undefined)
            member.studentInfo.centerMemo = updateData.centerMemo;
        if (updateData.membershipType !== undefined)
            member.studentInfo.membershipType = updateData.membershipType;
        if (updateData.notes !== undefined)
            member.studentInfo.notes = updateData.notes;
        await member.save();
        res.json({
            success: true,
            message: '회원 정보가 성공적으로 수정되었습니다.',
            data: member
        });
    }
    catch (error) {
        console.error('회원 정보 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=center-admin.js.map