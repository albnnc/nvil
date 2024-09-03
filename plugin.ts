import type { Project } from "./project.ts";
import { ScopeLogger } from "./utils/scope_logger.ts";

export interface PluginApplyOptions {
  project: Project;
}

export abstract class Plugin implements AsyncDisposable {
  name: string;
  logger: ScopeLogger;

  #project?: Project;
  #disposalAbortController = new AbortController();

  constructor(name: string) {
    this.name = name;
    this.logger = new ScopeLogger({
      scope: name,
      debug: false,
    });
  }

  get project(): Project {
    if (!this.#project) {
      throw new Error("Unapplied");
    }
    return this.#project;
  }

  get disposalSignal(): AbortSignal {
    return this.#disposalAbortController.signal;
  }

  apply(this: Plugin, options: PluginApplyOptions): void | Promise<void> {
    if (this.#project) {
      throw new Error("Already applied");
    }
    this.#project = options.project;
    if (this.#project.debug) {
      this.logger = new ScopeLogger({
        scope: this.name,
        debug: true,
      });
    }
  }

  // deno-lint-ignore require-await
  async [Symbol.asyncDispose]() {
    this.#disposalAbortController.abort();
  }
}
