"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnatomyQuestionGeneratorService = void 0;
class AnatomyQuestionGeneratorService {
    static generateQuestions(input) {
        const { textbookContent, minQuestions = 3 } = input;
        if (!textbookContent || textbookContent.trim().length === 0) {
            throw new Error('교재 내용이 필요합니다.');
        }
        const paragraphs = textbookContent
            .split(/\n\n+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
        const questions = [];
        const processedConcepts = new Set();
        for (const paragraph of paragraphs) {
            const keyTerms = this.extractKeyTerms(paragraph);
            for (const term of keyTerms) {
                if (processedConcepts.has(term))
                    continue;
                processedConcepts.add(term);
                const questionType = this.determineQuestionType(paragraph, term);
                const question = this.generateQuestionForTerm(paragraph, term, questionType);
                if (question) {
                    questions.push(question);
                }
                if (questions.length >= minQuestions * 2)
                    break;
            }
            if (questions.length >= minQuestions * 2)
                break;
        }
        if (questions.length < minQuestions) {
            const additionalQuestions = this.generateAdditionalQuestions(textbookContent, minQuestions - questions.length, processedConcepts);
            questions.push(...additionalQuestions);
        }
        return questions.slice(0, Math.max(minQuestions, Math.min(10, questions.length)));
    }
    static extractKeyTerms(paragraph) {
        const terms = [];
        const patterns = [
            /([가-힣]+(?:관절|근육|뼈|인대|힘줄|운동|작용|기능|역할|종류|분류|단계|순서|과정|메커니즘))/g,
            /([가-힣]+(?:굴곡|신전|내전|외전|회전|내회전|외회전|내측|외측))/g,
            /([가-힣]+(?:지레|모멘트|힘|저항|작용점|지지점))/g,
            /([가-힣]+(?:근육|수축|이완|수동적|능동적))/g,
        ];
        for (const pattern of patterns) {
            const matches = paragraph.match(pattern);
            if (matches) {
                terms.push(...matches.map(m => m.trim()));
            }
        }
        return [...new Set(terms)].filter(term => term.length >= 2 && term.length <= 20);
    }
    static determineQuestionType(paragraph, term) {
        const lowerParagraph = paragraph.toLowerCase();
        const lowerTerm = term.toLowerCase();
        if (paragraph.includes('공식') || paragraph.includes('계산') || paragraph.includes('=')) {
            return '공식';
        }
        if (paragraph.includes('순서') ||
            paragraph.includes('단계') ||
            paragraph.includes('과정') ||
            paragraph.includes('절차') ||
            /[0-9]+[\.\)]\s*[가-힣]/.test(paragraph)) {
            return '순서/단계';
        }
        if (paragraph.includes('종류') ||
            paragraph.includes('분류') ||
            paragraph.includes('유형') ||
            paragraph.includes('타입') ||
            paragraph.includes('종류로') ||
            paragraph.includes('나누어')) {
            return '분류/종류';
        }
        if (paragraph.includes('기능') ||
            paragraph.includes('역할') ||
            paragraph.includes('작용') ||
            paragraph.includes('효과')) {
            return '기능/역할';
        }
        return '개념 서술';
    }
    static generateQuestionForTerm(paragraph, term, questionType) {
        let question = '';
        let answer = '';
        switch (questionType) {
            case '개념 서술':
                question = `${term}에 대해 상세히 서술하시오.`;
                answer = this.extractConceptDescription(paragraph, term);
                break;
            case '분류/종류':
                question = `${term}의 종류(또는 분류)를 나열하고 각각에 대해 설명하시오.`;
                answer = this.extractClassification(paragraph, term);
                break;
            case '기능/역할':
                question = `${term}의 기능(또는 역할)을 설명하시오.`;
                answer = this.extractFunction(paragraph, term);
                break;
            case '순서/단계':
                question = `${term}의 과정(또는 단계)을 순서대로 설명하시오.`;
                answer = this.extractProcess(paragraph, term);
                break;
            case '공식':
                question = `${term}에 관련된 공식(또는 계산 방법)을 설명하시오.`;
                answer = this.extractFormula(paragraph, term);
                break;
        }
        if (!answer || answer.trim().length < 50) {
            return null;
        }
        const answerLines = answer.split('\n').filter(line => line.trim().length > 0);
        const limitedAnswer = answerLines.slice(0, 5).join('\n');
        return {
            핵심_키워드: term,
            문제_유형: questionType,
            주관식_질문: question,
            정답_상세_내용: limitedAnswer
        };
    }
    static extractConceptDescription(paragraph, term) {
        const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
        if (sentences.length === 0) {
            return paragraph.substring(0, 500);
        }
        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 10)
            .slice(0, 5)
            .join('. ') + '.';
    }
    static extractClassification(paragraph, term) {
        const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
        const items = [];
        for (const sentence of sentences) {
            if (/[0-9]+[\.\)]\s*/.test(sentence) || /[①②③④⑤]/.test(sentence)) {
                items.push(sentence.trim());
            }
        }
        if (items.length > 0) {
            return items.slice(0, 5).join('\n');
        }
        return sentences.slice(0, 5).map(s => s.trim()).join('\n');
    }
    static extractFunction(paragraph, term) {
        const sentences = paragraph
            .split(/[\.。]/)
            .filter(s => s.includes(term) && (s.includes('기능') || s.includes('역할') || s.includes('작용')));
        if (sentences.length === 0) {
            return this.extractConceptDescription(paragraph, term);
        }
        return sentences
            .map(s => s.trim())
            .filter(s => s.length > 10)
            .slice(0, 5)
            .join('. ') + '.';
    }
    static extractProcess(paragraph, term) {
        const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
        const numberedSentences = [];
        for (const sentence of sentences) {
            const numMatch = sentence.match(/([0-9]+)[\.\)]\s*(.+)/);
            if (numMatch) {
                numberedSentences.push({
                    num: parseInt(numMatch[1]),
                    text: numMatch[2].trim()
                });
            }
        }
        if (numberedSentences.length > 0) {
            numberedSentences.sort((a, b) => a.num - b.num);
            return numberedSentences
                .slice(0, 5)
                .map(item => `${item.num}. ${item.text}`)
                .join('\n');
        }
        return sentences
            .slice(0, 5)
            .map((s, i) => `${i + 1}. ${s.trim()}`)
            .join('\n');
    }
    static extractFormula(paragraph, term) {
        const sentences = paragraph.split(/[\.。]/).filter(s => s.includes(term));
        const formulaSentences = sentences.filter(s => /[=+\-*/]/.test(s) || s.includes('공식'));
        if (formulaSentences.length > 0) {
            return formulaSentences
                .map(s => s.trim())
                .slice(0, 5)
                .join('. ') + '.';
        }
        return this.extractConceptDescription(paragraph, term);
    }
    static generateAdditionalQuestions(fullText, count, processedConcepts) {
        const questions = [];
        const allTerms = this.extractKeyTerms(fullText);
        for (const term of allTerms) {
            if (processedConcepts.has(term))
                continue;
            if (questions.length >= count)
                break;
            processedConcepts.add(term);
            const questionType = this.determineQuestionType(fullText, term);
            const question = this.generateQuestionForTerm(fullText, term, questionType);
            if (question) {
                questions.push(question);
            }
        }
        return questions;
    }
}
exports.AnatomyQuestionGeneratorService = AnatomyQuestionGeneratorService;
//# sourceMappingURL=anatomyQuestionGeneratorService.js.map