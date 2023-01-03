import { Atom } from "../../atom.ts";
import { deepMerge } from "../../deps.ts";
import { createKoat, Koat, KoatConfig } from "../../mod.ts";
import { cyrb53 } from "../../utils/cyrb53.ts";
import { updateStorySetSync } from "./update_story_set.ts";
import { watchStorySet } from "./watch_story_set.ts";
import { build } from "../build.ts";
import { htmlTemplate } from "../html_template.ts";
import { relativiseUrl } from "../../utils/relativise_url.ts";

export function storybook(
  glob: string,
  getAtoms: (entryPoint: string) => Atom[]
): Atom {
  return ({ config, config: { dev, rootUrl }, getLogger, onStage }) => {
    const logger = getLogger("sb");
    const storySet = new Set<string>();
    const instanceMap = new Map<
      string,
      {
        abortController: AbortController;
        koat: Koat;
      }
    >();
    const onFind = (entryPoint: string) => {
      const relativeEntryPoint = relativiseUrl(entryPoint, rootUrl);
      logger.info(`Found story ${relativeEntryPoint}`);
      const id = cyrb53(relativeEntryPoint).toString();
      const destUrl = new URL(`./stories/${id}/`, config.destUrl).toString();
      const abortController = new AbortController();
      const storykoat = createKoat(
        getAtoms(entryPoint),
        deepMerge(config, {
          destUrl,
          signal: abortController.signal,
          overrideLogger: (scope: string) =>
            getLogger(`sb/story/${id.slice(0, 4)}/${scope}`),
        }) as KoatConfig
      );
      onStage("BOOTSTRAP", storykoat.bootstrap);
      instanceMap.set(entryPoint, { abortController, koat: storykoat });
    };
    const onLoss = (entryPoint: string) => {
      const relativeEntryPoint = relativiseUrl(entryPoint, rootUrl);
      logger.info(`Lost story ${relativeEntryPoint}`);
      const instance = instanceMap.get(entryPoint);
      if (!instance) {
        return;
      }
      instance.abortController.abort();
      instanceMap.delete(entryPoint);
      // TODO: Delete story destDir.
      // TODO: Cleanup story bootstrap bindings.
    };
    updateStorySetSync(storySet, { rootUrl, glob, onFind, onLoss });
    const uiKoat = createKoat(
      [build("./index.tsx"), htmlTemplate("./index.html")],
      deepMerge(config, {
        rootUrl: import.meta.resolve("./ui/"),
        importMapUrl: "./import_map.json",
        overrideLogger: (scope: string) => getLogger(`sb/ui/${scope}`),
      }) as KoatConfig
    );
    onStage("BOOTSTRAP", uiKoat.bootstrap);
    onStage("BOOTSTRAP", () => {
      dev && watchStorySet(storySet, { rootUrl, glob, onFind, onLoss });
    });
  };
}
