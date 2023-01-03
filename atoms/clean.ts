import { Atom } from "../atom.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export function clean(): Atom {
  return ({ config: { rootUrl, destUrl }, getLogger, onStage }) => {
    const logger = getLogger("clean");
    onStage("BOOTSTRAP", async () => {
      const relativeDestUrl = relativiseUrl(destUrl, rootUrl);
      logger.info(`Deleting ${relativeDestUrl}`);
      await Deno.remove(new URL(destUrl), {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
