/**
 * 회원 정보 일괄 등록 API
 * 연동되는 데이터: User (students), Course
 * 연동되는 파일: center-admin.ts
 */

import express, { Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { authMiddleware, requireCenterAdmin } from '../middleware/auth';
import { Request } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user: any;
}

const router = express.Router();

// Multer 설정 (메모리 저장)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('엑셀 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * POST /api/member-bulk-import/upload
 * 엑셀 파일로 회원 일괄 등록
 */
router.post('/upload', authMiddleware, requireCenterAdmin, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다.'
      });
    }

    console.log('📁 엑셀 파일 업로드 시작');

    // 센터 관리자 정보 가져오기
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    console.log('🏢 센터 ID:', centerId);

    // 엑셀 파일 파싱
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 총 ${data.length}개의 행 발견`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // 각 행을 회원으로 등록
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      try {
        // 필수 필드 검증
        if (!row['이름'] || !row['이메일']) {
          results.failed++;
          results.errors.push({
            row: i + 2, // 엑셀 행 번호 (헤더 제외)
            error: '이름 또는 이메일이 누락되었습니다.'
          });
          continue;
        }

        // 이미 존재하는 이메일인지 확인
        const existingUser = await User.findOne({ email: row['이메일'] });
        if (existingUser) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            error: `이미 존재하는 이메일입니다: ${row['이메일']}`
          });
          continue;
        }

        // 비밀번호 해싱 (기본 비밀번호: swim1234)
        const defaultPassword = row['비밀번호'] || 'swim1234';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // 회원 생성
        const newUser = new User({
          name: row['이름'],
          email: row['이메일'],
          password: hashedPassword,
          phone: row['전화번호'] || '',
          userType: 'student',
          centerId: new mongoose.Types.ObjectId(centerId),
          studentInfo: {
            level: row['레벨'] || 'beginner',
            centerId: new mongoose.Types.ObjectId(centerId),
            swimmingGoals: row['수영목표'] ? [row['수영목표']] : [],
            emergencyContact: row['비상연락처'] ? {
              name: row['비상연락처_이름'] || '',
              phone: row['비상연락처'] || '',
              relationship: row['비상연락처_관계'] || ''
            } : undefined,
            medicalInfo: row['의료정보'] ? {
              conditions: [row['의료정보']],
              medications: row['복용약물'] ? [row['복용약물']] : [],
              allergies: row['알레르기'] ? [row['알레르기']] : [],
              isPublic: false
            } : undefined
          }
        });

        await newUser.save();

        // 반 배정 (선택사항)
        if (row['반이름']) {
          const course = await Course.findOne({
            name: row['반이름'],
            centerId: centerId
          });

          if (course) {
            const enrolledStudents = course.enrolledStudents || [];
            const validEnrolledStudents = enrolledStudents.filter(
              (enrollment: any) => enrollment && enrollment.student
            );

            // 정원 확인
            if (validEnrolledStudents.length < course.maxStudents) {
              validEnrolledStudents.push({
                student: newUser._id,
                enrollmentDate: new Date(),
                status: 'active'
              });

              course.enrolledStudents = validEnrolledStudents;
              await course.save();
            }
          }
        }

        results.success++;
        console.log(`✅ ${i + 1}/${data.length} - ${row['이름']} 등록 완료`);

      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          error: error.message
        });
        console.error(`❌ ${i + 1}/${data.length} - 오류:`, error.message);
      }
    }

    console.log('📊 일괄 등록 완료:', results);

    res.json({
      success: true,
      message: `${results.success}명 등록 완료, ${results.failed}명 실패`,
      data: results
    });

  } catch (error: any) {
    console.error('❌ 일괄 등록 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/member-bulk-import/template
 * 엑셀 템플릿 다운로드
 */
router.get('/template', (req, res) => {
  const templateData = [
    {
      '이름': '홍길동',
      '이메일': 'hong@example.com',
      '비밀번호': 'swim1234',
      '전화번호': '010-1234-5678',
      '레벨': 'beginner',
      '수영목표': '자유형 마스터',
      '비상연락처_이름': '홍부모',
      '비상연락처': '010-9876-5432',
      '비상연락처_관계': '부모',
      '의료정보': '',
      '복용약물': '',
      '알레르기': '',
      '반이름': '초급 자유형 기초반'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '회원 목록');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=member_template.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

export default router;

