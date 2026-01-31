/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.infrastructureLogging = { level: 'error' };
    config.ignoreWarnings = [
      (warning) =>
        typeof warning.message === 'string' &&
        warning.message.includes('PackFileCacheStrategy/webpack.FileSystemInfo') &&
        warning.message.includes('typescript/lib/typescript')
    ];
    return config;
  },
}

module.exports = nextConfig
