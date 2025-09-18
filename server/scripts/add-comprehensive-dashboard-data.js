/**
 * 📊 JJ Swim Lab - 종합 대시보드 샘플 데이터 추가 스크립트
 * 
 * 📋 **스크립트 목적**
 * - 모든 계정 타입(학생/강사/관리자)의 대시보드 데이터 생성
 * - 스마트워치, 예약, 결제, 성과 등 모든 데이터 포함
 * - 실제 사용 환경과 유사한 데이터 생성
 */

const mongoose = require('mongoose');
const path = require('path');

// 환경 변수 로드
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 모델 import
const { User } = require('../dist/models/User');
const { SmartWatchData } = require('../dist/models/SmartWatchData');
const { ExerciseData } = require('../dist/models/ExerciseData');
const { HealthData } = require('../dist/models/HealthData');

async function addComprehensiveDashboardData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료');

    // 모든 사용자 찾기
    const users = await User.find({});
    console.log(`👥 총 ${users.length}명의 사용자 발견`);

    for (const user of users) {
      console.log(`\n👤 ${user.name} (${user.userType}) 데이터 생성 중...`);

      // 1. 건강 데이터 추가
      await HealthData.deleteMany({ userId: user._id });
      const healthData = new HealthData({
        userId: user._id,
        basicInfo: {
          age: 25 + Math.floor(Math.random() * 20),
          height: 160 + Math.floor(Math.random() * 30),
          weight: 60 + Math.floor(Math.random() * 30),
          gender: Math.random() > 0.5 ? 'male' : 'female'
        },
        swimmingInfo: {
          experienceLevel: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
          preferredStrokes: ['freestyle', 'backstroke'],
          goals: ['체력 향상', '기술 개선'],
          currentLevel: Math.floor(Math.random() * 5) + 1
        },
        healthConditions: {
          medicalHistory: [],
          currentMedications: [],
          injuries: [],
          allergies: []
        },
        fitnessGoals: {
          targetWeight: 65 + Math.floor(Math.random() * 15),
          targetBodyFat: 15 + Math.floor(Math.random() * 10),
          weeklyExerciseGoal: 3 + Math.floor(Math.random() * 4),
          specificGoals: ['근력 향상', '지구력 증진']
        }
      });
      await healthData.save();

      // 2. 운동 데이터 추가 (최근 30일)
      await ExerciseData.deleteMany({ userId: user._id });
      for (let i = 0; i < 15; i++) {
        const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000);
        const exerciseData = new ExerciseData({
          userId: user._id,
          sessionId: `session_${user._id}_${i}`,
          sessionInfo: {
            date: sessionDate,
            startTime: new Date(sessionDate.getTime() + 9 * 60 * 60 * 1000),
            endTime: new Date(sessionDate.getTime() + 10 * 60 * 60 * 1000),
            duration: 60,
            technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
            poolLength: 25,
            totalDistance: 800 + Math.floor(Math.random() * 400)
          },
          performanceMetrics: {
            averageSpeed: 1.0 + Math.random() * 0.5,
            maxSpeed: 1.2 + Math.random() * 0.6,
            totalCalories: 250 + Math.floor(Math.random() * 200),
            averageHeartRate: 130 + Math.floor(Math.random() * 30),
            maxHeartRate: 150 + Math.floor(Math.random() * 30),
            strokeCount: 600 + Math.floor(Math.random() * 400),
            efficiency: 70 + Math.floor(Math.random() * 30)
          },
          poseAnalysis: {
            overallScore: 70 + Math.floor(Math.random() * 30),
            headPosition: 75 + Math.floor(Math.random() * 20),
            bodyAlignment: 70 + Math.floor(Math.random() * 25),
            armMovement: 80 + Math.floor(Math.random() * 15),
            legKick: 75 + Math.floor(Math.random() * 20),
            breathing: 70 + Math.floor(Math.random() * 25),
            recommendations: [
              '머리 위치를 더 안정적으로 유지하세요',
              '팔 동작의 일관성을 높여보세요',
              '호흡 타이밍을 개선해보세요'
            ]
          }
        });
        await exerciseData.save();
      }

      // 3. 스마트워치 데이터 추가
      await SmartWatchData.deleteMany({ studentId: user._id });
      const devices = [
        { type: 'apple_watch', model: 'Apple Watch Series 9', version: '10.1' },
        { type: 'samsung_galaxy_watch', model: 'Galaxy Watch6', version: '5.0.0.2' },
        { type: 'garmin', model: 'Garmin Swim 2', version: '4.20' }
      ];

      for (let i = 0; i < 5; i++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const sessionDate = new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000);
        const smartWatchData = new SmartWatchData({
          studentId: user._id,
          sessionId: `${device.type}_${user._id}_${i}`,
          deviceInfo: {
            deviceType: device.type,
            deviceModel: device.model,
            firmwareVersion: device.version
          },
          sessionInfo: {
            startTime: sessionDate,
            endTime: new Date(sessionDate.getTime() + (30 + Math.random() * 30) * 60 * 1000),
            duration: 30 + Math.floor(Math.random() * 30),
            technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
            poolLength: 25,
            totalDistance: 600 + Math.floor(Math.random() * 600)
          },
          performanceMetrics: {
            averageSpeed: 0.8 + Math.random() * 0.6,
            maxSpeed: 1.0 + Math.random() * 0.8,
            averageHeartRate: 130 + Math.floor(Math.random() * 30),
            maxHeartRate: 150 + Math.floor(Math.random() * 30),
            minHeartRate: 110 + Math.floor(Math.random() * 20),
            strokeCount: 500 + Math.floor(Math.random() * 500),
            strokeRate: 15 + Math.floor(Math.random() * 8),
            caloriesBurned: 200 + Math.floor(Math.random() * 200),
            efficiency: 70 + Math.floor(Math.random() * 30)
          },
          detailedData: {
            heartRateData: Array.from({length: 10}, (_, idx) => ({
              timestamp: new Date(sessionDate.getTime() + idx * 3 * 60 * 1000),
              heartRate: 130 + Math.floor(Math.random() * 30)
            })),
            strokeData: Array.from({length: 5}, (_, idx) => ({
              timestamp: new Date(sessionDate.getTime() + idx * 6 * 60 * 1000),
              strokeType: ['freestyle', 'backstroke'][Math.floor(Math.random() * 2)],
              strokeCount: 20 + Math.floor(Math.random() * 10),
              strokeRate: 15 + Math.floor(Math.random() * 5)
            })),
            speedData: Array.from({length: 8}, (_, idx) => ({
              timestamp: new Date(sessionDate.getTime() + idx * 4 * 60 * 1000),
              speed: 0.8 + Math.random() * 0.6,
              distance: 100 + Math.floor(Math.random() * 100)
            })),
            restPeriods: Array.from({length: 2}, (_, idx) => ({
              startTime: new Date(sessionDate.getTime() + (10 + idx * 15) * 60 * 1000),
              endTime: new Date(sessionDate.getTime() + (12 + idx * 15) * 60 * 1000),
              duration: 2
            }))
          },
          aiAnalysis: {
            postureScore: 70 + Math.floor(Math.random() * 30),
            breathingPattern: {
              averageBreathRate: 8 + Math.floor(Math.random() * 4),
              breathConsistency: 70 + Math.floor(Math.random() * 25),
              breathEfficiency: 75 + Math.floor(Math.random() * 20)
            },
            strokeAnalysis: {
              strokeConsistency: 75 + Math.floor(Math.random() * 20),
              strokeEfficiency: 70 + Math.floor(Math.random() * 25),
              strokePower: 72 + Math.floor(Math.random() * 23)
            },
            overallEfficiency: 70 + Math.floor(Math.random() * 30),
            recommendations: [
              '심박수 안정화를 위한 호흡 연습을 강화하세요',
              '스트로크 일관성을 높이기 위한 기본 동작 연습을 하세요',
              '전체적인 효율성 향상을 위해 코어 근력 운동을 추가하세요'
            ]
          },
          syncedAt: sessionDate,
          isProcessed: true
        });
        await smartWatchData.save();
      }

      console.log(`✅ ${user.name} 데이터 생성 완료 - 건강정보, 운동기록 15개, 스마트워치 5개`);
    }

    console.log('\n🎉 모든 사용자의 종합 대시보드 데이터 생성 완료!');
    console.log('\n📊 생성된 데이터:');
    console.log('- 건강 프로필: 각 사용자별 1개');
    console.log('- 운동 기록: 각 사용자별 15개 (최근 30일)');
    console.log('- 스마트워치 데이터: 각 사용자별 5개');
    console.log('\n🎯 테스트 방법:');
    console.log('1. 임의 계정으로 로그인');
    console.log('2. 대시보드 페이지 접속');
    console.log('3. 건강 페이지 > 운동 기록 확인');
    console.log('4. 스마트워치 연동 데이터 확인');

  } catch (error) {
    console.error('❌ 종합 대시보드 데이터 생성 실패:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  addComprehensiveDashboardData();
}

module.exports = { addComprehensiveDashboardData };
