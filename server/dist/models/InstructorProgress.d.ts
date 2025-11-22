/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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