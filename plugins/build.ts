import { denoPlugin as esbuildDenoPlugin } from "@deno/esbuild-plugin";
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

export interface BuildStageContext {
  entryPoint: string;
  bundleUrl: string;
  bundleMetaUrl?: string;
}

export interface BuildPluginOptions {
  entryPoint: string;
  scope?: string;
  bundleUrl?: string;
  bundleMetaUrl?: string;
  overrideEsbuildOptions?: (options: EsbuildOptions) => void;
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
  #active?: boolean;
  #postponed?: boolean;

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

  get #context(): BuildStageContext {
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
      await this.trigger();
      if (this.project.dev) {
        this.watch();
      }
    });
    this.project.stager.on(
      "BUILD",
      (context: BuildStageContext) => this.build(context),
    );
  }

  async build(context: BuildStageContext = this.#context) {
    if (context.entryPoint !== this.#context.entryPoint) {
      return;
    }
    try {
      this.logger.info(`Building ${this.#relativeEntryPoint}`);
      const buildResult = await this.#esbuildContext?.rebuild();
      if (!buildResult) {
        return;
      }
      const { outputFiles, metafile } = buildResult;
      const mainOutputFile = outputFiles
        ?.find((v) => v.path === "<stdout>");
      if (!mainOutputFile) {
        return;
      }
      this.project.bundle.set(this.#bundleUrl, {
        data: mainOutputFile.contents,
        scope: this.#scope,
      });
      if (this.#bundleMetaUrl) {
        this.project.bundle.set(this.#bundleMetaUrl, {
          data: this.#encoder.encode(JSON.stringify(metafile)),
        });
      }
    } catch (e) {
      if (this.project.dev) {
        this.logger.error(e instanceof Error ? e.message : "Unknown error");
      } else {
        throw e;
      }
    }
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
        EsbuildPluginFactory.breakCache(
          this.#denoConfigSummary.localUrl,
        ),
        esbuildDenoPlugin({
          configPath: this.#denoConfigSummary.localPath,
        }),
      ],
    };
    this.#overrideEsbuildOptions?.(esbuildConfig);
    this.logger.debug(`Initializing context for ${this.#relativeEntryPoint}`);
    this.#esbuildContext = await esbuild.context(esbuildConfig);
  }

  async trigger() {
    if (this.#active) {
      this.#postponed = true;
      return;
    }
    this.#active = true;
    await this.project.stager.run("BUILD", this.#context);
    this.#active = false;
    if (this.#postponed) {
      this.#postponed = false;
      this.logger.debug(`Triggering postponed build`);
      this.trigger();
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
    const trigger = async.debounce(() => this.trigger(), 200);
    for await (const event of this.#moduleWatcher || []) {
      if (
        event.kind === "modify" ||
        event.kind === "create" ||
        event.kind === "remove"
      ) {
        trigger();
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

  static breakCache(baseUrl: string): EsbuildPlugin {
    const loaders = ["js", "jsx", "ts", "tsx"] as const;
    return {
      name: "break-cache",
      setup: (build) => {
        build.onLoad(
          { filter: /.+/, namespace: "file" },
          async (args) => {
            const url = args.path.startsWith("/")
              ? path.toFileUrl(args.path).toString()
              : args.path;
            if (!url.startsWith(baseUrl)) {
              return;
            }
            const ext = path.extname(args.path);
            const loader = loaders.find((v) => v === ext.slice(1));
            if (!loader) {
              return;
            }
            const contents = await fetch(args.path).then((v) => v.text());
            return { contents, loader };
          },
        );
      },
    };
  }
}

class DenoConfigSummary {
  url = "" as string;
  localUrl = "" as string;
  localPath = "" as string;
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
      this.localUrl = this.url;
      this.localPath = path.fromFileUrl(this.url);
      return;
    }
    this.temporary = true;
    this.localPath = await Deno.makeTempFile();
    this.localUrl = path.toFileUrl(this.localPath).toString();
    await Deno.writeTextFile(
      this.localPath,
      JSON.stringify(this.value, null, 2),
    );
  }

  async [Symbol.asyncDispose]() {
    if (this.temporary) {
      await Deno
        .remove(this.localPath)
        .catch(() => undefined);
    }
  }
}
