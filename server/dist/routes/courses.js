"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const auth_2 = require("../middleware/auth");
const requireInstructor = async (req, res, next) => {
    try {
        const user = await User_1.User.findById(req.user.userId);
        if (!user || (user.userType !== 'instructor' && user.userType !== 'superAdmin')) {
            return res.status(403).json({ error: '강사 권한이 필요합니다.' });
        }
        return next();
    }
    catch (error) {
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
};
router.get('/', async (req, res) => {
    try {
        const { level, instructor, isActive } = req.query;
        const filter = {};
        if (level)
            filter.level = level;
        if (instructor)
            filter.instructor = instructor;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const courses = await Course_1.Course.find(filter)
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId')
            .sort({ createdAt: -1 });
        return res.json({ success: true, message: '강습 과정 조회 성공!', data: courses });
    }
    catch (error) {
        console.error('강습 과정 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id)
            .populate('instructor', 'name userId experience certifications specialties')
            .populate('enrolledStudents.student', 'name userId email phone');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        return res.json({ course });
    }
    catch (error) {
        console.error('강습 과정 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_2.auth, requireInstructor, async (req, res) => {
    try {
        const { name, description, level, duration, price, maxStudents, schedule, instructorId } = req.body;
        if (!name || !description || !level || !duration || !price || !maxStudents) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const courseData = {
            name,
            description,
            level,
            duration,
            price,
            maxStudents,
            instructor: instructorId && instructorId !== '' && (await User_1.User.findById(req.user.userId))?.userType === 'superAdmin'
                ? instructorId
                : req.user.userId,
            schedule: schedule || [],
        };
        const course = new Course_1.Course(courseData);
        await course.save();
        const populatedCourse = await Course_1.Course.findById(course._id)
            .populate('instructor', 'name userId');
        return res.status(201).json({
            success: true,
            message: '강습 과정이 생성되었습니다.',
            data: populatedCourse
        });
    }
    catch (error) {
        console.error('강습 과정 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.put('/:id', auth_2.auth, requireInstructor, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        if (user?.userType !== 'superAdmin' && course.instructor.toString() !== String(req.user.userId)) {
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }
        const { name, description, level, duration, price, maxStudents } = req.body;
        if (name && typeof name !== 'string') {
            return res.status(400).json({ error: '강습 과정명은 문자열이어야 합니다.' });
        }
        if (description && typeof description !== 'string') {
            return res.status(400).json({ error: '강습 과정 설명은 문자열이어야 합니다.' });
        }
        if (level && !['beginner', 'intermediate', 'advanced'].includes(level)) {
            return res.status(400).json({ error: '유효하지 않은 레벨입니다.' });
        }
        if (duration && (typeof duration !== 'number' || duration <= 0)) {
            return res.status(400).json({ error: '강습 시간은 양수여야 합니다.' });
        }
        if (price && (typeof price !== 'number' || price < 0)) {
            return res.status(400).json({ error: '가격은 0 이상이어야 합니다.' });
        }
        if (maxStudents && (typeof maxStudents !== 'number' || maxStudents <= 0)) {
            return res.status(400).json({ error: '최대 수강생 수는 양수여야 합니다.' });
        }
        const updatedCourse = await Course_1.Course.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('instructor', 'name userId');
        return res.json({
            success: true,
            message: '강습 과정이 수정되었습니다.',
            data: updatedCourse
        });
    }
    catch (error) {
        console.error('강습 과정 수정 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.delete('/:id', auth_2.auth, requireInstructor, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        if (user?.userType !== 'superAdmin' && course.instructor.toString() !== String(req.user.userId)) {
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        await Course_1.Course.findByIdAndDelete(req.params.id);
        return res.json({ success: true, message: '강습 과정이 삭제되었습니다.' });
    }
    catch (error) {
        console.error('강습 과정 삭제 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/enroll', auth_2.auth, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        if (!course.isActive) {
            return res.status(400).json({ error: '비활성화된 강습 과정입니다.' });
        }
        const alreadyEnrolled = course.enrolledStudents.some(enrollment => enrollment.student && enrollment.student.toString() === String(req.user._id));
        if (alreadyEnrolled) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        let activeStudents = 0;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.status === 'active') {
                activeStudents++;
            }
        }
        if (activeStudents >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: req.user._id,
            status: 'active',
            enrolledAt: new Date()
        });
        await course.save();
        return res.json({ message: '강습 과정에 등록되었습니다.' });
    }
    catch (error) {
        console.error('강습 과정 등록 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/cancel', auth_2.auth, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === req.user.userId);
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents[enrollmentIndex].status = 'dropped';
        await course.save();
        return res.json({ message: '강습 과정이 취소되었습니다.' });
    }
    catch (error) {
        console.error('강습 과정 취소 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:courseId/enroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let existingEnrollment = null;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
                existingEnrollment = enrollment;
                break;
            }
        }
        if (existingEnrollment) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        if (course.enrolledStudents.length >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: studentId,
            enrolledAt: new Date(),
            status: 'active'
        });
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $push: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에 성공적으로 등록되었습니다.',
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 등록 오류:', error);
        res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
    }
});
router.post('/:courseId/unenroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === studentId.toString());
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents.splice(enrollmentIndex, 1);
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $pull: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에서 성공적으로 해제되었습니다.',
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 해제 오류:', error);
        res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
    }
});
router.put('/:courseId/progress/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { progress, completedSteps, notes } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
        }
        if (!enrollment.progress) {
            enrollment.progress = {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
        }
        enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
        enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
        enrollment.progress.lastUpdated = new Date();
        enrollment.progress.notes = notes || enrollment.progress.notes || '';
        await course.save();
        res.json({
            success: true,
            message: '진도율이 성공적으로 업데이트되었습니다.',
            data: enrollment.progress
        });
    }
    catch (error) {
        console.error('진도율 업데이트 오류:', error);
        res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
    }
});
router.get('/:courseId/student/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const course = await Course_1.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents.student', 'name email studentInfo');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let studentEnrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student._id.toString() === studentId) {
                studentEnrollment = e;
                break;
            }
        }
        if (!studentEnrollment || !studentEnrollment.student) {
            return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
        }
        res.json({
            success: true,
            message: '학생 정보 조회 성공',
            data: {
                course: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    instructor: course.instructor
                },
                student: studentEnrollment.student,
                enrollment: {
                    enrolledAt: studentEnrollment.enrolledAt,
                    status: studentEnrollment.status,
                    progress: studentEnrollment.progress || {}
                }
            }
        });
    }
    catch (error) {
        console.error('학생 정보 조회 오류:', error);
        res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/students', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const courses = await Course_1.Course.find({
            instructor: instructorId,
            isActive: true
        }).populate('enrolledStudents.student', 'name email studentInfo');
        const studentMap = new Map();
        courses.forEach(course => {
            course.enrolledStudents.forEach(enrollment => {
                if (enrollment.student && enrollment.status === 'active') {
                    const student = enrollment.student;
                    const studentId = student._id.toString();
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
                            courses: [],
                            totalProgress: 0,
                            averageProgress: 0
                        });
                    }
                    const studentInfo = studentMap.get(studentId);
                    const progress = enrollment.progress?.percentage || 0;
                    studentInfo.courses.push({
                        courseId: course._id,
                        courseName: course.name,
                        level: course.level,
                        enrolledAt: enrollment.enrolledAt,
                        progress: progress,
                        status: enrollment.status
                    });
                    studentInfo.totalProgress += progress;
                }
            });
        });
        const students = Array.from(studentMap.values()).map(student => ({
            ...student,
            averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
        }));
        students.sort((a, b) => b.averageProgress - a.averageProgress);
        res.json({
            success: true,
            message: '강사별 담당 학생 목록 조회 성공',
            data: {
                instructorId,
                totalStudents: students.length,
                students
            }
        });
    }
    catch (error) {
        console.error('강사별 학생 목록 조회 오류:', error);
        res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/stats', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const stats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: { $size: '$enrolledStudents' } },
                    activeStudents: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$enrolledStudents',
                                    cond: { $eq: ['$$this.status', 'active'] }
                                }
                            }
                        }
                    },
                    averageProgress: {
                        $avg: {
                            $avg: '$enrolledStudents.progress.percentage'
                        }
                    }
                }
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $project: {
                    name: 1,
                    level: 1,
                    enrolledCount: { $size: '$enrolledStudents' },
                    averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
                    completionRate: {
                        $divide: [
                            { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
                            { $size: '$enrolledStudents' }
                        ]
                    }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 통계 조회 성공',
            data: {
                instructorId,
                overview: stats[0] || {
                    totalCourses: 0,
                    totalStudents: 0,
                    activeStudents: 0,
                    averageProgress: 0
                },
                courseStats
            }
        });
    }
    catch (error) {
        console.error('강사별 통계 조회 오류:', error);
        res.status(500).json({ error: '통계 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/classes', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const classes = await Course_1.Course.find({
            instructor: instructorId
        })
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .sort({ 'classInfo.startDate': 1 });
        const classesData = [];
        for (const course of classes) {
            classesData.push({
                _id: course._id,
                name: course.name,
                level: course.level,
                classInfo: course.classInfo,
                instructor: course.instructor,
                enrolledStudents: course.enrolledStudents,
                teachingMethods: course.teachingMethods,
                schedule: course.schedule,
                isActive: course.isActive !== false
            });
        }
        res.json({
            success: true,
            data: {
                classes: classesData
            }
        });
    }
    catch (error) {
        console.error('강사 반 목록 조회 실패:', error);
        res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
    }
});
router.get('/class/:classId/students/progress', async (req, res) => {
    try {
        const { classId } = req.params;
        const course = await Course_1.Course.findById(classId)
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .populate('enrolledStudents.progress.completedSteps.methodId');
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        const studentsProgress = [];
        for (const enrollment of course.enrolledStudents) {
            const student = enrollment.student;
            const progress = enrollment.progress || {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
            let totalSteps = 0;
            for (const tm of course.teachingMethods) {
                const method = tm.methodId;
                totalSteps += (method?.steps?.length || 0);
            }
            const completedSteps = progress.completedSteps.length;
            const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            studentsProgress.push({
                student: {
                    _id: student._id,
                    name: student.name || student.userId,
                    userId: student.userId,
                    email: student.email
                },
                enrollment: {
                    enrolledAt: enrollment.enrolledAt,
                    status: enrollment.status,
                    progress: {
                        ...progress,
                        percentage,
                        totalSteps,
                        completedSteps: completedSteps
                    }
                },
                teachingMethods: (() => {
                    const methodsData = [];
                    for (const tm of course.teachingMethods) {
                        const method = tm.methodId;
                        let methodCompletedSteps = 0;
                        for (const step of progress.completedSteps) {
                            if (step.methodId?.toString() === method._id.toString()) {
                                methodCompletedSteps++;
                            }
                        }
                        methodsData.push({
                            _id: method._id,
                            name: method.name,
                            description: method.description,
                            steps: method.steps || [],
                            tips: method.tips || [],
                            order: tm.order,
                            isRequired: tm.isRequired,
                            progress: {
                                totalSteps: method.steps?.length || 0,
                                completedSteps: methodCompletedSteps,
                                percentage: method.steps?.length > 0
                                    ? Math.round((methodCompletedSteps / method.steps.length) * 100)
                                    : 0
                            }
                        });
                    }
                    return methodsData;
                })()
            });
        }
        res.json({
            success: true,
            data: {
                classInfo: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    classInfo: course.classInfo
                },
                studentsProgress
            }
        });
    }
    catch (error) {
        console.error('반 회원 진도 조회 실패:', error);
        res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
    }
});
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        const { methodId, stepName, notes } = req.body;
        const course = await Course_1.Course.findById(classId);
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
        }
        const progress = enrollment.progress;
        const existingStep = progress.completedSteps.find(step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName);
        if (existingStep) {
            return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
        }
        progress.completedSteps.push({
            methodId,
            stepName,
            completedAt: new Date(),
            notes: notes || ''
        });
        let totalSteps = 0;
        for (const tm of course.teachingMethods) {
            if (tm.methodId.toString() === methodId) {
                totalSteps++;
            }
        }
        progress.percentage = Math.round((progress.completedSteps.length / totalSteps) * 100);
        progress.lastUpdated = new Date();
        await course.save();
        res.json({
            success: true,
            message: '체크리스트 단계가 완료되었습니다.',
            data: {
                completedSteps: progress.completedSteps,
                percentage: progress.percentage
            }
        });
    }
    catch (error) {
        console.error('체크리스트 단계 완료 처리 실패:', error);
        res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
    }
});
router.post('/:courseId/enroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course || !course.isActive) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let existingEnrollment = null;
        for (const enrollment of course.enrolledStudents) {
            if (enrollment.student && enrollment.student.toString() === studentId.toString()) {
                existingEnrollment = enrollment;
                break;
            }
        }
        if (existingEnrollment) {
            return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
        }
        if (course.enrolledStudents.length >= course.maxStudents) {
            return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
        }
        course.enrolledStudents.push({
            student: studentId,
            enrolledAt: new Date(),
            status: 'active'
        });
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $push: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에 성공적으로 등록되었습니다.',
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 등록 오류:', error);
        res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
    }
});
router.post('/:courseId/unenroll', auth_2.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.userId;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const enrollmentIndex = course.enrolledStudents.findIndex(enrollment => enrollment.student && enrollment.student.toString() === studentId.toString());
        if (enrollmentIndex === -1) {
            return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
        }
        course.enrolledStudents.splice(enrollmentIndex, 1);
        await course.save();
        await User_1.User.findByIdAndUpdate(studentId, {
            $pull: { 'studentInfo.enrolledCourses': courseId }
        });
        res.json({
            success: true,
            message: '강습 과정에서 성공적으로 해제되었습니다.',
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 해제 오류:', error);
        res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
    }
});
router.put('/:courseId/progress/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { progress, completedSteps, notes } = req.body;
        const course = await Course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
        }
        if (!enrollment.progress) {
            enrollment.progress = {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
        }
        enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
        enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
        enrollment.progress.lastUpdated = new Date();
        enrollment.progress.notes = notes || enrollment.progress.notes || '';
        await course.save();
        res.json({
            success: true,
            message: '진도율이 성공적으로 업데이트되었습니다.',
            data: enrollment.progress
        });
    }
    catch (error) {
        console.error('진도율 업데이트 오류:', error);
        res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
    }
});
router.get('/:courseId/student/:studentId', auth_2.auth, async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const course = await Course_1.Course.findById(courseId)
            .populate('instructor', 'name email')
            .populate('enrolledStudents.student', 'name email studentInfo');
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        let studentEnrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student._id.toString() === studentId) {
                studentEnrollment = e;
                break;
            }
        }
        if (!studentEnrollment || !studentEnrollment.student) {
            return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
        }
        res.json({
            success: true,
            message: '학생 정보 조회 성공',
            data: {
                course: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    instructor: course.instructor
                },
                student: studentEnrollment.student,
                enrollment: {
                    enrolledAt: studentEnrollment.enrolledAt,
                    status: studentEnrollment.status,
                    progress: studentEnrollment.progress || {}
                }
            }
        });
    }
    catch (error) {
        console.error('학생 정보 조회 오류:', error);
        res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/students', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const courses = await Course_1.Course.find({
            instructor: instructorId,
            isActive: true
        }).populate('enrolledStudents.student', 'name email studentInfo');
        const studentMap = new Map();
        courses.forEach(course => {
            course.enrolledStudents.forEach(enrollment => {
                if (enrollment.student && enrollment.status === 'active') {
                    const student = enrollment.student;
                    const studentId = student._id.toString();
                    if (!studentMap.has(studentId)) {
                        studentMap.set(studentId, {
                            _id: student._id,
                            name: student.name,
                            email: student.email,
                            swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
                            courses: [],
                            totalProgress: 0,
                            averageProgress: 0
                        });
                    }
                    const studentInfo = studentMap.get(studentId);
                    const progress = enrollment.progress?.percentage || 0;
                    studentInfo.courses.push({
                        courseId: course._id,
                        courseName: course.name,
                        level: course.level,
                        enrolledAt: enrollment.enrolledAt,
                        progress: progress,
                        status: enrollment.status
                    });
                    studentInfo.totalProgress += progress;
                }
            });
        });
        const students = Array.from(studentMap.values()).map(student => ({
            ...student,
            averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
        }));
        students.sort((a, b) => b.averageProgress - a.averageProgress);
        res.json({
            success: true,
            message: '강사별 담당 학생 목록 조회 성공',
            data: {
                instructorId,
                totalStudents: students.length,
                students
            }
        });
    }
    catch (error) {
        console.error('강사별 학생 목록 조회 오류:', error);
        res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/stats', auth_2.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user.userId !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const stats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $group: {
                    _id: null,
                    totalCourses: { $sum: 1 },
                    totalStudents: { $sum: { $size: '$enrolledStudents' } },
                    activeStudents: {
                        $sum: {
                            $size: {
                                $filter: {
                                    input: '$enrolledStudents',
                                    cond: { $eq: ['$$this.status', 'active'] }
                                }
                            }
                        }
                    },
                    averageProgress: {
                        $avg: {
                            $avg: '$enrolledStudents.progress.percentage'
                        }
                    }
                }
            }
        ]);
        const courseStats = await Course_1.Course.aggregate([
            { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId), isActive: true } },
            {
                $project: {
                    name: 1,
                    level: 1,
                    enrolledCount: { $size: '$enrolledStudents' },
                    averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
                    completionRate: {
                        $divide: [
                            { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
                            { $size: '$enrolledStudents' }
                        ]
                    }
                }
            }
        ]);
        res.json({
            success: true,
            message: '강사별 통계 조회 성공',
            data: {
                instructorId,
                overview: stats[0] || {
                    totalCourses: 0,
                    totalStudents: 0,
                    activeStudents: 0,
                    averageProgress: 0
                },
                courseStats
            }
        });
    }
    catch (error) {
        console.error('강사별 통계 조회 오류:', error);
        res.status(500).json({ error: '통계 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/classes', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const classes = await Course_1.Course.find({
            instructor: instructorId
        })
            .populate('instructor', 'name userId')
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .sort({ 'classInfo.startDate': 1 });
        const classesData = [];
        for (const course of classes) {
            classesData.push({
                _id: course._id,
                name: course.name,
                level: course.level,
                classInfo: course.classInfo,
                instructor: course.instructor,
                enrolledStudents: course.enrolledStudents,
                teachingMethods: course.teachingMethods,
                schedule: course.schedule,
                isActive: course.isActive !== false
            });
        }
        res.json({
            success: true,
            data: {
                classes: classesData
            }
        });
    }
    catch (error) {
        console.error('강사 반 목록 조회 실패:', error);
        res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
    }
});
router.get('/class/:classId/students/progress', async (req, res) => {
    try {
        const { classId } = req.params;
        const course = await Course_1.Course.findById(classId)
            .populate('enrolledStudents.student', 'name userId email')
            .populate('teachingMethods.methodId')
            .populate('enrolledStudents.progress.completedSteps.methodId');
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        const studentsProgress = [];
        for (const enrollment of course.enrolledStudents) {
            const student = enrollment.student;
            const progress = enrollment.progress || {
                percentage: 0,
                completedSteps: [],
                lastUpdated: new Date(),
                notes: ''
            };
            let totalSteps = 0;
            for (const tm of course.teachingMethods) {
                const method = tm.methodId;
                totalSteps += (method?.steps?.length || 0);
            }
            const completedSteps = progress.completedSteps.length;
            const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
            studentsProgress.push({
                student: {
                    _id: student._id,
                    name: student.name || student.userId,
                    userId: student.userId,
                    email: student.email
                },
                enrollment: {
                    enrolledAt: enrollment.enrolledAt,
                    status: enrollment.status,
                    progress: {
                        ...progress,
                        percentage,
                        totalSteps,
                        completedSteps: completedSteps
                    }
                },
                teachingMethods: (() => {
                    const methodsData = [];
                    for (const tm of course.teachingMethods) {
                        const method = tm.methodId;
                        let methodCompletedSteps = 0;
                        for (const step of progress.completedSteps) {
                            if (step.methodId?.toString() === method._id.toString()) {
                                methodCompletedSteps++;
                            }
                        }
                        methodsData.push({
                            _id: method._id,
                            name: method.name,
                            description: method.description,
                            steps: method.steps || [],
                            tips: method.tips || [],
                            order: tm.order,
                            isRequired: tm.isRequired,
                            progress: {
                                totalSteps: method.steps?.length || 0,
                                completedSteps: methodCompletedSteps,
                                percentage: method.steps?.length > 0
                                    ? Math.round((methodCompletedSteps / method.steps.length) * 100)
                                    : 0
                            }
                        });
                    }
                    return methodsData;
                })()
            });
        }
        res.json({
            success: true,
            data: {
                classInfo: {
                    _id: course._id,
                    name: course.name,
                    level: course.level,
                    classInfo: course.classInfo
                },
                studentsProgress
            }
        });
    }
    catch (error) {
        console.error('반 회원 진도 조회 실패:', error);
        res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
    }
});
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
    try {
        const { classId, studentId } = req.params;
        const { methodId, stepName, notes } = req.body;
        const course = await Course_1.Course.findById(classId);
        if (!course) {
            return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
        }
        let enrollment = null;
        for (const e of course.enrolledStudents) {
            if (e.student && e.student.toString() === studentId) {
                enrollment = e;
                break;
            }
        }
        if (!enrollment) {
            return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
        }
        const progress = enrollment.progress;
        const existingStep = progress.completedSteps.find(step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName);
        if (existingStep) {
            return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
        }
        progress.completedSteps.push({
            methodId,
            stepName,
            completedAt: new Date(),
            notes: notes || ''
        });
        let totalSteps = 0;
        for (const tm of course.teachingMethods) {
            if (tm.methodId.toString() === methodId) {
                totalSteps++;
            }
        }
        progress.percentage = Math.round((progress.completedSteps.length / totalSteps) * 100);
        progress.lastUpdated = new Date();
        await course.save();
        res.json({
            success: true,
            message: '체크리스트 단계가 완료되었습니다.',
            data: {
                completedSteps: progress.completedSteps,
                percentage: progress.percentage
            }
        });
    }
    catch (error) {
        console.error('체크리스트 단계 완료 처리 실패:', error);
        res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
    }
});
router.get('/my-courses', auth_1.auth, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
    try {
        const instructorId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const courses = await Course_1.Course.find({ instructor: instructorId })
            .populate('enrolledStudents.student', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCourses = await Course_1.Course.countDocuments({ instructor: instructorId });
        res.json({
            success: true,
            message: '강사 강습 과정 조회 성공!',
            data: courses,
            pagination: {
                page,
                limit,
                total: totalCourses,
                pages: Math.ceil(totalCourses / limit)
            }
        });
    }
    catch (error) {
        console.error('강사 강습 과정 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강사 강습 과정 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map