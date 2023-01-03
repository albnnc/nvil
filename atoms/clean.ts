import { Atom } from "../atom.ts";
import { log } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { relativisePath } from "../utils/relativise_path.ts";

export interface CleanConfig {
  logger?: log.Logger;
}

export function clean({
  logger = createLogger("clean"),
}: CleanConfig = {}): Atom {
  return ({ config: { rootDir, destDir }, on }) => {
    on("BOOTSTRAP", async () => {
      const relativeDestDir = relativisePath(destDir, rootDir);
      logger.info(`Deleting ${relativeDestDir}`);
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
