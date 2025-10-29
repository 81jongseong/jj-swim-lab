"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Course_1 = require("../models/Course");
const User_1 = require("../models/User");
const Center_1 = require("../models/Center");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
const auth_2 = require("../middleware/auth");
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
        console.log('📚 강습 과정 조회 응답:', {
            totalCourses: courses.length,
            coursesWithLaneInfo: courses.filter(c => c.poolType || c.lanes || c.laneInfo).length,
            sampleCourse: courses[0] ? {
                name: courses[0].name,
                poolType: courses[0].poolType,
                lanes: courses[0].lanes,
                laneInfo: courses[0].laneInfo
            } : null
        });
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
router.post('/', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        console.log('📥 강습 과정 생성 요청:', {
            body: req.body,
            userId: req.user?.userId,
            userType: req.user?.userType
        });
        const { name, description, level, duration, price, maxStudents, schedule, instructorId, instructorName, tags, poolType, lanes, laneInfo, courseType, isPersonalLesson, personalLessonSettings, startDate, endDate } = req.body;
        if (!name || !level || !duration || price === undefined || !maxStudents) {
            console.error('❌ 필수 필드 누락:', { name, level, duration, price, maxStudents });
            return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        if (!user) {
            console.error('❌ 사용자를 찾을 수 없음:', req.user.userId);
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        console.log('👤 사용자 정보:', {
            userType: user.userType,
            managedCenters: user.centerAdminInfo?.managedCenters,
            assignedCenters: user.instructorInfo?.assignedCenters
        });
        let centerId = req.body.centerId;
        if (!centerId) {
            if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerAdminInfo?.managedCenters && user.centerAdminInfo.managedCenters.length > 0) {
                centerId = user.centerAdminInfo.managedCenters[0];
            }
            else if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters && user.instructorInfo.assignedCenters.length > 0) {
                centerId = user.instructorInfo.assignedCenters[0];
            }
            else if (['centerAdmin', 'center-admin'].includes(user.userType) && user.centerId) {
                centerId = user.centerId;
            }
        }
        console.log('🏢 centerId:', centerId, 'userType:', user.userType, 'hasCenterId:', !!user.centerId, 'hasManagedCenters:', !!user.centerAdminInfo?.managedCenters);
        if (!centerId) {
            console.error('❌ centerId를 찾을 수 없음 - 사용자 정보:', {
                userType: user.userType,
                centerId: user.centerId,
                managedCenters: user.centerAdminInfo?.managedCenters,
                assignedCenters: user.instructorInfo?.assignedCenters
            });
            return res.status(400).json({ error: '센터 ID가 필요합니다. 센터 관리자는 관리하는 센터가 있어야 합니다.' });
        }
        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        }
        if (isPersonalLesson && schedule && schedule.length > 0) {
            const center = await Center_1.Center.findById(centerId);
            if (!center) {
                return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
            }
            const personalLessonSettings = center.availabilitySettings?.personalLesson;
            if (!personalLessonSettings?.enabled) {
                return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
            }
            const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
            if (dayTimeSlots.length === 0) {
                return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
            }
            const dayMap = {
                'monday': 'monday',
                'tuesday': 'tuesday',
                'wednesday': 'wednesday',
                'thursday': 'thursday',
                'friday': 'friday',
                'saturday': 'saturday',
                'sunday': 'sunday',
                '월': 'monday',
                '화': 'tuesday',
                '수': 'wednesday',
                '목': 'thursday',
                '금': 'friday',
                '토': 'saturday',
                '일': 'sunday'
            };
            const invalidDays = [];
            for (const scheduleItem of schedule) {
                const startTime = scheduleItem.startTime || '';
                const endTime = scheduleItem.endTime || startTime;
                const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
                const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
                console.log('🔍 POST 검증할 스케줄:', {
                    dayOfWeekStr,
                    days,
                    startTime,
                    endTime
                });
                for (const day of days) {
                    const dayLower = day.toLowerCase();
                    const englishDay = dayMap[dayLower] || dayLower;
                    const daySlot = dayTimeSlots.find((ds) => ds.day === englishDay);
                    if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
                        const koreanDaysMap = {
                            'monday': '월요일',
                            'tuesday': '화요일',
                            'wednesday': '수요일',
                            'thursday': '목요일',
                            'friday': '금요일',
                            'saturday': '토요일',
                            'sunday': '일요일',
                            '월': '월요일',
                            '화': '화요일',
                            '수': '수요일',
                            '목': '목요일',
                            '금': '금요일',
                            '토': '토요일',
                            '일': '일요일'
                        };
                        const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
                        invalidDays.push(koreanDay);
                        continue;
                    }
                    const scheduleStartMinutes = timeToMinutes(startTime);
                    const scheduleEndMinutes = timeToMinutes(endTime);
                    let isWithinOperatingHours = false;
                    for (const timeSlot of daySlot.timeSlots) {
                        const slotStartMinutes = timeToMinutes(timeSlot.startTime);
                        const slotEndMinutes = timeToMinutes(timeSlot.endTime);
                        if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
                            isWithinOperatingHours = true;
                            break;
                        }
                    }
                    if (!isWithinOperatingHours) {
                        const availableTimes = daySlot.timeSlots.map((ts) => `${ts.startTime}~${ts.endTime}`).join(', ');
                        return res.status(400).json({
                            error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}`
                        });
                    }
                }
            }
            if (invalidDays.length > 0) {
                const invalidDaysStr = invalidDays.length === 1
                    ? invalidDays[0]
                    : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
                return res.status(400).json({
                    error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.`
                });
            }
        }
        const classInfo = req.body.classInfo || {
            className: name,
            classType: 'regular',
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            maxCapacity: maxStudents,
            currentEnrollment: 0
        };
        let finalInstructorName = instructorName;
        if (!finalInstructorName && instructorId) {
            try {
                const instructor = await User_1.User.findById(instructorId).select('name');
                finalInstructorName = instructor?.name || '';
            }
            catch (error) {
                console.error('강사 이름 조회 실패:', error);
            }
        }
        let finalPersonalLessonSettings = personalLessonSettings;
        if (isPersonalLesson && !personalLessonSettings) {
            finalPersonalLessonSettings = { timeSlots: [], lessonTypes: [], frequencyOptions: [] };
        }
        const courseData = {
            name,
            description,
            level,
            duration,
            price,
            maxStudents,
            centerId,
            classInfo,
            instructor: instructorId || req.user.userId,
            instructorId: instructorId || req.user.userId,
            instructorName: finalInstructorName,
            schedule: schedule || [],
            tags: tags || [],
            poolType: poolType || 'mainPool',
            lanes: lanes || [],
            laneInfo: laneInfo || {},
            courseType: courseType || 'group',
            isPersonalLesson: isPersonalLesson === true || name?.includes('개인 레슨') || name?.includes('개인레슨'),
            personalLessonSettings: finalPersonalLessonSettings,
            startDate: startDate || new Date(),
            endDate: endDate || new Date(new Date().setMonth(new Date().getMonth() + 1))
        };
        console.log('🎯 isPersonalLesson 판단:', {
            isPersonalLesson,
            name,
            finalValue: courseData.isPersonalLesson
        });
        if (schedule && schedule.length > 0) {
            const dayNameMap = {
                '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday',
                '금': 'friday', '토': 'saturday', '일': 'sunday',
                '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday',
                '금요일': 'friday', '토요일': 'saturday', '일요일': 'sunday',
                'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday', 'thursday': 'thursday',
                'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday'
            };
            courseData.schedule = schedule
                .map((sched) => {
                const day = sched.day || sched.dayOfWeek || '';
                const dayArray = day.split(',').map((d) => d.trim()).filter((d) => d);
                const englishDay = dayArray.map((d) => dayNameMap[d.toLowerCase()] || d).join(',');
                const scheduleItem = {
                    ...sched,
                    day: englishDay,
                    lanes: sched.lanes && sched.lanes.assignedLanes ? sched.lanes : {
                        assignedLanes: sched.lanes?.assignedLanes || lanes || [],
                        originalAssignedLanes: sched.lanes?.originalAssignedLanes || lanes || [],
                        isAdjusted: sched.lanes?.isAdjusted || false
                    }
                };
                console.log(`📅 스케줄 변환: ${day} → ${englishDay}`);
                return scheduleItem;
            })
                .filter((sched) => {
                const hasValidDay = sched.day && sched.day.trim() !== '';
                if (!hasValidDay) {
                    console.log(`⚠️ 유효하지 않은 스케줄 제외: day=${sched.day}, startTime=${sched.startTime}`);
                }
                return hasValidDay;
            });
            console.log(`📊 최종 schedule 항목 수: ${courseData.schedule.length}`);
        }
        console.log('📚 강습 과정 생성 데이터:', courseData);
        console.log('💾 저장할 데이터:', courseData);
        console.log('🏷️ 태그:', tags);
        const course = new Course_1.Course(courseData);
        await course.save();
        console.log('✅ 저장 성공:', course._id);
        const populatedCourse = await Course_1.Course.findById(course._id)
            .populate('instructor', 'name userId');
        console.log('📋 생성된 강습 과정 정보:', {
            id: populatedCourse?._id,
            name: populatedCourse?.name,
            instructor: populatedCourse?.instructor,
            instructorId: populatedCourse?.instructorId,
            instructorName: populatedCourse?.instructorName
        });
        return res.status(201).json({
            success: true,
            message: '강습 과정이 생성되었습니다.',
            data: populatedCourse
        });
    }
    catch (error) {
        console.error('💥 강습 과정 생성 오류:', error);
        if (error instanceof Error) {
            console.error('💥 에러 메시지:', error.message);
            console.error('💥 에러 스택:', error.stack);
        }
        return res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
router.put('/:id', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        console.log('📝 강습 과정 수정 요청 시작');
        console.log('📋 courseId:', req.params.id);
        console.log('🏊 body.lanes:', req.body.lanes);
        console.log('🏊 body.poolType:', req.body.poolType);
        console.log('🏊 body.laneInfo:', req.body.laneInfo);
        console.log('🏊 body.personalLessonSettings:', req.body.personalLessonSettings);
        console.log('📦 전체 body:', req.body);
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        console.log('🔍 기존 코스 정보:', {
            isPersonalLesson: course.isPersonalLesson,
            name: course.name,
            schedule: course.schedule
        });
        const user = await User_1.User.findById(req.user.userId);
        const isSuperAdmin = user?.userType === 'superAdmin';
        const isCenterAdmin = user?.userType === 'centerAdmin' || user?.userType === 'center-admin';
        const isOwnCourse = course.instructor ? course.instructor.toString() === String(req.user.userId) : false;
        console.log('🔐 권한 확인:', {
            userType: user?.userType,
            isSuperAdmin,
            isCenterAdmin,
            isOwnCourse,
            courseInstructor: course.instructor ? course.instructor.toString() : 'undefined',
            currentUser: req.user.userId
        });
        if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
            console.error('❌ 권한 없음:', { userType: user?.userType, userId: req.user.userId });
            return res.status(403).json({ error: '수정 권한이 없습니다.' });
        }
        console.log('✅ 권한 확인 통과');
        const { name, description, level, duration, price, maxStudents, instructorId } = req.body;
        if (name && typeof name !== 'string') {
            return res.status(400).json({ error: '강습 과정명은 문자열이어야 합니다.' });
        }
        if (description && typeof description !== 'string') {
            return res.status(400).json({ error: '강습 과정 설명은 문자열이어야 합니다.' });
        }
        if (level && typeof level !== 'string') {
            return res.status(400).json({ error: '레벨은 문자열이어야 합니다.' });
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
        const updateData = { ...req.body };
        if (updateData.instructorId) {
            updateData.instructor = updateData.instructorId;
            updateData.instructorId = updateData.instructorId;
            let instructorName = updateData.instructorName;
            if (!instructorName) {
                try {
                    const instructor = await User_1.User.findById(updateData.instructorId).select('name');
                    instructorName = instructor?.name || '';
                    updateData.instructorName = instructorName;
                }
                catch (error) {
                    console.error('강사 이름 조회 실패:', error);
                }
            }
            console.log('👨‍🏫 강사 정보 업데이트:', {
                원본: req.body.instructorId,
                instructorId: updateData.instructorId,
                instructor: updateData.instructor,
                instructorName: updateData.instructorName
            });
        }
        if (!updateData.tags) {
            updateData.tags = [];
        }
        console.log('🏷️ 태그 처리:', updateData.tags);
        if (!updateData.lanes) {
            updateData.lanes = [];
        }
        console.log('🏊 레인 처리:', updateData.lanes);
        if (!updateData.laneInfo) {
            updateData.laneInfo = {
                assignedLanes: [],
                maxLanes: 0,
                minLanes: 0
            };
        }
        console.log('🏊 레인 정보 처리:', updateData.laneInfo);
        const isPersonalLessonFromUpdateData = updateData.isPersonalLesson === true;
        const hasPersonalLessonSettings = !!updateData.personalLessonSettings;
        const isPersonalLessonFromCourse = course.isPersonalLesson === true;
        const isPersonalLessonByName = course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨'));
        if (isPersonalLessonFromUpdateData || hasPersonalLessonSettings || isPersonalLessonFromCourse || isPersonalLessonByName) {
            updateData.isPersonalLesson = true;
            console.log('⏰ 개인레슨 설정 업데이트:', {
                fromUpdateData: isPersonalLessonFromUpdateData,
                fromSettings: hasPersonalLessonSettings,
                fromCourse: isPersonalLessonFromCourse,
                fromName: isPersonalLessonByName,
                isPersonalLesson: updateData.isPersonalLesson,
                schedule: JSON.stringify(updateData.schedule)
            });
        }
        console.log('🔍 검증 체크:', {
            isPersonalLesson: updateData.isPersonalLesson,
            hasSchedule: !!updateData.schedule,
            scheduleLength: updateData.schedule?.length
        });
        if (updateData.isPersonalLesson && updateData.schedule && updateData.schedule.length > 0) {
            console.log('🔍 개인레슨 운영시간 검증 시작');
            const center = await Center_1.Center.findById(course.centerId);
            if (!center) {
                return res.status(404).json({ error: '센터 정보를 찾을 수 없습니다.' });
            }
            const personalLessonSettings = center.availabilitySettings?.personalLesson;
            if (!personalLessonSettings?.enabled) {
                return res.status(400).json({ error: '개인레슨 운영이 비활성화되어 있습니다. 센터 관리자에게 문의하세요.' });
            }
            const dayTimeSlots = personalLessonSettings.dayTimeSlots || [];
            if (dayTimeSlots.length === 0) {
                return res.status(400).json({ error: '개인레슨 운영시간이 설정되지 않았습니다. 센터 정보 관리 페이지에서 먼저 운영시간을 설정하세요.' });
            }
            const dayMap = {
                'monday': 'monday',
                'tuesday': 'tuesday',
                'wednesday': 'wednesday',
                'thursday': 'thursday',
                'friday': 'friday',
                'saturday': 'saturday',
                'sunday': 'sunday',
                '월': 'monday',
                '화': 'tuesday',
                '수': 'wednesday',
                '목': 'thursday',
                '금': 'friday',
                '토': 'saturday',
                '일': 'sunday'
            };
            function timeToMinutes(timeStr) {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + (minutes || 0);
            }
            const invalidDays = [];
            for (const scheduleItem of updateData.schedule) {
                const startTime = scheduleItem.startTime || '';
                const endTime = scheduleItem.endTime || startTime;
                const dayOfWeekStr = scheduleItem.day || scheduleItem.dayOfWeek || '';
                const days = dayOfWeekStr.split(',').map(d => d.trim()).filter(d => d);
                console.log('🔍 검증할 스케줄:', {
                    dayOfWeekStr,
                    days,
                    startTime,
                    endTime
                });
                for (const day of days) {
                    const dayLower = day.toLowerCase();
                    const englishDay = dayMap[dayLower] || dayLower;
                    const daySlot = dayTimeSlots.find((ds) => ds.day === englishDay);
                    if (!daySlot || !daySlot.timeSlots || daySlot.timeSlots.length === 0) {
                        const koreanDaysMap = {
                            'monday': '월요일',
                            'tuesday': '화요일',
                            'wednesday': '수요일',
                            'thursday': '목요일',
                            'friday': '금요일',
                            'saturday': '토요일',
                            'sunday': '일요일',
                            '월': '월요일',
                            '화': '화요일',
                            '수': '수요일',
                            '목': '목요일',
                            '금': '금요일',
                            '토': '토요일',
                            '일': '일요일'
                        };
                        const koreanDay = koreanDaysMap[dayLower] || `${day}요일`;
                        invalidDays.push(koreanDay);
                        continue;
                    }
                    const scheduleStartMinutes = timeToMinutes(startTime);
                    const scheduleEndMinutes = timeToMinutes(endTime);
                    let isWithinOperatingHours = false;
                    for (const timeSlot of daySlot.timeSlots) {
                        const slotStartMinutes = timeToMinutes(timeSlot.startTime);
                        const slotEndMinutes = timeToMinutes(timeSlot.endTime);
                        if (scheduleStartMinutes >= slotStartMinutes && scheduleEndMinutes <= slotEndMinutes) {
                            isWithinOperatingHours = true;
                            break;
                        }
                    }
                    if (!isWithinOperatingHours) {
                        const availableTimes = daySlot.timeSlots.map((ts) => `${ts.startTime}~${ts.endTime}`).join(', ');
                        return res.status(400).json({
                            error: `${day}요일 ${startTime}는 개인레슨 운영시간이 아닙니다. 운영시간: ${availableTimes}`
                        });
                    }
                }
            }
            if (invalidDays.length > 0) {
                const invalidDaysStr = invalidDays.length === 1
                    ? invalidDays[0]
                    : invalidDays.slice(0, -1).join(', ') + ', ' + invalidDays[invalidDays.length - 1];
                return res.status(400).json({
                    error: `${invalidDaysStr}은 개인레슨 운영시간이 설정되지 않았습니다. 센터 운영시간 설정을 확인하세요.`
                });
            }
        }
        if (updateData.schedule && updateData.schedule.length > 0) {
            updateData.schedule = updateData.schedule.map((sched) => {
                if (sched.lanes && sched.lanes.assignedLanes) {
                    return sched;
                }
                return {
                    ...sched,
                    lanes: {
                        assignedLanes: sched.lanes?.assignedLanes || updateData.lanes || [],
                        originalAssignedLanes: sched.lanes?.originalAssignedLanes || updateData.lanes || [],
                        isAdjusted: sched.lanes?.isAdjusted || false
                    }
                };
            });
        }
        console.log('💾 업데이트할 updateData:');
        console.log('  - lanes:', updateData.lanes);
        console.log('  - poolType:', updateData.poolType);
        console.log('  - laneInfo:', updateData.laneInfo);
        console.log('  - schedule:', JSON.stringify(updateData.schedule, null, 2));
        console.log('💾 전체 updateData:', updateData);
        const updatedCourse = await Course_1.Course.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('instructor', 'name userId');
        console.log('✅ DB 업데이트 완료');
        console.log('🏊 업데이트된 lanes:', updatedCourse?.lanes);
        console.log('🏊 업데이트된 poolType:', updatedCourse?.poolType);
        console.log('🏊 업데이트된 laneInfo:', updatedCourse?.laneInfo);
        console.log('🔍 업데이트 후 강습 과정:', {
            _id: updatedCourse?._id,
            name: updatedCourse?.name,
            instructor: updatedCourse?.instructor,
            instructorId: updatedCourse?.instructorId,
            instructorName: updatedCourse?.instructorName
        });
        console.log('✅ 강습 과정 수정 완료:', {
            courseId: updatedCourse?._id,
            courseName: updatedCourse?.name,
            instructor: updatedCourse?.instructor,
            instructorId: updatedCourse?.instructorId,
            instructorName: updatedCourse?.instructorName,
            tags: updatedCourse?.tags,
            poolType: updatedCourse?.poolType,
            lanes: updatedCourse?.lanes,
            laneInfo: updatedCourse?.laneInfo
        });
        return res.json({
            success: true,
            message: '강습 과정이 수정되었습니다.',
            data: updatedCourse
        });
    }
    catch (error) {
        console.error('💥 강습 과정 수정 오류:', error);
        if (error instanceof Error) {
            console.error('💥 에러 메시지:', error.message);
            console.error('💥 에러 스택:', error.stack);
        }
        return res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
router.delete('/:id', auth_2.auth, role_1.requireInstructorOrAdmin, async (req, res) => {
    try {
        const course = await Course_1.Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
        }
        const user = await User_1.User.findById(req.user.userId);
        const isSuperAdmin = user?.userType === 'superAdmin';
        const isCenterAdmin = ['centerAdmin', 'center-admin'].includes(user?.userType || '');
        const isOwnCourse = course.instructor.toString() === String(req.user.userId);
        console.log('🔐 삭제 권한 확인:', {
            userType: user?.userType,
            isSuperAdmin,
            isCenterAdmin,
            isOwnCourse
        });
        if (!isSuperAdmin && !isCenterAdmin && !isOwnCourse) {
            console.error('❌ 삭제 권한 없음:', { userType: user?.userType, userId: req.user.userId });
            return res.status(403).json({ error: '삭제 권한이 없습니다.' });
        }
        console.log('🔍 삭제할 코스 정보:', {
            name: course.name,
            isPersonalLesson: course.isPersonalLesson,
            schedule: course.schedule
        });
        const isPersonalLesson = course.isPersonalLesson === true ||
            (course.name && (course.name.includes('개인 레슨') || course.name.includes('개인레슨')));
        console.log('🎯 개인레슨 판단:', {
            isPersonalLessonFlag: course.isPersonalLesson,
            courseName: course.name,
            finalIsPersonalLesson: isPersonalLesson
        });
        if (isPersonalLesson) {
            console.log('🔄 개인레슨 삭제 - 레인 복원 시작...');
            console.log('📅 개인레슨 스케줄:', course.schedule);
            for (const scheduleItem of course.schedule) {
                const dayName = scheduleItem.day;
                const time = scheduleItem.startTime;
                console.log(`🔍 복원 대상 요일/시간: ${dayName} ${time}`);
                const actualDayName = Array.isArray(dayName)
                    ? dayName[0]
                    : dayName.split(',')[0].trim();
                console.log(`🔍 실제 날짜: ${actualDayName}`);
                const otherCourses = await Course_1.Course.find({
                    _id: { $ne: course._id },
                    centerId: course.centerId,
                    isActive: true,
                    $or: [
                        { 'schedule.day': actualDayName },
                        { 'schedule.day': { $regex: actualDayName, $options: 'i' } }
                    ],
                    'schedule.startTime': time
                });
                console.log(`🔍 발견된 다른 강습과정 수: ${otherCourses.length}`);
                for (const otherCourse of otherCourses) {
                    console.log(`🔍 처리 중인 강습과정: ${otherCourse.name}`);
                    const otherScheduleItem = otherCourse.schedule.find((s) => {
                        const sDay = s.day || '';
                        const sDays = Array.isArray(sDay)
                            ? sDay
                            : sDay.split(',').map((d) => d.trim());
                        return sDays.includes(actualDayName) && s.startTime === time;
                    });
                    if (otherScheduleItem) {
                        console.log(`📊 스케줄 항목 발견:`, {
                            day: otherScheduleItem.day,
                            time: otherScheduleItem.startTime,
                            lanes: otherScheduleItem.lanes
                        });
                        if (otherScheduleItem.lanes?.originalAssignedLanes && otherScheduleItem.lanes.originalAssignedLanes.length > 0) {
                            const originalLanes = otherScheduleItem.lanes.originalAssignedLanes;
                            const currentLanes = otherScheduleItem.lanes.assignedLanes;
                            console.log(`🔧 ${otherCourse.name} ${actualDayName} ${time} 레인 복원:`, {
                                current: currentLanes,
                                original: originalLanes
                            });
                            const updatedSchedule = otherCourse.schedule.map((s) => {
                                const sDay = s.day || '';
                                const sDays = Array.isArray(sDay)
                                    ? sDay
                                    : sDay.split(',').map((d) => d.trim());
                                const isMatchingDay = sDays.includes(actualDayName);
                                if (isMatchingDay && s.startTime === time) {
                                    return {
                                        ...s,
                                        lanes: {
                                            assignedLanes: originalLanes,
                                            originalAssignedLanes: originalLanes,
                                            isAdjusted: false
                                        }
                                    };
                                }
                                return s;
                            });
                            await Course_1.Course.findByIdAndUpdate(otherCourse._id, {
                                schedule: updatedSchedule
                            });
                            console.log(`✅ ${otherCourse.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${originalLanes.join(',')}]`);
                        }
                        else {
                            console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 복원할 원본 레인이 없음`);
                        }
                    }
                    else {
                        console.log(`⚠️  ${otherCourse.name} ${actualDayName} ${time} 스케줄 항목을 찾을 수 없음`);
                    }
                }
            }
        }
        await Course_1.Course.findByIdAndDelete(req.params.id);
        console.log('✅ 강습 과정 삭제 완료:', req.params.id);
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
router.get('/my-courses', auth_1.authMiddleware, (0, auth_1.requireRole)(['instructor']), async (req, res) => {
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
router.get('/oversight', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const dummyOversightData = [
            {
                _id: '1',
                title: '초급 자유형 기초반',
                description: '수영 초보자를 위한 자유형 기초 강습',
                level: 'beginner',
                duration: 60,
                maxStudents: 8,
                price: 80000,
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                centerRegion: '서울 강남구',
                instructor: { _id: 'inst1', name: '김강사', rating: 4.5 },
                enrollmentCount: 6,
                revenue: 480000,
                satisfaction: 4.3,
                status: 'active',
                approvalStatus: 'approved',
                createdAt: '2025-01-15',
                lastUpdated: '2025-01-18'
            },
            {
                _id: '2',
                title: '중급 4영법 마스터반',
                description: '4가지 영법을 모두 배우는 중급 과정',
                level: 'intermediate',
                duration: 75,
                maxStudents: 6,
                price: 120000,
                centerId: 'center2',
                centerName: 'JJ 수영장 홍대점',
                centerRegion: '서울 마포구',
                instructor: { _id: 'inst2', name: '이강사', rating: 4.7 },
                enrollmentCount: 4,
                revenue: 480000,
                satisfaction: 4.6,
                status: 'active',
                approvalStatus: 'pending',
                createdAt: '2025-01-10',
                lastUpdated: '2025-01-17'
            },
            {
                _id: '3',
                title: '고급 접영 마스터반',
                description: '접영 마스터 및 경기 준비 과정',
                level: 'advanced',
                duration: 90,
                maxStudents: 4,
                price: 180000,
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                centerRegion: '서울 강남구',
                instructor: { _id: 'inst3', name: '박강사', rating: 4.8 },
                enrollmentCount: 3,
                revenue: 540000,
                satisfaction: 4.9,
                status: 'active',
                approvalStatus: 'approved',
                createdAt: '2025-01-12',
                lastUpdated: '2025-01-16'
            }
        ];
        res.json({
            success: true,
            data: dummyOversightData,
            pagination: {
                current: 1,
                limit: 10,
                total: dummyOversightData.length,
                pages: 1
            }
        });
    }
    catch (error) {
        console.error('강습 과정 감독 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습 과정 감독 데이터 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/center-stats', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const dummyCenterStats = [
            {
                centerId: 'center1',
                centerName: 'JJ 수영장 강남점',
                region: '서울 강남구',
                totalCourses: 8,
                activeCourses: 7,
                totalEnrollments: 45,
                totalRevenue: 3600000,
                averageSatisfaction: 4.4,
                approvalRate: 87.5
            },
            {
                centerId: 'center2',
                centerName: 'JJ 수영장 홍대점',
                region: '서울 마포구',
                totalCourses: 6,
                activeCourses: 5,
                totalEnrollments: 32,
                totalRevenue: 2400000,
                averageSatisfaction: 4.2,
                approvalRate: 83.3
            },
            {
                centerId: 'center3',
                centerName: 'JJ 수영장 잠실점',
                region: '서울 송파구',
                totalCourses: 10,
                activeCourses: 9,
                totalEnrollments: 58,
                totalRevenue: 4200000,
                averageSatisfaction: 4.6,
                approvalRate: 90.0
            }
        ];
        res.json({
            success: true,
            data: dummyCenterStats
        });
    }
    catch (error) {
        console.error('센터별 강습 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '센터별 강습 통계 조회 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:id/approval', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 액션입니다. (approve 또는 reject)'
            });
        }
        const course = await Course_1.Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: '강습 과정을 찾을 수 없습니다.'
            });
        }
        course.isActive = action === 'approve';
        await course.save();
        res.json({
            success: true,
            message: `강습 과정이 성공적으로 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
            data: course
        });
    }
    catch (error) {
        console.error('강습 과정 승인 처리 오류:', error);
        res.status(500).json({
            success: false,
            message: '강습 과정 승인 처리 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map