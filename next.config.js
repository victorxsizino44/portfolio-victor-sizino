/** @type {import('next').NextConfig} */
const mold3Delivery = require("./app/data/mold3-cloudinary.json");
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "res.cloudinary.com",
      pathname: `/${mold3Delivery.cloudName}/image/upload/**`,
      search: "",
    }],
  },
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
