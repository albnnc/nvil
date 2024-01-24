import { Bundle } from "./bundle.ts";
import { Stager } from "./mod.ts";
import { Plugin } from "./plugin.ts";

export interface ProjectOptions {
  plugins: Plugin[];
  rootUrl: string;
  destUrl: string;
  importMapUrl?: string;
  dev?: boolean;
}

export class Project {
  bundle = new Bundle();
  stager = new Stager();

  options: ProjectOptions;

  constructor(options: ProjectOptions) {
    const safeRootUrl = new URL("./", options.rootUrl).toString();
    const safeDestUrl = new URL(
      "./",
      new URL(options.destUrl, safeRootUrl)
    ).toString();
    const safeImportMapUrl = options.importMapUrl
      ? new URL(options.importMapUrl, safeRootUrl).toString()
      : undefined;
    this.options = {
      ...options,
      rootUrl: safeRootUrl,
      destUrl: safeDestUrl,
      importMapUrl: safeImportMapUrl,
    };
  }

  async bootstrap() {
    await this.stager.run("BOOTSTRAP");
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.options.destUrl);
    await this.stager.run("WRITE_END", changes);
    if (this.options.dev) {
      this.writeDeferred();
    } else {
      // ?
      // abortController.abort();
    }
  }

  private async writeDeferred() {
    await this.stager.wait();
    const changes = this.bundle.getChanges();
    await this.bundle.writeChanges(this.options.destUrl);
    await this.stager.run("WRITE_END", changes);
    this.writeDeferred();
  }
}
