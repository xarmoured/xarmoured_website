import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['lucide-react', 'recharts'] },
  serverExternalPackages: ['@electric-sql/pglite'],
};
export default config;
