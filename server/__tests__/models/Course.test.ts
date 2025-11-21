/**
 * 📚 Course 모델 테스트
 */

import mongoose from 'mongoose';
import { Course } from '../../src/models/Course';
import { clearDatabase } from '../setup';

describe('Course 모델 테스트', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Course 생성', () => {
    it('유효한 데이터로 강의를 생성할 수 있어야 함', async () => {
      const courseData = {
        name: '초급 수영 강의',
        description: '수영 초보자를 위한 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse._id).toBeDefined();
      expect(savedCourse.name).toBe(courseData.name);
      expect(savedCourse.description).toBe(courseData.description);
      expect(savedCourse.level).toBe(courseData.level);
      expect(savedCourse.duration).toBe(courseData.duration);
      expect(savedCourse.price).toBe(courseData.price);
      expect(savedCourse.maxStudents).toBe(courseData.maxStudents);
    });

    it('필수 필드가 누락된 경우 에러를 발생시켜야 함', async () => {
      const incompleteData = {
        name: '강의 제목'
        // description, level, duration 등 누락
      };

      const course = new Course(incompleteData);
      await expect(course.save()).rejects.toThrow();
    });
  });

  describe('Course 조회', () => {
    it('레벨별로 강의를 찾을 수 있어야 함', async () => {
      const courseData = {
        name: '초급 강의',
        description: '초급자용 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      await course.save();

      const beginnerCourses = await Course.find({ level: 'beginner' });
      expect(beginnerCourses.length).toBeGreaterThan(0);
      expect(beginnerCourses[0].level).toBe('beginner');
    });

    it('강사별로 강의를 찾을 수 있어야 함', async () => {
      const instructorId = '507f1f77bcf86cd799439011';
      const courseData = {
        name: '강사별 강의',
        description: '특정 강사의 강의',
        level: 'intermediate',
        duration: 90,
        price: 75000,
        maxStudents: 8,
        instructor: instructorId,
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 중급반 B',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 8
        }
      };

      const course = new Course(courseData);
      await course.save();

      const instructorCourses = await Course.find({ instructor: instructorId });
      expect(instructorCourses.length).toBeGreaterThan(0);
      expect(instructorCourses[0].instructor.toString()).toBe(instructorId);
    });

    it('가격 범위로 강의를 찾을 수 있어야 함', async () => {
      const courseData = {
        name: '고가 강의',
        description: '고가 강의',
        level: 'advanced',
        duration: 120,
        price: 100000,
        maxStudents: 5,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 고급반 C',
          classType: 'private',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 5
        }
      };

      const course = new Course(courseData);
      await course.save();

      const expensiveCourses = await Course.find({ price: { $gte: 80000 } });
      expect(expensiveCourses.length).toBeGreaterThan(0);
      expect(expensiveCourses[0].price).toBeGreaterThanOrEqual(80000);
    });
  });

  describe('Course 수정', () => {
    it('강의 정보를 수정할 수 있어야 함', async () => {
      const courseData = {
        name: '수정 테스트 강의',
        description: '원본 설명',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      await course.save();

      course.description = '수정된 설명';
      course.maxStudents = 15;
      course.price = 60000;
      const updatedCourse = await course.save();

      expect(updatedCourse.description).toBe('수정된 설명');
      expect(updatedCourse.maxStudents).toBe(15);
      expect(updatedCourse.price).toBe(60000);
    });
  });

  describe('Course 삭제', () => {
    it('강의를 삭제할 수 있어야 함', async () => {
      const courseData = {
        name: '삭제 대상 강의',
        description: '삭제될 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      await course.save();

      await Course.findByIdAndDelete(course._id);

      const deletedCourse = await Course.findById(course._id);
      expect(deletedCourse).toBeNull();
    });
  });

  describe('유효성 검증', () => {
    it('유효하지 않은 레벨을 거부해야 함', async () => {
      const courseData = {
        name: '유효성 테스트 강의',
        description: '유효성 테스트용 강의',
        level: 'invalidLevel', // 유효하지 않은 레벨
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow();
    });

    it('음수 가격을 허용해야 함 (모델에서 검증하지 않음)', async () => {
      const courseData = {
        name: '유효성 테스트 강의',
        description: '유효성 테스트용 강의',
        level: 'beginner',
        duration: 60,
        price: -1000, // 음수 가격 (모델에서 검증하지 않음)
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();
      expect(savedCourse.price).toBe(-1000);
    });

    it('음수 최대 학생 수를 허용해야 함 (모델에서 검증하지 않음)', async () => {
      const courseData = {
        name: '유효성 테스트 강의',
        description: '유효성 테스트용 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: -5, // 음수 최대 학생 수 (모델에서 검증하지 않음)
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'regular',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();
      expect(savedCourse.maxStudents).toBe(-5);
    });
  });

  describe('클래스 정보 관리', () => {
    it('클래스 정보를 설정할 수 있어야 함', async () => {
      const courseData = {
        name: '클래스 테스트 강의',
        description: '클래스 테스트용 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'intensive',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.classInfo.className).toBe('자유형 기초반 A');
      expect(savedCourse.classInfo.classType).toBe('intensive');
      expect(savedCourse.classInfo.maxCapacity).toBe(10);
    });

    it('유효하지 않은 클래스 타입을 거부해야 함', async () => {
      const courseData = {
        name: '유효성 테스트 강의',
        description: '유효성 테스트용 강의',
        level: 'beginner',
        duration: 60,
        price: 50000,
        maxStudents: 10,
        instructor: '507f1f77bcf86cd799439011',
        centerId: new mongoose.Types.ObjectId(),
        classInfo: {
          className: '자유형 기초반 A',
          classType: 'invalidType', // 유효하지 않은 클래스 타입
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-27'),
          maxCapacity: 10
        }
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow();
    });
  });
});