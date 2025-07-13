/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/github',
        destination: 'https://github.com/WilsonLimSet/CoffeeChatAI',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
