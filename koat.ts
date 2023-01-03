import { Atom } from "./atom.ts";
import { Bundle } from "./bundle.ts";
import { path } from "./deps.ts";
import { createStager } from "./stager.ts";
import { absolutisePath } from "./utils/absolutise_path.ts";

export interface KoatConfig {
  dev?: boolean;
  rootDir: string;
  destDir: string;
  importMapUrl?: string;
  signal?: AbortSignal;
}

export function createKoat(atoms: Atom[], config: KoatConfig) {
  const completeRootDir = absolutisePath(config.rootDir);
  const completeDestDir = absolutisePath(config.destDir, completeRootDir);
  const completeImportMapUrl = config.importMapUrl?.startsWith(".")
    ? new URL(path.toFileUrl(completeRootDir), config.importMapUrl).toString()
    : config.importMapUrl?.startsWith("/")
    ? path.toFileUrl(completeRootDir).toString()
    : config.importMapUrl;
  const completeConfig = {
    ...config,
    rootDir: completeRootDir,
    destDir: completeDestDir,
    importMapUrl: completeImportMapUrl,
  };
  const bundle = new Bundle();
  const bootstrap = async () => {
    await koat.run("BOOTSTRAP");
    await bundle.writeChanges(completeDestDir);
    const writeDeferred = async () => {
      await stager.wait();
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
    ...stager,
  };
  for (const fn of atoms) {
    fn(koat);
  }
  return koat;
}

export type Koat = ReturnType<typeof createKoat>;
