import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: false,
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
})