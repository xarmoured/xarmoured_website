import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    webpackMemoryOptimizations: true,
    devMemoryThresholdRestart: process.env.XARMOURED_DEMO_NAMESPACE !== 'e2e',
  },
  serverExternalPackages: ['@electric-sql/pglite'],
  async redirects() {
    return [
      // /industries is the canonical Solutions route; /solutions is supported as a redirect.
      { source: '/solutions', destination: '/industries', permanent: true },
      // /security is the canonical disclosure route.
      { source: '/responsible-disclosure', destination: '/security', permanent: true },
    ];
  },
};
export default config;
