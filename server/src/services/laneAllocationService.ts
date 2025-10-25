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
      const { date, time, centerId, rentalCount = 1 } = personalLessonData;
      
      // 날짜에서 요일 추출
      const dateObj = new Date(date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dateObj.getDay()];
      
      console.log(`📅 개인레슨 날짜: ${date}, 요일: ${dayName}, 시간: ${time}`);
      
      // 모든 활성 강습과정 가져오기
      const allCourses = await Course.find({
        centerId,
        isActive: true
      });
      
      // 해당 요일과 시간에 충돌하는 강습과정 찾기
      const conflictingCourses = allCourses.filter((course: any) => {
        return course.schedule.some((scheduleItem: any) => {
          return scheduleItem.day === dayName && 
                 scheduleItem.startTime <= time && 
                 scheduleItem.endTime >= time;
        });
      });

      console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);

      // 개인레슨을 위한 레인 추천 (충돌 없는 레인)
      const usedLanes = new Set<number>();
      conflictingCourses.forEach((course: any) => {
        (course.laneInfo?.assignedLanes || []).forEach((lane: number) => usedLanes.add(lane));
      });
      
      // 사용 가능한 레인 찾기 (총 6개 레인 중에서)
      const availableLanes = Array.from({ length: 6 }, (_, i) => i + 1).filter(lane => !usedLanes.has(lane));
      
      console.log(`🔍 사용 중인 레인:`, Array.from(usedLanes));
      console.log(`🔍 사용 가능한 레인:`, availableLanes);
    
      // 각 강습과정의 레인을 조정 - 충돌 방지
      for (const course of conflictingCourses) {
        const maxLanes = course.laneInfo?.maxLanes || course.laneInfo?.assignedLanes?.length || 1;
        const minLanes = course.laneInfo?.minLanes || 1;
        const currentLanes = course.laneInfo?.assignedLanes || [1];
        
        console.log(`🔧 강습과정 ${course.name} 레인 조정 시작:`, {
          maxLanes,
          minLanes,
          currentLanes,
          availableLanes
        });

        // 사용 가능한 레인 중에서 선택 (충돌 방지)
        const adjustedLanes = availableLanes.slice(0, maxLanes);
        
        console.log(`📊 레인 조정 계산 결과:`, {
          courseName: course.name,
          maxLanes,
          minLanes,
          currentLanes: currentLanes.join(','),
          adjustedLanes: adjustedLanes.join(','),
          availableLanes: availableLanes.join(',')
        });

        // 최소 레인 수 만족 확인
        if (adjustedLanes.length < minLanes) {
          console.log(`⚠️ 경고: ${course.name}의 최소 레인 수(${minLanes})를 만족하지 못함 (사용 가능: ${adjustedLanes.length})`);
        }
        
        const updateData = {
          'laneInfo.assignedLanes': adjustedLanes.length > 0 ? adjustedLanes : currentLanes,
          'laneInfo.laneNotes': `개인레슨 ${rentalCount}개로 인해 레인 조정됨 - 충돌 방지 (${currentLanes.join(',')} → ${adjustedLanes.join(',')})`
        };
        
        console.log(`💾 업데이트할 데이터:`, {
          courseId: course._id,
          courseName: course.name,
          updateData
        });
        
        await Course.findByIdAndUpdate(course._id, updateData);
        
        // 업데이트 확인
        const updatedCourse = await Course.findById(course._id);
        console.log(`✅ 강습과정 ${course.name} 레인 조정 완료: [${currentLanes.join(',')}] → [${adjustedLanes.join(',')}] (max:${maxLanes}, min:${minLanes})`);
        console.log(`✅ DB 확인 - 업데이트된 레인: [${updatedCourse?.laneInfo?.assignedLanes?.join(',')}]`);
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

      // 날짜에서 요일 추출
      const dateObj = new Date(date);
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dateObj.getDay()];
      
      console.log(`📅 개인레슨 취소 - 날짜: ${date}, 요일: ${dayName}, 시간: ${time}`);
      
      // 모든 활성 강습과정 가져오기
      const allCourses = await Course.find({
        centerId,
        isActive: true
      });
      
      // 해당 요일과 시간에 진행되는 강습과정 찾기
      const courses = allCourses.filter((course: any) => {
        return course.schedule.some((scheduleItem: any) => {
          return scheduleItem.day === dayName && 
                 scheduleItem.startTime <= time && 
                 scheduleItem.endTime >= time;
        });
      });

      // 각 강습과정의 레인을 원래대로 복원 (maxLanes까지)
      for (const course of courses) {
        const maxLanes = course.laneInfo.maxLanes || course.laneInfo.assignedLanes.length;
        const currentLanes = course.laneInfo.assignedLanes || [];
        
        // 현재 레인 수가 maxLanes보다 작으면 점진적으로 복원
        const restoredLanes = currentLanes.length < maxLanes
          ? Array.from({ length: maxLanes }, (_, i) => i + 1)
          : currentLanes;
        
        await Course.findByIdAndUpdate(course._id, {
          'laneInfo.assignedLanes': restoredLanes,
          'laneInfo.laneNotes': `개인레슨 취소로 레인 복원됨 (${currentLanes.length} → ${restoredLanes.length})`
        });

        console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${restoredLanes.join(',')}] (max:${maxLanes})`);
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


