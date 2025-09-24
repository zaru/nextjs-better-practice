import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";
import type { NextConfig } from "next";

// 環境変数が設定されているかチェック
const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
};

export default nextConfig;
