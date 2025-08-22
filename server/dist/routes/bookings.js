"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Booking_1 = require("../models/Booking");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, async (req, res) => {
    try {
        const { date, status, user, instructor } = req.query;
        const filter = {};
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }
        if (status)
            filter.status = status;
        const currentUser = req.user;
        if (currentUser?.userType === 'superAdmin') {
            if (user)
                filter.user = user;
            if (instructor)
                filter.instructor = instructor;
        }
        else if (currentUser?.userType === 'instructor') {
            filter.instructor = currentUser._id;
        }
        else {
            filter.user = currentUser._id;
        }
        const bookings = await Booking_1.Booking.find(filter)
            .populate('user', 'name userId')
            .populate('instructor', 'name userId')
            .populate('course', 'name')
            .sort({ date: 1, startTime: 1 });
        return res.json({ bookings });
    }
    catch (error) {
        console.error('예약 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const booking = await Booking_1.Booking.findById(req.params.id)
            .populate('user', 'name userId email phone')
            .populate('instructor', 'name userId')
            .populate('course', 'name description');
        if (!booking) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }
        const currentUser = req.user;
        if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
            return res.status(403).json({ error: '조회 권한이 없습니다.' });
        }
        return res.json({ booking });
    }
    catch (error) {
        console.error('예약 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const { date, startTime, endTime, laneNumber, purpose, notes, instructor, course } = req.body;
        if (!date || !startTime || !endTime || !laneNumber) {
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const bookingDate = new Date(date);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (bookingDate < todayStart) {
            return res.status(400).json({ error: '과거 날짜는 예약할 수 없습니다.' });
        }
        if (startTime >= endTime) {
            return res.status(400).json({ error: '종료 시간은 시작 시간보다 늦어야 합니다.' });
        }
        const existingBooking = await Booking_1.Booking.findOne({
            date: bookingDate,
            laneNumber,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });
        if (existingBooking) {
            return res.status(400).json({ error: '해당 시간에 이미 예약이 있습니다.' });
        }
        const bookingData = {
            user: req.user._id,
            date: bookingDate,
            startTime,
            endTime,
            laneNumber,
            purpose: purpose || 'practice',
            notes: notes || '',
            instructor,
            course,
        };
        const booking = new Booking_1.Booking(bookingData);
        await booking.save();
        const populatedBooking = await Booking_1.Booking.findById(booking._id)
            .populate('user', 'name userId')
            .populate('instructor', 'name userId')
            .populate('course', 'name');
        try {
            const io = req.app.get('io');
            if (io)
                io.to(`user:${String(req.user._id)}`).emit('notification', {
                    type: 'booking:created',
                    message: '예약이 생성되었습니다.',
                });
        }
        catch { }
        return res.status(201).json({
            message: '예약이 생성되었습니다.',
            booking: populatedBooking
        });
    }
    catch (error) {
        console.error('예약 생성 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const booking = await Booking_1.Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }
        const currentUser = req.user;
        if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }
        if (booking.status === 'completed') {
            return res.status(400).json({ error: '완료된 예약은 수정할 수 없습니다.' });
        }
        const updatedBooking = await Booking_1.Booking.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name userId')
            .populate('instructor', 'name userId')
            .populate('course', 'name');
        try {
            const io = req.app.get('io');
            if (io && updatedBooking)
                io.to(`user:${String(updatedBooking.user)}`).emit('notification', {
                    type: 'booking:updated',
                    message: '예약 정보가 업데이트되었습니다.',
                });
        }
        catch { }
        return res.json({
            message: '예약이 수정되었습니다.',
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error('예약 수정 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.post('/:id/cancel', auth_1.auth, async (req, res) => {
    try {
        const booking = await Booking_1.Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }
        const currentUser = req.user;
        if (currentUser?.userType !== 'superAdmin' && booking.user.toString() !== String(currentUser._id)) {
            return res.status(403).json({ error: '취소 권한이 없습니다.' });
        }
        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: '이미 취소된 예약입니다.' });
        }
        booking.status = 'cancelled';
        await booking.save();
        try {
            const io = req.app.get('io');
            if (io)
                io.to(`user:${String(booking.user)}`).emit('notification', {
                    type: 'booking:cancelled',
                    message: '예약이 취소되었습니다.',
                });
        }
        catch { }
        return res.json({ message: '예약이 취소되었습니다.' });
    }
    catch (error) {
        console.error('예약 취소 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.patch('/:id/status', auth_1.auth, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: '상태를 지정해주세요.' });
        }
        const booking = await Booking_1.Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name userId')
            .populate('instructor', 'name userId')
            .populate('course', 'name');
        if (!booking) {
            return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
        }
        try {
            const io = req.app.get('io');
            if (io && booking)
                io.to(`user:${String(booking.user)}`).emit('notification', {
                    type: 'booking:statusChanged',
                    message: `예약 상태가 '${status}'로 변경되었습니다.`,
                });
        }
        catch { }
        return res.json({
            message: '예약 상태가 변경되었습니다.',
            booking
        });
    }
    catch (error) {
        console.error('예약 상태 변경 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/available/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { laneNumber } = req.query;
        const bookingDate = new Date(date);
        const filter = {
            date: bookingDate,
            status: { $in: ['pending', 'confirmed'] }
        };
        if (laneNumber) {
            filter.laneNumber = laneNumber;
        }
        const bookings = await Booking_1.Booking.find(filter)
            .select('startTime endTime laneNumber')
            .sort({ startTime: 1 });
        const availableSlots = [];
        const startHour = 6;
        const endHour = 22;
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const nextTime = minute === 30 ?
                    `${(hour + 1).toString().padStart(2, '0')}:00` :
                    `${hour.toString().padStart(2, '0')}:30`;
                const conflictingBooking = bookings.find(booking => booking.startTime < nextTime && booking.endTime > time);
                if (!conflictingBooking) {
                    availableSlots.push({
                        startTime: time,
                        endTime: nextTime
                    });
                }
            }
        }
        return res.json({
            date: bookingDate,
            availableSlots,
            existingBookings: bookings
        });
    }
    catch (error) {
        console.error('예약 가능 시간 조회 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
router.get('/course/:courseId', auth_1.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date } = req.query;
        let filter = { course: courseId };
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }
        const bookings = await Booking_1.Booking.find(filter)
            .populate('user', 'name email')
            .populate('instructor', 'name')
            .populate('course', 'name level')
            .sort({ date: 1, startTime: 1 });
        res.json({
            success: true,
            message: '강습 과정별 예약 현황 조회 성공',
            data: {
                courseId,
                totalBookings: bookings.length,
                bookings
            }
        });
    }
    catch (error) {
        console.error('강습 과정별 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
router.get('/student/:studentId/courses', auth_1.auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (req.user._id !== studentId &&
            req.user.userType !== 'instructor' &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const bookings = await Booking_1.Booking.find({
            user: studentId,
            course: { $exists: true, $ne: null }
        })
            .populate('course', 'name level instructor')
            .populate('instructor', 'name')
            .sort({ date: 1, startTime: 1 });
        const courseBookings = new Map();
        bookings.forEach(booking => {
            if (booking.course) {
                const course = booking.course;
                const courseId = course._id.toString();
                if (!courseBookings.has(courseId)) {
                    courseBookings.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level
                        },
                        totalBookings: 0,
                        completedBookings: 0,
                        upcomingBookings: 0,
                        bookings: []
                    });
                }
                const courseInfo = courseBookings.get(courseId);
                courseInfo.totalBookings++;
                courseInfo.bookings.push(booking);
                if (booking.status === 'completed') {
                    courseInfo.completedBookings++;
                }
                else if (new Date(booking.date) > new Date()) {
                    courseInfo.upcomingBookings++;
                }
            }
        });
        res.json({
            success: true,
            message: '학생별 강습 과정 예약 현황 조회 성공',
            data: {
                studentId,
                totalCourses: courseBookings.size,
                courseBookings: Array.from(courseBookings.values())
            }
        });
    }
    catch (error) {
        console.error('학생별 강습 과정 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/courses', auth_1.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user._id !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const bookings = await Booking_1.Booking.find({
            instructor: instructorId,
            course: { $exists: true, $ne: null }
        })
            .populate('course', 'name level')
            .populate('user', 'name email studentInfo')
            .sort({ date: 1, startTime: 1 });
        const courseBookings = new Map();
        bookings.forEach(booking => {
            if (booking.course) {
                const course = booking.course;
                const courseId = course._id.toString();
                if (!courseBookings.has(courseId)) {
                    courseBookings.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level
                        },
                        totalBookings: 0,
                        todayBookings: 0,
                        thisWeekBookings: 0,
                        bookings: []
                    });
                }
                const courseInfo = courseBookings.get(courseId);
                courseInfo.totalBookings++;
                courseInfo.bookings.push(booking);
                const bookingDate = new Date(booking.date);
                const today = new Date();
                const thisWeek = new Date();
                thisWeek.setDate(thisWeek.getDate() + 7);
                if (bookingDate.toDateString() === today.toDateString()) {
                    courseInfo.todayBookings++;
                }
                if (bookingDate >= today && bookingDate <= thisWeek) {
                    courseInfo.thisWeekBookings++;
                }
            }
        });
        res.json({
            success: true,
            message: '강사별 강습 과정 예약 현황 조회 성공',
            data: {
                instructorId,
                totalCourses: courseBookings.size,
                courseBookings: Array.from(courseBookings.values())
            }
        });
    }
    catch (error) {
        console.error('강사별 강습 과정 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
router.get('/course/:courseId', auth_1.auth, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date } = req.query;
        let filter = { course: courseId };
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }
        const bookings = await Booking_1.Booking.find(filter)
            .populate('user', 'name email')
            .populate('instructor', 'name')
            .populate('course', 'name level')
            .sort({ date: 1, startTime: 1 });
        res.json({
            success: true,
            message: '강습 과정별 예약 현황 조회 성공',
            data: {
                courseId,
                totalBookings: bookings.length,
                bookings
            }
        });
    }
    catch (error) {
        console.error('강습 과정별 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
router.get('/student/:studentId/courses', auth_1.auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (req.user._id !== studentId &&
            req.user.userType !== 'instructor' &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const bookings = await Booking_1.Booking.find({
            user: studentId,
            course: { $exists: true, $ne: null }
        })
            .populate('course', 'name level instructor')
            .populate('instructor', 'name')
            .sort({ date: 1, startTime: 1 });
        const courseBookings = new Map();
        bookings.forEach(booking => {
            if (booking.course) {
                const course = booking.course;
                const courseId = course._id.toString();
                if (!courseBookings.has(courseId)) {
                    courseBookings.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level
                        },
                        totalBookings: 0,
                        completedBookings: 0,
                        upcomingBookings: 0,
                        bookings: []
                    });
                }
                const courseInfo = courseBookings.get(courseId);
                courseInfo.totalBookings++;
                courseInfo.bookings.push(booking);
                if (booking.status === 'completed') {
                    courseInfo.completedBookings++;
                }
                else if (new Date(booking.date) > new Date()) {
                    courseInfo.upcomingBookings++;
                }
            }
        });
        res.json({
            success: true,
            message: '학생별 강습 과정 예약 현황 조회 성공',
            data: {
                studentId,
                totalCourses: courseBookings.size,
                courseBookings: Array.from(courseBookings.values())
            }
        });
    }
    catch (error) {
        console.error('학생별 강습 과정 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
router.get('/instructor/:instructorId/courses', auth_1.auth, async (req, res) => {
    try {
        const { instructorId } = req.params;
        if (req.user._id !== instructorId &&
            req.user.userType !== 'centerAdmin' &&
            req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const bookings = await Booking_1.Booking.find({
            instructor: instructorId,
            course: { $exists: true, $ne: null }
        })
            .populate('course', 'name level')
            .populate('user', 'name email studentInfo')
            .sort({ date: 1, startTime: 1 });
        const courseBookings = new Map();
        bookings.forEach(booking => {
            if (booking.course) {
                const course = booking.course;
                const courseId = course._id.toString();
                if (!courseBookings.has(courseId)) {
                    courseBookings.set(courseId, {
                        course: {
                            _id: course._id,
                            name: course.name,
                            level: course.level
                        },
                        totalBookings: 0,
                        todayBookings: 0,
                        thisWeekBookings: 0,
                        bookings: []
                    });
                }
                const courseInfo = courseBookings.get(courseId);
                courseInfo.totalBookings++;
                courseInfo.bookings.push(booking);
                const bookingDate = new Date(booking.date);
                const today = new Date();
                const thisWeek = new Date();
                thisWeek.setDate(thisWeek.getDate() + 7);
                if (bookingDate.toDateString() === today.toDateString()) {
                    courseInfo.todayBookings++;
                }
                if (bookingDate >= today && bookingDate <= thisWeek) {
                    courseInfo.thisWeekBookings++;
                }
            }
        });
        res.json({
            success: true,
            message: '강사별 강습 과정 예약 현황 조회 성공',
            data: {
                instructorId,
                totalCourses: courseBookings.size,
                courseBookings: Array.from(courseBookings.values())
            }
        });
    }
    catch (error) {
        console.error('강사별 강습 과정 예약 현황 조회 오류:', error);
        res.status(500).json({ error: '예약 현황 조회에 실패했습니다.' });
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map