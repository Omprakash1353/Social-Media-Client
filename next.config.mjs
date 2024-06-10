// @ts-check
import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lucide-react"],
  images: {
    remotePatterns: [{ hostname: "images.unsplash.com" }, {hostname: "res.cloudinary.com" }],
  },
};

export default withPlaiceholder(nextConfig);

