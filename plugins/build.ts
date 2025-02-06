import { denoPlugins as esbuildDenoPlugins } from "@luca/esbuild-deno-loader";
import * as async from "@std/async";
import * as jsonc from "@std/jsonc";
import * as path from "@std/path";
import * as esbuild from "esbuild";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";
import type { Project } from "../project.ts";
import { get } from "../utils/get.ts";
import { ModuleWatcher } from "../utils/module_watcher.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export type EsbuildPlugin = esbuild.Plugin;
export type EsbuildOptions = esbuild.BuildOptions;
export type EsbuildContext = esbuild.BuildContext;

export interface BuildPluginOptions {
  entryPoint: string;
  scope?: string;
  bundleUrl?: string;
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
  #bundleUrlOrUndefined?: string;
  #bundleMetaUrl?: string;
  #scope?: string;
  #overrideEsbuildOptions?: (options: EsbuildOptions) => void;
  #encoder: TextEncoder = new TextEncoder();
  #denoConfigSummary?: DenoConfigSummary;
  #esbuildContext?: EsbuildContext;
  #moduleWatcher?: ModuleWatcher;

  get #absoluteEntryPoint(): string {
    return new URL(this.#entryPoint, this.project.sourceUrl).toString();
  }

  get #relativeEntryPoint(): string {
    return relativiseUrl(this.#absoluteEntryPoint, this.project.sourceUrl);
  }

  get #bundleUrl(): string {
    return this.#bundleUrlOrUndefined ||
      "./" +
        this.#absoluteEntryPoint
          .split("/")
          .pop()!
          .replace(/\.(j|t)sx?$/, ".js");
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
    this.#bundleUrlOrUndefined = options.bundleUrl;
    this.#bundleMetaUrl = options.bundleMetaUrl;
    this.#scope = options.scope;
    this.#overrideEsbuildOptions = options.overrideEsbuildOptions;
  }

  override apply(options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      await this.init();
      await this.build();
      if (this.project.dev) {
        this.watch();
      }
    });
  }

  async init() {
    this.#denoConfigSummary = new DenoConfigSummary(this.project);
    await this.#denoConfigSummary.collect();
    const esbuildConfig: EsbuildOptions = {
      entryPoints: [this.#absoluteEntryPoint],
      write: false,
      bundle: true,
      metafile: !!this.#bundleMetaUrl,
      minify: !this.project.dev,
      target: "esnext",
      platform: "browser",
      format: "esm",
      define: {
        "import.meta.main": "false",
        ...(this.project.dev ? {} : { "process.env.NODE_ENV": '"production"' }),
      },
      logLevel: "silent",
      jsx: "automatic",
      jsxImportSource: get(
        this.#denoConfigSummary.value,
        "compilerOptions.jsxImportSource",
      ) || "react",
      plugins: [
        EsbuildPluginFactory.noSideEffects(),
        ...EsbuildPluginFactory.deno(this.#denoConfigSummary.path),
      ],
    };
    this.#overrideEsbuildOptions?.(esbuildConfig);
    this.logger.debug(`Initializing context for ${this.#relativeEntryPoint}`);
    this.#esbuildContext = await esbuild.context(esbuildConfig);
  }

  async build() {
    const { bundle, stager, dev } = this.project;
    this.logger.info(`Building ${this.#relativeEntryPoint}`);
    const buildStart = performance.now();
    await stager.run("BUILD_START", this.#buildStageHandlerOptions);
    try {
      const buildResult = await this.#esbuildContext?.rebuild();
      if (!buildResult) {
        return;
      }
      const { outputFiles, metafile } = buildResult;
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
        this.logger.error(e instanceof Error ? e.message : "Unknown error");
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

  override async [Symbol.asyncDispose]() {
    await this.#denoConfigSummary
      ?.[Symbol.asyncDispose]()
      .catch(() => undefined);
    await this.#esbuildContext
      ?.dispose()
      .catch(() => undefined);
    this.#moduleWatcher?.[Symbol.dispose]();
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

class DenoConfigSummary {
  url = "" as string;
  path = "" as string;
  value = undefined as unknown;
  temporary = false;

  constructor(public project: Project) {}

  async collect() {
    for (const relativeUrl of ["./deno.json", "./deno.jsonc"]) {
      const candidateUrl = new URL(relativeUrl, this.project.sourceUrl)
        .toString();
      this.value = await fetch(candidateUrl)
        .then((v) => v.text())
        .then((v) => jsonc.parse(v))
        .catch(() => undefined);
      if (this.value) {
        this.url = candidateUrl;
        break;
      }
    }
    if (!this.value) {
      throw new Error("Failed to get Deno config");
    }
    if (this.url.startsWith("file:")) {
      this.path = path.fromFileUrl(this.url);
      return;
    }
    this.temporary = true;
    this.path = await Deno.makeTempFile();
    await Deno.writeTextFile(
      this.path,
      JSON.stringify(this.value, null, 2),
    );
  }

  async [Symbol.asyncDispose]() {
    if (this.temporary) {
      await Deno
        .remove(this.path)
        .catch(() => undefined);
    }
  }
}
