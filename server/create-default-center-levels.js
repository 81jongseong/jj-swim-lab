const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CenterLevel 모델 정의
const centerLevelSchema = new mongoose.Schema({
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  levelName: {
    type: String,
    required: true,
    trim: true
  },
  levelOrder: {
    type: Number,
    required: true,
    min: 1
  },
  levelColor: {
    type: String,
    required: true,
    trim: true,
    default: 'bg-gray-500'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 센터별로 레벨 순서가 유일해야 함
centerLevelSchema.index({ centerId: 1, levelOrder: 1 }, { unique: true });

const CenterLevel = mongoose.model('CenterLevel', centerLevelSchema);

// 기본 센터 레벨 데이터
const defaultLevels = [
  {
    levelName: '입문',
    levelOrder: 1,
    levelColor: 'bg-blue-500',
    description: '수영을 처음 시작하는 단계'
  },
  {
    levelName: '기초',
    levelOrder: 2,
    levelColor: 'bg-indigo-500',
    description: '기본 동작을 배우는 단계'
  },
  {
    levelName: '초급',
    levelOrder: 3,
    levelColor: 'bg-green-500',
    description: '초급 기술을 연마하는 단계'
  },
  {
    levelName: '중급',
    levelOrder: 4,
    levelColor: 'bg-yellow-500',
    description: '중급 기술을 연마하는 단계'
  },
  {
    levelName: '상급',
    levelOrder: 5,
    levelColor: 'bg-orange-500',
    description: '상급 기술을 연마하는 단계'
  },
  {
    levelName: '마스터',
    levelOrder: 6,
    levelColor: 'bg-red-500',
    description: '마스터 수준의 기술을 구사하는 단계'
  }
];

async function createDefaultCenterLevels() {
  try {
    console.log('🚀 기본 센터 레벨 생성 시작...');
    
    // 임시로 하드코딩된 센터 ID 사용 (실제로는 데이터베이스에서 가져와야 함)
    const mockCenterId = '507f1f77bcf86cd799439010';
    console.log(`🔍 임시 센터 ID 사용: ${mockCenterId}`);
    
    try {
      // 기존 레벨 삭제
      await CenterLevel.deleteMany({ centerId: mockCenterId });
      console.log('🗑️ 기존 레벨 삭제 완료');
      
      // 새로운 기본 레벨 생성
      const centerLevels = defaultLevels.map(level => ({
        ...level,
        centerId: mockCenterId
      }));
      
      const createdLevels = await CenterLevel.insertMany(centerLevels);
      console.log(`✅ ${createdLevels.length}개의 기본 레벨 생성 완료`);
      
      // 생성된 레벨 출력
      createdLevels.forEach((level, index) => {
        console.log(`   ${index + 1}. ${level.levelName} (${level.levelColor})`);
      });
      
    } catch (error) {
      console.error(`❌ 센터 레벨 생성 실패:`, error.message);
    }
    
    console.log('\n🎉 기본 센터 레벨 생성이 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 기본 센터 레벨 생성 중 오류:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

createDefaultCenterLevels();
