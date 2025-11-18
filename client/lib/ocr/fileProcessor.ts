/**
 * 📄 파일 처리 유틸리티
 * 
 * PDF 및 이미지 파일을 처리하여 OCR에 사용할 수 있는 형식으로 변환합니다.
 */

// PDF.js는 동적 import로 로드 (Next.js 호환성)
let pdfjsLib: any = null;

async function loadPdfjs() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    const pdfjs = await import('pdfjs-dist');
    pdfjsLib = pdfjs;
    // Worker 설정
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.js`;
    }
  }
  return pdfjsLib;
}

/**
 * PDF 파일을 이미지로 변환합니다.
 */
export async function pdfToImage(file: File): Promise<string[]> {
  if (typeof window === 'undefined') {
    throw new Error('PDF 처리는 클라이언트 사이드에서만 가능합니다.');
  }

  const pdfjs = await loadPdfjs();
  if (!pdfjs) {
    throw new Error('PDF.js를 로드할 수 없습니다.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    images.push(canvas.toDataURL('image/png'));
  }

  return images;
}

/**
 * 이미지 파일을 Base64로 변환합니다.
 */
export async function imageToBase64(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('이미지 처리는 클라이언트 사이드에서만 가능합니다.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 파일을 이미지 데이터로 변환합니다.
 */
export async function fileToImage(file: File): Promise<string[]> {
  if (file.type === 'application/pdf') {
    return await pdfToImage(file);
  } else if (file.type.startsWith('image/')) {
    const base64 = await imageToBase64(file);
    return [base64];
  } else {
    throw new Error('지원하지 않는 파일 형식입니다. PDF 또는 이미지 파일을 업로드해주세요.');
  }
}

/**
 * Base64 이미지를 Image 객체로 변환합니다.
 */
export function base64ToImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

