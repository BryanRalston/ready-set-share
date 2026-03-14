import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === '1';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGitHubPages ? '/ready-set-share' : '',
  assetPrefix: isGitHubPages ? '/ready-set-share/' : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    // Type checking is done separately via `tsc`; skip during build to avoid
    // OOM in the TS-check worker when heavy deps (recharts, framer-motion,
    // react-icons, @google/generative-ai) are all in play.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Limit build workers to prevent OOM when bundling heavy deps
    // (recharts, framer-motion, react-icons, @google/generative-ai).
    // Default uses all CPUs which can exhaust memory on constrained systems.
    cpus: 1,
  },
};

export default nextConfig;
