"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizQuestionGeneratorService = void 0;
class QuizQuestionGeneratorService {
    static generateQuestionFromPools(input) {
        if (!input.correctPool || input.correctPool.length < 4) {
            throw new Error('정답 Pool은 최소 4개 이상이어야 합니다.');
        }
        if (!input.incorrectPool || input.incorrectPool.length < 4) {
            throw new Error('오답 Pool은 최소 4개 이상이어야 합니다.');
        }
        const optionCount = input.optionCount || 4;
        const questionType = input.type || '정답찾기';
        if (questionType === '정답찾기') {
            return this.generateCorrectVersion(input, optionCount);
        }
        else {
            return this.generateIncorrectVersion(input, optionCount);
        }
    }
    static generateCorrectVersion(input, optionCount) {
        const correctAnswer = this.selectRandom(input.correctPool);
        const incorrectPoolStrings = input.incorrectPool.map(item => typeof item === 'string' ? item : item.option);
        const incorrectOptions = this.selectRandomMultiple(incorrectPoolStrings, optionCount - 1);
        const allOptions = this.shuffleArray([correctAnswer, ...incorrectOptions]);
        const correctAnswerIndex = allOptions.indexOf(correctAnswer);
        const questionText = input.typeVariants?.correctVersion?.instruction || '다음 중 옳은 것은?';
        const solution = input.originalExplanation?.summary || '';
        const keyPoints = input.originalExplanation?.keyPoints || [];
        return {
            id: input.id,
            topic: input.topic,
            question: questionText,
            type: '정답찾기',
            options: allOptions,
            correctAnswer: correctAnswerIndex,
            explanation: `정답: ${correctAnswerIndex + 1}번. ${correctAnswer}`,
            solution: solution + (keyPoints.length > 0 ? '\n\n핵심 포인트:\n' + keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n') : ''),
            sourcePools: {
                correctPool: input.correctPool,
                incorrectPool: input.incorrectPool.map(item => typeof item === 'string' ? item : item.option)
            }
        };
    }
    static generateIncorrectVersion(input, optionCount) {
        const incorrectPoolStrings = input.incorrectPool.map(item => typeof item === 'string' ? item : item.option);
        const incorrectAnswer = this.selectRandom(incorrectPoolStrings);
        const correctOptions = this.selectRandomMultiple(input.correctPool, optionCount - 1);
        const allOptions = this.shuffleArray([incorrectAnswer, ...correctOptions]);
        const incorrectAnswerIndex = allOptions.indexOf(incorrectAnswer);
        const questionText = input.typeVariants?.incorrectVersion?.instruction || '다음 중 옳지 않은 것은?';
        const solution = input.originalExplanation?.summary || '';
        const keyPoints = input.originalExplanation?.keyPoints || [];
        return {
            id: input.id,
            topic: input.topic,
            question: questionText,
            type: '오답찾기',
            options: allOptions,
            correctAnswer: incorrectAnswerIndex,
            explanation: `정답: ${incorrectAnswerIndex + 1}번. ${incorrectAnswer}는 잘못된 설명입니다.`,
            solution: solution + (keyPoints.length > 0 ? '\n\n핵심 포인트:\n' + keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join('\n') : ''),
            sourcePools: {
                correctPool: input.correctPool,
                incorrectPool: input.incorrectPool.map(item => typeof item === 'string' ? item : item.option)
            }
        };
    }
    static generateMultipleQuestions(input, count = 5) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const question = this.generateQuestionFromPools({
                ...input,
                id: `${input.id}_${i + 1}`
            });
            questions.push(question);
        }
        return questions;
    }
    static selectRandom(array) {
        if (array.length === 0) {
            throw new Error('배열이 비어있습니다.');
        }
        return array[Math.floor(Math.random() * array.length)];
    }
    static selectRandomMultiple(array, count) {
        if (array.length < count) {
            throw new Error(`배열의 길이(${array.length})가 요청한 개수(${count})보다 작습니다.`);
        }
        const shuffled = this.shuffleArray([...array]);
        return shuffled.slice(0, count);
    }
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
exports.QuizQuestionGeneratorService = QuizQuestionGeneratorService;
//# sourceMappingURL=quizQuestionGeneratorService.js.map