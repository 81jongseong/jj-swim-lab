/**
 * 🏊 JJ Swim Lab - 수영 엔진 데이터 시드 스크립트
 * 
 * 📋 **목적:**
 * - 기존 하드코딩된 훈련법/드릴/질환 데이터를 DB로 마이그레이션
 * - 초기 데이터 세팅
 * 
 * 실행: node server/scripts/seed-swim-engine-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
const envPath = path.resolve(__dirname, '../../.env');
console.log('📁 .env 경로:', envPath);
dotenv.config({ path: envPath });

// 모델 import
import { SwimTrainingMethod } from '../src/models/SwimTrainingMethod.js';
import { SwimDrill } from '../src/models/SwimDrill.js';
import { SwimCondition } from '../src/models/SwimCondition.js';

// 기존 데이터 import (경로 조정 필요)
import { TRAINING_METHODS } from '../../client/src/swimlab/data/trainingMethods.js';
import { DRILLS } from '../../client/src/swimlab/data/drills.js';
import { CONDITIONS } from '../../client/src/swimlab/data/conditions_full.js';

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab';
    console.log('🔗 MongoDB 연결 중...', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

async function seedTrainingMethods() {
  console.log('\n📥 훈련법 데이터 시드 시작...');
  
  try {
    // 기존 데이터 삭제
    await SwimTrainingMethod.deleteMany({});
    console.log('🗑️  기존 훈련법 데이터 삭제 완료');
    
    // 새 데이터 삽입
    const methods = TRAINING_METHODS.map((method, index) => ({
      id: method.id,
      title: method.title,
      category: method.category || 'general',
      description: method.description || method.title,
      recommendedDrills: method.recommendedDrills || [],
      avoidForConditions: [],
      recommendForConditions: [],
      evidence: method.evidence || [],
      targetLevel: method.targetLevel || [],
      intensity: method.intensity,
      isActive: true,
      order: index
    }));
    
    await SwimTrainingMethod.insertMany(methods);
    console.log(`✅ 훈련법 ${methods.length}개 삽입 완료`);
  } catch (error) {
    console.error('❌ 훈련법 시드 오류:', error);
  }
}

async function seedDrills() {
  console.log('\n📥 드릴 데이터 시드 시작...');
  
  try {
    // 기존 데이터 삭제
    await SwimDrill.deleteMany({});
    console.log('🗑️  기존 드릴 데이터 삭제 완료');
    
    // 새 데이터 삽입
    const drills = DRILLS.map((drill, index) => ({
      id: drill.id,
      name: drill.name,
      category: drill.category || 'general',
      description: drill.description || drill.name,
      tags: drill.tags || [],
      cues: drill.cues || [],
      examples: drill.examples || [],
      videoUrl: drill.videoUrl,
      recommendedFor: drill.recommendedFor || [],
      avoidFor: drill.avoidFor || [],
      targetStroke: drill.targetStroke || [],
      difficulty: drill.difficulty,
      isActive: true,
      order: index
    }));
    
    await SwimDrill.insertMany(drills);
    console.log(`✅ 드릴 ${drills.length}개 삽입 완료`);
  } catch (error) {
    console.error('❌ 드릴 시드 오류:', error);
  }
}

async function seedConditions() {
  console.log('\n📥 질환 데이터 시드 시작...');
  
  try {
    // 기존 데이터 삭제
    await SwimCondition.deleteMany({});
    console.log('🗑️  기존 질환 데이터 삭제 완료');
    
    // 새 데이터 삽입
    const conditions = CONDITIONS.map((condition, index) => ({
      id: condition.id,
      name: condition.name,
      label: condition.label || condition.name,
      category: condition.category || 'general',
      group: condition.group || 'CHRONIC',
      description: condition.description,
      swimmingGuidance: condition.swimmingGuidance,
      recommendedStrokes: condition.recommendedStrokes || [],
      avoidStrokes: condition.avoidStrokes || [],
      recommendedMethods: [],
      avoidMethods: [],
      recommendedDrills: [],
      avoidDrills: [],
      rationale: condition.rationale,
      evidence: condition.evidence || [],
      keywords: condition.keywords || [],
      severity: condition.severity,
      isMSK28: condition.isMSK28 || false,
      isActive: true,
      order: index
    }));
    
    await SwimCondition.insertMany(conditions);
    console.log(`✅ 질환 ${conditions.length}개 삽입 완료`);
  } catch (error) {
    console.error('❌ 질환 시드 오류:', error);
  }
}

async function main() {
  console.log('🏊 수영 엔진 데이터 시드 시작\n');
  
  await connectDB();
  
  await seedTrainingMethods();
  await seedDrills();
  await seedConditions();
  
  console.log('\n🎉 모든 데이터 시드 완료!');
  console.log('📊 요약:');
  console.log(`  - 훈련법: ${await SwimTrainingMethod.countDocuments()}개`);
  console.log(`  - 드릴: ${await SwimDrill.countDocuments()}개`);
  console.log(`  - 질환: ${await SwimCondition.countDocuments()}개`);
  
  await mongoose.disconnect();
  console.log('\n✅ MongoDB 연결 종료');
}

main().catch(error => {
  console.error('❌ 스크립트 실행 오류:', error);
  process.exit(1);
});

