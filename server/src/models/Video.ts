import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  owner?: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  status: 'pending' | 'reviewed';
  analysisResult?: any;
  feedback?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  visibility?: 'private' | 'center' | 'public';
  reviews?: {
    reviewedBy: mongoose.Types.ObjectId;
    feedback?: string;
    analysisResult?: any;
    visibility?: 'private' | 'center' | 'public';
    reviewedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
  analysisResult: Schema.Types.Mixed,
  feedback: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  visibility: { type: String, enum: ['private', 'center', 'public'], default: 'private' },
  reviews: [{
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedback: { type: String },
    analysisResult: Schema.Types.Mixed,
    visibility: { type: String, enum: ['private', 'center', 'public'] },
    reviewedAt: { type: Date, required: true },
  }],
}, { timestamps: true });

videoSchema.index({ owner: 1, createdAt: -1 });

export const Video = mongoose.model<IVideo>('Video', videoSchema);
export default Video;


