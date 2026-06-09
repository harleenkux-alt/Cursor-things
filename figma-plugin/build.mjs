import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes("--watch");
const dist = join(__dirname, "dist");

mkdirSync(dist, { recursive: true });

const shared = {
  bundle: true,
  sourcemap: false,
  logLevel: "info",
  alias: {
    "@": join(__dirname, "../src")
  }
};

const uiBuild = {
  ...shared,
  entryPoints: [join(__dirname, "ui/index.tsx")],
  outfile: join(dist, "ui.js"),
  format: "iife",
  platform: "browser",
  target: ["chrome90"],
  loader: { ".css": "css" },
  define: {
    "process.env.NODE_ENV": '"production"'
  }
};

const codeBuild = {
  ...shared,
  entryPoints: [join(__dirname, "code.ts")],
  outfile: join(dist, "code.js"),
  platform: "neutral",
  target: "es2017",
  define: {
    __html__: '""'
  }
};

function writeUiHtml() {
  const html = readFileSync(join(__dirname, "ui/index.html"), "utf8");
  writeFileSync(join(dist, "ui.html"), html);
}

async function run() {
  writeUiHtml();

  if (watch) {
    const uiCtx = await esbuild.context(uiBuild);
    const codeCtx = await esbuild.context(codeBuild);
    await uiCtx.watch();
    await codeCtx.watch();
    console.log("Watching figma-plugin...");
  } else {
    await esbuild.build(uiBuild);
    await esbuild.build(codeBuild);
    copyFileSync(join(__dirname, "manifest.json"), join(dist, "manifest.json"));
    console.log("Figma plugin built → figma-plugin/dist/");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
