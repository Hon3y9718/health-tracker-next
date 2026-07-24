import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB. Meal/weight photos are compressed client-side to a few hundred KB,
      // but this gives headroom for HEIC conversions and slower devices without risking a
      // "Body exceeded 1 MB limit" error on submit.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
