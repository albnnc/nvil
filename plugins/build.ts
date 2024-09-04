import { denoPlugins as esbuildDenoPlugins } from "@luca/esbuild-deno-loader";
import * as async from "@std/async";
import * as jsonc from "@std/jsonc";
import * as path from "@std/path";
import * as esbuild from "esbuild";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";
import { get } from "../utils/get.ts";
import { ModuleWatcher } from "../utils/module_watcher.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export type EsbuildPlugin = esbuild.Plugin;
export type EsbuildOptions = esbuild.BuildOptions;

export interface BuildPluginOptions {
  entryPoint: string;
  scope?: string;
  bundleMetaUrl?: string;
  overrideEsbuildOptions?: (options: EsbuildOptions) => void;
}

export interface BuildStageHandlerOptions {
  entryPoint: string;
  bundleUrl: string;
  bundleMetaUrl?: string;
}

export class BuildPlugin extends Plugin {
  #entryPoint: string;
  #bundleMetaUrl?: string;
  #scope?: string;
  #overrideEsbuildOptions?: (options: EsbuildOptions) => void;
  #encoder: TextEncoder = new TextEncoder();
  #moduleWatcher?: ModuleWatcher;

  get #absoluteEntryPoint(): string {
    return new URL(this.#entryPoint, this.project.sourceUrl).toString();
  }

  get #relativeEntryPoint(): string {
    return relativiseUrl(this.#absoluteEntryPoint, this.project.sourceUrl);
  }

  get #bundleUrl(): string {
    return this.#relativeEntryPoint.replace(/\.(j|t)sx?$/, ".js");
  }

  get #buildStageHandlerOptions(): BuildStageHandlerOptions {
    return {
      entryPoint: this.#absoluteEntryPoint,
      bundleUrl: this.#bundleUrl,
      bundleMetaUrl: this.#bundleMetaUrl,
    };
  }

  constructor(public options: BuildPluginOptions) {
    super("BUILD");
    this.#entryPoint = options.entryPoint;
    this.#bundleMetaUrl = options.bundleMetaUrl;
    this.#scope = options.scope;
    this.#overrideEsbuildOptions = options.overrideEsbuildOptions;
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      await this.build();
      if (this.project.dev) {
        this.watch();
      }
    });
  }

  async build() {
    const { bundle, stager, dev } = this.project;
    this.logger.info(`Building ${this.#relativeEntryPoint}`);
    const buildStart = performance.now();
    await stager.run("BUILD_START", this.#buildStageHandlerOptions);
    try {
      await using denoConfigSummary = await this.#getDenoConfigSummary();
      const esbuildConfig: EsbuildOptions = {
        entryPoints: [this.#absoluteEntryPoint],
        write: false,
        bundle: true,
        metafile: !!this.#bundleMetaUrl,
        minify: !dev,
        target: "esnext",
        platform: "browser",
        format: "esm",
        define: { "import.meta.main": "false" },
        logLevel: "silent",
        jsx: "automatic",
        jsxImportSource: get(
          denoConfigSummary.value,
          "compilerOptions.jsxImportSource",
        ) || "react",
        plugins: [
          EsbuildPluginFactory.noSideEffects(),
          ...EsbuildPluginFactory.deno(denoConfigSummary.path),
        ],
      };
      this.#overrideEsbuildOptions?.(esbuildConfig);
      const { outputFiles, metafile } = await esbuild.build(esbuildConfig);
      const mainOutputFile = outputFiles?.find((v) => v.path === "<stdout>");
      if (!mainOutputFile) {
        return;
      }
      bundle.set(this.#bundleUrl, {
        data: mainOutputFile.contents,
        scope: this.#scope,
      });
      if (this.#bundleMetaUrl) {
        bundle.set(this.#bundleMetaUrl, {
          data: this.#encoder.encode(JSON.stringify(metafile)),
        });
      }
      const buildEnd = performance.now();
      this.logger.info(
        `Done in ${((buildEnd - buildStart) / 1000).toFixed(2)} s`,
      );

      await stager.run("BUILD_END", this.#buildStageHandlerOptions);
    } catch (e) {
      if (dev) {
        this.logger.error(e.message);
      } else {
        throw e;
      }
    }
  }

  async watch() {
    if (!this.#absoluteEntryPoint.startsWith("file:")) {
      return;
    }
    this.logger.debug(`Watching ${this.#relativeEntryPoint}`);
    this.#moduleWatcher = new ModuleWatcher({
      specifier: this.#absoluteEntryPoint,
    });
    const debounced = async.debounce(() => {
      this.build();
    }, 200);
    for await (const event of this.#moduleWatcher || []) {
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
  async [Symbol.asyncDispose]() {
    this.#moduleWatcher?.[Symbol.dispose]();
  }

  async #getDenoConfigSummary() {
    const summary = {
      url: "" as string,
      path: "" as string,
      value: undefined as unknown,
    };
    for (const relativeUrl of ["./deno.json", "./deno.jsonc"]) {
      const candidateUrl = new URL(relativeUrl, this.project.sourceUrl)
        .toString();
      summary.value = await fetch(candidateUrl)
        .then((v) => v.text())
        .then((v) => jsonc.parse(v))
        .catch(() => undefined);
      if (summary.value) {
        summary.url = candidateUrl;
        break;
      }
    }
    if (!summary.value) {
      throw new Error("Failed to get Deno config");
    }
    if (summary.url.startsWith("file:")) {
      summary.path = path.fromFileUrl(summary.url);
      return {
        ...summary,
        async [Symbol.asyncDispose]() {
          // Doing nothing.
        },
      };
    }
    summary.path = await Deno.makeTempFile();
    await Deno.writeTextFile(
      summary.path,
      JSON.stringify(summary.value, null, 2),
    );
    return {
      ...summary,
      async [Symbol.asyncDispose]() {
        await Deno.remove(summary.path).catch(() => undefined);
      },
    };
  }
}

export class EsbuildPluginFactory {
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

  static deno(configPath: string): EsbuildPlugin[] {
    return esbuildDenoPlugins({ configPath });
  }
}
