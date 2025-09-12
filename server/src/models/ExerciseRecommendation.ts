import mongoose, { Schema, Document } from 'mongoose';

// 운동 인터페이스
export interface IExercise {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // 분 단위
  repetitions?: number;
  sets?: number;
  equipment: string[];
  instructions: string[];
  benefits: string[];
  precautions: string[];
}

// 훈련 계획 인터페이스
export interface IWorkoutPlan {
  name: string;
  description: string;
  totalDuration: number; // 총 시간 (분)
  exercises: {
    exerciseName: string;
    duration: number;
    order: number;
  }[];
  frequency: number; // 주당 횟수
  progression: any; // 진행 단계 정보
}

// 운동 추천 인터페이스 (기존 복잡한 구조)
export interface IExerciseRecommendationComplex extends Document {
  technique: string; // 수영 기법 (freestyle, backstroke, breaststroke, butterfly)
  level: string; // 레벨 (beginner, intermediate, advanced, expert)
  category: 'posture' | 'breathing' | 'movement' | 'efficiency'; // 카테고리
  exercises: IExercise[]; // 운동 목록
  workoutPlan: IWorkoutPlan[]; // 훈련 계획
  isActive: boolean; // 활성 상태
  createdBy: mongoose.Types.ObjectId; // 생성자
  centerId: mongoose.Types.ObjectId; // 센터 ID
  createdAt: Date;
  updatedAt: Date;
}

// 간단한 운동 추천 인터페이스 (AI 엔진에서 사용)
export interface IExerciseRecommendation {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number; // 분
  equipment?: string[];
  instructions: string[];
  benefits: string[];
}

// 운동 스키마
const ExerciseSchema = new Schema<IExercise>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  duration: { type: Number, required: true, min: 1 },
  repetitions: { type: Number, min: 1 },
  sets: { type: Number, min: 1 },
  equipment: [{ type: String }],
  instructions: [{ type: String }],
  benefits: [{ type: String }],
  precautions: [{ type: String }]
}, { _id: false });

// 훈련 계획 스키마
const WorkoutPlanSchema = new Schema<IWorkoutPlan>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  totalDuration: { type: Number, required: true, min: 1 },
  exercises: [{
    exerciseName: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    order: { type: Number, required: true, min: 1 }
  }],
  frequency: { type: Number, required: true, min: 1 },
  progression: { type: Schema.Types.Mixed }
}, { _id: false });

// 운동 추천 스키마 (간단한 버전)
const ExerciseRecommendationSchema = new Schema<IExerciseRecommendation>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  equipment: [{ type: String }],
  instructions: [{ type: String, required: true }],
  benefits: [{ type: String, required: true }]
}, {
  timestamps: true
});

// 인덱스 설정
ExerciseRecommendationSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model<IExerciseRecommendation>('ExerciseRecommendation', ExerciseRecommendationSchema);

