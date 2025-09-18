/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기본 설정으로 안정성 확보
  trailingSlash: false,
  generateEtags: false,
  
  // 성능 최적화 (기본)
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // 이미지 최적화 (기본)
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // 압축 최적화
  compress: true,
  
  // 정적 최적화
  swcMinify: true,
  
  // 모바일 최적화
  poweredByHeader: false,
};

module.exports = nextConfig;