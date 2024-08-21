import type { Project } from "./project.ts";
import { ScopeLogger } from "./utils/scope_logger.ts";

export interface PluginApplyOptions {
  project: Project;
}

export abstract class Plugin implements AsyncDisposable {
  name: string;
  logger: ScopeLogger;

  private applyOptions?: PluginApplyOptions;

  constructor(name: string) {
    this.name = name;
    this.logger = new ScopeLogger(name);
  }

  get project(): Project {
    if (!this.applyOptions) {
      throw new Error("Unapplied");
    }
    return this.applyOptions.project;
  }

  apply(this: Plugin, options: PluginApplyOptions): void | Promise<void> {
    if (this.applyOptions) {
      throw new Error("Already applied");
    }
    this.applyOptions = options;
  }

  async [Symbol.asyncDispose]() {
    // Does nothing by default.
  }
}
