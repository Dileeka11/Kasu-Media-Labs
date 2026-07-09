import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static HTML export — produces a plain `out/` folder of HTML/CSS/JS that runs
  // on any shared/PHP hosting (Apache/cPanel) with no Node runtime. Content is
  // baked in at build time (great for SEO); the client then re-fetches the live
  // API so visitors still see the latest admin edits without a rebuild.
  output: 'export',
  trailingSlash: true,
  // Required for `output: 'export'` — we use plain <img>, so nothing to optimize.
  images: { unoptimized: true },
};

export default nextConfig;
