import { Atom } from "../atom.ts";
import { path } from "../deps.ts";
import { createLogger } from "../logger.ts";

export function clean(): Atom {
  const log = createLogger("CLEAN");
  return ({ config: { rootDir, destDir }, on }) => {
    on("BOOTSTRAP", async () => {
      const relativeDestDir = path.relative(rootDir, destDir);
      log.info(
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
