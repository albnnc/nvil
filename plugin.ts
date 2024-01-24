import { Project } from "./project.ts";

export interface PluginOptions {
  project: Project;
}

export abstract class Plugin {
  constructor(public options: PluginOptions) {}

  abstract setup(): void | Promise<void>;
}
