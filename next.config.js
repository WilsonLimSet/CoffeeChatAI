/** @type {import('next').NextConfig} */
const nextConfig = {
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
