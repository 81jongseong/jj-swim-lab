/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 파일 경로 설정
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  

  
  // 번들 분석기
  webpack: (config, { isServer, dev }) => {
    // 번들 분석기 (개발 환경에서만)
    if (!isServer && !dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: './bundle-report.html',
        })
      );
    }
    
    return config;
  },
  
  // 압축 최적화
  compress: true,
  
  // 정적 최적화
  swcMinify: true,
  
  // 모바일 최적화
  poweredByHeader: false,
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
