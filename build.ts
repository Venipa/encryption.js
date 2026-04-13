import { build } from "tsdown";

async function main() {
  await build({
    entry: ["./src/index.ts"],
    outDir: "./dist",
    format: ["esm", "cjs"],
    dts: {
      entry: ["./src/index.ts"],
    },
    tsconfig: "./tsconfig.json",
  });
}

main();