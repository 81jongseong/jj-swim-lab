/**
 * 📅 JJ Swim Lab - 센터 스케줄 설정 API
 * 
 * 📋 **API 목적**
 * - 센터 운영 시간 및 예약 설정 관리
 * - 개인레슨 및 레인대여 가능 시간 설정
 * - 강사별 가능 시간 및 인원 제한 설정
 * - 레인별 사용 가능 상태 관리
 * 
 * 🔄 **주요 기능**
 * - 센터 운영 시간 설정 (평일/주말/공휴일)
 * - 개인레슨 가능 시간 및 인원 제한 설정
 * - 레인대여 가능 시간 및 레인 상태 설정
 * - 강사별 가능 시간 및 인원 제한 설정
 * - 특별 일정 관리 (휴무일, 이벤트 등)
 * 
 * 🗄️ **데이터 연동**
 * - CenterSchedule 모델과 연동
 * - User 모델(강사)과 연동
 * - SwimmingCenter 모델과 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 센터 스케줄 설정 API 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

import express, { Request, Response } from 'express';
import { CenterSchedule } from '../models/CenterSchedule';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { requireCenterAdmin } from '../middleware/role';

const router = express.Router();

// 모든 라우트에 인증 및 센터 관리자 권한 적용
router.use(authMiddleware);
router.use(requireCenterAdmin);

// 센터 스케줄 조회
router.get('/', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;

    console.log('📅 센터 스케줄 조회:', { centerId });

    const schedule = await CenterSchedule.findOne({ centerId })
      .populate('instructorAvailability.instructorId', 'name email phone instructorInfo')
      .populate('updatedBy', 'name email');

    if (!schedule) {
      // 기본 스케줄 생성
      const defaultSchedule = new CenterSchedule({
        centerId,
        operatingHours: {
          weekdays: { isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
          weekends: { isOpen: true, openTime: '08:00', closeTime: '20:00', breaks: [] },
          holidays: { isOpen: false, openTime: '09:00', closeTime: '18:00', breaks: [] }
        },
        personalLessonSettings: {
          isAvailable: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          timeSlots: [
            { startTime: '09:00', endTime: '10:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '10:00', endTime: '11:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '11:00', endTime: '12:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '14:00', endTime: '15:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '15:00', endTime: '16:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '16:00', endTime: '17:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '17:00', endTime: '18:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '18:00', endTime: '19:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' },
            { startTime: '19:00', endTime: '20:00', maxLessons: 1, instructorCapacity: 1, poolType: 'mainPool' }
          ],
          advanceBookingDays: 7,
          cancellationHours: 24,
          lessonDuration: 60,
          bufferTime: 15
        },
        laneRentalSettings: {
          isAvailable: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          timeSlots: [
            { startTime: '06:00', endTime: '08:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '08:00', endTime: '10:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '10:00', endTime: '12:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '12:00', endTime: '14:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '14:00', endTime: '16:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '16:00', endTime: '18:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '18:00', endTime: '20:00', maxRentals: 1, poolType: 'mainPool' },
            { startTime: '20:00', endTime: '22:00', maxRentals: 1, poolType: 'mainPool' }
          ],
          advanceBookingDays: 14,
          cancellationHours: 48,
          minRentalDuration: 60,
          maxRentalDuration: 240,
          bufferTime: 30
        },
        instructorAvailability: [],
        laneAvailability: [
          { poolType: 'mainPool', laneNumber: 1, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
          { poolType: 'mainPool', laneNumber: 2, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
          { poolType: 'mainPool', laneNumber: 3, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
          { poolType: 'mainPool', laneNumber: 4, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
          { poolType: 'mainPool', laneNumber: 5, isAvailable: true, maintenanceSchedule: [], restrictions: [] },
          { poolType: 'mainPool', laneNumber: 6, isAvailable: true, maintenanceSchedule: [], restrictions: [] }
        ],
        specialSchedules: [],
        settings: {
          timeZone: 'Asia/Seoul',
          currency: 'KRW',
          language: 'ko',
          autoConfirm: false,
          requireApproval: true,
          maxConcurrentBookings: 10,
          notificationSettings: {
            emailNotifications: true,
            smsNotifications: false,
            reminderHours: 24
          }
        },
        updatedBy: req.user.id
      });

      await defaultSchedule.save();
      
      res.json({
        success: true,
        data: defaultSchedule
      });
    } else {
      res.json({
        success: true,
        data: schedule
      });
    }

  } catch (error) {
    console.error('센터 스케줄 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 센터 스케줄 업데이트
router.put('/', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const updateData = req.body;

    console.log('📅 센터 스케줄 업데이트:', {
      centerId,
      updateData: Object.keys(updateData)
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        ...updateData,
        lastUpdated: new Date(),
        updatedBy: req.user.id
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '센터 스케줄이 업데이트되었습니다.',
      data: schedule
    });

  } catch (error) {
    console.error('센터 스케줄 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 운영 시간 설정
router.put('/operating-hours', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { weekdays, weekends, holidays } = req.body;

    console.log('🕐 운영 시간 설정:', {
      centerId,
      weekdays,
      weekends,
      holidays
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $set: {
          'operatingHours.weekdays': weekdays,
          'operatingHours.weekends': weekends,
          'operatingHours.holidays': holidays,
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '운영 시간이 설정되었습니다.',
      data: schedule.operatingHours
    });

  } catch (error) {
    console.error('운영 시간 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 개인레슨 설정
router.put('/personal-lesson', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const personalLessonSettings = req.body;

    console.log('🏊 개인레슨 설정:', {
      centerId,
      settings: Object.keys(personalLessonSettings)
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $set: {
          personalLessonSettings,
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '개인레슨 설정이 업데이트되었습니다.',
      data: schedule.personalLessonSettings
    });

  } catch (error) {
    console.error('개인레슨 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인대여 설정
router.put('/lane-rental', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const laneRentalSettings = req.body;

    console.log('🏊‍♀️ 레인대여 설정:', {
      centerId,
      settings: Object.keys(laneRentalSettings)
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $set: {
          laneRentalSettings,
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '레인대여 설정이 업데이트되었습니다.',
      data: schedule.laneRentalSettings
    });

  } catch (error) {
    console.error('레인대여 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 가능 시간 설정
router.put('/instructor/:instructorId/availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { instructorId } = req.params;
    const availabilityData = req.body;

    console.log('👨‍🏫 강사 가능 시간 설정:', {
      centerId,
      instructorId,
      availabilityData
    });

    // 강사 존재 확인
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 기존 강사 스케줄 찾기
    const instructorIndex = schedule.instructorAvailability.findIndex(
      ia => ia.instructorId.toString() === instructorId
    );

    const instructorAvailability = {
      instructorId,
      ...availabilityData,
      isActive: true
    };

    if (instructorIndex >= 0) {
      // 기존 강사 스케줄 업데이트
      schedule.instructorAvailability[instructorIndex] = instructorAvailability;
    } else {
      // 새 강사 스케줄 추가
      schedule.instructorAvailability.push(instructorAvailability);
    }

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '강사 가능 시간이 설정되었습니다.',
      data: instructorAvailability
    });

  } catch (error) {
    console.error('강사 가능 시간 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인별 사용 가능 상태 설정
router.put('/lane-availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const laneAvailability = req.body;

    console.log('🏊 레인 사용 가능 상태 설정:', {
      centerId,
      laneCount: laneAvailability.length
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $set: {
          laneAvailability,
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '레인 사용 가능 상태가 설정되었습니다.',
      data: schedule.laneAvailability
    });

  } catch (error) {
    console.error('레인 사용 가능 상태 설정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특별 일정 추가
router.post('/special-schedule', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const specialSchedule = req.body;

    console.log('📅 특별 일정 추가:', {
      centerId,
      specialSchedule
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $push: {
          specialSchedules: specialSchedule
        },
        $set: {
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: '특별 일정이 추가되었습니다.',
      data: schedule.specialSchedules
    });

  } catch (error) {
    console.error('특별 일정 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특별 일정 삭제
router.delete('/special-schedule/:scheduleId', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { scheduleId } = req.params;

    console.log('🗑️ 특별 일정 삭제:', {
      centerId,
      scheduleId
    });

    const schedule = await CenterSchedule.findOneAndUpdate(
      { centerId },
      {
        $pull: {
          specialSchedules: { _id: scheduleId }
        },
        $set: {
          lastUpdated: new Date(),
          updatedBy: req.user.id
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '특별 일정이 삭제되었습니다.',
      data: schedule.specialSchedules
    });

  } catch (error) {
    console.error('특별 일정 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 개인레슨 시간 슬롯 생성
router.post('/personal-lesson/time-slots', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { startTime, endTime, poolType, maxLessons, instructorCapacity, price, notes } = req.body;

    console.log('⏰ 개인레슨 시간 슬롯 생성:', {
      centerId,
      startTime,
      endTime,
      poolType,
      maxLessons,
      instructorCapacity
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 중복 시간 슬롯 확인
    const existingSlot = schedule.personalLessonSettings.timeSlots.find(slot => 
      slot.startTime === startTime && slot.endTime === endTime && slot.poolType === poolType
    );

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 시간 슬롯입니다.'
      });
    }

    // 새 시간 슬롯 추가
    schedule.personalLessonSettings.timeSlots.push({
      startTime,
      endTime,
      isActive: true,
      maxLessons: maxLessons || 1,
      instructorCapacity: instructorCapacity || 1,
      poolType: poolType || 'mainPool',
      price: price || 0,
      notes: notes || ''
    });

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '개인레슨 시간 슬롯이 생성되었습니다.',
      data: schedule.personalLessonSettings.timeSlots
    });

  } catch (error) {
    console.error('개인레슨 시간 슬롯 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 개인레슨 시간 슬롯 업데이트
router.put('/personal-lesson/time-slots/:slotIndex', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { slotIndex } = req.params;
    const updateData = req.body;

    console.log('⏰ 개인레슨 시간 슬롯 업데이트:', {
      centerId,
      slotIndex,
      updateData
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    const slotIdx = parseInt(slotIndex);
    if (slotIdx < 0 || slotIdx >= schedule.personalLessonSettings.timeSlots.length) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 시간 슬롯 인덱스입니다.'
      });
    }

    // 시간 슬롯 업데이트
    Object.assign(schedule.personalLessonSettings.timeSlots[slotIdx], updateData);

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '개인레슨 시간 슬롯이 업데이트되었습니다.',
      data: schedule.personalLessonSettings.timeSlots[slotIdx]
    });

  } catch (error) {
    console.error('개인레슨 시간 슬롯 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 개인레슨 시간 슬롯 삭제
router.delete('/personal-lesson/time-slots/:slotIndex', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { slotIndex } = req.params;

    console.log('🗑️ 개인레슨 시간 슬롯 삭제:', {
      centerId,
      slotIndex
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    const slotIdx = parseInt(slotIndex);
    if (slotIdx < 0 || slotIdx >= schedule.personalLessonSettings.timeSlots.length) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 시간 슬롯 인덱스입니다.'
      });
    }

    // 시간 슬롯 삭제
    schedule.personalLessonSettings.timeSlots.splice(slotIdx, 1);

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '개인레슨 시간 슬롯이 삭제되었습니다.',
      data: schedule.personalLessonSettings.timeSlots
    });

  } catch (error) {
    console.error('개인레슨 시간 슬롯 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인대여 시간 슬롯 생성
router.post('/lane-rental/time-slots', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { startTime, endTime, poolType, maxRentals, hourlyRate, notes } = req.body;

    console.log('🏊 레인대여 시간 슬롯 생성:', {
      centerId,
      startTime,
      endTime,
      poolType,
      maxRentals,
      hourlyRate
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 중복 시간 슬롯 확인
    const existingSlot = schedule.laneRentalSettings.timeSlots.find(slot => 
      slot.startTime === startTime && slot.endTime === endTime && slot.poolType === poolType
    );

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 시간 슬롯입니다.'
      });
    }

    // 새 시간 슬롯 추가
    schedule.laneRentalSettings.timeSlots.push({
      startTime,
      endTime,
      isActive: true,
      maxRentals: maxRentals || 1,
      poolType: poolType || 'mainPool',
      hourlyRate: hourlyRate || 0,
      notes: notes || ''
    });

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '레인대여 시간 슬롯이 생성되었습니다.',
      data: schedule.laneRentalSettings.timeSlots
    });

  } catch (error) {
    console.error('레인대여 시간 슬롯 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인대여 시간 슬롯 업데이트
router.put('/lane-rental/time-slots/:slotIndex', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { slotIndex } = req.params;
    const updateData = req.body;

    console.log('🏊 레인대여 시간 슬롯 업데이트:', {
      centerId,
      slotIndex,
      updateData
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    const slotIdx = parseInt(slotIndex);
    if (slotIdx < 0 || slotIdx >= schedule.laneRentalSettings.timeSlots.length) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 시간 슬롯 인덱스입니다.'
      });
    }

    // 시간 슬롯 업데이트
    Object.assign(schedule.laneRentalSettings.timeSlots[slotIdx], updateData);

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '레인대여 시간 슬롯이 업데이트되었습니다.',
      data: schedule.laneRentalSettings.timeSlots[slotIdx]
    });

  } catch (error) {
    console.error('레인대여 시간 슬롯 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 레인대여 시간 슬롯 삭제
router.delete('/lane-rental/time-slots/:slotIndex', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { slotIndex } = req.params;

    console.log('🗑️ 레인대여 시간 슬롯 삭제:', {
      centerId,
      slotIndex
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    const slotIdx = parseInt(slotIndex);
    if (slotIdx < 0 || slotIdx >= schedule.laneRentalSettings.timeSlots.length) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 시간 슬롯 인덱스입니다.'
      });
    }

    // 시간 슬롯 삭제
    schedule.laneRentalSettings.timeSlots.splice(slotIdx, 1);

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '레인대여 시간 슬롯이 삭제되었습니다.',
      data: schedule.laneRentalSettings.timeSlots
    });

  } catch (error) {
    console.error('레인대여 시간 슬롯 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 가능 시간 조회
router.get('/instructor-availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const schedule = await CenterSchedule.findOne({ centerId });
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: schedule.instructorAvailability || []
    });
  } catch (error) {
    console.error('강사별 가능 시간 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 가능 시간 추가/업데이트
router.post('/instructor-availability', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { instructorId, instructorName, instructorType, timeSlots, availableDays } = req.body;

    console.log('👨‍🏫 강사별 가능 시간 설정:', {
      centerId,
      instructorId,
      instructorName,
      instructorType,
      timeSlotsCount: timeSlots?.length || 0
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 기존 강사 정보 찾기
    const existingInstructorIndex = schedule.instructorAvailability.findIndex(
      (instructor: any) => instructor.instructorId.toString() === instructorId
    );

    const instructorData = {
      instructorId,
      instructorName,
      instructorType: instructorType || 'instructor',
      availableDays: availableDays || [],
      timeSlots: timeSlots || [],
      isActive: true,
      lastUpdated: new Date()
    };

    if (existingInstructorIndex >= 0) {
      // 기존 강사 정보 업데이트
      schedule.instructorAvailability[existingInstructorIndex] = instructorData;
    } else {
      // 새 강사 추가
      schedule.instructorAvailability.push(instructorData);
    }

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '강사별 가능 시간이 설정되었습니다.',
      data: instructorData
    });

  } catch (error) {
    console.error('강사별 가능 시간 설정 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 강사별 가능 시간 삭제
router.delete('/instructor-availability/:instructorId', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { instructorId } = req.params;

    console.log('🗑️ 강사별 가능 시간 삭제:', {
      centerId,
      instructorId
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 강사 정보 삭제
    schedule.instructorAvailability = schedule.instructorAvailability.filter(
      (instructor: any) => instructor.instructorId.toString() !== instructorId
    );

    schedule.lastUpdated = new Date();
    schedule.updatedBy = req.user.id;

    await schedule.save();

    res.json({
      success: true,
      message: '강사별 가능 시간이 삭제되었습니다.',
      data: schedule.instructorAvailability
    });

  } catch (error) {
    console.error('강사별 가능 시간 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 시간대 가능한 강사 조회
router.get('/available-instructors', async (req: any, res: Response) => {
  try {
    const centerId = req.user.centerId;
    const { date, startTime, endTime, poolType, lessonType, skillLevel } = req.query;

    console.log('🔍 가능한 강사 조회:', {
      centerId,
      date,
      startTime,
      endTime,
      poolType,
      lessonType,
      skillLevel
    });

    const schedule = await CenterSchedule.findOne({ centerId });
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '센터 스케줄을 찾을 수 없습니다.'
      });
    }

    // 요청된 시간대에 가능한 강사들 필터링
    const availableInstructors = schedule.instructorAvailability.filter((instructor: any) => {
      if (!instructor.isActive) return false;

      return instructor.timeSlots.some((slot: any) => {
        if (!slot.isActive) return false;
        if (slot.startTime !== startTime || slot.endTime !== endTime) return false;
        if (poolType && slot.poolType !== poolType) return false;
        if (lessonType && !slot.lessonTypes.includes(lessonType)) return false;
        if (skillLevel && !slot.skillLevels.includes(skillLevel)) return false;
        if (slot.currentBookings >= slot.maxStudents) return false; // 정원 초과 체크

        return true;
      });
    });

    res.json({
      success: true,
      data: availableInstructors.map((instructor: any) => ({
        instructorId: instructor.instructorId,
        instructorName: instructor.instructorName,
        instructorType: instructor.instructorType,
        availableSlots: instructor.timeSlots.filter((slot: any) => 
          slot.startTime === startTime && slot.endTime === endTime && slot.isActive
        )
      }))
    });

  } catch (error) {
    console.error('가능한 강사 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;
