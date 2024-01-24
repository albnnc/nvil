import { Plugin } from "./plugin.ts";
import { Bundle } from "./bundle.ts";
import { log } from "./deps.ts";
import { createLogger } from "./logger.ts";
import { createStager } from "./stager.ts";

export interface ProjectConfig {
  rootUrl: string;
  destUrl: string;
  importMapUrl?: string;
  dev?: boolean;
  signal?: AbortSignal;
  overrideLogger?: (scope: string) => log.Logger;
}

export function createProject(plugins: Plugin[], config: ProjectConfig) {
  const safeRootUrl = new URL("./", config.rootUrl).toString();
  const safeDestUrl = new URL(
    "./",
    new URL(config.destUrl, safeRootUrl)
  ).toString();
  const safeImportMapUrl = config.importMapUrl
    ? new URL(config.importMapUrl, safeRootUrl).toString()
    : undefined;
  const abortController = new AbortController();
  config.signal?.addEventListener("abort", () => abortController.abort());
  const safeConfig: ProjectConfig = {
    ...config,
    rootUrl: safeRootUrl,
    destUrl: safeDestUrl,
    importMapUrl: safeImportMapUrl,
    signal: abortController.signal,
  };
  const bundle = new Bundle();
  const bootstrap = async () => {
    await project.runStage("BOOTSTRAP");
    const changes = bundle.getChanges();
    await bundle.writeChanges(safeDestUrl);
    await stager.runStage("WRITE_END", changes);
    const writeDeferred = async () => {
      await stager.waitStages();
      const changes = bundle.getChanges();
      await bundle.writeChanges(safeDestUrl);
      await stager.runStage("WRITE_END", changes);
      writeDeferred();
    };
    if (config.dev) {
      writeDeferred();
    } else {
      abortController.abort();
    }
  };
  const stager = createStager();
  const project = {
    plugins,
    config: safeConfig,
    bundle,
    bootstrap,
    getLogger: (scope: string) =>
      config.overrideLogger?.(scope) ?? createLogger(scope),
    ...stager,
  };
  for (const fn of plugins) {
    fn(project);
  }
  return project;
}

export type Project = ReturnType<typeof createProject>;
