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
  donePWR = Promise.withResolvers<void>();

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

  async bootstrap(this: Project) {
    if (!this.plugins.length) {
      this.logger.info("No plugins found");
      return;
    }
    if (this.bootstrapped) {
      throw new Error("Already bootstrapped");
    }
    this.bootstrapped = true;
    await this.applyPlugins();
    await this.runFirstCycle();
    if (this.dev) {
      this.watch();
    } else {
      this.donePWR.resolve();
    }
  }

  async done(this: Project) {
    await this.donePWR.promise;
  }

  async [Symbol.asyncDispose](this: Project) {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }

  private async applyPlugins(this: Project) {
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
  }

  private async runFirstCycle(this: Project) {
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.targetUrl);
    await this.stager.run("WRITE_END", changes);
  }

  private async watch(this: Project) {
    while (true) {
      await this.stager.waitCycle();
      const changes = this.bundle.getChanges();
      await this.bundle.writeChanges(this.targetUrl);
      await this.stager.run("WRITE_END", changes);
    }
  }
}
