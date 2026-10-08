import type { NextConfig } from "next";
import { readFileSync } from "node:fs";

// Single source of truth for the version: package.json (bumped by `npm run release:tag`)
const { version } = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

const nextConfig: NextConfig = {
  output: "standalone",
  env: { NEXT_PUBLIC_APP_VERSION: version },
  async redirects() {
    // Ancien « espace parent » devenu « espace enseignant »
    return [
      { source: '/parent', destination: '/enseignant', permanent: true },
      { source: '/parent/new', destination: '/enseignant/new', permanent: true },
    ];
  },
};

export default nextConfig;
