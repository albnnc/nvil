import { Atom } from "../atom.ts";
import { async, esbuild, esbuildPluginDeno } from "../deps.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";
import { watchModule } from "../utils/watch_module.ts";

export type EsbuildConfig = esbuild.BuildOptions;

export interface BuildConfig {
  scope?: string;
  overrideEsbuildConfig?: (config: EsbuildConfig) => EsbuildConfig;
}

export function build(
  entryPoint: string,
  { scope, overrideEsbuildConfig }: BuildConfig = {}
): Atom {
  return ({
    config: { rootUrl, importMapUrl, dev, signal },
    bundle,
    getLogger,
    onStage,
    runStage,
  }) => {
    const logger = getLogger("build");
    const absoluteEntryPoint = new URL(entryPoint, rootUrl).toString();
    const relativeEntryPoint = relativiseUrl(absoluteEntryPoint, rootUrl);
    const handle = async () => {
      logger.info(`Building ${relativeEntryPoint}`);
      await runStage("BUILD_START", absoluteEntryPoint);
      try {
        const esbuildConfig: EsbuildConfig = {
          entryPoints: [absoluteEntryPoint],
          write: false,
          bundle: true,
          minify: !dev,
          target: "esnext",
          platform: "browser",
          format: "esm",
          logLevel: "silent",
          define: { "import.meta.main": "false" },
          plugins: [
            esbuildPluginEsmShPackageJson(),
            esbuildPluginNoSideEffects(),
            esbuildPluginDeno({
              importMapURL: importMapUrl ? new URL(importMapUrl) : undefined,
            }),
          ],
        };
        overrideEsbuildConfig?.(esbuildConfig);
        const { outputFiles } = await esbuild.build(esbuildConfig);
        signal?.addEventListener("abort", () => {
          esbuild.stop();
        });
        const indexJs = outputFiles?.find((v) => v.path === "<stdout>");
        if (!indexJs) {
          return;
        }
        const targetUrl = relativeEntryPoint.replace(/\.(j|t)sx?/, ".js");
        bundle.set(targetUrl, { data: indexJs.contents, scope });
        await runStage("BUILD_END", absoluteEntryPoint);
      } catch (e) {
        logger.error(e.message);
      }
    };
    const watch = async () => {
      if (!absoluteEntryPoint.startsWith("file:")) {
        return;
      }
      logger.info(`Watching ${relativeEntryPoint}`);
      const watcher = watchModule(absoluteEntryPoint, { signal });
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

export function esbuildPluginEsmShPackageJson(): esbuild.Plugin {
  return {
    name: "esm-sh-package-json",
    setup(build) {
      build.onLoad({ filter: /package\.json\.js/ }, () => {
        return {
          contents: `{ "name": "UNKNOWN", "version": "UNKNOWN" }`,
          loader: "json",
        };
      });
    },
  };
}

export function esbuildPluginNoSideEffects(): esbuild.Plugin {
  return {
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
  };
}
