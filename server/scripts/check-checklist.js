/**
 * 체크리스트 데이터 확인 스크립트
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES 모듈에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// MongoDB 연결
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

// 체크리스트 확인
const checkChecklists = async () => {
  try {
    // ClassChecklist 모델 가져오기
    const { ClassChecklist } = await import('../src/models/ClassChecklist.js');
    
    console.log('\n🔍 체크리스트 데이터 확인 중...');
    
    // 모든 체크리스트 조회
    const allChecklists = await ClassChecklist.find({});
    console.log(`📊 총 체크리스트 수: ${allChecklists.length}`);
    
    if (allChecklists.length > 0) {
      allChecklists.forEach((checklist, index) => {
        console.log(`\n📋 체크리스트 ${index + 1}:`);
        console.log(`   ID: ${checklist._id}`);
        console.log(`   classId: ${checklist.classId} (타입: ${typeof checklist.classId})`);
        console.log(`   level: ${checklist.level}`);
        console.log(`   items: ${checklist.items.length}개`);
        console.log(`   isActive: ${checklist.isActive}`);
        console.log(`   createdAt: ${checklist.createdAt}`);
      });
    }
    
    // 특정 classId로 검색
    console.log('\n🔍 classId "class1"로 검색...');
    const class1Checklist = await ClassChecklist.findOne({ classId: 'class1' });
    
    if (class1Checklist) {
      console.log('✅ class1 체크리스트 발견:');
      console.log(`   ID: ${class1Checklist._id}`);
      console.log(`   classId: ${class1Checklist.classId}`);
      console.log(`   level: ${class1Checklist.level}`);
    } else {
      console.log('❌ class1 체크리스트를 찾을 수 없습니다.');
      
      // 문자열 검색도 시도
      console.log('\n🔍 문자열 "class1"로 검색...');
      const stringSearch = await ClassChecklist.find({ 
        classId: { $regex: 'class1', $options: 'i' } 
      });
      
      if (stringSearch.length > 0) {
        console.log(`✅ 문자열 검색으로 ${stringSearch.length}개 발견:`);
        stringSearch.forEach((item, index) => {
          console.log(`   ${index + 1}. ID: ${item._id}, classId: ${item.classId}`);
        });
      } else {
        console.log('❌ 문자열 검색으로도 찾을 수 없습니다.');
      }
    }
    
  } catch (error) {
    console.error('❌ 체크리스트 확인 실패:', error);
  }
};

// 메인 실행
const main = async () => {
  try {
    await connectDB();
    await checkChecklists();
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB 연결 종료');
    process.exit(0);
  }
};

main();

