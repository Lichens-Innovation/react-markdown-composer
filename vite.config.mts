import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import dts from "unplugin-dts/vite";
import { defineConfig, type UserConfig } from "vite";

interface PackageJsonDependencies {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const readPackageJson = (): PackageJsonDependencies => {
  const content = readFileSync(resolve(import.meta.dirname, "package.json"), "utf8");
  try {
    return JSON.parse(content) as PackageJsonDependencies;
  } catch (error: unknown) {
    throw new Error("Failed to parse package.json", { cause: error });
  }
};

const packageJson = readPackageJson();
const externalPackageNames = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
];

const isExternalPackage = (id: string): boolean => {
  if (id.includes("?")) return false;
  return externalPackageNames.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));
};

interface CssBuildAsset {
  name?: string;
  originalFileNames?: readonly string[];
}

const getCssAssetFileName = (asset: CssBuildAsset): string => {
  const sources = [...(asset.originalFileNames ?? []), asset.name ?? ""].join("/");
  if (sources.includes("frame-dark")) return "crepe-frame-dark.css";
  if (sources.includes("frame")) return "crepe-frame.css";
  return "[name][extname]";
};

const sharedResolve = {
  tsconfigPaths: true,
  extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
};

const playgroundConfig = (): UserConfig => ({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: sharedResolve,
});

const libraryConfig = (): UserConfig => ({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      entryRoot: "src",
      insertTypesEntry: true,
      exclude: ["src/playground/**", "src/**/*.test.ts", "src/**/*.test.tsx", "src/test-setup.ts"],
    }),
  ],
  resolve: sharedResolve,
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === "js") {
        return { runtime: `new URL(${JSON.stringify(`./${filename}`)}, import.meta.url).href` };
      }
    },
  },
  build: {
    copyPublicDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      fileName: "index",
      formats: ["es"],
    },
    rolldownOptions: {
      external: isExternalPackage,
      output: {
        assetFileNames: getCssAssetFileName,
      },
    },
  },
});

export default defineConfig(({ command }): UserConfig => {
  if (command === "serve") return playgroundConfig();
  return libraryConfig();
});
