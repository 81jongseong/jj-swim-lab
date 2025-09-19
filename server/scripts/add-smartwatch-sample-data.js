/**
 * ⌚ JJ Swim Lab - 스마트워치 샘플 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 스마트워치 연동 기능 테스트를 위한 샘플 데이터 생성
 * - Apple Watch, Samsung Galaxy Watch, Garmin 데이터 시뮬레이션
 * - 다양한 수영 기법 및 성과 데이터 생성
 * 
 * 🔄 **주요 기능**
 * - 3가지 스마트워치 브랜드별 샘플 데이터
 * - 4가지 수영 기법별 성과 데이터
 * - 실제적인 심박수, 칼로리, 효율성 데이터
 * - 학생 계정과 연동된 세션 데이터
 */

const mongoose = require('mongoose');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 모델 import (컴파일된 JS 파일 사용)
const { SmartWatchData } = require('../dist/models/SmartWatchData');
const { User } = require('../dist/models/User');

async function addSmartWatchSampleData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료');

    // 학생 사용자 찾기
    const student = await User.findOne({ userType: 'student' });
    if (!student) {
      console.error('❌ 학생 계정을 찾을 수 없습니다.');
      return;
    }

    console.log('👤 학생 계정 확인:', student.name);

    // 기존 스마트워치 데이터 삭제
    await SmartWatchData.deleteMany({ studentId: student._id });
    console.log('🗑️ 기존 스마트워치 데이터 삭제 완료');

    // 스마트워치 샘플 데이터 생성
    const sampleData = [
      // Apple Watch 데이터
      {
        studentId: student._id,
        sessionId: `apple_session_${Date.now()}_1`,
        deviceInfo: {
          deviceType: 'apple_watch',
          deviceModel: 'Apple Watch Series 9',
          firmwareVersion: '10.1'
        },
        sessionInfo: {
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45분 운동
          duration: 45,
          technique: 'freestyle',
          poolLength: 25,
          totalDistance: 1000
        },
        performanceMetrics: {
          averageSpeed: 1.2, // m/s
          maxSpeed: 1.5,
          averageHeartRate: 145,
          maxHeartRate: 165,
          minHeartRate: 120,
          strokeCount: 800,
          strokeRate: 18, // 스트로크/분
          caloriesBurned: 320,
          efficiency: 85
        },
        detailedData: {
          heartRateData: [
            { timestamp: new Date(), value: 145 },
            { timestamp: new Date(), value: 150 },
            { timestamp: new Date(), value: 155 }
          ],
          strokeData: [
            { timestamp: new Date(), count: 20, rate: 18 }
          ],
          speedData: [
            { timestamp: new Date(), value: 1.2 }
          ]
        },
        syncedAt: new Date(),
        isProcessed: true
      },
      // Samsung Galaxy Watch 데이터
      {
        studentId: student._id,
        sessionId: `samsung_session_${Date.now()}_2`,
        deviceInfo: {
          deviceType: 'samsung_galaxy_watch',
          deviceModel: 'Galaxy Watch6',
          firmwareVersion: '5.0.0.2'
        },
        sessionInfo: {
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000), // 35분 운동
          duration: 35,
          technique: 'backstroke',
          poolLength: 25,
          totalDistance: 750
        },
        performanceMetrics: {
          averageSpeed: 1.0,
          maxSpeed: 1.3,
          averageHeartRate: 138,
          maxHeartRate: 158,
          minHeartRate: 115,
          strokeCount: 600,
          strokeRate: 16,
          caloriesBurned: 280,
          efficiency: 78
        },
        detailedData: {
          heartRateData: [
            { timestamp: new Date(), value: 138 },
            { timestamp: new Date(), value: 142 },
            { timestamp: new Date(), value: 148 }
          ],
          strokeData: [
            { timestamp: new Date(), count: 16, rate: 16 }
          ],
          speedData: [
            { timestamp: new Date(), value: 1.0 }
          ]
        },
        syncedAt: new Date(),
        isProcessed: true
      },
      // Garmin 데이터
      {
        studentId: student._id,
        sessionId: `garmin_session_${Date.now()}_3`,
        deviceInfo: {
          deviceType: 'garmin',
          deviceModel: 'Garmin Swim 2',
          firmwareVersion: '4.20'
        },
        sessionInfo: {
          startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3시간 전
          endTime: new Date(Date.now() - 3 * 60 * 60 * 1000 + 50 * 60 * 1000), // 50분 운동
          duration: 50,
          technique: 'breaststroke',
          poolLength: 25,
          totalDistance: 1200
        },
        performanceMetrics: {
          averageSpeed: 1.1,
          maxSpeed: 1.4,
          averageHeartRate: 142,
          maxHeartRate: 162,
          minHeartRate: 118,
          strokeCount: 720,
          strokeRate: 15,
          caloriesBurned: 380,
          efficiency: 82
        },
        detailedData: {
          heartRateData: [
            { timestamp: new Date(), value: 142 },
            { timestamp: new Date(), value: 147 },
            { timestamp: new Date(), value: 152 }
          ],
          strokeData: [
            { timestamp: new Date(), count: 15, rate: 15 }
          ],
          speedData: [
            { timestamp: new Date(), value: 1.1 }
          ]
        },
        syncedAt: new Date(),
        isProcessed: true
      }
    ];

    // 샘플 데이터 저장
    for (const data of sampleData) {
      const smartWatchData = new SmartWatchData(data);
      await smartWatchData.save();
      console.log(`✅ ${data.deviceInfo.deviceModel} 데이터 저장 완료`);
    }

    console.log('\n📊 스마트워치 샘플 데이터 생성 완료:');
    console.log(`- Apple Watch Series 9: 자유형 45분 (1000m)`);
    console.log(`- Galaxy Watch6: 배영 35분 (750m)`);
    console.log(`- Garmin Swim 2: 평영 50분 (1200m)`);
    console.log('\n🎯 테스트 방법:');
    console.log('1. 학생 계정으로 로그인 (student1 / 101010)');
    console.log('2. 건강 페이지 > 운동 기록 탭 접속');
    console.log('3. 스마트워치 연동 데이터 확인');

  } catch (error) {
    console.error('❌ 스마트워치 샘플 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  addSmartWatchSampleData();
}

module.exports = { addSmartWatchSampleData };


