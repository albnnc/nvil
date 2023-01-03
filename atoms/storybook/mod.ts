import { Atom } from "../../atom.ts";
import { deepMerge, path } from "../../deps.ts";
import { createKoat, Koat, KoatConfig } from "../../mod.ts";
import { cyrb53 } from "../../utils/cyrb53.ts";
import { relativiseUrl } from "../../utils/relativise_url.ts";
import { build } from "../build.ts";
import { exec } from "../exec.ts";
import { htmlTemplate } from "../html_template.ts";
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
        koat: Koat;
      }
    >();
    const onFind = (entryPoint: string) => {
      const relativeEntryPoint = relativiseUrl(entryPoint, rootUrl);
      logger.info(`Found story ${relativeEntryPoint}`);
      const id = cyrb53(relativeEntryPoint).toString();
      const destUrl = new URL(`./stories/${id}/`, config.destUrl).toString();
      const abortController = new AbortController();
      const storyKoat = createKoat(
        getAtoms(entryPoint).concat([
          storyReload(),
          ({ bundle, onStage }) => {
            onStage("BOOTSTRAP", () => {
              const encoder = new TextEncoder();
              bundle.set("./meta.json", {
                data: encoder.encode(
                  JSON.stringify(
                    {
                      id,
                      entryPoint: relativeEntryPoint,
                    },
                    null,
                    2
                  )
                ),
              });
            });
          },
        ]),
        deepMerge(config, {
          destUrl,
          signal: abortController.signal,
          overrideLogger: (scope: string) =>
            getLogger(`sb/${id.slice(0, 4)}/${scope}`),
        }) as KoatConfig
      );
      bootstrapped
        ? storyKoat.bootstrap()
        : onStage("BOOTSTRAP", storyKoat.bootstrap);
      instanceMap.set(entryPoint, { abortController, koat: storyKoat });
    };
    const onLoss = async (entryPoint: string) => {
      const relativeEntryPoint = relativiseUrl(entryPoint, rootUrl);
      logger.info(`Lost story ${relativeEntryPoint}`);
      const instance = instanceMap.get(entryPoint);
      if (!instance) {
        return;
      }
      instance.abortController.abort();
      instanceMap.delete(entryPoint);
      await Deno.remove(path.fromFileUrl(instance.koat.config.destUrl), {
        recursive: true,
      });
      // TODO: Cleanup story bootstrap bindings.
    };
    updateStorySetSync(storySet, { rootUrl, glob, onFind, onLoss });
    const uiKoat = createKoat(
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
    );
    onStage("BOOTSTRAP", uiKoat.bootstrap);
    onStage("BOOTSTRAP", () => {
      bootstrapped = true;
      dev && watchStorySet(storySet, { rootUrl, glob, onFind, onLoss });
    });
  };
}
