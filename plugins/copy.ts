import * as async from "@std/async";
import * as fs from "@std/fs";
import * as path from "@std/path";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface CopyPluginOptions {
  /**
   * A file URL or glob URL.
   */
  entryPoint: string;
  /**
   * Must be a relative URL. If set, all found files will be copied
   * to the `targetUrl` directory under the `bundleUrl` subdirectory.
   * For example, a file `.../file.txt` will be copied to
   * `targetUrl > bundleUrl > file.txt` location.
   */
  bundleUrl?: string;
  /**
   * Treat `entryPoint` as a glob.
   */
  glob?: boolean;
}

export class CopyPlugin extends Plugin {
  entryPoint: string;
  bundleUrl?: string;
  glob?: boolean;

  private fsWatcher?: Deno.FsWatcher;

  private get absoluteUrl(): string {
    return new URL(this.entryPoint, this.project.sourceUrl).toString();
  }

  private get relativeUrl(): string {
    return relativiseUrl(this.entryPoint, this.project.sourceUrl);
  }

  constructor(options: CopyPluginOptions) {
    super("COPY");
    this.entryPoint = options.entryPoint;
    this.bundleUrl = options.bundleUrl;
    this.glob = options.glob;
  }

  apply(this: CopyPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      await this.copy();
      if (this.project.dev) {
        this.watch();
      }
    });
  }

  async copyFile(this: CopyPlugin, fileUrl: string) {
    const { bundle } = this.project;
    const data = await fetch(fileUrl).then(async (v) => {
      const arrayBuffer = await v.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    });
    if (this.bundleUrl) {
      const fileUrlSegments = fileUrl.split("/");
      const absoluteBundleUrl = new URL(this.bundleUrl, this.project.targetUrl)
        .toString();
      const absoluteFileBundleUrl = new URL(
        fileUrlSegments[fileUrlSegments.length - 1],
        absoluteBundleUrl,
      ).toString();
      const fileBundleUrl = relativiseUrl(
        absoluteFileBundleUrl,
        this.project.targetUrl,
      ).toString();
      bundle.set(fileBundleUrl, { data });
    } else {
      const fileBundleUrl = relativiseUrl(fileUrl, this.project.sourceUrl);
      bundle.set(fileBundleUrl, { data });
    }
  }

  async copy(this: CopyPlugin) {
    const { stager } = this.project;
    this.logger.info(`Copying ${decodeURIComponent(this.relativeUrl)}`);
    await stager.run("COPY_START");
    if (this.glob) {
      if (!this.absoluteUrl.startsWith("file:")) {
        throw new Error("Glob to copy must be a file: URL");
      }
      const fileUrls: string[] = [];
      const fsWalker = fs.expandGlob(
        path.fromFileUrl(decodeURIComponent(this.absoluteUrl)),
      );
      for await (const v of fsWalker) {
        if (v.isFile) {
          fileUrls.push(path.toFileUrl(v.path).toString());
        }
      }
      await Promise.all(fileUrls.map((v) => this.copyFile(v)));
    } else {
      await this.copyFile(this.absoluteUrl);
    }
    await stager.run("COPY_END");
  }

  async watch(this: CopyPlugin) {
    const targetRegExp = this.absoluteUrl.startsWith("file:")
      ? path.globToRegExp(path.fromFileUrl(this.absoluteUrl), {
        globstar: true,
      })
      : undefined;
    if (!targetRegExp) {
      return;
    }
    this.logger.info(`Watching ${decodeURIComponent(this.relativeUrl)}`);
    const dirToWatch = path.dirname(
      path.fromFileUrl(this.absoluteUrl).replace(/\*.*$/, ""),
    );
    this.fsWatcher = Deno.watchFs(dirToWatch);
    const debounced = async.debounce(() => this.copy(), 200);
    for await (const event of this.fsWatcher) {
      if (
        event.paths.some((v) => targetRegExp.test(v)) &&
        (event.kind === "modify" ||
          event.kind === "create" ||
          event.kind === "remove")
      ) {
        debounced();
      }
    }
  }

  // deno-lint-ignore require-await
  async [Symbol.asyncDispose](this: CopyPlugin) {
    this.fsWatcher?.[Symbol.dispose]();
  }
}
