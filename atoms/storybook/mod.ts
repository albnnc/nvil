import { Atom } from "../../atom.ts";
import { deepMerge, path } from "../../deps.ts";
import { createKoat, Koat, KoatConfig } from "../../mod.ts";
import { build } from "../build.ts";
import { exec } from "../exec.ts";
import { htmlTemplate } from "../html_template.ts";
import { getStoryMeta, storyMeta } from "./story_meta.ts";
import { storyReload } from "./story_reload.ts";
import { updateStorySetSync } from "./update_story_set.ts";
import { watchStorySet } from "./watch_story_set.ts";

export function storybook(
  glob: string,
  getAtoms: (entryPoint: string) => Atom[]
): Atom {
  return ({ config, config: { dev, rootUrl }, getLogger, onStage }) => {
    let bootstrapped = false;
    const logger = getLogger("sb");
    const storySet = new Set<string>();
    const instanceMap = new Map<
      string,
      {
        abortController: AbortController;
        instance: Koat;
      }
    >();
    const onFind = (entryPoint: string) => {
      const meta = getStoryMeta(entryPoint, rootUrl);
      logger.info(`Found story ${meta.entryPoint}`);
      const destUrl = new URL(
        `./stories/${meta.id}/`,
        config.destUrl
      ).toString();
      const abortController = new AbortController();
      const instance = createKoat(
        [...getAtoms(entryPoint), storyMeta(entryPoint), storyReload()],
        deepMerge(config, {
          destUrl,
          signal: abortController.signal,
          overrideLogger: (scope: string) =>
            getLogger(`sb/${meta.id.slice(0, 4)}/${scope}`),
        }) as KoatConfig
      );
      bootstrapped
        ? instance.bootstrap()
        : onStage("BOOTSTRAP", instance.bootstrap);
      instanceMap.set(entryPoint, { abortController, instance });
    };
    const onLoss = async (entryPoint: string) => {
      const meta = getStoryMeta(entryPoint, rootUrl);
      logger.info(`Lost story ${meta.entryPoint}`);
      const item = instanceMap.get(entryPoint);
      if (!item) {
        return;
      }
      item.abortController.abort();
      instanceMap.delete(entryPoint);
      await Deno.remove(path.fromFileUrl(item.instance.config.destUrl), {
        recursive: true,
      });
      // TODO: Cleanup story bootstrap bindings.
    };
    updateStorySetSync(storySet, { rootUrl, glob, onFind, onLoss });
    onStage("BOOTSTRAP", async () => {
      bootstrapped = true;
      dev && watchStorySet(storySet, { rootUrl, glob, onFind, onLoss });
      await createKoat(
        [
          build("./index.tsx"),
          build("./server.ts", { scope: "server" }),
          htmlTemplate("./index.html"),
          exec("server"),
        ],
        deepMerge(config, {
          rootUrl: import.meta.resolve("./ui/"),
          importMapUrl: "./import_map.json",
          overrideLogger: (scope: string) => getLogger(`sb/ui/${scope}`),
        }) as KoatConfig
      ).bootstrap();
    });
  };
}
