import { Bundle } from "./bundle.ts";
import { Stager } from "./mod.ts";
import { Plugin } from "./plugin.ts";
import { ScopeLogger } from "./_utils/scope_logger.ts";

export interface ProjectOptions {
  plugins: Plugin[];
  rootUrl: string;
  destUrl: string;
  importMapUrl?: string;
  dev?: boolean;
}

export class Project implements AsyncDisposable {
  logger = new ScopeLogger("Project");
  stager = new Stager();
  bundle = new Bundle();
  plugins: Plugin[];
  rootUrl: string;
  destUrl: string;
  importMapUrl?: string;
  dev?: boolean;

  constructor(options: ProjectOptions) {
    this.plugins = options.plugins;
    this.rootUrl = new URL("./", options.rootUrl).toString();
    this.destUrl = new URL(
      "./",
      new URL(options.destUrl, this.rootUrl)
    ).toString();
    this.importMapUrl = options.importMapUrl
      ? new URL(options.importMapUrl, this.rootUrl).toString()
      : undefined;
    this.dev = options.dev;
  }

  async bootstrap() {
    if (!this.plugins.length) {
      this.logger.info("No plugins found");
      return;
    }
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.destUrl);
    await this.stager.run("WRITE_END", changes);
    if (this.dev) {
      while (true) {
        await this.stager.wait();
        const changes = this.bundle.getChanges();
        await this.bundle.writeChanges(this.destUrl);
        await this.stager.run("WRITE_END", changes);
      }
    }
  }

  async [Symbol.asyncDispose]() {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }
}
