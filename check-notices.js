/**
 * 공지사항 데이터 확인 스크립트
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

const noticeSchema = new mongoose.Schema({
  title: String,
  content: String,
  type: String,
  status: String,
  priority: String,
  targetUserTypes: [String],
  targetRegions: [String],
  targetCenters: [String],
  authorId: String,
  authorName: String,
  createdAt: Date,
  publishedAt: Date,
  views: Number,
  attachments: [String]
}, { timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);

async function checkNotices() {
  try {
    console.log('🔌 MongoDB 연결 중...');
    console.log('URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공');

    const notices = await Notice.find({});
    console.log(`\n📊 총 공지사항: ${notices.length}개`);

    if (notices.length > 0) {
      console.log('\n📋 공지사항 목록:');
      notices.forEach((notice, idx) => {
        console.log(`${idx + 1}. ${notice.title}`);
        console.log(`   - 상태: ${notice.status}`);
        console.log(`   - 유형: ${notice.type}`);
        console.log(`   - 조회수: ${notice.views}`);
        console.log(`   - 작성일: ${notice.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n❌ 데이터베이스에 공지사항이 없습니다.');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');
  }
}

checkNotices();

