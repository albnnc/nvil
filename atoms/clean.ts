import { Atom } from "../atom.ts";
import { relativisePath } from "../utils/relativise_path.ts";

export function clean(): Atom {
  return ({ config: { rootDir, destDir }, getLogger, on }) => {
    const logger = getLogger("clean");
    on("BOOTSTRAP", async () => {
      const relativeDestDir = relativisePath(destDir, rootDir);
      logger.info(`Deleting ${relativeDestDir}`);
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
