/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'raw.githubusercontent.com', // PokeAPI sprites
      'assets.pokemon.com',
      'supabase.co'
    ],
  },
  // パフォーマンス最適化
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig