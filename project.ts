import { Table } from "@cliffy/table";
import * as datetime from "@std/datetime";
import { Bundle } from "./bundle.ts";
import denoJson from "./deno.json" with { type: "json" };
import type { Plugin } from "./plugin.ts";
import { Stager } from "./stager.ts";
import { ScopeLogger } from "./utils/scope_logger.ts";

export interface WriteStageContext {
  changes: string[];
}

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
  #bootstrapDate?: Date;

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

  async bootstrap(): Promise<void> {
    if (!this.plugins.length) {
      this.logger.debug("No plugins found");
      return;
    }
    if (this.#bootstrapped) {
      throw new Error("Already bootstrapped");
    }
    this.#bootstrapped = true;
    this.#bootstrapDate = new Date();
    this.stager.on(
      "WRITE",
      () => this.bundle.writeChanges(this.targetUrl),
    );
    await this.#applyPlugins();
    await this.#runFirstCycle();
    if (this.dev) {
      this.#watch();
    } else {
      this.#donePwr.resolve();
    }
  }

  async done(): Promise<void> {
    await this.#donePwr.promise;
  }

  async [Symbol.asyncDispose]() {
    await Promise.all(this.plugins.map((v) => v[Symbol.asyncDispose]()));
  }

  async #applyPlugins(): Promise<void> {
    for (const plugin of this.plugins) {
      await plugin.apply({ project: this });
    }
  }

  async #runFirstCycle(): Promise<void> {
    if (this.dev) {
      console.clear();
      this.#logBanner();
    }
    const t1 = performance.now();
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.stager.run("WRITE", { changes });
    const t2 = performance.now();
    this.#logTime(t1, t2);
  }

  async #watch(): Promise<void> {
    while (true) {
      await this.stager.waitStart();
      if (this.dev) {
        console.clear();
        this.#logBanner();
      }
      const t1 = performance.now();
      await this.stager.waitEnd();
      const t2 = performance.now();
      this.#logTime(t1, t2);
      const changes = this.bundle.getChanges();
      if (!changes.length) {
        continue;
      }
      await this.stager.run("WRITE", { changes });
    }
  }

  #logTime(t1: number, t2: number) {
    const d = ((t2 - t1) / 1_000).toFixed(2);
    this.logger.info(`Ready in ${d} seconds`);
  }

  #logBanner() {
    const startedAt = datetime.format(this.#bootstrapDate!, "HH:mm:ss");
    const content = new Table()
      .body([
        [`Version`, denoJson.version],
        ["Plugin Count", this.plugins.length],
        ["Started At", startedAt],
      ])
      .padding(4)
      .toString();
    new Table()
      .header(["nvil"])
      .body([[content]])
      .border(true)
      .render();
  }
}
