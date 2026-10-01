/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['de', 'en', 'es', 'fil', 'fr', 'hi', 'it', 'ko', 'ms', 'pt', 'ru', 'th', 'uk'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
