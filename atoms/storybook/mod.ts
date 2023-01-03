import { Atom } from "../../atom.ts";
import { deepMerge, log, path } from "../../deps.ts";
import { createKoat, Koat, KoatConfig } from "../../koat.ts";
import { createLogger } from "../../logger.ts";
import { cyrb53 } from "../../utils/cyrb53.ts";
import { updateStorySetSync } from "./update_story_set.ts";
import { watchStorySet } from "./watch_story_set.ts";

export interface StorybookConfig {
  logger?: log.Logger;
}

export function storybook(
  glob: string,
  getAtoms: (entryPoint: string) => Atom[],
  { logger = createLogger("storybook") }: StorybookConfig = {}
): Atom {
  return ({ config, config: { dev, rootDir }, on }) => {
    const storySet = new Set<string>();
    const instanceMap = new Map<
      string,
      {
        abortController: AbortController;
        koat: Koat;
      }
    >();
    const onFind = (entryPoint: string) => {
      const relativeEntryPoint = path.relative(rootDir, entryPoint);
      logger.info(`Found story ${relativeEntryPoint}`);
      const destDir = path.join(
        config.destDir,
        `./stories/${cyrb53(relativeEntryPoint)}/`
      );
      const abortController = new AbortController();
      const koat = createKoat(
        getAtoms(entryPoint),
        deepMerge(config, {
          destDir,
          signal: abortController.signal,
        }) as KoatConfig
      );
      koat.bootstrap();
      instanceMap.set(entryPoint, { abortController, koat });
    };
    const onLoss = (entryPoint: string) => {
      const relativeEntryPoint = path.relative(rootDir, entryPoint);
      logger.info(`Lost story ${relativeEntryPoint}`);
      const instance = instanceMap.get(entryPoint);
      if (!instance) {
        return;
      }
      instance.abortController.abort();
      instanceMap.delete(entryPoint);
      // TODO: Delete story destDir.
    };
    updateStorySetSync(storySet, { rootDir, glob, onFind, onLoss });
    on("BOOTSTRAP", () => {
      dev && watchStorySet(storySet, { rootDir, glob, onFind, onLoss });
    });
  };
}
