import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    webpackMemoryOptimizations: true,
    devMemoryThresholdRestart: process.env.XARMOURED_DEMO_NAMESPACE !== 'e2e',
  },
  serverExternalPackages: ['@electric-sql/pglite'],
};
export default config;
