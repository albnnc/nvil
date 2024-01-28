import { log } from "./_deps.ts";
import { ScopeLogger } from "./mod.ts";
import { Project } from "./project.ts";

export interface PluginApplyOptions {
  project: Project;
}

export abstract class Plugin implements AsyncDisposable {
  name: string;
  logger: log.Logger;
  applyOptions?: PluginApplyOptions;

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
    this.applyOptions = options;
  }

  async [Symbol.asyncDispose]() {
    // Does nothing by default.
  }
}
