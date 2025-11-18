import mongoose, { Document, Types } from 'mongoose';
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
export declare const InstructorProgress: mongoose.Model<IInstructorProgress, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorProgress> & IInstructorProgress & {
    _id: Types.ObjectId;
}, any>;
export {};
//# sourceMappingURL=InstructorProgress.d.ts.map