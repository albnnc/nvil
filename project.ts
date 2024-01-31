import { ScopeLogger } from "./_utils/scope_logger.ts";
import { Bundle } from "./bundle.ts";
import { Stager } from "./mod.ts";
import { Plugin } from "./plugin.ts";

export interface ProjectOptions {
  plugins: Plugin[];
  rootUrl: string;
  targetUrl: string;
  importMapUrl?: string;
  dev?: boolean;
}

export class Project implements AsyncDisposable {
  logger = new ScopeLogger("Project");
  stager = new Stager();
  bundle = new Bundle();
  plugins: Plugin[];
  rootUrl: string;
  targetUrl: string;
  importMapUrl?: string;
  dev?: boolean;

  bootstrapped = false;

  constructor(options: ProjectOptions) {
    this.plugins = options.plugins;
    this.rootUrl = new URL("./", options.rootUrl).toString();
    this.targetUrl = new URL(
      "./",
      new URL(options.targetUrl, this.rootUrl),
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
    if (this.bootstrapped) {
      throw new Error("Already bootstrapped");
    }
    this.bootstrapped = true;
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.targetUrl);
    await this.stager.run("WRITE_END", changes);
    if (this.dev) {
      while (true) {
        await this.stager.waitCycle();
        const changes = this.bundle.getChanges();
        await this.bundle.writeChanges(this.targetUrl);
        await this.stager.run("WRITE_END", changes);
      }
    }
  }

  async [Symbol.asyncDispose]() {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }
}
