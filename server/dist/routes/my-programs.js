"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const PersonalProgramAdjustment_1 = __importDefault(require("../models/PersonalProgramAdjustment"));
const GroupClass = require('../models/GroupClass').default;
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`🔍 프로그램 조회: ${req.user.name} (${userId})`);
        const allPrograms = [];
        const individualPrograms = await SwimProgram_1.default.find({
            athleteId: userId,
            programScope: 'individual'
        }).sort({ createdAt: -1 }).limit(10);
        console.log(`  🏊 개인 PT 프로그램: ${individualPrograms.length}개`);
        individualPrograms.forEach(p => {
            allPrograms.push({
                ...p.toObject(),
                programSource: 'individual',
                displayName: `${p.athleteName} (개인 PT)`,
                adjustment: null
            });
        });
        const myGroupClasses = await GroupClass.find({
            'students.userId': userId,
            status: 'active'
        });
        console.log(`  📚 소속 단체반: ${myGroupClasses.length}개`);
        for (const gc of myGroupClasses) {
            const groupPrograms = await SwimProgram_1.default.find({
                groupClassId: gc._id,
                programScope: 'group'
            }).sort({ createdAt: -1 }).limit(5);
            console.log(`    - ${gc.className}: ${groupPrograms.length}개 프로그램`);
            for (const gp of groupPrograms) {
                const adjustment = await PersonalProgramAdjustment_1.default.findOne({
                    programId: gp._id,
                    userId
                });
                allPrograms.push({
                    ...gp.toObject(),
                    programSource: 'group',
                    displayName: `${gc.className} (단체반)`,
                    adjustment: adjustment ? adjustment.toObject() : null
                });
            }
        }
        allPrograms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        console.log(`✅ 총 ${allPrograms.length}개 프로그램 조회 완료`);
        return res.json({
            success: true,
            data: {
                programs: allPrograms,
                total: allPrograms.length,
                individual: individualPrograms.length,
                group: allPrograms.length - individualPrograms.length
            }
        });
    }
    catch (error) {
        console.error('❌ 프로그램 조회 실패:', error);
        return res.status(500).json({
            success: false,
            message: '프로그램 조회에 실패했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=my-programs.js.map