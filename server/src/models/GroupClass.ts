/**
 * 🏊 JJ Swim Lab - 단체반 (Group Class) 모델
 * 
 * 📋 **모델 목적**
 * - 단체 수업 클래스 관리
 * - 강사-학생 다대다 관계 처리
 * - 클래스별 수영 프로그램 연동
 * - 단체반 완료율 집계
 * 
 * 🔗 **연동되는 모델**
 * - User (강사, 학생)
 * - SwimmingCenter (센터)
 * - SwimProgram (수영 프로그램)
 * 
 * 💡 **주요 필드**
 * - className: 클래스 이름
 * - instructor: 담당 강사
 * - students: 등록된 학생 목록
 * - schedule: 수업 일정
 * - program: 연동된 수영 프로그램
 * - capacity: 정원
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-XX: 초기 모델 생성 (단체반 관리)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupClass extends Document {
  _id: Types.ObjectId;
  className: string;
  
  // 메서드 타입 정의
  addStudent(userId: Types.ObjectId): Promise<void>;
  removeStudent(userId: Types.ObjectId): Promise<void>;
  updateStudentStatus(userId: Types.ObjectId, status: 'active' | 'inactive' | 'completed' | 'dropped'): Promise<void>;
  description?: string;
  
  // 센터 및 강사
  centerId: Types.ObjectId;
  instructorId: Types.ObjectId;
  
  // 학생 목록
  students: {
    userId: Types.ObjectId;
    enrolledAt: Date;
    status: 'active' | 'inactive' | 'completed' | 'dropped';
    attendanceRate?: number; // 출석률 (%)
    completionRate?: number; // 완료율 (%)
  }[];
  
  // 수업 일정
  schedule: {
    dayOfWeek: number[]; // 0: 일요일, 1: 월요일, ..., 6: 토요일
    startTime: string; // HH:mm 형식
    endTime: string;
    duration: number; // 분 단위
  };
  
  // 수업 기간
  period: {
    startDate: Date;
    endDate: Date;
    totalSessions: number; // 총 수업 횟수
    completedSessions: number; // 완료된 수업 횟수
  };
  
  // 정원 관리
  capacity: {
    min: number; // 최소 인원
    max: number; // 최대 인원
    current: number; // 현재 인원
  };
  
  // 연동된 프로그램
  programId?: Types.ObjectId; // SwimProgram 참조
  
  // 레벨 및 대상
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  targetAge?: {
    min: number;
    max: number;
  };
  
  // 수업 상태
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  
  // 수업료 정보
  fee?: {
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'per_session' | 'total';
  };
  
  // 메모 및 공지사항
  notes?: string;
  announcements?: {
    title: string;
    content: string;
    createdAt: Date;
    createdBy: Types.ObjectId;
  }[];
  
  // 생성/수정 정보
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
}

const GroupClassSchema: Schema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    
    // 센터 및 강사
    centerId: {
      type: Schema.Types.ObjectId,
      ref: 'SwimmingCenter',
      required: true,
      index: true
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
    // 학생 목록
    students: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'completed', 'dropped'],
        default: 'active'
      },
      attendanceRate: {
        type: Number,
        min: 0,
        max: 100
      },
      completionRate: {
        type: Number,
        min: 0,
        max: 100
      }
    }],
    
    // 수업 일정
    schedule: {
      dayOfWeek: {
        type: [Number],
        required: true,
        validate: {
          validator: function(arr: number[]) {
            return arr.every(day => day >= 0 && day <= 6);
          },
          message: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'
        }
      },
      startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
      },
      duration: {
        type: Number,
        required: true,
        min: 30,
        max: 180
      }
    },
    
    // 수업 기간
    period: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      totalSessions: {
        type: Number,
        required: true,
        min: 1
      },
      completedSessions: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    // 정원 관리
    capacity: {
      min: {
        type: Number,
        required: true,
        min: 1,
        default: 4
      },
      max: {
        type: Number,
        required: true,
        min: 1,
        default: 12
      },
      current: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    // 연동된 프로그램
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'SwimProgram'
    },
    
    // 레벨 및 대상
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
      required: true,
      default: 'beginner'
    },
    targetAge: {
      min: {
        type: Number,
        min: 1,
        max: 100
      },
      max: {
        type: Number,
        min: 1,
        max: 100
      }
    },
    
    // 수업 상태
    status: {
      type: String,
      enum: ['planned', 'active', 'completed', 'cancelled'],
      default: 'planned',
      index: true
    },
    
    // 수업료 정보
    fee: {
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'KRW'
      },
      billingCycle: {
        type: String,
        enum: ['monthly', 'per_session', 'total'],
        default: 'monthly'
      }
    },
    
    // 메모 및 공지사항
    notes: {
      type: String
    },
    announcements: [{
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    // 생성/수정 정보
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'groupclasses'
  }
);

// 인덱스 생성
GroupClassSchema.index({ centerId: 1, status: 1 });
GroupClassSchema.index({ instructorId: 1, status: 1 });
GroupClassSchema.index({ 'students.userId': 1 });
GroupClassSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

// 가상 필드: 현재 등록된 활성 학생 수
GroupClassSchema.virtual('activeStudentCount').get(function() {
  return this.students.filter((s: any) => s.status === 'active').length;
});

// 가상 필드: 정원 대비 현재 인원 비율
GroupClassSchema.virtual('occupancyRate').get(function() {
  return (this.capacity.current / this.capacity.max) * 100;
});

// 메서드: 학생 추가
GroupClassSchema.methods.addStudent = async function(userId: Types.ObjectId) {
  if (this.capacity.current >= this.capacity.max) {
    throw new Error('Class is full');
  }
  
  const existingStudent = this.students.find(
    (s: any) => s.userId.toString() === userId.toString()
  );
  
  if (existingStudent) {
    throw new Error('Student already enrolled');
  }
  
  this.students.push({
    userId,
    enrolledAt: new Date(),
    status: 'active'
  });
  
  this.capacity.current += 1;
  await this.save();
};

// 메서드: 학생 제거
GroupClassSchema.methods.removeStudent = async function(userId: Types.ObjectId) {
  const studentIndex = this.students.findIndex(
    (s: any) => s.userId.toString() === userId.toString()
  );
  
  if (studentIndex === -1) {
    throw new Error('Student not found');
  }
  
  this.students.splice(studentIndex, 1);
  this.capacity.current = Math.max(0, this.capacity.current - 1);
  await this.save();
};

// 메서드: 학생 상태 업데이트
GroupClassSchema.methods.updateStudentStatus = async function(
  userId: Types.ObjectId,
  status: 'active' | 'inactive' | 'completed' | 'dropped'
) {
  const student = this.students.find(
    (s: any) => s.userId.toString() === userId.toString()
  );
  
  if (!student) {
    throw new Error('Student not found');
  }
  
  student.status = status;
  await this.save();
};

export default mongoose.model<IGroupClass>('GroupClass', GroupClassSchema);

