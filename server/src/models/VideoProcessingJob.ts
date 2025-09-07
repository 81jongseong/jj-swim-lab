import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoProcessingJob extends Document {
  videoId: string;
  originalVideoPath: string;
  outputDir: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  
  // 결과 파일 경로들
  motionDataPath?: string; // BVH 파일
  glbPath?: string;        // GLB 파일
  fbxPath?: string;        // FBX 파일
  previewImagePath?: string; // 미리보기 이미지
  
  // 메타데이터
  originalFileName?: string;
  videoDuration?: number;
  frameCount?: number;
  resolution?: {
    width: number;
    height: number;
  };
}

const VideoProcessingJobSchema = new Schema<IVideoProcessingJob>({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalVideoPath: {
    type: String,
    required: true
  },
  outputDir: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  
  // 결과 파일 경로들
  motionDataPath: {
    type: String
  },
  glbPath: {
    type: String
  },
  fbxPath: {
    type: String
  },
  previewImagePath: {
    type: String
  },
  
  // 메타데이터
  originalFileName: {
    type: String
  },
  videoDuration: {
    type: Number
  },
  frameCount: {
    type: Number
  },
  resolution: {
    width: Number,
    height: Number
  }
});

// 업데이트 시 updatedAt 자동 갱신
VideoProcessingJobSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 인덱스 설정
VideoProcessingJobSchema.index({ status: 1 });
VideoProcessingJobSchema.index({ createdAt: -1 });
VideoProcessingJobSchema.index({ videoId: 1 });

export const VideoProcessingJob = mongoose.model<IVideoProcessingJob>('VideoProcessingJob', VideoProcessingJobSchema);






