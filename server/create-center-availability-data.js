/**
 * 📅 센터 가능시간 설정 데이터 생성 스크립트
 * 
 * 센터에 개인레슨과 레인대여 가능시간을 설정합니다.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 import
const User = require('./dist/models/User').default;
const Center = require('./dist/models/Center').default;

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority');

async function createCenterAvailabilityData() {
  try {
    console.log('🚀 센터 가능시간 설정 시작...');

    // 센터 정보 가져오기
    let center = await Center.findOne({ email: 'center@swim.com' });
    if (!center) {
      console.log('🏢 센터가 없어서 생성합니다...');
      
      // 센터 생성
      center = new Center({
        name: 'JJ Swim Center',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'center@swim.com',
        managerId: new mongoose.Types.ObjectId(),
        capacity: 100,
        status: 'active',
        facilities: ['25m 풀', '유아풀', '샤워실', '락커룸'],
        poolConfiguration: {
          mainPool: {
            name: '메인 풀',
            lanes: 6,
            depth: '1.2m~1.8m',
            size: '25m x 15m'
          },
          kidsPool: {
            name: '유아 풀',
            lanes: 2,
            depth: '0.8m~1.0m',
            size: '10m x 5m'
          }
        },
        operatingHours: {
          open: '06:00',
          close: '22:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        availabilitySettings: {
          personalLesson: {
            enabled: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            availableTimes: [
              { startTime: '09:00', endTime: '18:00', maxDuration: 120 }
            ],
            advanceBookingDays: 7,
            cancellationPolicy: '24시간 전 취소 가능'
          },
          laneRental: {
            enabled: true,
            availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            availableTimes: [
              { startTime: '06:00', endTime: '22:00', maxDuration: 180 }
            ],
            availableLanes: [1, 2, 3, 4, 5, 6],
            advanceBookingDays: 14,
            cancellationPolicy: '12시간 전 취소 가능'
          }
        }
      });
      
      await center.save();
      console.log('✅ 센터 생성 완료:', center.name);
    } else {
      console.log('🏢 기존 센터 찾음:', center.name);
      
      // 기존 센터에 가능시간 설정 추가
      center.availabilitySettings = {
        personalLesson: {
          enabled: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
          availableTimes: [
            { startTime: '09:00', endTime: '18:00', maxDuration: 120 }
          ],
          advanceBookingDays: 7,
          cancellationPolicy: '24시간 전 취소 가능'
        },
        laneRental: {
          enabled: true,
          availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          availableTimes: [
            { startTime: '06:00', endTime: '22:00', maxDuration: 180 }
          ],
          availableLanes: [1, 2, 3, 4, 5, 6],
          advanceBookingDays: 14,
          cancellationPolicy: '12시간 전 취소 가능'
        }
      };
      
      await center.save();
      console.log('✅ 센터 가능시간 설정 완료');
    }

    console.log('🎉 센터 가능시간 설정 완료!');
    console.log('📊 설정된 내용:');
    console.log('  - 개인레슨 가능:', center.availabilitySettings.personalLesson.enabled);
    console.log('  - 개인레슨 가능 요일:', center.availabilitySettings.personalLesson.availableDays);
    console.log('  - 레인대여 가능:', center.availabilitySettings.laneRental.enabled);
    console.log('  - 레인대여 가능 레인:', center.availabilitySettings.laneRental.availableLanes);

  } catch (error) {
    console.error('❌ 센터 가능시간 설정 실패:', error);
  } finally {
    mongoose.connection.close();
  }
}

createCenterAvailabilityData();


