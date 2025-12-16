export interface AnatomyQuestionInput {
    textbookContent: string;
    section?: string;
    topic?: string;
    minQuestions?: number;
}
export interface AnatomyQuestion {
    핵심_키워드: string;
    문제_유형: '개념 서술' | '분류/종류' | '기능/역할' | '순서/단계' | '공식';
    주관식_질문: string;
    정답_상세_내용: string;
}
export declare class AnatomyQuestionGeneratorService {
    static generateQuestions(input: AnatomyQuestionInput): AnatomyQuestion[];
    private static extractKeyTerms;
    private static determineQuestionType;
    private static generateQuestionForTerm;
    private static extractConceptDescription;
    private static extractClassification;
    private static extractFunction;
    private static extractProcess;
    private static extractFormula;
    private static generateAdditionalQuestions;
}
//# sourceMappingURL=anatomyQuestionGeneratorService.d.ts.map