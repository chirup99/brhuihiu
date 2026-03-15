import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

// Native Node.js addons cannot be bundled by esbuild — they must be
// listed here as external so esbuild leaves require() calls intact.
// bufferutil ships a native .node binding (binding.gyp / prebuilds/).
// bcrypt (native) is NOT used — the project uses bcryptjs (pure-JS),
// so it does NOT need to be listed here.
const nativeModules: string[] = ["bufferutil"];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: nativeModules,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
