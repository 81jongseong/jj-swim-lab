/**
 * 🏊‍♂️ 레인 자동 배정 서비스
 * 
 * 개인레슨 신청 시 강습과정의 레인을 자동으로 조정하는 서비스입니다.
 * 개인레슨이 들어오면 기존 강습과정의 레인을 최소 사용 레인수로 조정합니다.
 */

import { Course } from '../models/Course';
import { PersonalLesson } from '../models/PersonalLesson';
import { LaneRental } from '../models/LaneRental';

export class LaneAllocationService {
  /**
   * 개인레슨 신청 시 레인 자동 조정
   */
  static async adjustLanesForPersonalLesson(personalLessonData: any) {
    try {
      const { date, time, centerId } = personalLessonData;
      
      // 해당 시간대에 진행되는 강습과정들 찾기
      const conflictingCourses = await Course.find({
        centerId,
        'schedule.date': date,
        'schedule.startTime': { $lte: time },
        'schedule.endTime': { $gte: time },
        status: 'active',
        'personalLessonAdjustment.isEnabled': true
      });

      console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);

      // 각 강습과정의 레인을 최소 사용 레인수로 조정
      for (const course of conflictingCourses) {
        if (course.personalLessonAdjustment?.isEnabled) {
          const originalLanes = [...course.laneInfo.assignedLanes];
          const minLanes = course.laneInfo.minLanes || 1;
          
          // 레인을 최소 사용 레인수로 조정
          const adjustedLanes = originalLanes.slice(0, minLanes);
          
          await Course.findByIdAndUpdate(course._id, {
            'laneInfo.assignedLanes': adjustedLanes,
            'laneInfo.laneNotes': `개인레슨으로 인해 레인 조정됨 (${originalLanes.length} → ${adjustedLanes.length})`
          });

          console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: ${originalLanes.length} → ${adjustedLanes.length}`);
        }
      }

      return { success: true, adjustedCourses: conflictingCourses.length };
    } catch (error) {
      console.error('❌ 레인 자동 조정 실패:', error);
      throw error;
    }
  }

  /**
   * 개인레슨 취소 시 레인 복원
   */
  static async restoreLanesAfterPersonalLessonCancellation(personalLessonId: string) {
    try {
      const personalLesson = await PersonalLesson.findById(personalLessonId);
      if (!personalLesson) return;

      const { date, time, centerId } = personalLesson;

      // 해당 시간대에 진행되는 강습과정들 찾기
      const courses = await Course.find({
        centerId,
        'schedule.date': date,
        'schedule.startTime': { $lte: time },
        'schedule.endTime': { $gte: time },
        status: 'active'
      });

      // 각 강습과정의 레인을 원래대로 복원
      for (const course of courses) {
        const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
        const restoredLanes = Array.from({ length: maxLanes }, (_, i) => i + 1);
        
        await Course.findByIdAndUpdate(course._id, {
          'laneInfo.assignedLanes': restoredLanes,
          'laneInfo.laneNotes': '개인레슨 취소로 레인 복원됨'
        });

        console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: ${restoredLanes.length}개`);
      }

      return { success: true, restoredCourses: courses.length };
    } catch (error) {
      console.error('❌ 레인 복원 실패:', error);
      throw error;
    }
  }

  /**
   * 레인 충돌 검사
   */
  static async checkLaneConflicts(date: string, time: string, centerId: string, duration: number) {
    try {
      const conflicts = [];

      // 강습과정과의 충돌 검사
      const courseConflicts = await Course.find({
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

      // 레인대여와의 충돌 검사
      const rentalConflicts = await LaneRental.find({
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
    } catch (error) {
      console.error('❌ 레인 충돌 검사 실패:', error);
      throw error;
    }
  }

  /**
   * 사용 가능한 레인 찾기
   */
  static async findAvailableLanes(date: string, time: string, centerId: string, duration: number) {
    try {
      // 센터의 전체 레인 수 (일반적으로 6개)
      const totalLanes = 6;
      const allLanes = Array.from({ length: totalLanes }, (_, i) => i + 1);
      
      // 충돌하는 레인들 찾기
      const conflicts = await this.checkLaneConflicts(date, time, centerId, duration);
      const conflictingLanes = new Set();
      
      conflicts.forEach(conflict => {
        conflict.lanes.forEach((lane: number) => conflictingLanes.add(lane));
      });

      // 사용 가능한 레인들
      const availableLanes = allLanes.filter(lane => !conflictingLanes.has(lane));
      
      return {
        availableLanes,
        conflictingLanes: Array.from(conflictingLanes),
        conflicts
      };
    } catch (error) {
      console.error('❌ 사용 가능한 레인 찾기 실패:', error);
      throw error;
    }
  }
}


