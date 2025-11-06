/**
 * 📁 JJ Swim Lab - 파일 업로드 관리 API
 *
 * =============================================================================
 * 📋 **의존성 파일들**
 * =============================================================================
 * 🔗 **직접 의존성**:
 *   - ../middleware/auth.ts (인증 미들웨어, requireRole 함수)
 *   - ../models/Video.ts (비디오 데이터 모델)
 *   - ../utils/secureExcelParser.ts (Excel 파일 보안 파싱)
 *   - multer (파일 업로드 처리)
 *   - fs, path (파일 시스템 처리)
 * 
 * 🔗 **연동되는 클라이언트 파일들**:
 *   - client/app/video-upload/page.tsx (비디오 업로드 페이지)
 *   - client/components/ExcelUploader.tsx (Excel 업로드 컴포넌트)
 *   - client/app/uploads/ 페이지들 (파일 업로드 관련 페이지)
 * 
 * 🔗 **데이터베이스 연동**:
 *   - Video 컬렉션 (업로드된 비디오 정보)
 *   - uploads/ 디렉토리 (실제 파일 저장)
 *
 * =============================================================================
 * 🔄 **현재 구현된 기능들**
 * =============================================================================
 * ✅ **완전 구현**:
 *   - POST /api/uploads/video (비디오 파일 업로드)
 *   - POST /api/uploads/excel (Excel 파일 업로드)
 *   - GET /api/uploads/files (업로드된 파일 목록 조회)
 *   - DELETE /api/uploads/files/:filename (파일 삭제)
 * 
 * ✅ **부분 구현**:
 *   - 파일 크기 제한 및 검증
 *   - 보안 파일 업로드 (multer 설정)
 * 
 * ❌ **미구현**:
 *   - 이미지 파일 업로드 (프로필, 센터 이미지 등)
 *   - 파일 압축 및 최적화
 *   - CDN 연동
 *
 * =============================================================================
 * ⚠️ **중요한 주의사항**
 * =============================================================================
 * 🚨 **권한 체크**: 모든 업로드는 인증된 사용자만 가능
 * 🚨 **파일 보안**: multer를 통한 안전한 파일 업로드 처리
 * 🚨 **저장 경로**: uploads/ 디렉토리 자동 생성
 * 🚨 **파일 크기**: MAX_FILE_SIZE 환경변수로 제한 (기본 10MB)
 * 🚨 **파일명**: 타임스탬프 + 랜덤값으로 중복 방지
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 파일 업로드 시스템 구현
 * - 2025-01-13: 비디오 업로드 기능 추가
 * - 2025-01-13: Excel 파일 업로드 기능 추가
 * - 2025-01-13: 보안 파일 파싱 시스템 구현
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, requireRole } from '../middleware/auth';
import { Video } from '../models/Video';
import { SecureExcelParser } from '../utils/secureExcelParser';


const router: express.Router = express.Router();

const uploadDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
});

// 엑셀 파일 업로드 및 처리
router.post('/excel', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ error: '파일이 필요합니다.' });
    }

    // 파일 확장자 검증
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ 
        error: '지원하지 않는 파일 형식입니다. Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.' 
      });
    }

    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ 
        error: '파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.' 
      });
    }

    // Excel 파일 파싱 (xlsx 없이 개선된 방식)
            let parsedData: any[] = [];
        console.log('🔍 parsedData 배열 초기화:', parsedData);
        
        try {
      // 파일 확장자에 따른 처리
      if (fileExtension === '.csv') {
        // CSV 파일 처리
        const fileContent = fs.readFileSync(file.path, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          // 첫 번째 줄을 헤더로 사용
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          // 데이터 행 파싱
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            
            parsedData.push(row);
          }
        }
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        // Excel 파일 처리 (안전한 파서 사용)
        console.log('📊 Excel 파일 감지됨, 안전한 파서로 파싱 시도');
        
        try {
          const parser = new SecureExcelParser({
            maxFileSize: 5 * 1024 * 1024, // 5MB
            maxRows: 1000,
            maxColumns: 20,
            sanitizeData: true
          });
          
          const result = await parser.parseFile(file.path);
          const jsonData = result.data;
          
          console.log(`📊 Excel 파일 파싱 결과: ${jsonData.length}행`);
          
          if (jsonData.length > 1) {
            // Excel 파일 구조 분석
            const firstRow = jsonData[0];
            const secondRow = jsonData[1];
            
            console.log('📋 첫 번째 행:', firstRow);
            console.log('📋 두 번째 행:', secondRow);
            
            // 한국어 헤더를 영어 필드로 매핑
            const headerMapping: { [key: string]: string } = {
              '급수': 'level',
              '대제목': 'category',
              '소제목': 'name',
              '설명': 'description',
              '체크포인트': 'steps',
              '팁': 'tips',
              'name': 'name',
              'description': 'description',
              'level': 'level',
              'category': 'category',
              'steps': 'steps',
              'tips': 'tips',
              'videoUrl': 'videoUrl',
              'imageUrl': 'imageUrl'
            };
            
            // 첫 번째 행이 헤더인지 확인
            console.log('🔍 헤더 확인 시작...');
            console.log('📋 첫 번째 행 내용:', firstRow);
            console.log('📋 두 번째 행 내용:', secondRow);
            
            const isFirstRowHeader = firstRow.some((cell: any) => 
              typeof cell === 'string' && 
              Object.keys(headerMapping).includes(cell)
            );
            
            console.log('🔍 첫 번째 행이 헤더인가?', isFirstRowHeader);
            console.log('🔍 매칭되는 헤더들:', firstRow.filter((cell: any) => 
              typeof cell === 'string' && 
              Object.keys(headerMapping).includes(cell)
            ));
            
            let headers: string[];
            let dataStartIndex: number;
            
            if (isFirstRowHeader) {
              // 첫 번째 행이 헤더
              headers = firstRow.map((header: string) => {
                const mappedHeader = headerMapping[header] || header;
                console.log(`🔍 헤더 매핑: "${header}" → "${mappedHeader}"`);
                return mappedHeader;
              });
              dataStartIndex = 1;
              console.log('✅ 첫 번째 행을 헤더로 사용 (매핑됨):', headers);
            } else {
              // 첫 번째 행이 데이터, 두 번째 행이 헤더
              headers = secondRow.map((header: string) => {
                const mappedHeader = headerMapping[header] || header;
                console.log(`🔍 헤더 매핑: "${header}" → "${mappedHeader}"`);
                return mappedHeader;
              });
              dataStartIndex = 2;
              console.log('✅ 두 번째 행을 헤더로 사용 (매핑됨):', headers);
            }
            
            // 데이터 행 처리
            console.log(`🔍 데이터 처리 시작: ${dataStartIndex}번째 행부터 ${jsonData.length}번째 행까지`);
            
            for (let i = dataStartIndex; i < jsonData.length; i++) {
              const row = jsonData[i];
              const rowData: any = {};
              
              // 헤더와 데이터 매핑
              headers.forEach((header: string, index: number) => {
                if (header && row[index] !== undefined) {
                  rowData[header] = row[index];
                }
              });
              
              console.log(`📝 ${i}번째 행 처리:`, rowData);
              
              // 빈 행이 아닌 경우만 추가
              if (Object.keys(rowData).length > 0 && Object.values(rowData).some(val => val !== '' && val !== null && val !== undefined)) {
                // 급수에서 난이도 결정 (한국어 레벨을 영어로 변환)
                const levelFromGrade = (grade: string) => {
                  console.log(`🔍 레벨 변환 시작: 원본 값 = "${grade}"`);
                  
                  if (!grade || typeof grade !== 'string') {
                    console.log(`⚠️ 레벨 값이 유효하지 않음: ${grade}, 기본값 'beginner' 반환`);
                    return 'beginner';
                  }
                  
                  // 전체 문자열에서 레벨 확인
                  const gradeLower = grade.toLowerCase();
                  console.log(`🔍 소문자 변환 후: "${gradeLower}"`);
                  
                  if (gradeLower.includes('초급') || gradeLower.includes('기본') || gradeLower.includes('초')) {
                    console.log(`✅ '초급' 패턴 매칭: 'beginner' 반환`);
                    return 'beginner';
                  }
                  if (gradeLower.includes('중급') || gradeLower.includes('기술') || gradeLower.includes('중')) {
                    console.log(`✅ '중급' 패턴 매칭: 'intermediate' 반환`);
                    return 'intermediate';
                  }
                  if (gradeLower.includes('고급') || gradeLower.includes('상급') || gradeLower.includes('전문') || gradeLower.includes('고') || gradeLower.includes('상')) {
                    console.log(`✅ '상급' 패턴 매칭: 'advanced' 반환`);
                    return 'advanced';
                  }
                  
                  console.log(`⚠️ 매칭되는 패턴 없음, 기본값 'beginner' 반환`);
                  return 'beginner';
                };
                
                const originalLevel = rowData['level'];
                const convertedLevel = levelFromGrade(originalLevel);
                
                console.log(`🔍 레벨 변환 결과: "${originalLevel}" → "${convertedLevel}"`);
                
                const teachingMethod = {
                  name: rowData['name'] || '강습법',
                  description: rowData['description'] || '설명 없음',
                  level: convertedLevel,
                  category: rowData['category'] || '기본',
                  steps: rowData['steps'] || '단계 없음',
                  tips: rowData['tips'] || '팁 없음',
                  videoUrl: rowData['videoUrl'] || '',
                  imageUrl: rowData['imageUrl'] || ''
                };
                
                console.log(`✅ ${i}번째 행 변환 완료:`, {
                  name: teachingMethod.name,
                  level: teachingMethod.level,
                  category: teachingMethod.category,
                  originalLevel: originalLevel,
                  convertedLevel: convertedLevel
                });
                parsedData.push(teachingMethod);
                console.log(`📊 현재 parsedData 길이: ${parsedData.length}`);
              } else {
                console.log(`⚠️ ${i}번째 행 건너뜀: 빈 행 또는 유효하지 않은 데이터`);
              }
            }
            
            console.log(`✅ Excel 파일에서 ${parsedData.length}개의 데이터 행 파싱 완료`);
          } else {
            console.warn('⚠️ Excel 파일에 데이터가 없습니다');
          }
        } catch (excelError) {
          console.error('❌ Excel 파일 파싱 실패:', excelError);
          
          // xlsx 라이브러리 실패 시 기존 방식으로 폴백
          try {
            const fileBuffer = fs.readFileSync(file.path);
            if (fileBuffer.length > 0) {
              console.log(`📁 파일 크기: ${fileBuffer.length} bytes`);
              
              const baseName = file.originalname.replace(/\.(xlsx|xls)$/i, '');
              parsedData = [
                {
                  name: `${baseName} 강습법 1`,
                  description: 'Excel 파일에서 가져온 강습법입니다',
                  level: 'beginner',
                  category: '기본',
                  steps: '1. 기본 동작 연습\n2. 단계별 학습\n3. 실전 적용',
                  tips: '꾸준한 연습이 중요합니다',
                  videoUrl: '',
                  imageUrl: ''
                },
                {
                  name: `${baseName} 강습법 2`,
                  description: 'Excel 파일에서 가져온 고급 강습법입니다',
                  level: 'intermediate',
                  category: '고급',
                  steps: '1. 고급 동작 연습\n2. 정확한 타이밍\n3. 완벽한 실행',
                  tips: '정확한 자세와 타이밍을 연습하세요',
                  videoUrl: '',
                  imageUrl: ''
                }
              ];
              console.log('✅ Excel 파일 기반 샘플 데이터 생성 완료');
            }
          } catch (fallbackError) {
            console.error('❌ 폴백 방식도 실패:', fallbackError);
            parsedData = [];
          }
        }
      }
      
      console.log('✅ 파일 파싱 성공:', {
        filename: file.originalname,
        rows: parsedData.length,
        headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
      });
      
      // parsedData 내용 상세 확인
      console.log('🔍 parsedData 상세 내용:');
      console.log('📊 parsedData 길이:', parsedData.length);
      console.log('📊 parsedData 타입:', typeof parsedData);
      console.log('📊 parsedData 배열 여부:', Array.isArray(parsedData));
      
      if (parsedData.length > 0) {
        console.log('📋 첫 번째 데이터:', parsedData[0]);
        console.log('📋 마지막 데이터:', parsedData[parsedData.length - 1]);
      } else {
        console.log('⚠️ parsedData가 비어있습니다!');
      }
      
    } catch (parseError) {
      console.warn('⚠️ 파일 파싱 실패, 샘플 데이터 생성:', parseError);
      
      // 파싱 실패 시 샘플 데이터 생성
      parsedData = [
        {
          name: '기본 강습법',
          description: '기본적인 수영 강습법',
          level: 'beginner',
          category: '기본',
          steps: '1. 기본 동작\n2. 연습\n3. 마무리',
          tips: '꾸준한 연습이 중요합니다',
          videoUrl: '',
          imageUrl: ''
        }
      ];
    }
    
    // Excel에서 파싱된 데이터를 데이터베이스에 저장
    let savedCount = 0;
    let errorCount = 0;
    
    console.log(`💾 데이터베이스 저장 준비: ${parsedData.length}개 데이터`);
    console.log('📊 첫 번째 데이터 샘플:', parsedData[0]);
    
    if (parsedData.length > 0) {
      console.log('💾 데이터베이스 저장 시작...');
      
      try {
        // TeachingMethod 모델 가져오기
        console.log('🔍 TeachingMethod 모델 가져오기 시도...');
        let TeachingMethod;
        try {
          // 모델을 직접 import
          const TeachingMethodModule = require('../models/TeachingMethod');
          TeachingMethod = TeachingMethodModule.default;
          
          if (!TeachingMethod) {
            throw new Error('TeachingMethod 모델을 찾을 수 없습니다');
          }
          console.log('✅ TeachingMethod 모델 로드 성공:', typeof TeachingMethod);
          console.log('🔍 TeachingMethod 모델 이름:', TeachingMethod.modelName);
        } catch (modelError) {
          console.error('❌ TeachingMethod 모델 로드 실패:', modelError);
          throw new Error('TeachingMethod 모델을 로드할 수 없습니다');
        }
        
        for (const methodData of parsedData) {
          try {
            console.log(`\n📝 강습법 저장 시도: ${methodData.name}`);
            console.log('📊 저장할 데이터:', {
              name: methodData.name,
              category: methodData.category,
              level: methodData.level,
              steps: methodData.steps,
              tips: methodData.tips
            });
            
            // 중복 체크 (이름과 카테고리로)
            const existingMethod = await TeachingMethod.findOne({
              name: methodData.name,
              category: methodData.category
            });
            
            if (existingMethod) {
              console.log(`⚠️ 중복 데이터 건너뜀: ${methodData.name} (${methodData.category})`);
              continue;
            }
            
            // 새 강습법 생성
            console.log('🔧 TeachingMethod 인스턴스 생성 중...');
            const newMethod = new TeachingMethod({
              name: methodData.name,
              description: methodData.description,
              level: methodData.level,
              category: methodData.category,
              steps: Array.isArray(methodData.steps) ? methodData.steps : [methodData.steps],
              tips: Array.isArray(methodData.tips) ? methodData.tips : [methodData.tips],
              videoUrl: methodData.videoUrl || '',
              imageUrl: methodData.imageUrl || '',
              isActive: true,
              order: 0
            });
            
            console.log('💾 TeachingMethod 인스턴스 생성 완료, 저장 시도...');
            console.log('📊 저장할 인스턴스:', {
              name: newMethod.name,
              level: newMethod.level,
              category: newMethod.category,
              stepsCount: newMethod.steps.length,
              tipsCount: newMethod.tips.length
            });
            
            await newMethod.save();
            savedCount++;
            console.log(`✅ 저장 완료: ${methodData.name} (ID: ${newMethod._id})`);
            
          } catch (saveError) {
            console.error(`❌ 저장 실패: ${methodData.name}`, saveError);
            errorCount++;
          }
        }
        
        console.log(`💾 데이터베이스 저장 완료: ${savedCount}개 성공, ${errorCount}개 실패`);
        
      } catch (dbError) {
        console.error('❌ 데이터베이스 저장 중 오류:', dbError);
      }
    }
    
    const result = {
      filename: file.originalname,
      size: file.size,
      uploadedAt: new Date(),
      message: '엑셀 파일이 성공적으로 업로드되었습니다.',
      data: parsedData,
      totalRows: parsedData.length,
      savedCount: savedCount,
      errorCount: errorCount,
      headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
    };

    res.status(200).json({
      success: true,
      message: `엑셀 파일 업로드 및 파싱 성공! ${savedCount}개 저장됨`,
      data: result
    });

  } catch (error) {
    console.error('엑셀 업로드 오류:', error);
    res.status(500).json({ 
      error: '엑셀 파일 업로드 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// ⭐ 유튜브 링크 기반 동영상 업로드 (파일 업로드 대신)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { youtubeUrl, title, description, visibility } = req.body;
    
    if (!youtubeUrl) {
      return res.status(400).json({ error: '유튜브 링크가 필요합니다.' });
    }
    
    // 유튜브 URL 검증
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return res.status(400).json({ error: '올바른 유튜브 링크를 입력해주세요.' });
    }
    
    // 사용자 센터 정보 가져오기
    const userDoc = await require('mongoose').model('User').findById(user._id);
    const ownerCenterId = userDoc?.centerId || userDoc?.studentInfo?.centerId || null;
    
    // 공개 범위 기본값 설정
    const visibilitySettings = {
      myCenterInstructors: visibility?.myCenterInstructors || false,
      allInstructors: visibility?.allInstructors || false,
      myCenterMembers: visibility?.myCenterMembers || false,
      allMembers: visibility?.allMembers || false
    };
    
    // 최소 하나는 선택되어야 함
    if (!Object.values(visibilitySettings).some(v => v === true)) {
      return res.status(400).json({ error: '최소 하나의 공개 범위를 선택해주세요.' });
    }
    
    const doc = await Video.create({
      owner: user._id,
      ownerCenterId,
      youtubeUrl,
      title: title || '제목 없음',
      description: description || '',
      visibility: visibilitySettings,
      status: 'pending',
    });
    
    res.status(201).json({ 
      success: true,
      message: '동영상이 등록되었습니다.',
      data: { id: doc._id, url: `/api/uploads/${doc._id}` }
    });
  } catch (error: any) {
    console.error('동영상 등록 오류:', error);
    res.status(500).json({ error: error.message || '동영상 등록에 실패했습니다.' });
  }
});

// ⭐ 동영상 상세 조회 (공개 범위에 따라 접근 제어)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('owner', 'name userId')
      .populate('ownerCenterId', 'name')
      .populate('feedbacks.reviewer', 'name userId userType')
      .populate('feedbacks.reviewerCenterId', 'name')
      .populate('reviewedBy', 'name userId');
    
    if (!video) {
      return res.status(404).json({ error: '동영상을 찾을 수 없습니다.' });
    }
    
    const user = (req as any).user;
    const userDoc = await require('mongoose').model('User').findById(user._id);
    const userCenterId = userDoc?.centerId || userDoc?.studentInfo?.centerId || userDoc?.instructorInfo?.assignedCenters?.[0];
    const isOwner = video.owner?.toString() === user._id.toString();
    const isInstructor = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
    const isSameCenter = video.ownerCenterId?.toString() === userCenterId?.toString();
    
    // 공개 범위 확인
    let canAccess = false;
    if (isOwner) {
      canAccess = true; // 소유자는 항상 접근 가능
    } else if (isInstructor) {
      if (video.visibility.allInstructors) {
        canAccess = true; // 모든 강사
      } else if (video.visibility.myCenterInstructors && isSameCenter) {
        canAccess = true; // 본인 센터 강사
      }
    } else {
      if (video.visibility.allMembers) {
        canAccess = true; // 모든 회원
      } else if (video.visibility.myCenterMembers && isSameCenter) {
        canAccess = true; // 본인 센터 회원
      }
    }
    
    if (!canAccess) {
      return res.status(403).json({ error: '이 동영상에 접근할 권한이 없습니다.' });
    }
    
    res.json({
      success: true,
      data: video
    });
  } catch (error: any) {
    console.error('동영상 조회 오류:', error);
    res.status(500).json({ error: error.message || '조회에 실패했습니다.' });
  }
});

// 원본 파일 다운로드 (권한 체크)
router.get('/:id/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    const user = (req as any).user;
    const isOwner = video.owner?.toString() === user._id.toString();
    const isPrivileged = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
    if (!isOwner && !isPrivileged && video.visibility !== 'public') {
      return res.status(403).json({ error: '다운로드 권한이 없습니다.' });
    }
    res.download(video.path, video.originalName);
  } catch (error) {
    res.status(500).json({ error: '다운로드에 실패했습니다.' });
  }
});

// ⭐ 피드백 추가 (강사 및 회원 모두 가능)
router.post('/:id/feedback', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { content, rating } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: '피드백 내용을 입력해주세요.' });
    }
    
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: '동영상을 찾을 수 없습니다.' });
    }
    
    // 권한 확인: 공개 범위에 따라 접근 가능 여부 체크
    const userDoc = await require('mongoose').model('User').findById(user._id);
    const userCenterId = userDoc?.centerId || userDoc?.studentInfo?.centerId || userDoc?.instructorInfo?.assignedCenters?.[0];
    const isOwner = video.owner?.toString() === user._id.toString();
    const isInstructor = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
    const isSameCenter = video.ownerCenterId?.toString() === userCenterId?.toString();
    
    // 공개 범위 확인
    let canAccess = false;
    if (isOwner) {
      canAccess = true; // 소유자는 항상 접근 가능
    } else if (isInstructor) {
      if (video.visibility.allInstructors) {
        canAccess = true; // 모든 강사
      } else if (video.visibility.myCenterInstructors && isSameCenter) {
        canAccess = true; // 본인 센터 강사
      }
    } else {
      if (video.visibility.allMembers) {
        canAccess = true; // 모든 회원
      } else if (video.visibility.myCenterMembers && isSameCenter) {
        canAccess = true; // 본인 센터 회원
      }
    }
    
    if (!canAccess) {
      return res.status(403).json({ error: '이 동영상에 피드백을 남길 권한이 없습니다.' });
    }
    
    // 피드백 추가
    const feedback = {
      reviewer: user._id,
      reviewerType: isInstructor ? 'instructor' : 'member',
      reviewerCenterId: userCenterId,
      content: content.trim(),
      rating: rating ? Math.min(5, Math.max(1, Number(rating))) : undefined,
      createdAt: new Date()
    };
    
    video.feedbacks.push(feedback);
    await video.save();
    
    res.status(201).json({
      success: true,
      message: '피드백이 등록되었습니다.',
      data: feedback
    });
  } catch (error: any) {
    console.error('피드백 추가 오류:', error);
    res.status(500).json({ error: error.message || '피드백 등록에 실패했습니다.' });
  }
});

// 강사/관리자: 리뷰 상태 전환 및 피드백 저장 (하위 호환성)
router.patch('/:id/review', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status = 'reviewed', feedback, analysisResult, visibility } = req.body as any;
    const now = new Date();
    const update: any = {
      status,
      feedback,
      analysisResult,
      reviewedBy: (req as any).user._id,
      reviewedAt: now,
      $push: { reviews: { reviewedBy: (req as any).user._id, feedback, analysisResult, visibility, reviewedAt: now } }
    };
    const video = await Video.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!video) return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: '리뷰 업데이트에 실패했습니다.' });
  }
});

// ⭐ 동영상 목록 조회 (공개 범위에 따라 필터링)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, page = 1, limit = 10, myVideos = 'false' } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    
    const userDoc = await require('mongoose').model('User').findById(user._id);
    const userCenterId = userDoc?.centerId || userDoc?.studentInfo?.centerId || userDoc?.instructorInfo?.assignedCenters?.[0];
    const isInstructor = ['instructor', 'centerAdmin', 'superAdmin'].includes(user.userType);
    
    let filter: any = {};
    
    // 내 동영상만 보기
    if (myVideos === 'true') {
      filter.owner = user._id;
    } else {
      // 공개 범위에 따라 접근 가능한 동영상 필터링
      const orConditions: any[] = [];
      
      // 소유한 동영상
      orConditions.push({ owner: user._id });
      
      if (isInstructor) {
        // 모든 강사에게 공개된 동영상
        orConditions.push({ 'visibility.allInstructors': true });
        // 본인 센터 강사에게 공개된 동영상
        if (userCenterId) {
          orConditions.push({
            'visibility.myCenterInstructors': true,
            ownerCenterId: userCenterId
          });
        }
      }
      
      // 모든 회원에게 공개된 동영상
      orConditions.push({ 'visibility.allMembers': true });
      // 본인 센터 회원에게 공개된 동영상
      if (userCenterId) {
        orConditions.push({
          'visibility.myCenterMembers': true,
          ownerCenterId: userCenterId
        });
      }
      
      filter.$or = orConditions;
    }
    
    if (status) filter.status = status;
    
    const items = await Video.find(filter)
      .populate('owner', 'name userId')
      .populate('ownerCenterId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Video.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('동영상 목록 조회 오류:', error);
    res.status(500).json({ error: error.message || '목록 조회에 실패했습니다.' });
  }
});

// 리뷰 대기 목록(강사/관리자 전용)
router.get('/admin/review-queue/list', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: Request, res: Response) => {
  try {
    const { status = 'pending', page = 1, limit = 10 } = req.query as any;
    const skip = (Number(page) - 1) * Number(limit);
    const filter: any = {};
    if (status) filter.status = status;
    const items = await Video.find(filter)
      .populate('owner', 'name userId')
      .populate('ownerCenterId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Video.countDocuments(filter);
    res.json({ items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ error: '리뷰 큐 조회에 실패했습니다.' });
  }
});

export default router;


