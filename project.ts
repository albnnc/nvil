import { Bundle } from "./bundle.ts";
import type { Plugin } from "./plugin.ts";
import { Stager } from "./stager.ts";
import { ScopeLogger } from "./utils/scope_logger.ts";

export interface ProjectOptions {
  plugins: Plugin[];
  sourceUrl: string;
  targetUrl: string;
  dev?: boolean;
  debug?: boolean;
}

export class Project implements AsyncDisposable {
  plugins: Plugin[];
  sourceUrl: string;
  targetUrl: string;
  dev?: boolean;
  debug?: boolean;
  logger: ScopeLogger;
  stager: Stager = new Stager();
  bundle: Bundle = new Bundle();

  #donePwr: PromiseWithResolvers<void> = Promise.withResolvers();
  #bootstrapped = false;

  constructor(options: ProjectOptions) {
    this.plugins = options.plugins;
    this.sourceUrl = new URL("./", options.sourceUrl).toString();
    this.targetUrl = new URL(
      "./",
      new URL(options.targetUrl, this.sourceUrl),
    ).toString();
    this.dev = options.dev;
    this.debug = options.debug;
    this.logger = new ScopeLogger("PROJECT", this.debug ? "DEBUG" : "INFO");
  }

  async bootstrap(this: Project): Promise<void> {
    if (!this.plugins.length) {
      this.logger.debug("No plugins found");
      return;
    }
    if (this.#bootstrapped) {
      throw new Error("Already bootstrapped");
    }
    this.#bootstrapped = true;
    await this.#applyPlugins();
    await this.#runFirstCycle();
    if (this.dev) {
      this.#watch();
    } else {
      this.#donePwr.resolve();
    }
  }

  async done(this: Project): Promise<void> {
    await this.#donePwr.promise;
  }

  async [Symbol.asyncDispose](this: Project) {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }

  async #applyPlugins(this: Project): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
  }

  async #runFirstCycle(this: Project): Promise<void> {
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.targetUrl);
    await this.stager.run("WRITE_END", changes);
  }

  async #watch(this: Project): Promise<void> {
    while (true) {
      await this.stager.waitCycle();
      const changes = this.bundle.getChanges();
      await this.bundle.writeChanges(this.targetUrl);
      await this.stager.run("WRITE_END", changes);
    }
  }
}
