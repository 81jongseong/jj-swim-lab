/**
 * 🏊 Center 모델 테스트
 */

import mongoose from 'mongoose';
import { Center } from '../../src/models/Center';
import { clearDatabase } from '../setup';

describe('Center 모델 테스트', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Center 생성', () => {
    it('유효한 데이터로 센터를 생성할 수 있어야 함', async () => {
      const centerData = {
        name: '테스트 수영장',
        address: '서울시 강남구 테스트로 123',
        phone: '02-1234-5678',
        email: 'center@example.com',
        managerId: new mongoose.Types.ObjectId(),
        facilities: ['수영장', '샤워실', '락커룸'],
        operatingHours: {
          open: '09:00',
          close: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        capacity: 100,
        status: 'active'
      };

      const center = new Center(centerData);
      const savedCenter = await center.save();

      expect(savedCenter._id).toBeDefined();
      expect(savedCenter.name).toBe(centerData.name);
      expect(savedCenter.address).toBe(centerData.address);
      expect(savedCenter.facilities).toEqual(centerData.facilities);
      expect(savedCenter.status).toBe(centerData.status);
    });

    it('필수 필드가 누락된 경우 에러를 발생시켜야 함', async () => {
      const incompleteData = {
        address: '서울시 강남구 테스트로 123'
        // name 누락
      };

      const center = new Center(incompleteData);
      await expect(center.save()).rejects.toThrow();
    });
  });

  describe('Center 조회', () => {
    it('이름으로 센터를 찾을 수 있어야 함', async () => {
      const centerData = {
        name: '검색 테스트 수영장',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'search@example.com',
        managerId: new mongoose.Types.ObjectId(),
        status: 'active'
      };

      const center = new Center(centerData);
      await center.save();

      const foundCenter = await Center.findOne({ name: '검색 테스트 수영장' });
      expect(foundCenter).toBeDefined();
      expect(foundCenter?.name).toBe('검색 테스트 수영장');
    });

    it('상태별로 센터를 찾을 수 있어야 함', async () => {
      const centerData = {
        name: '활성 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'active@example.com',
        managerId: new mongoose.Types.ObjectId(),
        status: 'active'
      };

      const center = new Center(centerData);
      await center.save();

      const activeCenters = await Center.find({ status: 'active' });
      expect(activeCenters.length).toBeGreaterThan(0);
      expect(activeCenters[0].status).toBe('active');
    });
  });

  describe('Center 수정', () => {
    it('센터 정보를 수정할 수 있어야 함', async () => {
      const centerData = {
        name: '수정 테스트 센터',
        address: '원본 주소',
        phone: '02-1234-5678',
        email: 'update@example.com',
        managerId: new mongoose.Types.ObjectId(),
        status: 'active'
      };

      const center = new Center(centerData);
      await center.save();

      center.address = '수정된 주소';
      center.phone = '02-9876-5432';
      const updatedCenter = await center.save();

      expect(updatedCenter.address).toBe('수정된 주소');
      expect(updatedCenter.phone).toBe('02-9876-5432');
    });
  });

  describe('Center 삭제', () => {
    it('센터를 삭제할 수 있어야 함', async () => {
      const centerData = {
        name: '삭제 대상 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'delete@example.com',
        managerId: new mongoose.Types.ObjectId(),
        status: 'active'
      };

      const center = new Center(centerData);
      await center.save();

      await Center.findByIdAndDelete(center._id);

      const deletedCenter = await Center.findById(center._id);
      expect(deletedCenter).toBeNull();
    });
  });

  describe('유효성 검증', () => {
    it('유효하지 않은 이메일 형식을 허용해야 함 (모델에서 검증하지 않음)', async () => {
      const centerData = {
        name: '유효성 테스트 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'invalid-email',
        managerId: new mongoose.Types.ObjectId(),
        status: 'active'
      };

      const center = new Center(centerData);
      const savedCenter = await center.save();
      expect(savedCenter.email).toBe('invalid-email');
    });

    it('유효하지 않은 상태를 거부해야 함', async () => {
      const centerData = {
        name: '유효성 테스트 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'valid@example.com',
        managerId: new mongoose.Types.ObjectId(),
        status: 'invalidStatus' // 유효하지 않은 상태
      };

      const center = new Center(centerData);
      await expect(center.save()).rejects.toThrow();
    });
  });

  describe('시설 관리', () => {
    it('시설 목록을 추가할 수 있어야 함', async () => {
      const centerData = {
        name: '시설 테스트 센터',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'facilities@example.com',
        managerId: new mongoose.Types.ObjectId(),
        facilities: ['수영장'],
        status: 'active'
      };

      const center = new Center(centerData);
      await center.save();

      center.facilities.push('샤워실', '락커룸');
      const updatedCenter = await center.save();

      expect(updatedCenter.facilities).toContain('수영장');
      expect(updatedCenter.facilities).toContain('샤워실');
      expect(updatedCenter.facilities).toContain('락커룸');
    });
  });
});
