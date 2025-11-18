/**
 * 🔍 OCR 처리 유틸리티
 * 
 * Tesseract.js를 사용하여 이미지에서 텍스트를 추출합니다.
 * 클라이언트 사이드에서만 실행됩니다.
 */

/**
 * 파일에서 OCR을 수행하여 텍스트를 추출합니다.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('OCR 처리는 클라이언트 사이드에서만 가능합니다.');
  }

  try {
    // 동적 import로 클라이언트 사이드에서만 로드
    const [{ createWorker }, { fileToImage }] = await Promise.all([
      import('tesseract.js'),
      import('./fileProcessor')
    ]);
    
    // 이미지로 변환
    const images = await fileToImage(file);
    
    // Tesseract.js worker 생성
    const worker = await createWorker('kor+eng'); // 한국어 + 영어
    
    let allText = '';
    
    // 각 이미지에서 텍스트 추출
    for (const imageData of images) {
      const { data: { text } } = await worker.recognize(imageData);
      allText += text + '\n';
    }
    
    await worker.terminate();
    
    return allText;
  } catch (error) {
    console.error('OCR 처리 중 오류 발생:', error);
    throw new Error('텍스트 추출에 실패했습니다. 파일 형식과 품질을 확인해주세요.');
  }
}

