import { Atom } from "./atom.ts";
import { Bundle } from "./bundle.ts";
import { log, path } from "./deps.ts";
import { createLogger } from "./logger.ts";
import { createStager } from "./stager.ts";
import { absolutisePath } from "./utils/absolutise_path.ts";

export interface KoatConfig {
  dev?: boolean;
  rootDir: string;
  destDir: string;
  importMapUrl?: string;
  signal?: AbortSignal;
  overrideLogger?: (scope: string) => log.Logger;
}

export function createKoat(atoms: Atom[], config: KoatConfig) {
  const completeRootDir = absolutisePath(config.rootDir);
  const completeDestDir = absolutisePath(config.destDir, completeRootDir);
  const completeImportMapUrl = config.importMapUrl?.startsWith(".")
    ? new URL(path.toFileUrl(completeRootDir), config.importMapUrl).toString()
    : config.importMapUrl?.startsWith("/")
    ? path.toFileUrl(completeRootDir).toString()
    : config.importMapUrl;
  const completeConfig: KoatConfig = {
    ...config,
    rootDir: completeRootDir,
    destDir: completeDestDir,
    importMapUrl: completeImportMapUrl,
  };
  const bundle = new Bundle();
  const bootstrap = async () => {
    await koat.runStage("BOOTSTRAP");
    await bundle.writeChanges(completeDestDir);
    const writeDeferred = async () => {
      await stager.waitStages();
      await bundle.writeChanges(completeDestDir);
      writeDeferred();
    };
    config.dev && writeDeferred();
  };
  const stager = createStager();
  const koat = {
    atoms,
    config: completeConfig,
    bundle,
    bootstrap,
    getLogger: (scope: string) =>
      config.overrideLogger?.(scope) ?? createLogger(scope),
    ...stager,
  };
  for (const fn of atoms) {
    fn(koat);
  }
  return koat;
}

export type Koat = ReturnType<typeof createKoat>;
