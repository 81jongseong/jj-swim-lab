/**
 * 센터에 풀 구성 정보 추가 스크립트
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

async function addPoolConfig() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');

    const SwimmingCenter = mongoose.model('SwimmingCenter', new mongoose.Schema({}, { strict: false }));

    // 모든 센터 조회
    console.log('🔍 모든 센터 조회 중...');
    const centers = await SwimmingCenter.find({});
    console.log(`📋 총 ${centers.length}개 센터 발견\n`);

    if (centers.length === 0) {
      console.log('⚠️ 센터가 없습니다. 먼저 센터를 생성하세요.');
      await mongoose.disconnect();
      process.exit(0);
    }

    let updatedCount = 0;

    for (const center of centers) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🏊 ${center.name}`);
      console.log(`${'='.repeat(50)}`);
      
      const hasPoolConfig = center.poolConfiguration && center.poolConfiguration.mainPool;
      
      if (!hasPoolConfig) {
        console.log('📝 풀 구성 정보 추가 중...');
        
        // 기본 풀 구성 설정
        center.poolConfiguration = {
          mainPool: {
            name: '메인 풀',
            lanes: 6,
            depth: '1.2m~1.8m',
            size: '25m x 15m'
          },
          kidsPool: {
            name: '유아 풀',
            lanes: 3, // 유아풀 있음
            depth: '0.6m~0.9m',
            size: '10m x 5m'
          },
          auxiliaryPool: {
            name: '보조 풀',
            lanes: 0, // 보조풀 없음
            depth: '1.0m~1.5m',
            size: '15m x 8m'
          }
        };
        
        await center.save();
        
        console.log('✅ 풀 구성 추가 완료:');
        console.log(`  🏊 메인 풀: ${center.poolConfiguration.mainPool.lanes}레인`);
        console.log(`  👶 유아 풀: ${center.poolConfiguration.kidsPool.lanes}레인`);
        console.log(`  🏊‍♀️ 보조 풀: ${center.poolConfiguration.auxiliaryPool.lanes}레인`);
        
        updatedCount++;
      } else {
        console.log('⏭️ 이미 설정됨');
        console.log(`  🏊 메인 풀: ${center.poolConfiguration.mainPool.lanes}레인`);
        if (center.poolConfiguration.kidsPool && center.poolConfiguration.kidsPool.lanes > 0) {
          console.log(`  👶 유아 풀: ${center.poolConfiguration.kidsPool.lanes}레인`);
        }
        if (center.poolConfiguration.auxiliaryPool && center.poolConfiguration.auxiliaryPool.lanes > 0) {
          console.log(`  🏊‍♀️ 보조 풀: ${center.poolConfiguration.auxiliaryPool.lanes}레인`);
        }
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 작업 완료!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📊 총 ${centers.length}개 센터 중 ${updatedCount}개 업데이트됨`);

  } catch (error) {
    console.error('\n💥 오류 발생:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB 연결 종료');
  }
}

addPoolConfig();

