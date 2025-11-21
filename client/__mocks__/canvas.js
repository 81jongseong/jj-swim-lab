/**
 * Canvas 모듈 모킹
 * Jest 테스트 환경에서 canvas 모듈을 모킹하여 오류를 방지합니다.
 */

module.exports = {
  createCanvas: () => ({
    getContext: () => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Array(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    }),
    width: 0,
    height: 0,
    toDataURL: jest.fn(() => ''),
  }),
  loadImage: jest.fn(),
  Image: class MockImage {
    constructor() {
      this.width = 0;
      this.height = 0;
      this.src = '';
      this.onload = null;
      this.onerror = null;
    }
  },
};


