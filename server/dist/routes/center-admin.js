"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
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
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const requireCenterAdmin = (0, auth_1.requireRole)(['centerAdmin', 'center-admin']);
router.get('/dashboard', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const centerAdmin = await User_1.User.findById(req.user._id);
        console.log('🔍 센터 관리자 정보:', centerAdmin);
        const queryCenterId = req.query.centerId;
        let centerId;
        if (queryCenterId) {
            const managedCenters = centerAdmin?.centerAdminInfo?.managedCenters || [];
            const isValidCenter = managedCenters.some((c) => {
                const cId = c.toString ? c.toString() : c._id?.toString() || c;
                return cId === queryCenterId;
            });
            if (isValidCenter) {
                centerId = queryCenterId;
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: '해당 센터를 관리할 권한이 없습니다.'
                });
            }
        }
        else {
            centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        }
        console.log('🏢 센터 ID:', centerId);
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const centerIdStrings = new Set();
        const objectIdStrings = new Set();
        const collectCenterId = (value) => {
            if (!value)
                return;
            if (Array.isArray(value)) {
                value.forEach(collectCenterId);
                return;
            }
            if (value instanceof mongoose_1.default.Types.ObjectId) {
                const str = value.toString();
                objectIdStrings.add(str);
                return;
            }
            if (typeof value === 'object') {
                if (value._id) {
                    collectCenterId(value._id);
                    return;
                }
                if (value.toString && value.toString() !== '[object Object]') {
                    collectCenterId(value.toString());
                    return;
                }
            }
            const strValue = String(value);
            centerIdStrings.add(strValue);
            if (mongoose_1.default.Types.ObjectId.isValid(strValue)) {
                objectIdStrings.add(strValue);
            }
        };
        collectCenterId(centerId);
        collectCenterId(queryCenterId);
        const objectIdCandidates = Array.from(objectIdStrings).map((id) => new mongoose_1.default.Types.ObjectId(id));
        const stringCandidates = Array.from(centerIdStrings).filter((id) => !objectIdStrings.has(id));
        const centerIdFilterValues = [
            ...objectIdCandidates,
            ...stringCandidates
        ];
        if (centerIdFilterValues.length === 0) {
            console.warn('⚠️ 센터 ID 후보가 없어 통계를 계산할 수 없습니다.', {
                userId: req.user?._id,
                centerId,
                queryCenterId
            });
            return res.status(400).json({
                success: false,
                message: '센터 정보를 확인할 수 없습니다.'
            });
        }
        const centerIdFilter = { $in: centerIdFilterValues };
        const centerOrConditions = [
            { centerId: centerIdFilter },
            { 'instructorInfo.assignedCenters': centerIdFilter },
            { 'studentInfo.enrolledCenters': centerIdFilter }
        ];
        const totalMembers = await User_1.User.countDocuments({
            isActive: true,
            userType: { $in: ['student', 'instructor'] },
            $or: centerOrConditions
        });
        const activeInstructors = await User_1.User.countDocuments({
            userType: 'instructor',
            isActive: true,
            $or: centerOrConditions
        });
        const activeCourses = await Course_1.Course.countDocuments({
            centerId: centerIdFilter,
            status: 'active'
        });
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = await Payment_1.Payment.aggregate([
            {
                $match: {
                    centerId: centerIdFilter,
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
            centerId: centerIdFilter,
            date: {
                $gte: today,
                $lt: tomorrow
            },
            status: 'confirmed'
        });
        const { Approval } = require('../models/Approval');
        const pendingRefundRequests = await Approval.countDocuments({
            type: 'refund_request',
            status: 'pending',
            centerId: centerIdFilter
        });
        console.log('📊 센터 관리자 대시보드 통계', {
            userId: req.user?._id,
            centerIdCandidates: centerIdFilterValues.map((value) => value.toString()),
            totals: {
                totalMembers,
                activeInstructors,
                activeCourses,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                todayBookings,
                pendingApprovals: pendingRefundRequests
            }
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
                pendingApprovals: pendingRefundRequests,
                monthlyGrowth: 12.5,
                averageRating: 4.7
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 관리자 대시보드 조회 오류', error);
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
        const center = await Center_1.Center.findById(centerId).lean();
        if (!center) {
            return res.status(404).json({
                success: false,
                message: '센터를 찾을 수 없습니다.'
            });
        }
        console.log('🏊 센터 정보 조회:', {
            centerName: center.name,
            poolConfiguration: center.poolConfiguration,
            availabilitySettings: center.availabilitySettings ? JSON.stringify(center.availabilitySettings, null, 2) : '없음'
        });
        return res.json({
            success: true,
            message: '센터 정보 조회 성공!',
            data: center
        });
    }
    catch (error) {
        (0, logger_1.logError)('센터 정보 조회 오류', error);
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
            centerId: centerId,
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
                hasStudentInfo: !!userObj.studentInfo
            });
            if (userObj.userType === 'student') {
                userObj.currentLevel = userObj.studentInfo?.currentLevel
                    || userObj.studentInfo?.swimmingLevel
                    || userObj.level
                    || '레벨 미설정';
                console.log(`✅ 회원 ${index + 1} (${userObj.name}) currentLevel 설정됨:`, userObj.currentLevel);
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
        (0, logger_1.logError)('센터 회원 목록 조회 오류', error);
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
                    $or: [
                        { instructorId: instructor._id },
                        { instructor: instructor._id }
                    ],
                    centerId: centerId,
                    isPersonalLesson: { $ne: true },
                    'enrolledStudents.0': { '$exists': true }
                }).select('_id enrolledStudents');
                const groupStudentsCount = groupCoursesWithStudents.reduce((acc, course) => acc + course.enrolledStudents.length, 0);
                const personalLessons = await PersonalLesson_1.PersonalLesson.find({
                    instructorId: instructor._id,
                    centerId: centerId
                });
                const uniqueStudentIds = new Set();
                personalLessons.forEach(lesson => {
                    if (lesson.studentId) {
                        uniqueStudentIds.add(lesson.studentId.toString());
                    }
                });
                const personalLessonCourses = await Course_1.Course.find({
                    $or: [
                        { instructorId: instructor._id },
                        { instructor: instructor._id }
                    ],
                    centerId: centerId,
                    isPersonalLesson: true
                }).select('enrolledStudents');
                personalLessonCourses.forEach(course => {
                    course.enrolledStudents.forEach(enrollment => {
                        if (enrollment.student) {
                            uniqueStudentIds.add(enrollment.student.toString());
                        }
                    });
                });
                const personalStudentsCount = uniqueStudentIds.size;
                const groupCoursesCount = await Course_1.Course.countDocuments({
                    $or: [
                        { instructorId: instructor._id },
                        { instructor: instructor._id }
                    ],
                    centerId: centerId,
                    isPersonalLesson: { $ne: true }
                });
                const coursePersonalLessonsCount = await Course_1.Course.countDocuments({
                    $or: [
                        { instructorId: instructor._id },
                        { instructor: instructor._id }
                    ],
                    centerId: centerId,
                    isPersonalLesson: true
                });
                console.log(`📊 ${instructor.name} 개인레슨 통계:`, {
                    personalStudentsFromPersonalLessonModel: personalLessons.length,
                    personalStudentsFromCourseModel: personalLessonCourses.length,
                    uniqueStudentsCount: personalStudentsCount
                });
                const personalLessonsCount = personalLessons.length + coursePersonalLessonsCount;
                const completedPersonalLessonsCount = personalLessons.filter(lesson => lesson.status === 'completed').length;
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
                (0, logger_1.logError)(`강사 ${instructor.name} 통계 계산 오류`, error);
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
        (0, logger_1.logError)('강사 통계 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const admin = await User_1.User.findById(req.user._id);
        const centerId = admin?.centerId || admin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({ success: false, message: '관리하는 센터가 없습니다.' });
        }
        const instructors = await User_1.User.find({ userType: 'instructor', centerId: centerId }, 'name email phone userType').lean();
        return res.json({ success: true, data: instructors });
    }
    catch (error) {
        (0, logger_1.logError)('강사 목록 조회 오류', error);
        return res.status(500).json({ success: false, message: '강사 목록 조회 중 오류가 발생했습니다.' });
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
            (0, logger_1.logError)('센터 ID 없음');
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
            (0, logger_1.logError)('강사 없음 또는 권한 없음');
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
            if (instructorInfo.photo !== undefined) {
                updateData['instructorInfo.photo'] = instructorInfo.photo;
            }
            if (instructorInfo.bio !== undefined) {
                updateData['instructorInfo.bio'] = instructorInfo.bio;
            }
            if (instructorInfo.introduction !== undefined) {
                updateData['instructorInfo.introduction'] = instructorInfo.introduction;
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
        (0, logger_1.logError)('강사 정보 수정 오류', { message: error.message, error });
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const instructorImageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(uploadDir, 'instructor-images');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `instructor-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const instructorImageUpload = (0, multer_1.default)({
    storage: instructorImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    }
});
router.post('/instructors/:instructorId/upload-photo', auth_1.authMiddleware, requireCenterAdmin, instructorImageUpload.single('photo'), async (req, res) => {
    try {
        const { instructorId } = req.params;
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: '파일이 업로드되지 않았습니다.'
            });
        }
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
                message: '해당 강사를 찾을 수 없거나 권한이 없습니다.'
            });
        }
        const imageUrl = `/uploads/instructor-images/${file.filename}`;
        if (!instructor.instructorInfo) {
            instructor.instructorInfo = {};
        }
        instructor.instructorInfo.photo = imageUrl;
        await instructor.save();
        res.json({
            success: true,
            message: '강사 사진이 성공적으로 업로드되었습니다.',
            data: {
                imageUrl,
                photo: imageUrl
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 사진 업로드 오류', error);
        res.status(500).json({
            success: false,
            message: error.message || '강사 사진 업로드 중 오류가 발생했습니다.'
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
        (0, logger_1.logError)('예약 대시보드 조회 오류', error);
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
        void status;
        void date;
        void type;
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
                memberId: lesson.studentId?._id || lesson.studentId,
                memberName: lesson.studentId?.name || '회원 정보 없음',
                instructorId: lesson.instructorId?._id || lesson.instructorId,
                instructorName: lesson.instructorId?.name || '강사 정보 없음',
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
                memberId: rental.userId?._id || rental.userId,
                memberName: rental.userId?.name || '회원 정보 없음',
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
        (0, logger_1.logError)('센터 예약 목록 조회 오류', error);
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
            .populate('user', 'name email')
            .populate('relatedCourse', 'name')
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
        (0, logger_1.logError)('센터 결제 목록 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.patch('/payments/:id/complete', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment_1.Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: '결제를 찾을 수 없습니다.' });
        }
        if (payment.status === 'completed') {
            return res.json({ success: true, message: '이미 완료된 결제입니다.', data: payment });
        }
        payment.status = 'completed';
        payment.approvedAt = new Date();
        await payment.save();
        if (payment.relatedCourse && payment.purpose === 'course') {
            const course = await Course_1.Course.findById(payment.relatedCourse);
            if (course) {
                const already = (course.enrolledStudents || []).some((e) => e?.student?.toString?.() === payment.user.toString());
                if (!already) {
                    course.enrolledStudents = [
                        ...(course.enrolledStudents || []),
                        { student: payment.user, enrollmentDate: new Date(), status: 'active' }
                    ];
                    await course.save();
                }
                if (course.centerId) {
                    const student = await User_1.User.findById(payment.user);
                    if (student && !student.centerId) {
                        student.centerId = course.centerId;
                        await student.save();
                    }
                }
            }
        }
        return res.json({ success: true, message: '결제가 완료 처리되었습니다.', data: payment });
    }
    catch (error) {
        (0, logger_1.logError)('결제 완료 처리 오류', error);
        return res.status(500).json({ success: false, message: '결제 완료 처리 중 오류가 발생했습니다.' });
    }
});
router.patch('/payments/:id/cancel', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment_1.Payment.findById(id);
        if (!payment)
            return res.status(404).json({ success: false, message: '결제를 찾을 수 없습니다.' });
        payment.status = 'cancelled';
        await payment.save();
        if (payment.relatedCourse && payment.purpose === 'course') {
            const course = await Course_1.Course.findById(payment.relatedCourse);
            const userIdStr = payment.user?.toString?.() || String(payment.user || '');
            if (course) {
                const current = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
                course.enrolledStudents = current.filter((e) => {
                    const sid = e?.student?.toString?.() || String(e?.student || '');
                    return sid !== userIdStr;
                });
                await course.save();
            }
        }
        return res.json({ success: true, message: '결제가 취소되었습니다.', data: payment });
    }
    catch (error) {
        (0, logger_1.logError)('결제 취소 처리 오류', error);
        return res.status(500).json({ success: false, message: '결제 취소 처리 중 오류가 발생했습니다.' });
    }
});
router.patch('/payments/:id/refund', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { refundAmount } = req.body;
        const payment = await Payment_1.Payment.findById(id);
        if (!payment)
            return res.status(404).json({ success: false, message: '결제를 찾을 수 없습니다.' });
        payment.refundAmount = typeof refundAmount === 'number' ? refundAmount : payment.amount;
        payment.status = 'refunded';
        await payment.save();
        if (payment.relatedCourse && payment.purpose === 'course') {
            const course = await Course_1.Course.findById(payment.relatedCourse);
            const userIdStr = payment.user?.toString?.() || String(payment.user || '');
            if (course) {
                const current = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
                course.enrolledStudents = current.filter((e) => {
                    const sid = e?.student?.toString?.() || String(e?.student || '');
                    return sid !== userIdStr;
                });
                await course.save();
            }
        }
        return res.json({ success: true, message: '결제가 환불 처리되었습니다.', data: payment });
    }
    catch (error) {
        (0, logger_1.logError)('결제 환불 처리 오류', error);
        return res.status(500).json({ success: false, message: '결제 환불 처리 중 오류가 발생했습니다.' });
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
        try {
            const { LaneAllocationService } = await Promise.resolve().then(() => __importStar(require('../services/laneAllocationService')));
            const restoredLanes = await LaneAllocationService.restoreLanesIfNoPersonalLesson(centerId.toString());
            if (restoredLanes && restoredLanes.length > 0) {
                console.log('🔄 레인 자동 복원 완료:', restoredLanes);
            }
        }
        catch (restoreError) {
            (0, logger_1.logWarn)('레인 복원 실패 (무시하고 계속 진행)', restoreError);
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
                personalLessonSettings: course.personalLessonSettings || { timeSlots: [], lessonTypes: [], frequencyOptions: [] },
                startDate: course.startDate,
                endDate: course.endDate,
                duration: course.duration || 60,
                lanes: course.lanes || [1],
                poolType: course.poolType || 'main',
                laneInfo: course.laneInfo || { assignedLanes: [], maxLanes: 0, minLanes: 0, laneNotes: '' },
                enrolledStudents: course.enrolledStudents || [],
                isActive: course.isActive,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
            };
            if (courseData.name === '초급 자유형') {
                const mondaySchedule = course.schedule.find((s) => s.day === 'monday' && s.startTime === '09:00');
                if (mondaySchedule) {
                    console.log('🔍 초급 자유형 월요일 9시 스케줄:', JSON.stringify(mondaySchedule, null, 2));
                }
            }
            console.log('🔄 변환된 강습 과정 데이터:', {
                _id: courseData._id,
                name: courseData.name,
                instructorId: courseData.instructorId,
                instructorName: courseData.instructorName,
                lanes: courseData.lanes,
                poolType: courseData.poolType,
                laneInfo: courseData.laneInfo
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
        (0, logger_1.logError)('센터 강습 과정 조회 오류', error);
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
        (0, logger_1.logError)('센터 스케줄 조회 오류', error);
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
        (0, logger_1.logError)('센터 통계 조회 오류', error);
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
        const { name, description, level, maxStudents, price, isPersonalLesson, courseType, startDate, endDate, schedule, lanes, poolType, tags } = req.body;
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
            tags: tags || [],
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
        (0, logger_1.logError)('강습 과정 생성 오류', error);
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
        (0, logger_1.logError)('공지사항 조회 오류', error);
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
        (0, logger_1.logError)('공지사항 생성 오류', error);
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
        (0, logger_1.logError)('결제 내역 조회 오류', error);
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
        (0, logger_1.logError)('리뷰 조회 오류', error);
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
        (0, logger_1.logError)('리포트 조회 오류', error);
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
        (0, logger_1.logError)('예시 데이터 추가 오류', error);
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
        (0, logger_1.logError)('강사 정보 조회 오류', error);
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
            $or: [
                { instructorId: new mongoose_1.default.Types.ObjectId(instructorId) },
                { instructor: new mongoose_1.default.Types.ObjectId(instructorId) }
            ],
            centerId: new mongoose_1.default.Types.ObjectId(centerId),
            isPersonalLesson: { $ne: true }
        })
            .populate('enrolledStudents.student', 'name phone email studentInfo');
        console.log(`📚 조회된 단체반 수업: ${groupCourses.length}개`);
        console.log(`📚 전체 단체반 조회 결과:`, JSON.stringify(groupCourses.map(c => ({
            name: c.name,
            _id: c._id,
            students: c.students,
            enrolledStudents: c.enrolledStudents
        })), null, 2));
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
                console.log(`🔍 enrolledStudents 필드에서 조회할 학생들:`, course.enrolledStudents);
                for (const enrollment of course.enrolledStudents) {
                    if (enrollment.student) {
                        const studentId = typeof enrollment.student === 'string'
                            ? enrollment.student
                            : enrollment.student._id?.toString() || enrollment.student.toString();
                        studentIds.push(new mongoose_1.default.Types.ObjectId(studentId));
                    }
                }
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
                        totalLessonsCompleted: 0,
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
        console.log('🔍 PersonalLesson 모델에서 개인레슨 조회 시작...');
        const personalLessonsRaw = await mongoose_1.default.connection.db.collection('personallessons').find({
            instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            centerId: new mongoose_1.default.Types.ObjectId(centerId)
        }).toArray();
        console.log(`🏊 PersonalLesson 모델에서 조회된 개인레슨: ${personalLessonsRaw.length}개`);
        const personalLessonCourses = await Course_1.Course.find({
            $or: [
                { instructorId: new mongoose_1.default.Types.ObjectId(instructorId) },
                { instructor: new mongoose_1.default.Types.ObjectId(instructorId) }
            ],
            centerId: new mongoose_1.default.Types.ObjectId(centerId),
            isPersonalLesson: true
        })
            .populate('enrolledStudents.student', 'name phone email studentInfo');
        console.log(`🏊 Course 모델에서 조회된 개인레슨: ${personalLessonCourses.length}개`);
        const studentIds = personalLessonsRaw.map(lesson => lesson.studentId).filter(Boolean);
        const students = await User_1.User.find({ _id: { $in: studentIds } });
        const personalStudents1 = personalLessonsRaw.map((lesson) => {
            const student = students.find(s => s._id.toString() === lesson.studentId?.toString());
            if (student) {
                return {
                    _id: lesson._id,
                    name: student.name,
                    courseId: lesson._id,
                    courseName: '개인레슨',
                    isPersonalLesson: true,
                    status: lesson.status || 'active',
                    enrollmentDate: lesson.date || lesson.createdAt || new Date(),
                    phone: student.phone || '',
                    email: student.email || '',
                    totalLessonsCompleted: lesson.completedSessions || 0,
                    progress: { percentage: lesson.progress || 0 },
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
        const personalStudents2 = [];
        for (const course of personalLessonCourses) {
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                for (const enrollment of course.enrolledStudents) {
                    if (enrollment.student) {
                        const studentId = typeof enrollment.student === 'string'
                            ? enrollment.student
                            : enrollment.student._id?.toString() || enrollment.student.toString();
                        const student = await User_1.User.findById(studentId);
                        if (student) {
                            personalStudents2.push({
                                _id: student._id,
                                name: student.name,
                                courseId: course._id,
                                courseName: course.name || '개인레슨',
                                isPersonalLesson: true,
                                status: 'active',
                                enrollmentDate: student.createdAt || new Date(),
                                phone: student.phone || '',
                                email: student.email || '',
                                totalLessonsCompleted: 0,
                                progress: { percentage: enrollment.progress?.percentage || 0 },
                                currentPackage: {
                                    name: course.name || '개인레슨 패키지',
                                    remainingSessions: 10,
                                    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                                },
                                personalLessonInfo: {
                                    lessonType: '1:1',
                                    completedSessions: 0,
                                    remainingSessions: 10,
                                    totalSessions: 10,
                                    pricePerSession: course.price || 0,
                                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                                }
                            });
                        }
                    }
                }
            }
        }
        const personalStudents = [...personalStudents1, ...personalStudents2];
        console.log(`👥 총 개인레슨 학생 수: ${personalStudents.length}명`);
        const allStudents = [...groupStudents, ...personalStudents];
        res.json({
            success: true,
            message: '강사별 학생 목록 조회 성공',
            data: allStudents
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사별 학생 목록 조회 오류', error);
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
        (0, logger_1.logError)('회원 메모 업데이트 오류', error);
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
        (0, logger_1.logError)('회원 메모 삭제 오류', error);
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
        await member.save();
        res.json({
            success: true,
            message: '메모가 수정되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('메모 수정 오류', error);
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
                level: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel,
                age: member.studentInfo?.age,
                healthProfile: member.studentInfo?.healthProfile ? {
                    height: member.studentInfo.healthProfile.height,
                    weight: member.studentInfo.healthProfile.weight,
                    bmi: member.studentInfo.healthProfile.bmi
                } : '없음',
                studentInfo: member.studentInfo
            });
        });
        const membersWithCourses = await Promise.all(members.map(async (member) => {
            const assignedCourses = await Course_1.Course.find({
                centerId: centerId,
                'enrolledStudents.student': member._id,
                isPersonalLesson: { $ne: true }
            }).select('name instructorId level');
            const courseDetails = await Promise.all(assignedCourses.map(async (course) => {
                const instructor = await User_1.User.findById(course.instructorId).select('name');
                console.log(`🔍 ${member.name}의 과정 ${course.name} 레벨 확인:`, {
                    courseId: course._id,
                    courseName: course.name,
                    courseLevel: course.level,
                    instructorId: course.instructorId
                });
                return {
                    courseId: course._id,
                    courseName: course.name,
                    courseLevel: course.level,
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
                status: member.studentInfo?.status || 'active',
                enrollmentDate: member.createdAt || new Date(),
                assignedCourses: courseDetails,
                totalLessonsCompleted: 0,
                lastLessonDate: null,
                centerMemo: member.studentInfo?.centerMemo || '',
                centerMemos: member.studentInfo?.centerMemos || [],
                currentLevel: courseDetails.length > 0
                    ? courseDetails[0].courseLevel
                    : member.studentInfo?.currentLevel
                        || member.studentInfo?.swimmingLevel
                        || member.level
                        || '레벨 미설정',
                studentInfo: {
                    age: member.studentInfo?.age ?? null,
                    level: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel || '레벨 미설정',
                    emergencyContact: member.studentInfo?.emergencyContact || '',
                    medicalConditions: member.studentInfo?.medicalConditions || '',
                    goals: [],
                    centerMemo: member.studentInfo?.centerMemo || '',
                    centerMemos: member.studentInfo?.centerMemos || [],
                    healthProfile: member.studentInfo?.healthProfile ? (() => {
                        const healthProfile = member.studentInfo.healthProfile;
                        const privacySettings = healthProfile.privacySettings || {};
                        const filteredProfile = {};
                        if (healthProfile.height !== undefined && privacySettings.height !== false) {
                            filteredProfile.height = healthProfile.height;
                        }
                        if (healthProfile.weight !== undefined && privacySettings.weight !== false) {
                            filteredProfile.weight = healthProfile.weight;
                        }
                        if (healthProfile.bmi !== undefined && privacySettings.bmi !== false) {
                            filteredProfile.bmi = healthProfile.bmi;
                        }
                        if (healthProfile.bloodPressure &&
                            privacySettings.blood_pressure_systolic !== false &&
                            privacySettings.blood_pressure_diastolic !== false) {
                            filteredProfile.bloodPressure = healthProfile.bloodPressure;
                        }
                        if (healthProfile.cholesterol) {
                            const filteredChol = {};
                            if (privacySettings.cholesterol_total !== false && healthProfile.cholesterol.total !== undefined) {
                                filteredChol.total = healthProfile.cholesterol.total;
                            }
                            if (privacySettings.cholesterol_ldl !== false && healthProfile.cholesterol.ldl !== undefined) {
                                filteredChol.ldl = healthProfile.cholesterol.ldl;
                            }
                            if (privacySettings.cholesterol_hdl !== false && healthProfile.cholesterol.hdl !== undefined) {
                                filteredChol.hdl = healthProfile.cholesterol.hdl;
                            }
                            if (privacySettings.cholesterol_triglycerides !== false && healthProfile.cholesterol.triglycerides !== undefined) {
                                filteredChol.triglycerides = healthProfile.cholesterol.triglycerides;
                            }
                            if (Object.keys(filteredChol).length > 0) {
                                filteredProfile.cholesterol = filteredChol;
                            }
                        }
                        if (healthProfile.bloodSugar) {
                            const filteredSugar = {};
                            if (privacySettings.blood_sugar_fasting !== false && healthProfile.bloodSugar.fasting !== undefined) {
                                filteredSugar.fasting = healthProfile.bloodSugar.fasting;
                            }
                            if (privacySettings.blood_sugar_postprandial !== false && healthProfile.bloodSugar.postprandial !== undefined) {
                                filteredSugar.postprandial = healthProfile.bloodSugar.postprandial;
                            }
                            if (privacySettings.blood_sugar_hba1c !== false && healthProfile.bloodSugar.hba1c !== undefined) {
                                filteredSugar.hba1c = healthProfile.bloodSugar.hba1c;
                            }
                            if (Object.keys(filteredSugar).length > 0) {
                                filteredProfile.bloodSugar = filteredSugar;
                            }
                        }
                        if (healthProfile.fitnessMetrics) {
                            const filteredFitness = {};
                            if (privacySettings.muscle_mass !== false && healthProfile.fitnessMetrics.muscleMass !== undefined) {
                                filteredFitness.muscleMass = healthProfile.fitnessMetrics.muscleMass;
                            }
                            if (privacySettings.body_fat !== false && healthProfile.fitnessMetrics.bodyFatPercentage !== undefined) {
                                filteredFitness.bodyFatPercentage = healthProfile.fitnessMetrics.bodyFatPercentage;
                            }
                            if (privacySettings.heart_rate !== false && healthProfile.fitnessMetrics.restingHeartRate !== undefined) {
                                filteredFitness.restingHeartRate = healthProfile.fitnessMetrics.restingHeartRate;
                            }
                            if (privacySettings.max_heart_rate !== false && healthProfile.fitnessMetrics.maxHeartRate !== undefined) {
                                filteredFitness.maxHeartRate = healthProfile.fitnessMetrics.maxHeartRate;
                            }
                            if (Object.keys(filteredFitness).length > 0) {
                                filteredProfile.fitnessMetrics = filteredFitness;
                            }
                        }
                        if (member.studentInfo?.swimmingProfile) {
                            filteredProfile.swimmingProfile = member.studentInfo.swimmingProfile;
                        }
                        if (privacySettings.chronic_conditions !== false) {
                            filteredProfile.chronicConditions = healthProfile.chronicConditions || [];
                        }
                        if (privacySettings.medications !== false) {
                            filteredProfile.medications = healthProfile.medications || [];
                        }
                        if (privacySettings.allergies !== false) {
                            filteredProfile.allergies = healthProfile.allergies || [];
                        }
                        filteredProfile.bloodType = healthProfile.bloodType;
                        filteredProfile.emergencyContact = healthProfile.emergencyContact;
                        filteredProfile.fitnessGoals = healthProfile.fitnessGoals || [];
                        filteredProfile.activityLevel = healthProfile.activityLevel;
                        filteredProfile.targetWeight = healthProfile.targetWeight;
                        filteredProfile.targetBMI = healthProfile.targetBMI;
                        filteredProfile.lastHealthCheck = healthProfile.lastHealthCheck;
                        filteredProfile.swimmingRelatedConditions = healthProfile.swimmingRelatedConditions;
                        return Object.keys(filteredProfile).length > 0 ? filteredProfile : null;
                    })() : null
                },
                isEnrolledInSpecificCourse: isEnrolledInSpecificCourse,
                currentCourses: courseDetails.map(course => ({
                    courseId: course.courseId.toString(),
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
                swimmingGoals: member.studentInfo?.swimmingProfile?.currentGoal ? [member.studentInfo.swimmingProfile.currentGoal] : [],
                preferredTimes: member.studentInfo?.swimmingProfile?.trainingDays || [],
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
        (0, logger_1.logError)('회원 목록 조회 오류', error);
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
        (0, logger_1.logError)('회원 통계 조회 오류', error);
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
            member.studentInfo.emergencyContact = `${contact?.name || ''} (${contact?.phone || ''})`;
            console.log('🔄 emergencyContact 필드 변환:', member.studentInfo.emergencyContact);
        }
        console.log('🔍 과정 조회 조건:', {
            courseId: courseId,
            centerId: centerId,
            isPersonalLesson: { $ne: true }
        });
        const course = await Course_1.Course.findOne({
            _id: courseId,
            centerId: centerId
        });
        console.log('📚 과정 조회 결과:', course ? '찾음' : '찾지 못함', course ? `(${course.isPersonalLesson ? '개인레슨' : '단체반'})` : '');
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
            const enrollmentStudentId = enrollment.student.toString();
            const memberIdStr = memberId.toString();
            console.log('🔍 등록 비교:', { enrollmentStudentId, memberIdStr, match: enrollmentStudentId === memberIdStr });
            return enrollmentStudentId === memberIdStr;
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
        const savedCourse = await Course_1.Course.findById(courseId);
        console.log('🔍 저장 후 검증 - enrolledStudents:', savedCourse?.enrolledStudents);
        console.log('🔍 저장 후 검증 - 찾고 있는 memberId:', memberId);
        const isNowEnrolled = savedCourse?.enrolledStudents?.some((e) => e.student?.toString() === memberId.toString());
        console.log('🔍 저장 후 검증 - 배정 확인:', isNowEnrolled);
        console.log('🔄 회원 레벨 업데이트 시작:', {
            memberId: memberId,
            currentLevel: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel,
            courseLevel: course.level
        });
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        const oldLevel = member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel;
        member.studentInfo.currentLevel = course.level || '레벨 미설정';
        if (member.studentInfo.emergencyContact && typeof member.studentInfo.emergencyContact === 'object') {
            const contact = member.studentInfo.emergencyContact;
            member.studentInfo.emergencyContact = `${contact?.name || ''} (${contact?.phone || ''})`;
        }
        const memberToSave = member.toObject();
        if (memberToSave.studentInfo?.emergencyContact && typeof memberToSave.studentInfo.emergencyContact === 'object') {
            delete memberToSave.studentInfo.emergencyContact;
        }
        await User_1.User.findByIdAndUpdate(memberId, {
            'studentInfo.level': course.level,
            'studentInfo.emergencyContact': member.studentInfo.emergencyContact || ''
        });
        console.log('✅ 회원 레벨 업데이트 완료:', {
            memberName: member.name,
            oldLevel: oldLevel,
            newLevel: course.level
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
                    newLevel: course.level
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 과정 배정 오류', {
            message: error.message,
            stack: error.stack,
            type: typeof error
        });
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.',
            error: error.message
        });
    }
});
router.delete('/members/:memberId/course/:courseId', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { memberId, courseId } = req.params;
        console.log('🗑️ 회원 과정 배정 취소 시작:', { memberId, courseId });
        const centerAdmin = await User_1.User.findById(req.user._id);
        const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
        if (!centerId) {
            return res.status(400).json({
                success: false,
                message: '관리하는 센터가 없습니다.'
            });
        }
        const member = await User_1.User.findById(memberId);
        if (!member || member.userType !== 'student') {
            return res.status(404).json({
                success: false,
                message: '학생 회원을 찾을 수 없습니다.'
            });
        }
        const course = await Course_1.Course.findOne({
            _id: courseId,
            centerId: centerId,
            isPersonalLesson: { $ne: true }
        });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '과정을 찾을 수 없습니다.'
            });
        }
        const enrolledStudents = course.enrolledStudents || [];
        const updatedEnrolledStudents = enrolledStudents.filter((enrollment) => {
            const enrollmentStudentId = enrollment.student?.toString();
            const memberIdStr = memberId.toString();
            console.log('🔍 배정 취소 비교:', { enrollmentStudentId, memberIdStr, willRemove: enrollmentStudentId === memberIdStr });
            return enrollmentStudentId !== memberIdStr;
        });
        course.enrolledStudents = updatedEnrolledStudents;
        await course.save();
        console.log('💾 과정 배정 취소 완료');
        res.json({
            success: true,
            message: '과정 배정이 취소되었습니다.',
            data: {
                memberId: memberId,
                courseId: courseId,
                courseName: course.name
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 과정 배정 취소 오류', error);
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
        const coursesData = courses.map(course => {
            console.log(`🔍 과정 ${course.name} - laneInfo 원본:`, JSON.stringify(course.laneInfo, null, 2));
            return {
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
            };
        });
        res.json({
            success: true,
            message: '강습 과정 목록 조회 성공',
            data: coursesData
        });
    }
    catch (error) {
        (0, logger_1.logError)('강습 과정 목록 조회 오류', error);
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
        if (updateData.name)
            member.name = updateData.name;
        if (updateData.email)
            member.email = updateData.email;
        if (updateData.phone !== undefined)
            member.phone = updateData.phone;
        if (updateData.status && member.studentInfo) {
            member.studentInfo.status = updateData.status;
        }
        if (!member.studentInfo) {
            member.studentInfo = {};
        }
        if (updateData.currentLevel !== undefined)
            member.studentInfo.currentLevel = updateData.currentLevel;
        if (updateData.emergencyContact !== undefined)
            member.studentInfo.emergencyContact = updateData.emergencyContact;
        if (updateData.medicalConditions !== undefined)
            member.studentInfo.medicalConditions = updateData.medicalConditions;
        if (updateData.swimmingGoals !== undefined && member.studentInfo.swimmingProfile) {
            member.studentInfo.swimmingProfile.currentGoal = Array.isArray(updateData.swimmingGoals)
                ? updateData.swimmingGoals[0]
                : updateData.swimmingGoals;
        }
        if (updateData.centerMemo !== undefined)
            member.studentInfo.centerMemo = updateData.centerMemo;
        await member.save();
        res.json({
            success: true,
            message: '회원 정보가 성공적으로 수정되었습니다.',
            data: member
        });
    }
    catch (error) {
        (0, logger_1.logError)('회원 정보 수정 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.get('/instructors/:instructorId/lessons', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { date } = req.query;
        console.log('📅 강사 수업 일정 조회:', { instructorId, date });
        if (!date) {
            return res.status(400).json({
                success: false,
                message: '날짜가 필요합니다.'
            });
        }
        const requestedDate = new Date(date);
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestedDate.getDay()];
        console.log('📅 요청된 날짜:', {
            date: requestedDate.toISOString().split('T')[0],
            dayOfWeek
        });
        const centerId = await getCenterId(req);
        console.log('🔍 강사 수업 일정 조회 - 필터 조건:', {
            instructorId,
            centerId,
            isPersonalLesson: { $ne: true }
        });
        const courses = await Course_1.Course.find({
            $or: [
                { instructorId: instructorId },
                { instructor: instructorId }
            ],
            centerId: centerId,
            isPersonalLesson: { $ne: true }
        })
            .populate('enrolledStudents.student', 'name phone');
        console.log('📚 조회된 단체반 과정 수:', courses.length);
        courses.forEach((course, index) => {
            console.log(`  ${index + 1}. ${course.name} - 학생 ${course.enrolledStudents?.length || 0}명, 스케줄:`, course.schedule?.map((s) => `${s.day} ${s.startTime}`));
        });
        const coursePersonalLessons = await Course_1.Course.find({
            $or: [
                { instructorId: instructorId },
                { instructor: instructorId }
            ],
            centerId: centerId,
            isPersonalLesson: true
        })
            .populate('enrolledStudents.student', 'name phone');
        console.log('🏊 Course 모델의 개인레슨 수:', coursePersonalLessons.length);
        coursePersonalLessons.forEach((course, index) => {
            console.log(`  ${index + 1}. ${course.name} - 학생 ${course.enrolledStudents?.length || 0}명, 스케줄:`, course.schedule?.map((s) => `${s.day} ${s.startTime}`));
        });
        const personalLessons = await PersonalLesson_1.PersonalLesson.find({
            instructorId: instructorId,
            centerId: centerId
        })
            .populate('studentId', 'name phone');
        console.log('🏊 PersonalLesson 모델의 개인레슨 수:', personalLessons.length);
        personalLessons.forEach((lesson, index) => {
            console.log(`  ${index + 1}. ${lesson.studentId?.name || '미배정'} - ${lesson.time}, 상태: ${lesson.status}`);
        });
        const transformLessons = (courses, coursePersonalLessons, personalLessons) => {
            const lessons = [];
            console.log('🔄 수업 일정 변환 시작...');
            courses.forEach((course, courseIndex) => {
                console.log(`  📚 단체반 ${courseIndex + 1}: ${course.name}`);
                const scheduleInfo = course.schedule?.map((sch) => `${sch.day} ${sch.startTime}-${sch.endTime}`).join(', ') || '스케줄 없음';
                if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                    console.log(`    📅 스케줄: ${scheduleInfo}, 학생 ${course.enrolledStudents.length}명`);
                    course.enrolledStudents.forEach((enrollment, studentIndex) => {
                        const student = enrollment.student;
                        console.log(`      👤 학생 ${studentIndex + 1}: ${student.name}`);
                        lessons.push({
                            _id: `${course._id}_${student._id}`,
                            courseId: course._id,
                            courseName: course.name,
                            studentId: student._id,
                            studentName: student.name,
                            studentPhone: student.phone,
                            instructorId: instructorId,
                            scheduledDates: course.schedule?.map(s => {
                                const dayMap = {
                                    'monday': '월',
                                    'tuesday': '화',
                                    'wednesday': '수',
                                    'thursday': '목',
                                    'friday': '금',
                                    'saturday': '토',
                                    'sunday': '일'
                                };
                                return dayMap[s.day.toLowerCase()] || s.day;
                            }).join(', '),
                            startTime: course.schedule?.[0]?.startTime || '09:00',
                            endTime: course.schedule?.[0]?.endTime || '10:00',
                            status: 'scheduled',
                            lessonType: 'group',
                            level: course.level,
                            poolType: course.schedule?.[0]?.poolType || 'mainPool',
                            laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
                            packageInfo: null,
                            progress: enrollment.progress
                        });
                    });
                }
                else {
                    console.log(`    📅 스케줄: ${scheduleInfo}, 회원 미배정`);
                    lessons.push({
                        _id: `${course._id}_no_student`,
                        courseId: course._id,
                        courseName: course.name,
                        studentId: null,
                        studentName: '회원 미배정',
                        studentPhone: null,
                        instructorId: instructorId,
                        scheduledDates: course.schedule?.map(s => {
                            const dayMap = {
                                'monday': '월',
                                'tuesday': '화',
                                'wednesday': '수',
                                'thursday': '목',
                                'friday': '금',
                                'saturday': '토',
                                'sunday': '일'
                            };
                            return dayMap[s.day.toLowerCase()] || s.day;
                        }).join(', '),
                        startTime: course.schedule?.[0]?.startTime || '09:00',
                        endTime: course.schedule?.[0]?.endTime || '10:00',
                        status: 'scheduled',
                        lessonType: 'group',
                        level: course.level,
                        poolType: course.schedule?.[0]?.poolType || 'mainPool',
                        laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
                        packageInfo: null,
                        progress: null
                    });
                }
            });
            console.log(`✅ 단체반 변환 완료: ${lessons.length}개 수업 생성`);
            coursePersonalLessons.forEach((course, courseIndex) => {
                console.log(`  🏊 개인레슨(Course) ${courseIndex + 1}: ${course.name}`);
                const scheduleInfo = course.schedule?.map((sch) => `${sch.day} ${sch.startTime}-${sch.endTime}`).join(', ') || '스케줄 없음';
                if (course.enrolledStudents && course.enrolledStudents.length > 0) {
                    console.log(`    📅 스케줄: ${scheduleInfo}, 학생 ${course.enrolledStudents.length}명`);
                    course.enrolledStudents.forEach((enrollment, studentIndex) => {
                        const student = enrollment.student;
                        console.log(`      👤 학생 ${studentIndex + 1}: ${student.name}`);
                        lessons.push({
                            _id: `${course._id}_${student._id}`,
                            courseId: course._id,
                            courseName: course.name,
                            studentId: student._id,
                            studentName: student.name,
                            studentPhone: student.phone,
                            instructorId: instructorId,
                            scheduledDates: course.schedule?.map(s => {
                                const dayMap = {
                                    'monday': '월',
                                    'tuesday': '화',
                                    'wednesday': '수',
                                    'thursday': '목',
                                    'friday': '금',
                                    'saturday': '토',
                                    'sunday': '일'
                                };
                                return dayMap[s.day.toLowerCase()] || s.day;
                            }).join(', '),
                            startTime: course.schedule?.[0]?.startTime || '09:00',
                            endTime: course.schedule?.[0]?.endTime || '10:00',
                            status: 'scheduled',
                            lessonType: 'private',
                            level: course.level,
                            poolType: course.schedule?.[0]?.poolType || 'mainPool',
                            laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
                            packageInfo: null,
                            progress: enrollment.progress
                        });
                    });
                }
                else {
                    console.log(`    📅 스케줄: ${scheduleInfo}, 회원 미배정`);
                    lessons.push({
                        _id: `${course._id}_no_student`,
                        courseId: course._id,
                        courseName: course.name,
                        studentId: null,
                        studentName: '회원 미배정',
                        studentPhone: null,
                        instructorId: instructorId,
                        scheduledDates: course.schedule?.map(s => {
                            const dayMap = {
                                'monday': '월',
                                'tuesday': '화',
                                'wednesday': '수',
                                'thursday': '목',
                                'friday': '금',
                                'saturday': '토',
                                'sunday': '일'
                            };
                            return dayMap[s.day.toLowerCase()] || s.day;
                        }).join(', '),
                        startTime: course.schedule?.[0]?.startTime || '09:00',
                        endTime: course.schedule?.[0]?.endTime || '10:00',
                        status: 'scheduled',
                        lessonType: 'private',
                        level: course.level,
                        poolType: course.schedule?.[0]?.poolType || 'mainPool',
                        laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
                        packageInfo: null,
                        progress: null
                    });
                }
            });
            console.log(`✅ 개인레슨(Course) 변환 완료: 총 ${lessons.length}개 수업 생성`);
            personalLessons.forEach((lesson) => {
                const [hour, minute] = lesson.time.split(':').map(Number);
                const startTime = new Date(lesson.date);
                startTime.setHours(hour, minute, 0, 0);
                const endTime = new Date(startTime);
                endTime.setMinutes(endTime.getMinutes() + lesson.duration);
                lessons.push({
                    _id: lesson._id,
                    courseId: lesson._id,
                    studentId: lesson.studentId._id,
                    studentName: lesson.studentId.name,
                    studentPhone: lesson.studentId.phone,
                    instructorId: instructorId,
                    scheduledDate: new Date(lesson.date).toISOString().split('T')[0],
                    startTime: lesson.time,
                    endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
                    status: lesson.status === 'approved' ? 'scheduled' : 'pending',
                    lessonType: 'private',
                    level: lesson.skillLevel,
                    poolType: 'mainPool',
                    laneNumber: lesson.assignedLane || 1,
                    packageInfo: null,
                    progress: null
                });
            });
            lessons.sort((a, b) => {
                const timeA = a.startTime.split(':').map(Number);
                const timeB = b.startTime.split(':').map(Number);
                if (timeA[0] !== timeB[0])
                    return timeA[0] - timeB[0];
                return timeA[1] - timeB[1];
            });
            return lessons;
        };
        const transformedLessons = transformLessons(courses, coursePersonalLessons, personalLessons);
        console.log('✅ 변환된 수업 일정 수:', transformedLessons.length);
        res.json({
            success: true,
            data: transformedLessons
        });
    }
    catch (error) {
        (0, logger_1.logError)('강사 수업 일정 조회 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/lessons/:lessonId/status', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { status } = req.body;
        console.log('📝 수업 상태 업데이트:', { lessonId, status });
        const [courseId, studentId] = lessonId.split('_');
        console.log('📋 파싱된 lessonId:', { courseId, studentId });
        if (status === 'cancelled') {
            const course = await Course_1.Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: '강습 과정을 찾을 수 없습니다.'
                });
            }
            console.log('🗑️ 취소 전 enrolledStudents:', course.enrolledStudents.length);
            course.enrolledStudents = course.enrolledStudents.filter((enrollment) => enrollment.student?.toString() !== studentId);
            course.currentStudents = course.enrolledStudents.filter((e) => e.status === 'active').length;
            await course.save();
            console.log('✅ 취소 후 enrolledStudents:', course.enrolledStudents.length);
            return res.json({
                success: true,
                message: '회원이 강습 과정에서 제외되었습니다.',
                data: {
                    courseId,
                    studentId,
                    remainingStudents: course.enrolledStudents.length
                }
            });
        }
        res.json({
            success: true,
            message: '수업 상태가 업데이트되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('수업 상태 업데이트 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
router.put('/lessons/:lessonId/progress', auth_1.authMiddleware, requireCenterAdmin, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const progressData = req.body;
        console.log('📝 수업 진행 기록 저장:', { lessonId, progressData });
        res.json({
            success: true,
            message: '수업 진행 기록이 저장되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('수업 진행 기록 저장 오류', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
async function getCenterId(req) {
    const headerCenterId = req.headers['x-center-id']?.trim();
    if (headerCenterId) {
        return headerCenterId;
    }
    const centerAdmin = await User_1.User.findById(req.user?._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    return centerId ? centerId.toString() : null;
}
exports.default = router;
//# sourceMappingURL=center-admin.js.map