import { Atom } from "../atom.ts";
import { relativisePath } from "../utils/relativise_path.ts";

export function clean(): Atom {
  return ({ config: { rootDir, destDir }, getLogger, onStage }) => {
    const logger = getLogger("clean");
    onStage("BOOTSTRAP", async () => {
      const relativeDestDir = relativisePath(destDir, rootDir);
      logger.info(`Deleting ${relativeDestDir}`);
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
