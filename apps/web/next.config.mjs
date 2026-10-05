import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@app/ui', '@app/common'],
  experimental: {
    // `@app/ui` is a single barrel re-exporting Mantine, recharts, leaflet and
    // swiper. Without this, importing a button pulls all of it into the first
    // load — costly on a landing page opened on a slow mobile connection.
    optimizePackageImports: ['@app/ui', 'lucide-react'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    // Illustrations are served at 85; everything else keeps the default 75.
    qualities: [75, 85],
    // Add `remotePatterns` here for images served from your storage bucket or CDN.
  },

  // SVG and TypeScript module resolution configuration
  webpack(config, { dev }) {
    config.resolve = config.resolve || {}
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    }

    // Only apply this webpack config when not using turbopack
    if (!dev) {
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg'),
      )

      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
          use: ['@svgr/webpack'],
        },
      )

      fileLoaderRule.exclude = /\.svg$/i
    }

    return config
  },
}

export default withNextIntl(nextConfig)
