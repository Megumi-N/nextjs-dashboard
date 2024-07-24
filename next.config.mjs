/** @type {import('next').NextConfig} */

const nextConfig = {
  /** @memo https://nextjs.org/learn/dashboard-app/partial-prerendering#how-does-partial-prerendering-work */
  // ルートの静的部分を事前にレンダリングし、動的な部分をユーザーが要求するまで延期。
  experimental: {
    ppr: 'incremental',
  },
};

export default nextConfig;
