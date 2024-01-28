import { async, esbuild, esbuildDenoPlugins } from "../_deps.ts";
import { ModuleWatcher } from "../_utils/module_watcher.ts";
import { relativiseUrl } from "../_utils/relativise_url.ts";
import { Plugin, PluginApplyOptions } from "../plugin.ts";

export type EsbuildPlugin = esbuild.Plugin;
export type EsbuildOptions = esbuild.BuildOptions;

export interface BuildPluginOptions {
  entryPoint: string;
  scope?: string;
  overrideEsbuildOptions?: (options: EsbuildOptions) => EsbuildOptions;
}

export class BuildPlugin extends Plugin {
  encoder = new TextEncoder();
  entryPoint: string;
  scope?: string;
  overrideEsbuildOptions?: (options: EsbuildOptions) => EsbuildOptions;

  moduleWatcher?: ModuleWatcher;

  get absoluteEntryPoint(): string {
    return new URL(this.entryPoint, this.project.rootUrl).toString();
  }

  get relativeEntryPoint(): string {
    return relativiseUrl(this.absoluteEntryPoint, this.project.rootUrl);
  }

  constructor(public options: BuildPluginOptions) {
    super("BUILD");
    this.entryPoint = options.entryPoint;
    this.scope = options.scope;
    this.overrideEsbuildOptions = options.overrideEsbuildOptions;
  }

  apply(this: BuildPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      await this.build();
      if (this.project.dev) {
        this.watch();
      }
    });
  }

  async build(this: BuildPlugin) {
    const { bundle, stager, importMapUrl, dev } = this.project;
    this.logger.info(`Building ${this.relativeEntryPoint}`);
    await stager.run("BUILD_START", this.absoluteEntryPoint);
    try {
      const esbuildConfig: EsbuildOptions = {
        entryPoints: [this.absoluteEntryPoint],
        write: false,
        bundle: true,
        metafile: true,
        minify: !dev,
        target: "esnext",
        platform: "browser",
        format: "esm",
        logLevel: "silent",
        define: { "import.meta.main": "false" },
        plugins: [
          EsbuildPluginFactory.esmShPackageJson(),
          EsbuildPluginFactory.noSideEffects(),
          ...EsbuildPluginFactory.deno(importMapUrl),
        ],
      };
      this.overrideEsbuildOptions?.(esbuildConfig);
      const { outputFiles, metafile } = await esbuild.build(esbuildConfig);
      const indexJs = outputFiles?.find((v) => v.path === "<stdout>");
      if (!indexJs) {
        return;
      }
      const targetUrl = this.relativeEntryPoint.replace(/\.(j|t)sx?$/, ".js");
      const metaUrl = targetUrl.replace(/\.js$/, ".meta.json");
      bundle.set(targetUrl, {
        data: indexJs.contents,
        scope: this.scope,
      });
      bundle.set(metaUrl, {
        data: this.encoder.encode(JSON.stringify(metafile)),
      });
      await stager.run("BUILD_END", this.absoluteEntryPoint);
    } catch (e) {
      if (dev) {
        this.logger.error(e.message);
      } else {
        throw e;
      }
    }
  }

  async watch(this: BuildPlugin) {
    if (!this.absoluteEntryPoint.startsWith("file:")) {
      return;
    }
    this.logger.info(`Watching ${this.relativeEntryPoint}`);
    this.moduleWatcher = new ModuleWatcher({
      specifier: this.absoluteEntryPoint,
    });
    const debounced = async.debounce(() => {
      this.build();
    }, 200);
    for await (const event of this.moduleWatcher || []) {
      if (
        event.kind === "modify" ||
        event.kind === "create" ||
        event.kind === "remove"
      ) {
        debounced();
      }
    }
  }

  // deno-lint-ignore require-await
  async [Symbol.asyncDispose](this: BuildPlugin) {
    this.moduleWatcher?.[Symbol.dispose]();
    esbuild.stop();
  }
}

export class EsbuildPluginFactory {
  static deno(importMapUrl?: string): EsbuildPlugin[] {
    return esbuildDenoPlugins({ importMapURL: importMapUrl });
  }

  static noSideEffects(): EsbuildPlugin {
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

  static esmShPackageJson(): EsbuildPlugin {
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
}
