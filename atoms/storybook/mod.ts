import { Atom } from "../../atom.ts";
import { deepMerge, path } from "../../deps.ts";
import { createProject, Project, ProjectConfig } from "../../project.ts";
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
        project: Project;
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
      const project = createProject(
        [...getAtoms(entryPoint), storyMeta(entryPoint), storyReload()],
        deepMerge(config, {
          destUrl,
          signal: abortController.signal,
          overrideLogger: (scope: string) =>
            getLogger(`sb/${meta.id.slice(0, 4)}/${scope}`),
        }) as ProjectConfig
      );
      bootstrapped
        ? project.bootstrap()
        : onStage("BOOTSTRAP", project.bootstrap);
      instanceMap.set(entryPoint, { abortController, project });
    };
    const onLoss = async (entryPoint: string) => {
      const meta = getStoryMeta(entryPoint, rootUrl);
      logger.info(`Lost story ${meta.entryPoint}`);
      const instance = instanceMap.get(entryPoint);
      if (!instance) {
        return;
      }
      instance.abortController.abort();
      instanceMap.delete(entryPoint);
      await Deno.remove(path.fromFileUrl(instance.project.config.destUrl), {
        recursive: true,
      });
      // TODO: Cleanup story bootstrap bindings.
    };
    updateStorySetSync(storySet, { rootUrl, glob, onFind, onLoss });
    onStage("BOOTSTRAP", async () => {
      bootstrapped = true;
      dev && watchStorySet(storySet, { rootUrl, glob, onFind, onLoss });
      await createProject(
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
        }) as ProjectConfig
      ).bootstrap();
    });
  };
}
