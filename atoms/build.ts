import { Atom } from "../atom.ts";
import { async, esbuild, esbuildDenoPlugin } from "../deps.ts";
import { absolutisePath } from "../utils/absolutise_path.ts";
import { relativisePath } from "../utils/relativise_path.ts";
import { watchModule } from "../utils/watch_module.ts";

export interface BuildConfig {
  scope?: string;
  esbuildOptions?: esbuild.BuildOptions;
}

export function build(
  entryPoint: string,
  { scope, esbuildOptions }: BuildConfig = {}
): Atom {
  return ({
    config: { dev, rootDir, importMapUrl },
    bundle,
    getLogger,
    onStage,
    runStage,
  }) => {
    const logger = getLogger("build");
    const absoluteEntryPoint = absolutisePath(entryPoint, rootDir);
    const relativeEntryPoint = relativisePath(entryPoint, rootDir);
    const handle = async () => {
      logger.info(`Building ${relativeEntryPoint}`);
      await runStage("BUILD_START", absoluteEntryPoint);
      try {
        const { outputFiles } = await esbuild.build({
          entryPoints: [absoluteEntryPoint],
          write: false,
          bundle: true,
          minify: !dev,
          target: "esnext",
          platform: "browser",
          format: "esm",
          logLevel: "silent",
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
        const targetPath = relativisePath(absoluteEntryPoint, rootDir).replace(
          /.(j|t)sx?/,
          ".js"
        );
        bundle.set(targetPath, { data: indexJs.contents, scope });
        await runStage("BUILD_END", absoluteEntryPoint);
      } catch (e) {
        logger.error(e.message);
      }
    };
    const watch = async () => {
      logger.info(`Watching ${relativeEntryPoint}`);
      const watcher = watchModule(absoluteEntryPoint);
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
    onStage("BOOTSTRAP", async () => {
      await handle();
      dev && watch();
    });
  };
}
