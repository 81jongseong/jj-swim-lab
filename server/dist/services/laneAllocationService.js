"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaneAllocationService = void 0;
const Course_1 = require("../models/Course");
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
class LaneAllocationService {
    static async adjustLanesForPersonalLesson(personalLessonData, rentalCount = 1) {
        try {
            const { date, time, centerId } = personalLessonData;
            console.log(`🔍 개인레슨 레인 조정 시작 - 입력 데이터:`, {
                date,
                time,
                centerId,
                dateType: typeof date,
                dateValue: date
            });
            const lessonDate = new Date(date);
            const dayOfWeek = lessonDate.getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            console.log(`📅 날짜 파싱 결과:`, {
                originalDate: date,
                parsedDate: lessonDate,
                dayOfWeek,
                dayName
            });
            console.log(`🔍 개인레슨 레인 조정 시작: ${dayName} ${time}, centerId: ${centerId}`);
            const allCourses = await Course_1.Course.find({
                centerId,
                isActive: true
            });
            console.log(`📚 센터의 전체 강습 과정: ${allCourses.length}개`);
            const conflictingCourses = allCourses.filter((course) => {
                if (!course.schedule || !course.schedule.length)
                    return false;
                return course.schedule.some((schedule) => {
                    const matchesDay = schedule.day === dayName;
                    const matchesTime = schedule.startTime <= time && schedule.endTime >= time;
                    if (matchesDay && matchesTime) {
                        console.log(`  ✓ ${course.name} - ${schedule.day} ${schedule.startTime}-${schedule.endTime}`);
                    }
                    return matchesDay && matchesTime;
                });
            });
            console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);
            const usedLanes = new Set();
            conflictingCourses.forEach((course) => {
                (course.laneInfo?.assignedLanes || []).forEach((lane) => usedLanes.add(lane));
            });
            const availableLanes = Array.from({ length: 6 }, (_, i) => i + 1).filter(lane => !usedLanes.has(lane));
            console.log(`🔍 사용 중인 레인:`, Array.from(usedLanes));
            console.log(`🔍 사용 가능한 레인:`, availableLanes);
            for (const course of conflictingCourses) {
                const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes?.length || 1;
                const minLanes = course.laneInfo.minLanes || 1;
                const currentLanes = course.laneInfo.assignedLanes || [1];
                const adjustedLanes = availableLanes.slice(0, maxLanes);
                if (adjustedLanes.length < minLanes) {
                    console.log(`⚠️ 경고: ${course.name}의 최소 레인 수(${minLanes})를 만족하지 못함 (사용 가능: ${adjustedLanes.length})`);
                }
                await Course_1.Course.findByIdAndUpdate(course._id, {
                    'laneInfo.assignedLanes': adjustedLanes.length > 0 ? adjustedLanes : currentLanes,
                    'laneInfo.laneNotes': `개인레슨 ${rentalCount}개로 인해 레인 조정됨 - 충돌 방지 (${currentLanes.join(',')} → ${adjustedLanes.join(',')})`
                });
                console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: [${currentLanes.join(',')}] → [${adjustedLanes.join(',')}] (max:${maxLanes}, min:${minLanes})`);
            }
            return { success: true, adjustedCourses: conflictingCourses.length };
        }
        catch (error) {
            console.error('❌ 레인 자동 조정 실패:', error);
            throw error;
        }
    }
    static async restoreLanesAfterPersonalLessonCancellation(personalLessonId, restoreCount = 1) {
        try {
            const personalLesson = await PersonalLesson_1.PersonalLesson.findById(personalLessonId);
            if (!personalLesson) {
                console.log('❌ 개인레슨을 찾을 수 없습니다:', personalLessonId);
                return;
            }
            const { date, time, centerId } = personalLesson;
            const lessonDate = new Date(date);
            const dayOfWeek = lessonDate.getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayName = dayNames[dayOfWeek];
            console.log(`🔍 개인레슨 취소 레인 복원 시작: ${dayName} ${time}`);
            const allCourses = await Course_1.Course.find({
                centerId,
                isActive: true
            });
            const courses = allCourses.filter((course) => {
                if (!course.schedule || !course.schedule.length)
                    return false;
                return course.schedule.some((schedule) => {
                    return schedule.day === dayName &&
                        schedule.startTime <= time &&
                        schedule.endTime >= time;
                });
            });
            console.log(`🔍 개인레슨 취소 영향 강습과정: ${courses.length}개`);
            for (const course of courses) {
                const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes?.length || 1;
                const currentLanes = course.laneInfo.assignedLanes || [1];
                const restoredLaneCount = Math.min(maxLanes, currentLanes.length + restoreCount);
                const restoredLanes = Array.from({ length: restoredLaneCount }, (_, i) => i + 1);
                await Course_1.Course.findByIdAndUpdate(course._id, {
                    'laneInfo.assignedLanes': restoredLanes,
                    'laneInfo.laneNotes': `개인레슨 취소로 레인 복원됨 (${currentLanes.length} → ${restoredLaneCount})`
                });
                console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: ${currentLanes.length} → ${restoredLaneCount} 레인`);
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
}
exports.LaneAllocationService = LaneAllocationService;
//# sourceMappingURL=laneAllocationService.js.map