/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "localhost", 
      process.env.NEXT_PUBLIC_CDN_URL?.replace(/https?:\/\//, "") || "localhost:3315"
    ],
  },
};

export default nextConfig;
