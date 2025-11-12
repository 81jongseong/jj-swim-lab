/**
 * @file 강사용 레슨 진행 관리 모델
 * @description 출석, 코멘트, 과제, 레벨 체크리스트를 instructors가 저장할 수 있도록 MongoDB 스키마 정의
 * 연동 모델: User(학생/강사), Course(강의), TeachingMethod(슈퍼관리자 강습법)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'late' | 'absent';

interface SessionRecord {
  sessionId: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
  activity: string;
  location?: string;
  sessionType: 'group' | 'personal';
  courseName?: string;
  status: AttendanceStatus;
}

interface CoachNoteRecord {
  noteId: string;
  sessionId?: string;
  content: string;
  authorName?: string;
  createdAt: Date;
}

interface HomeworkRecord {
  taskId: string;
  title: string;
  description?: string;
  dueDate: Date;
  createdAt: Date;
  completed: boolean;
  completedAt?: Date | null;
}

interface LevelChecklistRecord {
  itemId: string;
  label: string;
  description?: string;
  category: 'stroke' | 'technique' | 'endurance' | 'safety';
  level: 'beginner' | 'intermediate' | 'advanced';
  checked: boolean;
  checkedAt?: Date | null;
  sourceMethodId?: string | null;
  sourceMethodName?: string | null;
}

export interface IInstructorProgress extends Document {
  instructorId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseName?: string;
  sessions: SessionRecord[];
  notes: CoachNoteRecord[];
  homework: HomeworkRecord[];
  levelChecklist: LevelChecklistRecord[];
  updatedAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<SessionRecord>(
  {
    sessionId: { type: String, required: true },
    sessionDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    activity: { type: String, required: true },
    location: { type: String },
    sessionType: { type: String, enum: ['group', 'personal'], required: true },
    courseName: { type: String },
    status: { type: String, enum: ['present', 'late', 'absent'], required: true }
  },
  { _id: false }
);

const CoachNoteSchema = new Schema<CoachNoteRecord>(
  {
    noteId: { type: String, required: true },
    sessionId: { type: String },
    content: { type: String, required: true },
    authorName: { type: String },
    createdAt: { type: Date, required: true }
  },
  { _id: false }
);

const HomeworkSchema = new Schema<HomeworkRecord>(
  {
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const LevelChecklistSchema = new Schema<LevelChecklistRecord>(
  {
    itemId: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['stroke', 'technique', 'endurance', 'safety'],
      default: 'technique'
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    checked: { type: Boolean, default: false },
    checkedAt: { type: Date, default: null },
    sourceMethodId: { type: String },
    sourceMethodName: { type: String }
  },
  { _id: false }
);

const InstructorProgressSchema = new Schema<IInstructorProgress>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseName: { type: String },
    sessions: { type: [SessionSchema], default: [] },
    notes: { type: [CoachNoteSchema], default: [] },
    homework: { type: [HomeworkSchema], default: [] },
    levelChecklist: { type: [LevelChecklistSchema], default: [] }
  },
  {
    timestamps: true,
    collection: 'instructorProgress'
  }
);

InstructorProgressSchema.index({ instructorId: 1, studentId: 1 }, { unique: true });

export const InstructorProgress = mongoose.model<IInstructorProgress>('InstructorProgress', InstructorProgressSchema);
