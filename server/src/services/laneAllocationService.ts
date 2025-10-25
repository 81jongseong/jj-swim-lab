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
   * @param personalLessonData 개인레슨 데이터
   * @param rentalCount 신청된 개인레슨 수 (기본값: 1)
   */
  static async adjustLanesForPersonalLesson(personalLessonData: any, rentalCount: number = 1) {
    try {
      const { date, time, centerId } = personalLessonData;
      
      // 해당 시간대에 진행되는 강습과정들 찾기
      const conflictingCourses = await Course.find({
        centerId,
        'schedule.date': date,
        'schedule.startTime': { $lte: time },
        'schedule.endTime': { $gte: time },
        status: 'active'
      });

      console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);

      // 각 강습과정의 레인을 조정
      for (const course of conflictingCourses) {
        const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
        const minLanes = course.laneInfo.minLanes || 1;
        const originalLanes = course.laneInfo.assignedLanes || [];
        
        // 개인레슨 수만큼 레인 감소 (최소 레인 수는 유지)
        const adjustedLaneCount = Math.max(minLanes, maxLanes - rentalCount);
        const adjustedLanes = originalLanes.slice(0, adjustedLaneCount);
        
        await Course.findByIdAndUpdate(course._id, {
          'laneInfo.assignedLanes': adjustedLanes,
          'laneInfo.laneNotes': `개인레슨 ${rentalCount}개로 인해 레인 조정됨 (${maxLanes} → ${adjustedLaneCount})`
        });

        console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: ${maxLanes} → ${adjustedLaneCount} 레인`);
      }

      return { success: true, adjustedCourses: conflictingCourses.length };
    } catch (error) {
      console.error('❌ 레인 자동 조정 실패:', error);
      throw error;
    }
  }

  /**
   * 개인레슨 취소 시 레인 복원
   * @param personalLessonId 개인레슨 ID
   * @param restoreCount 복원할 레인 수 (기본값: 1)
   */
  static async restoreLanesAfterPersonalLessonCancellation(personalLessonId: string, restoreCount: number = 1) {
    try {
      const personalLesson = await PersonalLesson.findById(personalLessonId);
      if (!personalLesson) {
        console.log('❌ 개인레슨을 찾을 수 없습니다:', personalLessonId);
        return;
      }

      const { date, time, centerId } = personalLesson;

      // 해당 시간대에 진행되는 강습과정들 찾기
      const courses = await Course.find({
        centerId,
        'schedule.date': date,
        'schedule.startTime': { $lte: time },
        'schedule.endTime': { $gte: time },
        status: 'active'
      });

      console.log(`🔍 개인레슨 취소 영향 강습과정: ${courses.length}개`);

      // 각 강습과정의 레인을 원래대로 복원
      for (const course of courses) {
        const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
        const currentLanes = course.laneInfo.assignedLanes || [];
        
        // 현재 레인 수에서 복원 수만큼 증가 (최대 레인 수를 초과하지 않음)
        const restoredLaneCount = Math.min(maxLanes, currentLanes.length + restoreCount);
        const restoredLanes = Array.from({ length: restoredLaneCount }, (_, i) => i + 1);
        
        await Course.findByIdAndUpdate(course._id, {
          'laneInfo.assignedLanes': restoredLanes,
          'laneInfo.laneNotes': `개인레슨 취소로 레인 복원됨 (${currentLanes.length} → ${restoredLaneCount})`
        });

        console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: ${currentLanes.length} → ${restoredLaneCount} 레인`);
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


