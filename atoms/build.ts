import { Atom } from "../atom.ts";
import { async, esbuild, esbuildDenoPlugin, log } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { completePath } from "../utils/complete_path.ts";
import { watchModule } from "../utils/watch_module.ts";

export interface BuildConfig {
  scope?: string;
  logger?: log.Logger;
  esbuildOptions?: esbuild.BuildOptions;
}

export function build(
  entryPoint: string,
  { scope, logger = createLogger("BUILD"), esbuildOptions }: BuildConfig = {}
): Atom {
  return ({ config: { dev, rootDir, importMapUrl }, bundle, on, run }) => {
    const completeEntryPoint = completePath(entryPoint, rootDir);
    const handle = async () => {
      logger.info(`Building ${entryPoint}`);
      await run("BUILD_START", completeEntryPoint);
      const { outputFiles } = await esbuild.build({
        entryPoints: [completeEntryPoint],
        write: false,
        bundle: true,
        minify: !dev,
        target: "esnext",
        platform: "browser",
        format: "esm",
        logLevel: "error",
        define: {
          "import.meta.main": "false",
        },
        plugins: [
          {
            name: "esm-sh-package-json",
            setup(build) {
              build.onLoad({ filter: /package\.json\.js/ }, () => {
                return {
                  contents: `{ "name": "UNKNOWN", "version": "UNKNOWN" }`,
                  loader: "json",
                };
              });
            },
          },
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
          esbuildDenoPlugin({
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
      logger.info(`Watching ${entryPoint}`);
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
