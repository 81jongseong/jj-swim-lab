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
      const { date, time, centerId, rentalCount = 1, dayName } = personalLessonData;
      
      // 요일 정규화 함수
      const normalizeDayName = (day: string): string => {
        const dayMap: { [key: string]: string } = {
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
      
      // 요일 추출: dayName이 제공되면 사용, 아니면 date에서 추출
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
      
      // 모든 활성 강습과정 가져오기
      const allCourses = await Course.find({
        centerId,
        isActive: true
      });
      
      // 요일 정규화 함수 (스코프 문제 해결)
      const normalizeDayForCompare = (day: string): string => {
        const dayMap: { [key: string]: string } = {
          'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday', 'thursday': 'thursday',
          'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
          '월': 'monday', '화': 'tuesday', '수': 'wednesday', '목': 'thursday',
          '금': 'friday', '토': 'saturday', '일': 'sunday',
          '월요일': 'monday', '화요일': 'tuesday', '수요일': 'wednesday', '목요일': 'thursday',
          '금요일': 'friday', '토요일': 'saturday', '일요일': 'sunday'
        };
        return dayMap[day.toLowerCase()] || day.toLowerCase();
      };
      
      // 해당 요일과 시간에 충돌하는 강습과정 찾기 (개인레슨 제외)
      const conflictingCourses = allCourses.filter((course: any) => {
        // 개인레슨은 제외
        if (course.isPersonalLesson) {
          return false;
        }
        
        return course.schedule.some((scheduleItem: any) => {
          // day 필드가 배열이거나 쉼표로 구분된 경우 처리
          const courseDay = scheduleItem.day || '';
          const courseDays = Array.isArray(courseDay) 
            ? courseDay 
            : courseDay.split(',').map((d: string) => d.trim()).filter((d: string) => d);
          
          // 모든 요일을 정규화하여 비교
          const normalizedCourseDays = courseDays.map((d: string) => normalizeDayForCompare(d));
          const normalizedDayName = normalizeDayForCompare(actualDayName);
          
          return normalizedCourseDays.includes(normalizedDayName) && 
                 scheduleItem.startTime <= time && 
                 scheduleItem.endTime >= time;
        });
      });

      console.log(`🔍 개인레슨 시간 충돌 강습과정 발견: ${conflictingCourses.length}개`);

      // ⚠️ 개인레슨은 항상 1레인을 사용
      const personalLessonLane = 1;
      
      // 1레인을 사용 중인 것으로 간주하고 다른 레인을 순차적으로 조정
      const usedLanes = new Set<number>([personalLessonLane]);
      
      console.log(`🔍 개인레슨 레인: ${personalLessonLane}`);
      
      // 1레인과 겹치는 강습과정들을 찾아서 순차적으로 밀어냄
      const coursesWithLane1 = conflictingCourses.filter((course: any) => {
        const currentLanes = course.laneInfo?.assignedLanes || [];
        return currentLanes.includes(1);
      });
      
      console.log(`🔍 1레인과 충돌하는 강습과정: ${coursesWithLane1.length}개`);

      // 레인 조정: 1레인을 사용하는 강습과정들을 순차적으로 밀어냄
      let currentAvailableLanes = [2, 3, 4, 5, 6]; // 1레인 제외한 사용 가능한 레인
      let nextLaneIndex = 0; // 다음에 사용할 레인의 인덱스
      
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
          currentAvailableLanes: currentAvailableLanes.slice(nextLaneIndex)
        });

        // 현재 레인이 1레인과 겹치는지 확인
        const hasLane1 = currentLanes.includes(1);
        
        let adjustedLanes: number[];
        if (hasLane1) {
          // 1레인이 포함되어 있으면 순차적으로 밀어냄
          adjustedLanes = currentAvailableLanes.slice(nextLaneIndex, nextLaneIndex + minLanes);
          nextLaneIndex += minLanes; // 다음 강습과정을 위한 인덱스 업데이트
          
          console.log(`📊 레인 순차 할당:`, {
            courseName: course.name,
            fromLanes: currentLanes.join(','),
            toLanes: adjustedLanes.join(','),
            nextIndex: nextLaneIndex
          });
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
        
        // ⭐ 스케줄별로 레인 정보 업데이트 (요일/시간별 관리)
        const schedule = course.schedule || [];
        const updatedSchedule = schedule.map((scheduleItem: any) => {
          console.log(`🔍 스케줄 항목 검토:`, {
            courseName: course.name,
            day: scheduleItem.day,
            dayType: typeof scheduleItem.day,
            startTime: scheduleItem.startTime,
            endTime: scheduleItem.endTime,
            lanes: scheduleItem.lanes
          });
          
          // day가 없는 스케줄 항목은 그대로 유지 (필터링하지 않음)
          if (!scheduleItem.day || scheduleItem.day.trim() === '') {
            console.log(`⚠️ 유효하지 않은 스케줄 항목 발견 (유지):`, {
              courseName: course.name,
              day: scheduleItem.day,
              startTime: scheduleItem.startTime
            });
            return scheduleItem; // 유효하지 않은 스케줄도 그대로 반환
          }
          
          // 개인레슨과 충돌하는 스케줄 항목만 조정
          const courseDay = scheduleItem.day || '';
          const courseDays = Array.isArray(courseDay) 
            ? courseDay 
            : courseDay.split(',').map((d: string) => d.trim()).filter((d: string) => d);
          
          const normalizedCourseDays = courseDays.map((d: string) => normalizeDayForCompare(d));
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
            // 충돌하는 스케줄 항목의 레인 정보 업데이트
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
            
          // 충돌하지 않는 스케줄 항목은 원래 설정 유지
          return scheduleItem;
        });
        
        // Mongoose 서브도큐먼트를 일반 객체로 변환 (조정된 lanes 보존)
        const scheduleForUpdate = updatedSchedule.map((s: any) => {
          // 조정된 lanes 정보를 보존
          const adjustedLanes = s.lanes || {};
          
          // 기본 필드 추출
          let day, startTime, endTime, _id;
          
          if (s.toObject && typeof s.toObject === 'function') {
            const temp = s.toObject();
            day = temp.day;
            startTime = temp.startTime;
            endTime = temp.endTime;
            _id = temp._id;
          } else if (s._doc) {
            day = s._doc.day;
            startTime = s._doc.startTime;
            endTime = s._doc.endTime;
            _id = s._doc._id;
          } else {
            day = s.day;
            startTime = s.startTime;
            endTime = s.endTime;
            _id = s._id;
          }
          
          const converted = {
            day,
            startTime,
            endTime,
            lanes: adjustedLanes, // 조정된 lanes 사용
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
        
        const updateData: any = {
          schedule: scheduleForUpdate,
          'laneInfo.laneNotes': `개인레슨으로 인해 레인 조정됨 (${actualDayName} ${time})`
        };
        
        // originalAssignedLanes가 없으면 현재 레인을 저장 (첫 조정 시)
        if (!course.laneInfo?.originalAssignedLanes || course.laneInfo.originalAssignedLanes.length === 0) {
          updateData['laneInfo.originalAssignedLanes'] = currentLanes;
          console.log(`💾 원래 레인 저장: [${currentLanes.join(',')}]`);
        }
        
        // 디버깅: updatedSchedule의 실제 내용 확인
        console.log(`🔍 updatedSchedule 상세 내용:`, updatedSchedule);
        
        console.log(`💾 업데이트할 데이터 (변환 전):`, {
          courseId: course._id,
          courseName: course.name,
          scheduleLength: updatedSchedule.length,
          updatedSchedule: updatedSchedule.map((s: any) => ({
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
          scheduleForUpdate: scheduleForUpdate.map((s: any) => ({
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            time: `${s.startTime}-${s.endTime}`,
            lanes: s.lanes?.assignedLanes
          }))
        });
        
        console.log(`💾 실제 updateData:`, JSON.stringify(updateData, null, 2));
        
        await Course.findByIdAndUpdate(course._id, updateData);
        
        // 업데이트 확인
        const updatedCourse = await Course.findById(course._id);
        console.log(`✅ 강습과정 ${course.name} 레인 조정 완료 (요일별 관리)`);
        console.log(`✅ DB 확인 - 원래 레인: [${updatedCourse?.laneInfo?.originalAssignedLanes?.join(',')}]`);
        console.log(`✅ DB 확인 - 조정된 레인:`, updatedCourse?.schedule?.find((s: any) => s.day === actualDayName)?.lanes);
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

  /**
   * 개인레슨이 없으면 레인 자동 복원
   */
  static async restoreLanesIfNoPersonalLesson(centerId: string) {
    try {
      console.log('🔄 개인레슨 없음 확인 및 레인 복원 시작...');
      
      // 센터의 모든 활성 개인레슨 가져오기
      const personalLessons = await Course.find({
        centerId,
        isActive: true,
        isPersonalLesson: true
      });

      console.log(`📊 개인레슨 수: ${personalLessons.length}개`);

      // 개인레슨이 없으면 레인 복원
      if (personalLessons.length === 0) {
        console.log('✅ 개인레슨이 없으므로 레인 복원 수행...');
        
        // 모든 활성 강습과정 가져오기
        const allCourses = await Course.find({
          centerId,
          isActive: true
        });

        const restoredSchedules: any[] = [];

        for (const course of allCourses) {
          if (course.schedule && course.schedule.length > 0) {
            const updatedSchedule = course.schedule.map((scheduleItem: any) => {
              // originalAssignedLanes가 있으면 복원 (isAdjusted 여부와 상관없이)
              if (scheduleItem.lanes?.originalAssignedLanes && 
                  scheduleItem.lanes.originalAssignedLanes.length > 0) {
                
                const originalLanes = scheduleItem.lanes.originalAssignedLanes;
                const currentLanes = scheduleItem.lanes.assignedLanes;
                
                // 현재 레인과 원래 레인이 다르면 복원
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

            await Course.findByIdAndUpdate(course._id, {
              schedule: updatedSchedule
            });
          }
        }

        console.log(`✅ 레인 복원 완료: ${restoredSchedules.length}개 스케줄 복원`);
        return restoredSchedules;
      } else {
        console.log('⏭️ 개인레슨이 존재하므로 레인 복원 건너뜀');
        return [];
      }
    } catch (error) {
      console.error('❌ 레인 복원 실패:', error);
      return [];
    }
  }
}


