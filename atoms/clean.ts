import { Atom } from "../atom.ts";
import { createLogger } from "../logger.ts";

export function clean(): Atom {
  const log = createLogger("CLEAN");
  return ({ config: { destDir }, on }) => {
    on("BOOTSTRAP", async () => {
      log.info(`Deleting ${destDir}`);
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
