export declare function calculatePaceFromCSS(cssPer100: number, intensity: 'recovery' | 'easy' | 'moderate' | 'hard' | 'very_hard'): string;
export declare function generateAdvancedCSSProgram(memberData: {
    currentLevel: string;
    cssPer100?: Record<string, number>;
    mainStrokes: string[];
    excludedStrokes: string[];
    poolLength: number;
    sessionDuration: number;
    goal: string;
}): {
    summary: string;
    planExplanation: string;
    totalDuration: number;
    totalMeters: number;
    sessions: Array<{
        day: string;
        date?: string;
        themeDesc?: string;
        duration: number;
        distance: number;
        intensity: string;
        blocks: Array<{
            type: string;
            description: string;
            duration: number;
            distance: number;
            whyPace?: string;
            whyRest?: string;
            whySet?: string;
            evidenceKeys?: string[];
        }>;
    }>;
};
export declare function generateProgramByLevel(memberData: {
    currentLevel: string;
    cssPer100?: Record<string, number>;
    mainStrokes: string[];
    excludedStrokes: string[];
    poolLength: number;
    sessionDuration: number;
    goal: string;
}): any;
//# sourceMappingURL=advancedProgramGenerator.d.ts.map