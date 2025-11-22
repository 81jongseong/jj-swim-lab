"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const teachingMethodToProgramConverter_1 = require("../utils/teachingMethodToProgramConverter");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { athleteId, athleteName, centerId, programType, programScope, groupClassId, groupClassName, params, content, usedMethodIds, useTeachingMethod } = req.body;
        const user = await User_1.User.findById(athleteId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const currentLevel = user.studentInfo?.currentLevel || 'beginner';
        const rawCSS = user.studentInfo?.swimmingProfile?.css || {};
        const cssPer100 = {};
        if (rawCSS.freestyle)
            cssPer100.freestyle = rawCSS.freestyle;
        if (rawCSS.backstroke)
            cssPer100.backstroke = rawCSS.backstroke;
        if (rawCSS.breaststroke)
            cssPer100.breaststroke = rawCSS.breaststroke;
        if (rawCSS.butterfly)
            cssPer100.butterfly = rawCSS.butterfly;
        const mainStrokes = user.studentInfo?.swimmingProfile?.mainStrokes || ['freestyle'];
        const excludedStrokes = user.studentInfo?.swimmingProfile?.excludedStrokes || [];
        const poolLength = user.studentInfo?.swimmingProfile?.poolLength || 25;
        const sessionDuration = user.studentInfo?.swimmingProfile?.sessionDuration || 60;
        const goal = params?.goal || '체력 향상';
        let generatedContent = null;
        if (['advanced', 'advanced_1', 'advanced_2', 'master', 'expert'].includes(currentLevel)) {
            const hasCSS = Object.values(cssPer100).length > 0;
            if (hasCSS) {
                console.log('🎯 수영 엔진 v3.1을 사용한 고급 프로그램 생성 시작');
                const engineInput = {
                    weeklyMinutes: sessionDuration * 3,
                    weeklyMeters: 0,
                    days: ['화요일', '목요일', '토요일'],
                    goal: goal,
                    mainStrokes: mainStrokes,
                    excludedStrokes: excludedStrokes,
                    css100: cssPer100,
                    pool: poolLength,
                    conditions: [],
                    weekHistory: []
                };
                console.log('⚠️ 수영 엔진 v3.1 호출 필요:', engineInput);
                generatedContent = (0, teachingMethodToProgramConverter_1.generateDefaultTechniqueProgram)(currentLevel, mainStrokes, poolLength, sessionDuration);
                console.log('✅ 임시 기본 프로그램 생성 완료:', generatedContent?.summary);
            }
        }
        if (!generatedContent && useTeachingMethod === true) {
            const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];
            const preferredStrokes = user.studentInfo?.swimmingProfile?.preferredStrokes || ['freestyle'];
            console.log('📚 강습법 기반 프로그램 생성 시작');
            generatedContent = await (0, teachingMethodToProgramConverter_1.generateProgramFromTeachingMethod)(athleteId, teachingProgress, {
                currentLevel,
                preferredStrokes,
                poolLength,
                sessionDuration
            });
            console.log('✅ 강습법 기반 프로그램 생성 완료:', generatedContent?.summary);
        }
        if (!generatedContent) {
            console.log('🔧 기본 기술 프로그램 생성');
            generatedContent = (0, teachingMethodToProgramConverter_1.generateDefaultTechniqueProgram)(currentLevel, mainStrokes, poolLength, sessionDuration);
        }
        if (generatedContent) {
            Object.assign(content, generatedContent);
        }
        if (!athleteId || !athleteName || !params || !content) {
            return res.status(400).json({
                error: '필수 필드가 누락되었습니다.',
                required: ['athleteId', 'athleteName', 'params', 'content']
            });
        }
        const scope = programScope || (groupClassId ? 'group' : 'individual');
        const program = new SwimProgram_1.default({
            athleteId,
            athleteName,
            groupClassId,
            groupClassName,
            centerId,
            programType: programType || 'weekly',
            programScope: scope,
            params,
            content,
            usedMethodIds: usedMethodIds || [],
            executionHistory: []
        });
        await program.save();
        res.status(201).json({
            message: '프로그램이 저장되었습니다.',
            programId: program._id,
            usedMethodIds: program.usedMethodIds
        });
    }
    catch (error) {
        (0, logger_1.logError)('프로그램 저장 실패', error);
        res.status(500).json({ error: '프로그램 저장에 실패했습니다.', details: error.message });
    }
});
router.get('/athlete/:athleteId/history', auth_1.authMiddleware, async (req, res) => {
    try {
        const { athleteId } = req.params;
        const threeWeeksAgo = new Date();
        threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
        const programs = await SwimProgram_1.default.find({
            athleteId,
            createdAt: { $gte: threeWeeksAgo }
        })
            .sort({ createdAt: -1 })
            .select('usedMethodIds params.startDate')
            .limit(3);
        const usedMethodIds = programs.flatMap(p => p.usedMethodIds);
        const uniqueMethodIds = [...new Set(usedMethodIds)];
        res.json({
            weekHistory: uniqueMethodIds,
            recentPrograms: programs.map(p => ({
                id: p._id,
                startDate: p.params.startDate,
                methodIds: p.usedMethodIds
            }))
        });
    }
    catch (error) {
        (0, logger_1.logError)('이력 조회 실패', error);
        res.status(500).json({ error: '이력 조회에 실패했습니다.', details: error.message });
    }
});
router.get('/all', auth_1.authMiddleware, async (req, res) => {
    try {
        const currentUser = req.user;
        const { limit = 100, search } = req.query;
        const query = {};
        if (currentUser.userType === 'centerAdmin' && currentUser.centerId) {
            query.centerId = currentUser.centerId;
        }
        if (search && typeof search === 'string') {
            query.athleteName = { $regex: search, $options: 'i' };
        }
        const programs = await SwimProgram_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('-__v');
        res.json({
            count: programs.length,
            programs
        });
    }
    catch (error) {
        (0, logger_1.logError)('전체 프로그램 조회 실패', error);
        res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
    }
});
router.get('/athlete/:athleteId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { athleteId } = req.params;
        const { limit = 10 } = req.query;
        const programs = await SwimProgram_1.default.find({ athleteId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .select('-__v');
        res.json({
            count: programs.length,
            programs
        });
    }
    catch (error) {
        (0, logger_1.logError)('프로그램 조회 실패', error);
        res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
    }
});
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const program = await SwimProgram_1.default.findById(id).select('-__v');
        if (!program) {
            return res.status(404).json({ error: '프로그램을 찾을 수 없습니다.' });
        }
        res.json(program);
    }
    catch (error) {
        (0, logger_1.logError)('프로그램 조회 실패', error);
        res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
    }
});
router.patch('/:id/execution', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, dayOfWeek, condition, hasPain, adjustedPace, adjustedRest, notes, completed, rpe } = req.body;
        if (!date || !dayOfWeek) {
            return res.status(400).json({
                error: '필수 필드가 누락되었습니다.',
                required: ['date', 'dayOfWeek']
            });
        }
        const program = await SwimProgram_1.default.findById(id);
        if (!program) {
            return res.status(404).json({ error: '프로그램을 찾을 수 없습니다.' });
        }
        const existingIndex = program.executionHistory.findIndex(h => h.date === date && h.dayOfWeek === dayOfWeek);
        const executionRecord = {
            date,
            dayOfWeek,
            condition: condition || 'normal',
            hasPain: hasPain || false,
            rpe: typeof rpe === 'number' ? rpe : undefined,
            adjustedPace,
            adjustedRest,
            notes,
            completed: completed || false
        };
        if (existingIndex >= 0) {
            program.executionHistory[existingIndex] = executionRecord;
        }
        else {
            program.executionHistory.push(executionRecord);
        }
        await program.save();
        res.json({
            message: '실행 기록이 업데이트되었습니다.',
            executionHistory: program.executionHistory
        });
    }
    catch (error) {
        (0, logger_1.logError)('실행 기록 업데이트 실패', error);
        res.status(500).json({ error: '실행 기록 업데이트에 실패했습니다.', details: error.message });
    }
});
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, params } = req.body;
        console.log(`✏️ 프로그램 수정 요청: ${id}`);
        const program = await SwimProgram_1.default.findById(id);
        if (!program) {
            console.log(`❌ 프로그램 없음: ${id}`);
            return res.status(404).json({ success: false, error: '프로그램을 찾을 수 없습니다.' });
        }
        if (content) {
            program.content = content;
        }
        if (params) {
            program.params = { ...program.params, ...params };
        }
        await program.save();
        console.log(`✅ 프로그램 수정 성공: ${id}`);
        res.json({
            success: true,
            message: '프로그램이 수정되었습니다.',
            data: program
        });
    }
    catch (error) {
        (0, logger_1.logError)('프로그램 수정 실패', error);
        res.status(500).json({ success: false, error: '프로그램 수정에 실패했습니다.', details: error.message });
    }
});
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ 프로그램 삭제 요청: ${id}`);
        const result = await SwimProgram_1.default.findByIdAndDelete(id);
        if (!result) {
            console.log(`❌ 프로그램 없음: ${id}`);
            return res.status(404).json({ success: false, error: '프로그램을 찾을 수 없습니다.' });
        }
        console.log(`✅ 프로그램 삭제 성공: ${id}`);
        res.json({ success: true, message: '프로그램이 삭제되었습니다.' });
    }
    catch (error) {
        (0, logger_1.logError)('프로그램 삭제 실패', error);
        res.status(500).json({ success: false, error: '프로그램 삭제에 실패했습니다.', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=swim-programs.js.map