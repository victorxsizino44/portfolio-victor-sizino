/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/cases/case-porto-seguro-setur",
        destination: "/cases/case-portal-turismo-setur",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
