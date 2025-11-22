/**
 * 📅 JJ Swim Lab - 예약 가능 시간 확인 API
 * 
 * 📋 **API 목적**
 * - 개인레슨 및 레인대여 가능 시간 조회
 * - 실시간 예약 가능 상태 확인
 * - 강사별 가능 시간 및 인원 확인
 * - 레인별 사용 가능 상태 확인
 * 
 * 🔄 **주요 기능**
 * - 날짜별 예약 가능 시간 조회
 * - 강사별 가능 시간 및 인원 확인
 * - 레인별 사용 가능 상태 확인
 * - 실시간 예약 충돌 방지
 * - 예약 가능 시간 필터링
 * 
 * 🗄️ **데이터 연동**
 * - CenterSchedule 모델과 연동
 * - PersonalLesson 및 LaneRental 모델과 연동
 * - User 모델(강사)과 연동
 * - SwimmingCenter 모델과 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 예약 가능 시간 API 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

import express, { Response } from 'express';
import { CenterSchedule } from '../models/CenterSchedule';
import { PersonalLesson } from '../models/PersonalLesson';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
import { LaneRental } from '../models/LaneRental';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 라우트에 인증 적용
router.use(authMiddleware);

// 시간 변환 헬퍼 함수
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 개인레슨 가능 시간 조회
router.get('/personal-lesson/availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { date, instructorId, poolType } = req.query;

    console.log('📅 개인레슨 가능 시간 조회:', {
      centerId,
      date,
      instructorId,
      poolType
    });

    // 센터 스케줄 조회
    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 개인레슨 설정 확인
    if (!schedule.personalLessonSettings.isAvailable) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '개인레슨 서비스가 비활성화되어 있습니다.',
          timeSlots: []
        }
      });
    }

    // 요청된 날짜 파싱
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 해당 요일이 개인레슨 가능 요일인지 확인
    if (!schedule.personalLessonSettings.availableDays.includes(dayOfWeek)) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '해당 요일에는 개인레슨이 불가능합니다.',
          timeSlots: []
        }
      });
    }

    // 특별 일정 확인 (휴무일, 이벤트 등)
    const specialSchedule = schedule.specialSchedules.find(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate.toDateString() === requestedDate.toDateString() &&
             (s.affectedServices.includes('personalLesson') || s.affectedServices.includes('all'));
    });

    if (specialSchedule && !specialSchedule.isOpen) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: specialSchedule.title || '해당 날짜에는 개인레슨이 불가능합니다.',
          timeSlots: []
        }
      });
    }

    // 기존 예약 조회
    const existingLessons = await PersonalLesson.find({
      centerId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'approved', 'completed'] }
    });

    // 강사별 가능 시간 필터링
    let availableTimeSlots = schedule.personalLessonSettings.timeSlots;
    
    if (instructorId) {
      const instructorSchedule = schedule.instructorAvailability.find(
        ia => ia.instructorId.toString() === instructorId && ia.isActive
      );
      
      if (instructorSchedule) {
        // 강사별 가능 시간과 센터 시간 교집합 계산
        availableTimeSlots = schedule.personalLessonSettings.timeSlots.filter(slot => {
          return instructorSchedule.timeSlots.some(instructorSlot => 
            instructorSlot.startTime === slot.startTime && 
            instructorSlot.endTime === slot.endTime &&
            (!poolType || instructorSlot.poolType === poolType)
          );
        });
      }
    }

    // 풀 타입 필터링
    if (poolType) {
      availableTimeSlots = availableTimeSlots.filter(slot => slot.poolType === poolType);
    }

    // 예약 가능한 시간 슬롯 계산
    const availableSlots = availableTimeSlots.map(slot => {
      // 해당 시간대의 기존 예약 수 계산
      const existingCount = existingLessons.filter(lesson => {
        // time을 startTime으로 간주하고, duration으로 endTime 계산
        const lessonStart = lesson.time;
        const lessonStartMinutes = timeToMinutes(lessonStart);
        const lessonEndMinutes = lessonStartMinutes + (lesson.duration || 60);
        const lessonEnd = minutesToTime(lessonEndMinutes);
        return lessonStart === slot.startTime && lessonEnd === slot.endTime;
      }).length;

      // 강사별 예약 수 계산 (특정 강사가 지정된 경우)
      let instructorBookings = 0;
      if (instructorId) {
        instructorBookings = existingLessons.filter(lesson => {
          const lessonStart = lesson.time;
          const lessonStartMinutes = timeToMinutes(lessonStart);
          const lessonEndMinutes = lessonStartMinutes + (lesson.duration || 60);
          const lessonEnd = minutesToTime(lessonEndMinutes);
          return lesson.instructorId?.toString() === instructorId &&
            lessonStart === slot.startTime &&
            lessonEnd === slot.endTime;
        }).length;
      }

      const isAvailable = existingCount < slot.maxLessons;
      const instructorAvailable = instructorId ? instructorBookings < slot.instructorCapacity : true;

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        poolType: slot.poolType,
        maxLessons: slot.maxLessons,
        instructorCapacity: slot.instructorCapacity,
        availableLessons: slot.maxLessons - existingCount,
        instructorAvailableCapacity: instructorId ? slot.instructorCapacity - instructorBookings : slot.instructorCapacity,
        isAvailable: isAvailable && instructorAvailable,
        existingBookings: existingCount,
        instructorBookings: instructorBookings
      };
    });

    res.json({
      success: true,
      data: {
        available: true,
        date: requestedDate.toISOString().split('T')[0],
        dayOfWeek,
        timeSlots: availableSlots,
        settings: {
          advanceBookingDays: schedule.personalLessonSettings.advanceBookingDays,
          cancellationHours: schedule.personalLessonSettings.cancellationHours,
          lessonDuration: schedule.personalLessonSettings.lessonDuration,
          bufferTime: schedule.personalLessonSettings.bufferTime
        }
      }
    });

  } catch (error) {
    logError('개인레슨 가능 시간 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인대여 가능 시간 조회
router.get('/lane-rental/availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { date, poolType, duration } = req.query;

    console.log('🏊 레인대여 가능 시간 조회:', {
      centerId,
      date,
      poolType,
      duration
    });

    // 센터 스케줄 조회
    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 레인대여 설정 확인
    if (!schedule.laneRentalSettings.isAvailable) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '레인대여 서비스가 비활성화되어 있습니다.',
          lanes: []
        }
      });
    }

    // 요청된 날짜 파싱
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 해당 요일이 레인대여 가능 요일인지 확인
    if (!schedule.laneRentalSettings.availableDays.includes(dayOfWeek)) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '해당 요일에는 레인대여가 불가능합니다.',
          lanes: []
        }
      });
    }

    // 특별 일정 확인
    const specialSchedule = schedule.specialSchedules.find(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate.toDateString() === requestedDate.toDateString() &&
             (s.affectedServices.includes('laneRental') || s.affectedServices.includes('all'));
    });

    if (specialSchedule && !specialSchedule.isOpen) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: specialSchedule.title || '해당 날짜에는 레인대여가 불가능합니다.',
          lanes: []
        }
      });
    }

    // 기존 레인대여 조회
    const existingRentals = await LaneRental.find({
      centerId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'approved', 'completed'] }
    });

    // 풀 타입별 레인 상태 계산
    const poolTypes = poolType ? [poolType] : ['mainPool', 'kidsPool', 'auxiliaryPool'];
    const laneAvailability = [];

    for (const pType of poolTypes) {
      const poolLanes = schedule.laneAvailability.filter(la => la.poolType === pType);
      
      for (const lane of poolLanes) {
        // 해당 레인의 기존 대여 확인
        const laneRentals = existingRentals.filter(rental => 
          rental.poolType === pType && 
          rental.laneNumber === lane.laneNumber
        );

        // 시간대별 사용 가능 상태 계산
        const timeSlots = schedule.laneRentalSettings.timeSlots
          .filter(slot => slot.poolType === pType)
          .map(slot => {
            const slotRentals = laneRentals.filter(rental => 
              rental.startTime === slot.startTime && 
              rental.endTime === slot.endTime
            );

            const isAvailable = slotRentals.length < slot.maxRentals;
            const availableRentals = slot.maxRentals - slotRentals.length;

            return {
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable,
              availableRentals,
              existingRentals: slotRentals.length,
              maxRentals: slot.maxRentals
            };
          });

        laneAvailability.push({
          poolType: pType,
          laneNumber: lane.laneNumber,
          isAvailable: lane.isAvailable,
          timeSlots,
          maintenanceSchedule: lane.maintenanceSchedule,
          restrictions: lane.restrictions
        });
      }
    }

    res.json({
      success: true,
      data: {
        available: true,
        date: requestedDate.toISOString().split('T')[0],
        dayOfWeek,
        lanes: laneAvailability,
        settings: {
          advanceBookingDays: schedule.laneRentalSettings.advanceBookingDays,
          cancellationHours: schedule.laneRentalSettings.cancellationHours,
          minRentalDuration: schedule.laneRentalSettings.minRentalDuration,
          maxRentalDuration: schedule.laneRentalSettings.maxRentalDuration,
          bufferTime: schedule.laneRentalSettings.bufferTime
        }
      }
    });

  } catch (error) {
    logError('레인대여 가능 시간 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 가능 시간 조회
router.get('/instructor/:instructorId/availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { instructorId } = req.params;
    const { date } = req.query;

    console.log('👨‍🏫 강사 가능 시간 조회:', {
      centerId,
      instructorId,
      date
    });

    // 센터 스케줄 조회
    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 강사 정보 조회
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    // 강사별 스케줄 조회
    const instructorSchedule = schedule.instructorAvailability.find(
      ia => ia.instructorId.toString() === instructorId && ia.isActive
    );

    if (!instructorSchedule) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '해당 강사의 스케줄이 설정되지 않았습니다.',
          timeSlots: []
        }
      });
    }

    // 요청된 날짜 파싱
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // 해당 요일이 강사 가능 요일인지 확인
    if (!instructorSchedule.availableDays.includes(dayOfWeek)) {
      return res.json({
        success: true,
        data: {
          available: false,
          message: '해당 요일에는 강사가 불가능합니다.',
          timeSlots: []
        }
      });
    }

    // 기존 예약 조회
    const existingLessons = await PersonalLesson.find({
      centerId,
      instructorId: instructorId,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'approved', 'completed'] }
    });

    // 강사별 가능 시간 슬롯 계산
    const availableSlots = instructorSchedule.timeSlots.map(slot => {
      const existingCount = existingLessons.filter(lesson => {
        const lessonStart = lesson.time;
        const lessonStartMinutes = timeToMinutes(lessonStart);
        const lessonEndMinutes = lessonStartMinutes + (lesson.duration || 60);
        const lessonEnd = minutesToTime(lessonEndMinutes);
        return lessonStart === slot.startTime && lessonEnd === slot.endTime;
      }).length;

      const isAvailable = existingCount < slot.maxStudents;
      const availableCapacity = slot.maxStudents - existingCount;

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        poolType: slot.poolType,
        maxStudents: slot.maxStudents,
        availableCapacity,
        isAvailable,
        existingBookings: existingCount,
        lessonTypes: slot.lessonTypes
      };
    });

    res.json({
      success: true,
      data: {
        available: true,
        instructor: {
          id: instructor._id,
          name: instructor.name,
          email: instructor.email
        },
        date: requestedDate.toISOString().split('T')[0],
        dayOfWeek,
        timeSlots: availableSlots
      }
    });

  } catch (error) {
    logError('강사 가능 시간 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;






