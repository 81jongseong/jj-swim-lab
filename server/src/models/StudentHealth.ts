import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRestriction extends Document {
  condition: string; // 건강상태 (예: "허리질환", "어깨부상", "심장질환")
  severity: 'mild' | 'moderate' | 'severe'; // 심각도
  description: string; // 상세 설명
  restrictions: string[]; // 제한되는 동작들 (예: ["평영", "접영"])
  alternatives: string[]; // 대체 가능한 동작들 (예: ["자유형", "배영"])
  doctorNote?: string; // 의사 소견
  startDate: Date; // 시작일
  endDate?: Date; // 종료일 (없으면 지속)
}

export interface IStudentHealth extends Document {
  studentId: mongoose.Types.ObjectId; // 학생 ID
  centerId: mongoose.Types.ObjectId; // 센터 ID
  currentRestrictions: IHealthRestriction[]; // 현재 제약사항
  medicalHistory: IHealthRestriction[]; // 과거 병력
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[]; // 알레르기
  medications: string[]; // 복용 중인 약물
  notes: string; // 기타 참고사항
  lastUpdated: Date; // 마지막 업데이트
  updatedBy: mongoose.Types.ObjectId; // 업데이트한 사람
}

const HealthRestrictionSchema = new Schema<IHealthRestriction>({
  condition: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  restrictions: [{
    type: String,
    trim: true
  }],
  alternatives: [{
    type: String,
    trim: true
  }],
  doctorNote: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

const StudentHealthSchema = new Schema<IStudentHealth>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  currentRestrictions: {
    type: [HealthRestrictionSchema],
    default: []
  },
  medicalHistory: {
    type: [HealthRestrictionSchema],
    default: []
  },
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medications: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// 학생별로 유니크 - studentId 필드에 unique: true가 없으므로 인덱스 생성
StudentHealthSchema.index({ studentId: 1 }, { unique: true });

export const StudentHealth = mongoose.model<IStudentHealth>('StudentHealth', StudentHealthSchema);

