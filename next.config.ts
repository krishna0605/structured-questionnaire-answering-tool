import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['pdf-parse', 'xlsx', 'pdfjs-dist'],
};

export default nextConfig;
