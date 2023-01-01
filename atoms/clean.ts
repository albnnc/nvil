import { Atom } from "../atom.ts";
import { log, path } from "../deps.ts";
import { createLogger } from "../logger.ts";

export interface CleanConfig {
  logger?: log.Logger;
}

export function clean({
  logger = createLogger("CLEAN"),
}: CleanConfig = {}): Atom {
  return ({ config: { rootDir, destDir }, on }) => {
    on("BOOTSTRAP", async () => {
      const relativeDestDir = path.relative(rootDir, destDir);
      logger.info(
        `Deleting ${
          relativeDestDir.startsWith(".")
            ? relativeDestDir
            : "./" + relativeDestDir
        }`
      );
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
