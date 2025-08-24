/** @type {import('next').NextConfig} */
const nextConfig = {
  // 성능 최적화
  experimental: {
    optimizeCss: true,
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
    
    // Tree Shaking 최적화
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };
    
    return config;
  },
  
  // 압축 최적화
  compress: true,
  
  // 정적 최적화
  swcMinify: true,
  
  // PWA 지원 (선택사항)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

module.exports = nextConfig;
