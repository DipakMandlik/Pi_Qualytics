// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit', 'snowflake-sdk'],
}

export default nextConfig