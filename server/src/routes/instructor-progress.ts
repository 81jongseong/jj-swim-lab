/**
 * @file 강사용 레슨 진행/출석 관리 API
 * @description 출석, 코멘트, 과제 정보를 저장/조회하는 라우트
 * 연동 모델: InstructorProgress, User
 */

import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import { authMiddleware, requireRole } from '../middleware/auth';
import { InstructorProgress } from '../models/InstructorProgress';

const router = express.Router();

router.get('/student/:studentId', authMiddleware, requireRole(['instructor']), async (req: Request & { user?: any }, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
    }

    const progress = await InstructorProgress.findOne({
      instructorId: new Types.ObjectId(instructorId),
      studentId: new Types.ObjectId(studentId)
    }).lean();

    if (!progress) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('❌ 진행 관리 조회 실패:', error);
    res.status(500).json({ success: false, message: '진행 관리 데이터를 불러오는 중 오류가 발생했습니다.' });
  }
});

router.post('/student/:studentId', authMiddleware, requireRole(['instructor']), async (req: Request & { user?: any }, res: Response) => {
  try {
    const instructorId = req.user?.id;
    const { studentId } = req.params;
    const { courseName, sessions = [], notes = [], homework = [], levelChecklist = [] } = req.body || {};

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '유효하지 않은 학생 ID 입니다.' });
    }

    const instructorObjectId = new Types.ObjectId(instructorId);
    const studentObjectId = new Types.ObjectId(studentId);

    const normalizedSessions = Array.isArray(sessions)
      ? sessions.map((session: any) => ({
          sessionId: session.sessionId,
          sessionDate: session.sessionDate ? new Date(session.sessionDate) : new Date(),
          startTime: session.startTime,
          endTime: session.endTime,
          activity: session.activity,
          location: session.location,
          sessionType: session.sessionType || 'group',
          courseName: session.courseName,
          status: session.status || 'absent'
        }))
      : [];

    const normalizedNotes = Array.isArray(notes)
      ? notes.map((note: any) => ({
          noteId: note.noteId,
          sessionId: note.sessionId,
          content: note.content,
          authorName: note.authorName,
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date()
        }))
      : [];

    const normalizedHomework = Array.isArray(homework)
      ? homework.map((task: any) => ({
          taskId: task.taskId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          completed: Boolean(task.completed),
          completedAt: task.completedAt ? new Date(task.completedAt) : null
        }))
      : [];

    const normalizedChecklist = Array.isArray(levelChecklist)
      ? levelChecklist.map((item: any) => ({
          itemId: item.itemId || item.id,
          label: item.label,
          description: item.description,
          category: ['stroke', 'technique', 'endurance', 'safety'].includes(item.category)
            ? item.category
            : 'technique',
          level: ['beginner', 'intermediate', 'advanced'].includes(item.level) ? item.level : 'beginner',
          checked: Boolean(item.checked),
          checkedAt: item.checkedAt ? new Date(item.checkedAt) : item.checked ? new Date() : null,
          sourceMethodId: item.sourceMethodId || item.sourceId || null,
          sourceMethodName: item.sourceMethodName || item.sourceName || item.source || null
        }))
      : [];

    const updated = await InstructorProgress.findOneAndUpdate(
      { instructorId: instructorObjectId, studentId: studentObjectId },
      {
        instructorId: instructorObjectId,
        studentId: studentObjectId,
        courseName,
        sessions: normalizedSessions,
        notes: normalizedNotes,
        homework: normalizedHomework,
        levelChecklist: normalizedChecklist
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('❌ 진행 관리 저장 실패:', error);
    res.status(500).json({ success: false, message: '진행 관리 데이터를 저장하는 중 오류가 발생했습니다.' });
  }
});

export default router;
