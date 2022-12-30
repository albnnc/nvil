import { Atom } from "../atom.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.15.10/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
import { watchModule } from "../utils/watch_module.ts";
import { async, log } from "../deps.ts";
import { completePath } from "../utils/complete_path.ts";

export interface BuildConfig {
  scope?: string;
  esbuildOptions?: esbuild.BuildOptions;
}

export function build(
  entryPoint: string,
  { scope, esbuildOptions }: BuildConfig = {}
): Atom {
  return ({ config: { dev, rootDir, importMapUrl }, bundle, on, run }) => {
    const completeEntryPoint = completePath(entryPoint, rootDir);
    const handle = async () => {
      log.info(`Building ${entryPoint}`);
      await run("BUILD_START", completeEntryPoint);
      const { outputFiles } = await esbuild.build({
        entryPoints: [completeEntryPoint],
        write: false,
        bundle: true,
        minify: !dev,
        target: "es2020",
        platform: "browser",
        format: "esm",
        logLevel: "error",
        define: {
          "import.meta.main": "false",
        },
        plugins: [
          {
            // https://github.com/evanw/esbuild/issues/1895#issuecomment-1003404929
            name: "no-side-effects",
            setup(build) {
              build.onResolve({ filter: /.*/ }, async (args) => {
                if (args.pluginData) {
                  return;
                }
                const { path, ...rest } = args;
                rest.pluginData = true;
                const result = await build.resolve(path, rest);
                result.sideEffects = false;
                return result;
              });
            },
          },
          denoPlugin({
            importMapURL: importMapUrl ? new URL(importMapUrl) : undefined,
          }),
        ],
        ...esbuildOptions,
      });
      esbuild.stop();
      const indexJs = outputFiles?.find((v) => v.path === "<stdout>");
      if (!indexJs) {
        return;
      }
      const relativePath =
        "./" +
        completeEntryPoint.replace(rootDir, "").replace(/.(j|t)sx?/, ".js");
      bundle.set(relativePath, { data: indexJs.contents, scope });
      await run("BUILD_END", completeEntryPoint);
    };
    const watch = async () => {
      log.info(`Watching ${entryPoint}`);
      const watcher = watchModule(completeEntryPoint);
      const debounced = async.debounce(handle, 200);
      for await (const event of watcher) {
        if (
          event.kind === "modify" ||
          event.kind === "create" ||
          event.kind === "remove"
        ) {
          debounced();
        }
      }
    };
    on("BOOTSTRAP", async () => {
      await handle();
      dev && watch();
    });
  };
}
