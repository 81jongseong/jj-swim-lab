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
    
      // 개인레슨에 사용할 레인 우선 배정 (항상 1레인 우선 사용)
      const personalLessonLane = 1;
      usedLanes.add(personalLessonLane);
      
      // 사용 가능한 레인 재계산
      const remainingAvailableLanes = Array.from({ length: 6 }, (_, i) => i + 1).filter(lane => !usedLanes.has(lane));
      
      console.log(`🔍 개인레슨 ${personalLessonLane}레인 배정 후 사용 가능한 레인:`, remainingAvailableLanes);

      // 각 강습과정의 레인을 조정 - 개인레슨을 피해서 밀어냄
      for (const course of conflictingCourses) {
        const maxLanes = course.laneInfo?.maxLanes || course.laneInfo?.assignedLanes?.length || 1;
        const minLanes = course.laneInfo?.minLanes || 1;
        const currentLanes = course.laneInfo?.assignedLanes || [1];
        // 원래 레인 저장 (아직 저장되지 않은 경우에만)
        const originalLanes = course.laneInfo?.originalAssignedLanes?.length > 0 
          ? course.laneInfo.originalAssignedLanes 
          : currentLanes;
        
        console.log(`🔧 강습과정 ${course.name} 레인 조정 시작:`, {
          maxLanes,
          minLanes,
          currentLanes,
          originalLanes,
          availableLanes: remainingAvailableLanes
        });

        // 현재 레인이 1레인과 겹치는지 확인
        const hasLane1 = currentLanes.includes(1);
        
        let adjustedLanes: number[];
        if (hasLane1) {
          // 1레인이 포함되어 있으면 개인레슨을 피해 minLanes로 축소
          // 충돌하지 않는 레인 중에서 minLanes 수만큼만 선택
          adjustedLanes = remainingAvailableLanes.slice(0, minLanes);
        } else {
          // 1레인이 없으면 그대로 유지 (개인레슨과 겹치지 않음)
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

        // 최소 레인 수 만족 확인
        if (adjustedLanes.length < minLanes) {
          console.log(`⚠️ 경고: ${course.name}의 최소 레인 수(${minLanes})를 만족하지 못함 (사용 가능: ${adjustedLanes.length})`);
        }
        
        const updateData: any = {
          'laneInfo.assignedLanes': adjustedLanes.length > 0 ? adjustedLanes : currentLanes,
          'laneInfo.laneNotes': `개인레슨으로 인해 레인 조정됨 (${currentLanes.join(',')} → ${adjustedLanes.join(',')})`
        };
        
        // originalAssignedLanes가 없으면 현재 레인을 저장 (첫 조정 시)
        if (!course.laneInfo?.originalAssignedLanes || course.laneInfo.originalAssignedLanes.length === 0) {
          updateData['laneInfo.originalAssignedLanes'] = currentLanes;
          console.log(`💾 원래 레인 저장: [${currentLanes.join(',')}]`);
        }
        
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
        console.log(`✅ DB 확인 - 원래 레인: [${updatedCourse?.laneInfo?.originalAssignedLanes?.join(',')}]`);
      }
      
      return { 
        success: true, 
        adjustedCourses: conflictingCourses.length,
        personalLessonLane,
        adjustedCoursesList: conflictingCourses.map(c => ({ name: c.name, lanes: c.laneInfo?.assignedLanes }))
      };
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

      // 각 강습과정의 레인을 원래대로 복원 (originalAssignedLanes 사용)
      for (const course of courses) {
        const originalLanes = course.laneInfo?.originalAssignedLanes || [];
        const currentLanes = course.laneInfo?.assignedLanes || [];
        
        console.log(`🔧 강습과정 ${course.name} 레인 복원 시작:`, {
          originalLanes: originalLanes.join(','),
          currentLanes: currentLanes.join(','),
          currentCount: currentLanes.length
        });
        
        // originalAssignedLanes가 있으면 복원, 없으면 현재 레인 유지
        const restoredLanes = originalLanes.length > 0 ? originalLanes : currentLanes;
        
        console.log(`📊 레인 복원 계산 결과:`, {
          courseName: course.name,
          currentLanes: currentLanes.join(','),
          restoredLanes: restoredLanes.join(','),
          hasOriginalLanes: originalLanes.length > 0
        });
        
        // originalAssignedLanes를 사용한 경우에만 복원
        if (originalLanes.length > 0) {
          await Course.findByIdAndUpdate(course._id, {
            'laneInfo.assignedLanes': restoredLanes,
            'laneInfo.originalAssignedLanes': [], // 복원 후 초기화
            'laneInfo.laneNotes': `개인레슨 취소로 원래 레인 복원됨 (${currentLanes.join(',')} → ${restoredLanes.join(',')})`
          });

          // 업데이트 확인
          const updatedCourse = await Course.findById(course._id);
          console.log(`✅ 강습과정 ${course.name} 레인 복원 완료: [${currentLanes.join(',')}] → [${restoredLanes.join(',')}]`);
          console.log(`✅ DB 확인 - 복원된 레인: [${updatedCourse?.laneInfo?.assignedLanes?.join(',')}]`);
        } else {
          console.log(`⚠️ ${course.name}는 복원할 원래 레인이 없어 현재 레인 유지`);
        }
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

  /**
   * 모든 강습 과정의 레인 정리 및 검증
   * (강습 과정 목록 조회 시 호출)
   */
  static async organizeAllCourseLanes(centerId: string) {
    try {
      console.log('🔄 모든 강습 과정 레인 정리 시작...');
      
      // 센터의 모든 활성 강습과정 가져오기
      const allCourses = await Course.find({
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

          // 검증: minLanes <= maxLanes
          if (minLanes > maxLanes) {
            console.error(`❌ ${course.name}: minLanes(${minLanes}) > maxLanes(${maxLanes}) - maxLanes로 수정`);
            await Course.findByIdAndUpdate(course._id, {
              'laneInfo.maxLanes': minLanes
            });
          }

          // 검증: assignedLanes.length <= maxLanes
          if (currentLanes.length > maxLanes) {
            console.warn(`⚠️ ${course.name}: assignedLanes(${currentLanes.length}) > maxLanes(${maxLanes}) - 축소`);
            const adjustedLanes = Array.from({ length: maxLanes }, (_, i) => i + 1);
            await Course.findByIdAndUpdate(course._id, {
              'laneInfo.assignedLanes': adjustedLanes,
              'laneInfo.laneNotes': `레인 수 검증으로 조정됨 (${currentLanes.length} → ${maxLanes})`
            });
            adjustedCount++;
          }

          // 검증: assignedLanes.length < minLanes
          if (currentLanes.length < minLanes) {
            console.warn(`⚠️ ${course.name}: assignedLanes(${currentLanes.length}) < minLanes(${minLanes}) - 확장`);
            const adjustedLanes = Array.from({ length: minLanes }, (_, i) => i + 1);
            await Course.findByIdAndUpdate(course._id, {
              'laneInfo.assignedLanes': adjustedLanes,
              'laneInfo.laneNotes': `최소 레인 수 확보로 조정됨 (${currentLanes.length} → ${minLanes})`
            });
            adjustedCount++;
          }

        } catch (error) {
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
    } catch (error) {
      console.error('❌ 모든 강습 과정 레인 정리 실패:', error);
      throw error;
    }
  }
}


