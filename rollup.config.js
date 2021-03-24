import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
    {
      file: pkg.browser,
      name: "clarityPatternParser",
      format: "umd",
    },
  ],
  plugins: [typescript()],
};
