import { async, fs, path } from "../_deps.ts";
import { Plugin, PluginApplyOptions } from "../plugin.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface CopyPluginOptions {
  url: string;
  glob?: boolean;
}

export class CopyPlugin extends Plugin {
  url: string;
  glob?: boolean;

  fsWatcher?: Deno.FsWatcher;

  get absoluteUrl(): string {
    return new URL(this.url, this.project.rootUrl).toString();
  }

  get relativeUrl(): string {
    return relativiseUrl(this.url, this.project.rootUrl);
  }

  constructor(options: CopyPluginOptions) {
    super("COPY");
    this.url = options.url;
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
    const relativeUrl = relativiseUrl(fileUrl, this.project.rootUrl);
    bundle.set(relativeUrl, {
      data: await fetch(fileUrl).then(async (v) => {
        const arrayBuffer = await v.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }),
    });
  }

  async copy(this: CopyPlugin) {
    const { stager } = this.project;
    this.logger.info(`Copying ${this.relativeUrl}`);
    await stager.run("COPY_START");
    if (this.glob) {
      if (!this.absoluteUrl.startsWith("file:")) {
        throw new Error("Glob to copy must be a local URL");
      }
      const fileUrls: string[] = [];
      const fsWalker = fs.expandGlob(
        path.fromFileUrl(decodeURIComponent(this.absoluteUrl))
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
    this.logger.info(`Watching ${this.relativeUrl}`);
    const dirToWatch = path.dirname(
      path.fromFileUrl(this.absoluteUrl).replace(/\*.*$/, "")
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
