import { Bundle } from "./bundle.ts";
import type { Plugin } from "./plugin.ts";
import { Stager } from "./stager.ts";
import { ScopeLogger } from "./utils/scope_logger.ts";

export interface ProjectOptions {
  plugins: Plugin[];
  sourceUrl: string;
  targetUrl: string;
  dev?: boolean;
}

export class Project implements AsyncDisposable {
  logger: ScopeLogger = new ScopeLogger("Project");
  stager: Stager = new Stager();
  bundle: Bundle = new Bundle();
  plugins: Plugin[];
  sourceUrl: string;
  targetUrl: string;
  dev?: boolean;

  bootstrapped = false;
  donePWR: PromiseWithResolvers<void> = Promise.withResolvers();

  constructor(options: ProjectOptions) {
    this.plugins = options.plugins;
    this.sourceUrl = new URL("./", options.sourceUrl).toString();
    this.targetUrl = new URL(
      "./",
      new URL(options.targetUrl, this.sourceUrl),
    ).toString();
    this.dev = options.dev;
  }

  async bootstrap(this: Project): Promise<void> {
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

  async done(this: Project): Promise<void> {
    await this.donePWR.promise;
  }

  async [Symbol.asyncDispose](this: Project) {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }

  private async applyPlugins(this: Project): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
  }

  private async runFirstCycle(this: Project): Promise<void> {
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.targetUrl);
    await this.stager.run("WRITE_END", changes);
  }

  private async watch(this: Project): Promise<void> {
    while (true) {
      await this.stager.waitCycle();
      const changes = this.bundle.getChanges();
      await this.bundle.writeChanges(this.targetUrl);
      await this.stager.run("WRITE_END", changes);
    }
  }
}
