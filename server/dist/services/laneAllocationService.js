"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaneAllocationService = void 0;
const Course_1 = require("../models/Course");
const PersonalLesson_1 = require("../models/PersonalLesson");
const LaneRental_1 = require("../models/LaneRental");
class LaneAllocationService {
    static async adjustLanesForPersonalLesson(personalLessonData) {
        try {
            const { date, time, centerId } = personalLessonData;
            const conflictingCourses = await Course_1.Course.find({
                centerId,
                'schedule.date': date,
                'schedule.startTime': { $lte: time },
                'schedule.endTime': { $gte: time },
                status: 'active',
                'personalLessonAdjustment.isEnabled': true
            });
            console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);
            for (const course of conflictingCourses) {
                if (course.personalLessonAdjustment?.isEnabled) {
                    const originalLanes = [...course.laneInfo.assignedLanes];
                    const minLanes = course.laneInfo.minLanes || 1;
                    const adjustedLanes = originalLanes.slice(0, minLanes);
                    await Course_1.Course.findByIdAndUpdate(course._id, {
                        'laneInfo.assignedLanes': adjustedLanes,
                        'laneInfo.laneNotes': `개인레슨으로 인해 레인 조정됨 (${originalLanes.length} → ${adjustedLanes.length})`
                    });
                    console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: ${originalLanes.length} → ${adjustedLanes.length}`);
                }
            }
            return { success: true, adjustedCourses: conflictingCourses.length };
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
            const courses = await Course_1.Course.find({
                centerId,
                'schedule.date': date,
                'schedule.startTime': { $lte: time },
                'schedule.endTime': { $gte: time },
                status: 'active'
            });
            for (const course of courses) {
                const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
                const restoredLanes = Array.from({ length: maxLanes }, (_, i) => i + 1);
                await Course_1.Course.findByIdAndUpdate(course._id, {
                    'laneInfo.assignedLanes': restoredLanes,
                    'laneInfo.laneNotes': '개인레슨 취소로 레인 복원됨'
                });
                console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: ${restoredLanes.length}개`);
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