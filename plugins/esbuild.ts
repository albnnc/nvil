import * as esbuild from "https://deno.land/x/esbuild@v0.15.10/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
import { Plugin } from "../plugin.ts";

export interface EsbuildPluginOptions extends Partial<esbuild.BuildOptions> {
  importMapURL?: string;
}

export function createEsbuildPlugin({
  importMapURL,
  ...rest
}: EsbuildPluginOptions = {}): Plugin {
  return {
    onBuild: async ({ entryPoint, dev, root, bundle }) => {
      const { outputFiles } = await esbuild.build({
        entryPoints: [entryPoint],
        write: false,
        bundle: true,
        minify: !dev,
        plugins: [
          denoPlugin({
            importMapURL: importMapURL ? new URL(importMapURL) : undefined,
          }),
        ],
        ...rest,
      });
      esbuild.stop();
      const indexJs = outputFiles?.find((v) => v.path === "<stdout>");
      if (!indexJs) {
        return;
      }
      const relativePath =
        "./" + entryPoint.replace(root, "").replace(/.(j|t)sx?/, ".js");
      bundle.set(relativePath, { data: indexJs.contents });
    },
  };
}
