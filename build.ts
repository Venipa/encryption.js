import { build } from "tsdown";

async function main() {
  await build({
    entry: ["./src/index.ts"],
    outDir: "./dist",
    format: ["esm", "cjs"],
    dts: true,
    tsconfig: "./tsconfig.json",
    deps: {
      neverBundle: ["node:crypto", "node:buffer"],
    }
  });
}

main();