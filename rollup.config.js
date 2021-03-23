import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    name: "main",
    format: "umd",
  },
  plugins: [typescript()],
};
