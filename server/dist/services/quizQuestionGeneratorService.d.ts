export interface QuestionPoolInput {
    id: string;
    topic: string;
    conceptBlock?: {
        title?: string;
        theory?: string[];
    };
    originalExplanation?: {
        summary?: string;
        keyPoints?: string[];
    };
    correctPool: string[];
    incorrectPool: Array<string | {
        option: string;
        whyIncorrect?: string;
    }>;
    typeVariants?: {
        correctVersion?: {
            instruction?: string;
            exampleOptions?: string[];
            exampleAnswer?: number;
        };
        incorrectVersion?: {
            instruction?: string;
            exampleOptions?: string[];
            exampleAnswer?: number;
        };
    };
    optionCount?: number;
    type?: '정답찾기' | '오답찾기';
}
export interface GeneratedQuestion {
    id: string;
    topic: string;
    question: string;
    type: '정답찾기' | '오답찾기';
    options: string[];
    correctAnswer: number;
    explanation: string;
    solution?: string;
    sourcePools: {
        correctPool: string[];
        incorrectPool: string[];
    };
}
export declare class QuizQuestionGeneratorService {
    static generateQuestionFromPools(input: QuestionPoolInput): GeneratedQuestion;
    private static generateCorrectVersion;
    private static generateIncorrectVersion;
    static generateMultipleQuestions(input: QuestionPoolInput, count?: number): GeneratedQuestion[];
    private static selectRandom;
    private static selectRandomMultiple;
    private static shuffleArray;
}
//# sourceMappingURL=quizQuestionGeneratorService.d.ts.map