import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home directory would
  // otherwise be picked up as the monorepo root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
