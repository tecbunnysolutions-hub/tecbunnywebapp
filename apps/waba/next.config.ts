import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tecbunny/core", "@tecbunny/ui", "@tecbunny/database"],
};

export default nextConfig;
