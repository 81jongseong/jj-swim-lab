/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 설정 - 빌드 시 타입 체크 활성화
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 설정 - 빌드 시 린팅 활성화
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 압축 설정
  compress: true,

  // 트래일링 슬래시 제거
  trailingSlash: false,

  // 실험적 기능 활성화
  experimental: {
    // TypeScript 자동 설정 활성화
    typedRoutes: true,
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['mongoose'],
  },

  // 이미지 최적화
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 추가 이미지 최적화
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐시
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 웹팩 설정 최적화
  webpack: (config, { dev, isServer }) => {
    // 프로덕션 빌드 최적화
    if (!dev && !isServer) {
      // 번들 분할 최적화
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
          // React 관련 라이브러리 별도 분할
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // UI 라이브러리 별도 분할
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
        },
      };

      // 압축 최적화
      config.optimization.minimize = true;
      config.optimization.minimizer = config.optimization.minimizer || [];
      
      // Tree Shaking 강화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // 번들 분석기 설정
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        })
      );
    }

    return config;
  },

  // 헤더 설정
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/instructor',
        destination: '/instructor/dashboard',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
