import { defineConfig } from 'rollup';
import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import { terser } from 'rollup-plugin-terser';


const dev = process.env.ROLLUP_WATCH ? true : false;


const typescriptOptions = {
  sourceMap: dev,
};
const serveOptions = {
  contentBase: ["./dist", "./"],
  host: "0.0.0.0",
  port: 3000,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
};
const terserOptions = {
  format: {
    comments: false
  }
};

export default defineConfig(
  [
    {
      input: "src/swipe-navigation.ts",
      output: {
        dir: "dist",
        format: "es",
        sourcemap: dev,
      },
      watch:{
        chokidar: {
          // Workaround for WSL2-based Docker
          usePolling: true,
        }
      },
      plugins: [
        typescript(typescriptOptions),
        nodeResolve(),
        // Serve or Uglify based on develop or release
        dev ?
          serve(serveOptions)
          : terser(terserOptions),
      ]
    },
  ]
);
