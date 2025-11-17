"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = require("../models/User");
const Course_1 = require("../models/Course");
const Booking_1 = require("../models/Booking");
const PersonalLesson_1 = require("../models/PersonalLesson");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.get('/dashboard', auth_1.authMiddleware, (0, auth_1.requirePermission)('canManageCourses'), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        logger_1.default.info(`🏊‍♂️ 강사 대시보드 조회 요청: ${instructorId}`);
        if (!instructorId) {
            return res.status(400).json({
                success: false,
                message: '강사 ID가 없습니다.'
            });
        }
        const instructor = await User_1.User.findById(instructorId).lean();
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: '강사를 찾을 수 없습니다.'
            });
        }
        const instructorInfo = instructor.instructorInfo || {};
        const centerId = instructor.centerId || instructorInfo.assignedCenters?.[0];
        const courses = await Course_1.Course.find({
            $or: [
                { instructorId: new mongoose_1.default.Types.ObjectId(instructorId) },
                { instructor: new mongoose_1.default.Types.ObjectId(instructorId) }
            ],
            ...(centerId ? { centerId: new mongoose_1.default.Types.ObjectId(centerId) } : {})
        })
            .populate('enrolledStudents.student', 'name email')
            .lean();
        const activeCourses = courses.filter(c => c.status === 'active' || !c.status);
        const allStudentIds = new Set();
        courses.forEach(course => {
            if (course.enrolledStudents) {
                course.enrolledStudents.forEach((enrollment) => {
                    const studentId = enrollment.student?._id?.toString() || enrollment.student?.toString() || enrollment.studentId?.toString();
                    if (studentId) {
                        allStudentIds.add(studentId);
                    }
                });
            }
            if (course.students) {
                course.students.forEach((studentId) => {
                    const id = studentId?._id?.toString() || studentId?.toString();
                    if (id) {
                        allStudentIds.add(id);
                    }
                });
            }
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.Booking.find({
            instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            date: {
                $gte: today,
                $lt: tomorrow
            }
        })
            .populate('studentId', 'name email')
            .populate('courseId', 'name')
            .lean()
            .sort({ startTime: 1 });
        const dashboardData = {
            stats: {
                totalStudents: allStudentIds.size || instructorInfo.currentStudents || 0,
                activeCourses: activeCourses.length || 0,
                todayBookings: todayBookings.length || 0,
                averageRating: instructorInfo.rating || 0,
                totalHours: instructorInfo.totalClasses ? instructorInfo.totalClasses * 1 : 0,
                monthlyRevenue: instructorInfo.salaryInfo?.amount ? (instructorInfo.salaryInfo.amount / 4) : 0,
            },
            upcomingBookings: todayBookings.slice(0, 10).map((booking) => ({
                id: booking._id?.toString() || booking.id,
                studentName: booking.studentId?.name || '학생 이름 없음',
                courseName: booking.courseId?.name || booking.courseName || '수업 이름 없음',
                time: booking.startTime || booking.time || '',
                status: booking.status || 'pending',
            })),
        };
        res.status(200).json({
            success: true,
            message: '강사 대시보드 조회 성공',
            data: dashboardData,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 강사 대시보드 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
router.get('/courses', auth_1.authMiddleware, (0, auth_1.requirePermission)('canManageCourses'), async (req, res) => {
    try {
        const instructorId = req.user?._id;
        logger_1.default.info(`📚 강사 강의 목록 조회 요청: ${instructorId}`);
        if (!instructorId) {
            return res.status(400).json({
                success: false,
                message: '강사 ID가 없습니다.'
            });
        }
        const instructor = await User_1.User.findById(instructorId).lean();
        const centerId = instructor?.centerId || instructor?.instructorInfo?.assignedCenters?.[0];
        const dbCourses = await Course_1.Course.find({
            $or: [
                { instructorId: new mongoose_1.default.Types.ObjectId(instructorId) },
                { instructor: new mongoose_1.default.Types.ObjectId(instructorId) }
            ],
            ...(centerId ? { centerId: new mongoose_1.default.Types.ObjectId(centerId) } : {})
        })
            .populate('enrolledStudents.student', 'name email')
            .lean()
            .sort({ createdAt: -1 });
        const personalLessonsRaw = await PersonalLesson_1.PersonalLesson.find({
            instructorId: new mongoose_1.default.Types.ObjectId(instructorId),
            status: { $in: ['pending', 'approved', 'completed'] }
        })
            .populate('studentId', 'name email')
            .sort({ date: -1, startTime: -1 });
        const personalLessonsToUpdate = [];
        for (const lesson of personalLessonsRaw) {
            if (lesson.status === 'pending' && lesson.instructorId?.toString() === instructorId.toString()) {
                lesson.status = 'approved';
                personalLessonsToUpdate.push(lesson);
            }
        }
        if (personalLessonsToUpdate.length > 0) {
            await Promise.all(personalLessonsToUpdate.map(lesson => lesson.save()));
            logger_1.default.info(`✅ 강사 ${instructorId}의 ${personalLessonsToUpdate.length}개 개인레슨 자동 승인 완료`);
        }
        const personalLessonsLean = personalLessonsRaw.map((lesson) => lesson.toObject());
        const personalLessonCourses = personalLessonsLean.map((lesson) => {
            const studentName = lesson.studentId?.name || '학생 이름 없음';
            return {
                id: lesson._id?.toString() || '',
                name: `개인 레슨 - ${studentName}`,
                description: lesson.goals || '',
                level: lesson.skillLevel || 'beginner',
                category: lesson.lessonType || '개인레슨',
                duration: lesson.duration || 60,
                price: lesson.price || 0,
                currentStudents: 1,
                maxStudents: 1,
                startDate: lesson.date ? new Date(lesson.date).toISOString().split('T')[0] : '',
                endDate: lesson.date ? new Date(lesson.date).toISOString().split('T')[0] : '',
                status: lesson.status === 'completed' ? 'inactive' : 'active',
                totalSessions: 1,
                completedSessions: lesson.status === 'completed' ? 1 : 0,
                progress: lesson.status === 'completed' ? 100 : 0,
                location: lesson.poolType || '위치 미지정',
                schedule: [{
                        dayOfWeek: lesson.date ? new Date(lesson.date).getDay() + 1 : 1,
                        startTime: lesson.startTime || lesson.time || '09:00',
                        endTime: lesson.endTime || (() => {
                            const [h, m] = (lesson.startTime || lesson.time || '09:00').split(':').map(Number);
                            const end = new Date(2000, 0, 1, h, m + (lesson.duration || 60), 0);
                            return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                        })()
                    }],
                tags: [lesson.lessonType || '개인레슨'],
                rating: 0,
                enrolledStudents: [{
                        studentId: lesson.studentId?._id?.toString() || lesson.studentId?.toString() || '',
                        studentName,
                        status: 'active',
                        enrolledAt: lesson.createdAt || null,
                        completedAt: lesson.status === 'completed' ? lesson.updatedAt : null
                    }],
                isPersonalLesson: true,
                courseType: 'personal',
                createdAt: lesson.createdAt,
                updatedAt: lesson.updatedAt,
            };
        });
        const courses = dbCourses.map((course) => {
            const enrolledStudents = course.enrolledStudents || [];
            const students = course.students || [];
            const currentStudents = enrolledStudents.length || students.length || 0;
            const enrolledStudentsData = enrolledStudents.map((enrollment) => ({
                studentId: enrollment.student?._id?.toString() || enrollment.student?.toString() || '',
                studentName: enrollment.student?.name || '이름 없음',
                status: enrollment.status || 'active',
                enrolledAt: enrollment.enrolledAt || null,
                completedAt: enrollment.completedAt || null
            }));
            let courseType = 'group';
            if (course.isPersonalLesson) {
                courseType = 'personal';
            }
            else if (course.category === '자유수영' || course.category === 'freeSwim' || course.courseType === 'freeSwim') {
                courseType = 'freeSwim';
            }
            else if (course.courseType) {
                courseType = course.courseType;
            }
            return {
                id: course._id?.toString() || course.id,
                name: course.name || course.title || '수업 이름 없음',
                description: course.description || '',
                level: course.level || 'beginner',
                category: course.category || course.tags?.[0] || '자유형',
                duration: course.duration || 60,
                price: course.price || 0,
                currentStudents,
                maxStudents: course.maxStudents || course.maxEnrollment || 10,
                startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
                endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
                status: course.status || 'active',
                totalSessions: course.totalSessions || course.sessions?.length || 0,
                completedSessions: course.completedSessions || 0,
                progress: course.totalSessions ? Math.round((course.completedSessions || 0) / course.totalSessions * 100) : 0,
                location: course.location || course.poolType || '위치 미지정',
                schedule: course.schedule || [],
                tags: course.tags || [],
                rating: course.rating || 0,
                enrolledStudents: enrolledStudentsData,
                isPersonalLesson: course.isPersonalLesson || false,
                courseType: courseType,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
            };
        });
        const allCourses = [...courses, ...personalLessonCourses];
        res.status(200).json({
            success: true,
            message: '강사 강의 목록 조회 성공',
            data: allCourses,
        });
    }
    catch (error) {
        logger_1.default.error(`❌ 강사 강의 목록 조회 중 오류 발생: ${error.message}`);
        (0, errorHandler_1.errorHandler)(error, req, res, () => { });
    }
});
exports.default = router;
//# sourceMappingURL=instructor.js.map