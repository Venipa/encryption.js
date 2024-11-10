import { copyFileSync } from 'fs'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  cjsInterop: true,
  async onSuccess() {
    copyFileSync("./package.json", "dist/package.json")
    copyFileSync("./README.md", "dist/readme.md")
  },
})