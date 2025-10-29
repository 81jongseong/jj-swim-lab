"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaneAllocationService = void 0;
const Course_1 = require("../models/Course");
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
class LaneAllocationService {
    static async adjustLanesForPersonalLesson(personalLessonData) {
        try {
            const { date, time, centerId, rentalCount = 1, dayName } = personalLessonData;
            const normalizeDayName = (day) => {
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
                    '일': 'sunday',
                    '월요일': 'monday',
                    '화요일': 'tuesday',
                    '수요일': 'wednesday',
                    '목요일': 'thursday',
                    '금요일': 'friday',
                    '토요일': 'saturday',
                    '일요일': 'sunday'
                };
                return dayMap[day.toLowerCase()] || day.toLowerCase();
            };
            let actualDayName = dayName ? normalizeDayName(dayName) : null;
            if (!actualDayName && date) {
                const dateObj = new Date(date);
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                actualDayName = dayNames[dateObj.getDay()];
            }
            if (!actualDayName) {
                throw new Error('요일 정보가 없습니다.');
            }
            console.log(`📅 개인레슨: ${actualDayName}, 시간: ${time}`);
            const allCourses = await Course_1.Course.find({
                centerId,
                isActive: true
            });
            const normalizeDayForCompare = (day) => {
                const dayMap = {
                    'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday', 'thursday': 'thursday',
                    'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
                    '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday',
                    '금': 'friday', '토': 'saturday', '일': 'sunday',
                    '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday',
                    '금요일': 'friday', '토요일': 'saturday', '일요일': 'sunday'
                };
                return dayMap[day.toLowerCase()] || day.toLowerCase();
            };
            const conflictingCourses = allCourses.filter((course) => {
                if (course.isPersonalLesson) {
                    return false;
                }
                return course.schedule.some((scheduleItem) => {
                    const courseDay = scheduleItem.day || '';
                    const courseDays = Array.isArray(courseDay)
                        ? courseDay
                        : courseDay.split(',').map((d) => d.trim()).filter((d) => d);
                    const normalizedCourseDays = courseDays.map((d) => normalizeDayForCompare(d));
                    const normalizedDayName = normalizeDayForCompare(actualDayName);
                    return normalizedCourseDays.includes(normalizedDayName) &&
                        scheduleItem.startTime <= time &&
                        scheduleItem.endTime >= time;
                });
            });
            console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);
            const personalLessonLane = 1;
            const usedLanes = new Set([personalLessonLane]);
            console.log(`🔍 개인레슨 레인: ${personalLessonLane}`);
            const coursesWithLane1 = conflictingCourses.filter((course) => {
                const currentLanes = course.laneInfo?.assignedLanes || [];
                return currentLanes.includes(1);
            });
            console.log(`🔍 1레인과 충돌하는 강습과정: ${coursesWithLane1.length}개`);
            let currentAvailableLanes = [2, 3, 4, 5, 6];
            let nextLaneIndex = 0;
            for (const course of conflictingCourses) {
                const maxLanes = course.laneInfo?.maxLanes || course.laneInfo?.assignedLanes?.length || 1;
                const minLanes = course.laneInfo?.minLanes || 1;
                const currentLanes = course.laneInfo?.assignedLanes || [1];
                const originalLanes = course.laneInfo?.originalAssignedLanes?.length > 0
                    ? course.laneInfo.originalAssignedLanes
                    : currentLanes;
                console.log(`🔧 강습과정 ${course.name} 레인 조정 시작:`, {
                    maxLanes,
                    minLanes,
                    currentLanes,
                    originalLanes,
                    currentAvailableLanes: currentAvailableLanes.slice(nextLaneIndex)
                });
                const hasLane1 = currentLanes.includes(1);
                let adjustedLanes;
                if (hasLane1) {
                    adjustedLanes = currentAvailableLanes.slice(nextLaneIndex, nextLaneIndex + minLanes);
                    nextLaneIndex += minLanes;
                    console.log(`📊 레인 순차 할당:`, {
                        courseName: course.name,
                        fromLanes: currentLanes.join(','),
                        toLanes: adjustedLanes.join(','),
                        nextIndex: nextLaneIndex
                    });
                }
                else {
                    adjustedLanes = currentLanes;
                }
                console.log(`📊 레인 조정 계산 결과:`, {
                    courseName: course.name,
                    hasLane1,
                    maxLanes,
                    minLanes,
                    currentLanes: currentLanes.join(','),
                    originalLanes: originalLanes.join(','),
                    adjustedLanes: adjustedLanes.join(',')
                });
                if (adjustedLanes.length < minLanes) {
                    console.log(`⚠️ 경고: ${course.name}의 최소 레인 수(${minLanes})를 만족하지 못함 (사용 가능: ${adjustedLanes.length})`);
                }
                const schedule = course.schedule || [];
                const updatedSchedule = schedule.map((scheduleItem) => {
                    console.log(`🔍 스케줄 항목 검토:`, {
                        courseName: course.name,
                        day: scheduleItem.day,
                        dayType: typeof scheduleItem.day,
                        startTime: scheduleItem.startTime,
                        endTime: scheduleItem.endTime,
                        lanes: scheduleItem.lanes
                    });
                    if (!scheduleItem.day || scheduleItem.day.trim() === '') {
                        console.log(`⚠️ 유효하지 않은 스케줄 항목 발견 (유지):`, {
                            courseName: course.name,
                            day: scheduleItem.day,
                            startTime: scheduleItem.startTime
                        });
                        return scheduleItem;
                    }
                    const courseDay = scheduleItem.day || '';
                    const courseDays = Array.isArray(courseDay)
                        ? courseDay
                        : courseDay.split(',').map((d) => d.trim()).filter((d) => d);
                    const normalizedCourseDays = courseDays.map((d) => normalizeDayForCompare(d));
                    const normalizedDayName = normalizeDayForCompare(actualDayName);
                    console.log(`🔍 요일 비교:`, {
                        courseDays,
                        normalizedCourseDays,
                        actualDayName,
                        normalizedDayName,
                        isIncluded: normalizedCourseDays.includes(normalizedDayName)
                    });
                    const isConflicting = normalizedCourseDays.includes(normalizedDayName) &&
                        scheduleItem.startTime <= time &&
                        scheduleItem.endTime >= time;
                    console.log(`🔍 충돌 확인:`, {
                        isConflicting,
                        timeCheck: `${scheduleItem.startTime} <= ${time} <= ${scheduleItem.endTime}`
                    });
                    if (isConflicting) {
                        const scheduleCurrentLanes = scheduleItem.lanes?.assignedLanes || currentLanes;
                        const scheduleOriginalLanes = scheduleItem.lanes?.originalAssignedLanes || scheduleCurrentLanes;
                        console.log(`🔧 레인 조정 적용:`, {
                            courseName: course.name,
                            day: scheduleItem.day,
                            time: `${scheduleItem.startTime}-${scheduleItem.endTime}`,
                            hasLane1,
                            scheduleCurrentLanes,
                            adjustedLanes,
                            updatedLanes: hasLane1 ? adjustedLanes : scheduleCurrentLanes
                        });
                        return {
                            ...scheduleItem,
                            lanes: {
                                assignedLanes: hasLane1 ? adjustedLanes : scheduleCurrentLanes,
                                originalAssignedLanes: scheduleItem.lanes?.originalAssignedLanes?.length > 0
                                    ? scheduleItem.lanes.originalAssignedLanes
                                    : scheduleCurrentLanes,
                                isAdjusted: hasLane1
                            }
                        };
                    }
                    return scheduleItem;
                });
                const scheduleForUpdate = updatedSchedule.map((s) => {
                    const adjustedLanes = s.lanes || {};
                    let day, startTime, endTime, _id;
                    if (s.toObject && typeof s.toObject === 'function') {
                        const temp = s.toObject();
                        day = temp.day;
                        startTime = temp.startTime;
                        endTime = temp.endTime;
                        _id = temp._id;
                    }
                    else if (s._doc) {
                        day = s._doc.day;
                        startTime = s._doc.startTime;
                        endTime = s._doc.endTime;
                        _id = s._doc._id;
                    }
                    else {
                        day = s.day;
                        startTime = s.startTime;
                        endTime = s.endTime;
                        _id = s._id;
                    }
                    const converted = {
                        day,
                        startTime,
                        endTime,
                        lanes: adjustedLanes,
                        _id
                    };
                    console.log(`🔄 변환된 스케줄 항목:`, {
                        day: converted.day,
                        startTime: converted.startTime,
                        endTime: converted.endTime,
                        lanes: converted.lanes
                    });
                    return converted;
                });
                const updateData = {
                    schedule: scheduleForUpdate,
                    'laneInfo.laneNotes': `개인레슨으로 인해 레인 조정됨 (${actualDayName} ${time})`
                };
                if (!course.laneInfo?.originalAssignedLanes || course.laneInfo.originalAssignedLanes.length === 0) {
                    updateData['laneInfo.originalAssignedLanes'] = currentLanes;
                    console.log(`💾 원래 레인 저장: [${currentLanes.join(',')}]`);
                }
                console.log(`🔍 updatedSchedule 상세 내용:`, updatedSchedule);
                console.log(`💾 업데이트할 데이터 (변환 전):`, {
                    courseId: course._id,
                    courseName: course.name,
                    scheduleLength: updatedSchedule.length,
                    updatedSchedule: updatedSchedule.map((s) => ({
                        day: s.day,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        time: `${s.startTime}-${s.endTime}`,
                        lanes: s.lanes?.assignedLanes
                    }))
                });
                console.log(`💾 업데이트할 데이터 (변환 후):`, {
                    courseId: course._id,
                    courseName: course.name,
                    scheduleLength: scheduleForUpdate.length,
                    scheduleForUpdate: scheduleForUpdate.map((s) => ({
                        day: s.day,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        time: `${s.startTime}-${s.endTime}`,
                        lanes: s.lanes?.assignedLanes
                    }))
                });
                console.log(`💾 실제 updateData:`, JSON.stringify(updateData, null, 2));
                await Course_1.Course.findByIdAndUpdate(course._id, updateData);
                const updatedCourse = await Course_1.Course.findById(course._id);
                console.log(`✅ 강습과정 ${course.name} 레인 조정 완료 (요일별 관리)`);
                console.log(`✅ DB 확인 - 원래 레인: [${updatedCourse?.laneInfo?.originalAssignedLanes?.join(',')}]`);
                console.log(`✅ DB 확인 - 조정된 레인:`, updatedCourse?.schedule?.find((s) => s.day === actualDayName)?.lanes);
            }
            return {
                success: true,
                adjustedCourses: conflictingCourses.length,
                personalLessonLane,
                adjustedCoursesList: conflictingCourses.map(c => ({ name: c.name, lanes: c.laneInfo?.assignedLanes }))
            };
        }
        catch (error) {
            console.error('❌ 레인 자동 조정 실패:', error);
            throw error;
        }
    }
    static async restoreLanesAfterPersonalLessonCancellation(personalLessonId) {
        try {
            const personalLesson = await PersonalLesson_1.PersonalLesson.findById(personalLessonId);
            if (!personalLesson)
                return;
            const { date, time, centerId } = personalLesson;
            const dateObj = new Date(date);
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dateObj.getDay()];
            console.log(`📅 개인레슨 취소 - 날짜: ${date}, 요일: ${dayName}, 시간: ${time}`);
            const allCourses = await Course_1.Course.find({
                centerId,
                isActive: true
            });
            const courses = allCourses.filter((course) => {
                return course.schedule.some((scheduleItem) => {
                    return scheduleItem.day === dayName &&
                        scheduleItem.startTime <= time &&
                        scheduleItem.endTime >= time;
                });
            });
            for (const course of courses) {
                const originalLanes = course.laneInfo?.originalAssignedLanes || [];
                const currentLanes = course.laneInfo?.assignedLanes || [];
                console.log(`🔧 강습과정 ${course.name} 레인 복원 시작:`, {
                    originalLanes: originalLanes.join(','),
                    currentLanes: currentLanes.join(','),
                    currentCount: currentLanes.length
                });
                const restoredLanes = originalLanes.length > 0 ? originalLanes : currentLanes;
                console.log(`📊 레인 복원 계산 결과:`, {
                    courseName: course.name,
                    currentLanes: currentLanes.join(','),
                    restoredLanes: restoredLanes.join(','),
                    hasOriginalLanes: originalLanes.length > 0
                });
                if (originalLanes.length > 0) {
                    await Course_1.Course.findByIdAndUpdate(course._id, {
                        'laneInfo.assignedLanes': restoredLanes,
                        'laneInfo.originalAssignedLanes': [],
                        'laneInfo.laneNotes': `개인레슨 취소로 원래 레인 복원됨 (${currentLanes.join(',')} → ${restoredLanes.join(',')})`
                    });
                    const updatedCourse = await Course_1.Course.findById(course._id);
                    console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${restoredLanes.join(',')}]`);
                    console.log(`✅ DB 확인 - 복원된 레인: [${updatedCourse?.laneInfo?.assignedLanes?.join(',')}]`);
                }
                else {
                    console.log(`⚠️ ${course.name}는 복원할 원래 레인이 없어 현재 레인 유지`);
                }
            }
            return { success: true, restoredCourses: courses.length };
        }
        catch (error) {
            console.error('❌ 레인 복원 실패:', error);
            throw error;
        }
    }
    static async checkLaneConflicts(date, time, centerId, duration) {
        try {
            const conflicts = [];
            const courseConflicts = await Course_1.Course.find({
                centerId,
                'schedule.date': date,
                'schedule.startTime': { $lte: time },
                'schedule.endTime': { $gte: time },
                status: 'active'
            });
            conflicts.push(...courseConflicts.map(course => ({
                type: 'course',
                name: course.name,
                lanes: course.laneInfo.assignedLanes,
                time: `${course.schedule.startTime} - ${course.schedule.endTime}`
            })));
            const rentalConflicts = await LaneRental_1.LaneRental.find({
                centerId,
                date: new Date(date),
                status: { $in: ['confirmed', 'pending'] },
                $or: [
                    { startTime: { $lte: time }, endTime: { $gte: time } },
                    { startTime: { $gte: time, $lt: new Date(new Date(time).getTime() + duration * 60000).toISOString() } }
                ]
            });
            conflicts.push(...rentalConflicts.map(rental => ({
                type: 'rental',
                name: `레인대여 (${rental.laneNumber}번 레인)`,
                lanes: [rental.laneNumber],
                time: `${rental.startTime} - ${rental.endTime}`
            })));
            return conflicts;
        }
        catch (error) {
            console.error('❌ 레인 충돌 검사 실패:', error);
            throw error;
        }
    }
    static async findAvailableLanes(date, time, centerId, duration) {
        try {
            const totalLanes = 6;
            const allLanes = Array.from({ length: totalLanes }, (_, i) => i + 1);
            const conflicts = await this.checkLaneConflicts(date, time, centerId, duration);
            const conflictingLanes = new Set();
            conflicts.forEach(conflict => {
                conflict.lanes.forEach((lane) => conflictingLanes.add(lane));
            });
            const availableLanes = allLanes.filter(lane => !conflictingLanes.has(lane));
            return {
                availableLanes,
                conflictingLanes: Array.from(conflictingLanes),
                conflicts
            };
        }
        catch (error) {
            console.error('❌ 사용 가능한 레인 찾기 실패:', error);
            throw error;
        }
    }
    static async organizeAllCourseLanes(centerId) {
        try {
            console.log('🔄 모든 강습 과정 레인 정리 시작...');
            const allCourses = await Course_1.Course.find({
                centerId,
                isActive: true
            });
            console.log(`📊 총 ${allCourses.length}개의 강습과정 검토`);
            let adjustedCount = 0;
            let errorCount = 0;
            for (const course of allCourses) {
                try {
                    const maxLanes = course.laneInfo?.maxLanes || course.laneInfo?.assignedLanes?.length || 1;
                    const minLanes = course.laneInfo?.minLanes || 1;
                    const currentLanes = course.laneInfo?.assignedLanes || [];
                    console.log(`🔍 ${course.name} 검토:`, {
                        maxLanes,
                        minLanes,
                        currentLanes: currentLanes.join(',')
                    });
                    if (minLanes > maxLanes) {
                        console.error(`❌ ${course.name}: minLanes(${minLanes}) > maxLanes(${maxLanes}) - maxLanes로 수정`);
                        await Course_1.Course.findByIdAndUpdate(course._id, {
                            'laneInfo.maxLanes': minLanes
                        });
                    }
                    if (currentLanes.length > maxLanes) {
                        console.warn(`⚠️ ${course.name}: assignedLanes(${currentLanes.length}) > maxLanes(${maxLanes}) - 축소`);
                        const adjustedLanes = Array.from({ length: maxLanes }, (_, i) => i + 1);
                        await Course_1.Course.findByIdAndUpdate(course._id, {
                            'laneInfo.assignedLanes': adjustedLanes,
                            'laneInfo.laneNotes': `레인 수 검증으로 조정됨 (${currentLanes.length} → ${maxLanes})`
                        });
                        adjustedCount++;
                    }
                    if (currentLanes.length < minLanes) {
                        console.warn(`⚠️ ${course.name}: assignedLanes(${currentLanes.length}) < minLanes(${minLanes}) - 확장`);
                        const adjustedLanes = Array.from({ length: minLanes }, (_, i) => i + 1);
                        await Course_1.Course.findByIdAndUpdate(course._id, {
                            'laneInfo.assignedLanes': adjustedLanes,
                            'laneInfo.laneNotes': `최소 레인 수 확보로 조정됨 (${currentLanes.length} → ${minLanes})`
                        });
                        adjustedCount++;
                    }
                }
                catch (error) {
                    console.error(`❌ ${course.name} 레인 정리 실패:`, error);
                    errorCount++;
                }
            }
            console.log(`✅ 레인 정리 완료: ${adjustedCount}개 조정, ${errorCount}개 오류`);
            return {
                success: true,
                adjustedCount,
                errorCount,
                totalCourses: allCourses.length
            };
        }
        catch (error) {
            console.error('❌ 모든 강습 과정 레인 정리 실패:', error);
            throw error;
        }
    }
    static async restoreLanesIfNoPersonalLesson(centerId) {
        try {
            console.log('🔄 개인레슨 없음 확인 및 레인 복원 시작...');
            const personalLessons = await Course_1.Course.find({
                centerId,
                isActive: true,
                isPersonalLesson: true
            });
            console.log(`📊 개인레슨 수: ${personalLessons.length}개`);
            if (personalLessons.length === 0) {
                console.log('✅ 개인레슨이 없으므로 레인 복원 수행...');
                const allCourses = await Course_1.Course.find({
                    centerId,
                    isActive: true
                });
                const restoredSchedules = [];
                for (const course of allCourses) {
                    if (course.schedule && course.schedule.length > 0) {
                        const updatedSchedule = course.schedule.map((scheduleItem) => {
                            if (scheduleItem.lanes?.originalAssignedLanes &&
                                scheduleItem.lanes.originalAssignedLanes.length > 0) {
                                const originalLanes = scheduleItem.lanes.originalAssignedLanes;
                                const currentLanes = scheduleItem.lanes.assignedLanes;
                                if (JSON.stringify(currentLanes) !== JSON.stringify(originalLanes)) {
                                    console.log(`🔧 ${course.name} ${scheduleItem.day} ${scheduleItem.startTime} 레인 복원:`, {
                                        current: currentLanes,
                                        original: originalLanes
                                    });
                                    restoredSchedules.push({
                                        courseName: course.name,
                                        day: scheduleItem.day,
                                        time: scheduleItem.startTime,
                                        from: currentLanes,
                                        to: originalLanes
                                    });
                                    return {
                                        ...(typeof scheduleItem.toObject === 'function' ? scheduleItem.toObject() : scheduleItem),
                                        lanes: {
                                            assignedLanes: originalLanes,
                                            originalAssignedLanes: originalLanes,
                                            isAdjusted: false
                                        }
                                    };
                                }
                            }
                            return scheduleItem;
                        });
                        await Course_1.Course.findByIdAndUpdate(course._id, {
                            schedule: updatedSchedule
                        });
                    }
                }
                console.log(`✅ 레인 복원 완료: ${restoredSchedules.length}개 스케줄 복원`);
                return restoredSchedules;
            }
            else {
                console.log('⏭️ 개인레슨이 존재하므로 레인 복원 건너뜀');
                return [];
            }
        }
        catch (error) {
            console.error('❌ 레인 복원 실패:', error);
            return [];
        }
    }
}
exports.LaneAllocationService = LaneAllocationService;
//# sourceMappingURL=laneAllocationService.js.map