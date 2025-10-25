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
            const conflictingCourses = await Course_1.Course.find({
                centerId,
                'schedule.date': date,
                'schedule.startTime': { $lte: time },
                'schedule.endTime': { $gte: time },
                status: 'active'
            });
            console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);
            for (const course of conflictingCourses) {
                const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
                const minLanes = course.laneInfo.minLanes || 1;
                const originalLanes = course.laneInfo.assignedLanes || [];
                const adjustedLaneCount = Math.max(minLanes, maxLanes - rentalCount);
                const adjustedLanes = originalLanes.slice(0, adjustedLaneCount);
                await Course_1.Course.findByIdAndUpdate(course._id, {
                    'laneInfo.assignedLanes': adjustedLanes,
                    'laneInfo.laneNotes': `개인레슨 ${rentalCount}개로 인해 레인 조정됨 (${maxLanes} → ${adjustedLaneCount})`
                });
                console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: ${maxLanes} → ${adjustedLaneCount} 레인`);
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
            const courses = await Course_1.Course.find({
                centerId,
                'schedule.date': date,
                'schedule.startTime': { $lte: time },
                'schedule.endTime': { $gte: time },
                status: 'active'
            });
            console.log(`🔍 개인레슨 취소 영향 강습과정: ${courses.length}개`);
            for (const course of courses) {
                const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
                const currentLanes = course.laneInfo.assignedLanes || [];
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