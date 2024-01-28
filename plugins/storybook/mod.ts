import { Plugin } from "../../plugin.ts";
import { deepMerge, path } from "../../_deps.ts";
import { createProject, Project, ProjectConfig } from "../../project.ts";
import { build } from "../build.ts";
import { exec } from "../exec.ts";
import { htmlTemplate } from "../html_template.ts";
import { getStoryMeta, storyMeta } from "./story_meta.ts";
import { storyReload } from "./story_reload.ts";
import { Theme } from "./ui/theme.ts";
import { updateStorySetSync } from "./update_story_set.ts";
import { watchStorySet } from "./watch_story_set.ts";

export interface StorybookConfig {
  constants?: { theme: Theme };
}

export function storybook(
  glob: string,
  getPlugins: (entryPoint: string) => Plugin[],
  { constants }: StorybookConfig = {}
): Plugin {
  return ({ config, config: { dev, rootUrl }, getLogger, onStage }) => {
    let bootstrapped = false;
    const logger = getLogger("sb");
    const storySet = new Set<string>();
    const instanceMap = new Map<
      string,
      {
        project: Project;
        clean: () => Promise<void>;
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
        [...getPlugins(entryPoint), storyMeta(entryPoint), storyReload()],
        deepMerge(config, {
          destUrl,
          signal: abortController.signal,
          overrideLogger: (scope: string) =>
            getLogger(`sb/${meta.id.slice(0, 4)}/${scope}`),
        }) as ProjectConfig
      );
      const bootstrap = () => {
        if (bootstrapped) {
          project.bootstrap();
          return;
        }
        return onStage("BOOTSTRAP", project.bootstrap);
      };
      const cleanStage = bootstrap();
      const clean = async () => {
        abortController.abort();
        cleanStage?.();
        await Deno.remove(path.fromFileUrl(destUrl), { recursive: true });
      };
      instanceMap.set(entryPoint, { project, clean });
    };
    const onLoss = (entryPoint: string) => {
      const meta = getStoryMeta(entryPoint, rootUrl);
      logger.info(`Lost story ${meta.entryPoint}`);
      const instance = instanceMap.get(entryPoint);
      if (!instance) {
        return;
      }
      instance.clean();
      instanceMap.delete(entryPoint);
    };
    updateStorySetSync(storySet, { rootUrl, glob, onFind, onLoss });
    onStage("BOOTSTRAP", async () => {
      bootstrapped = true;
      dev && watchStorySet(storySet, { rootUrl, glob, onFind, onLoss });
      await createProject(
        [
          build("./index.tsx", {
            overrideEsbuildOptions: (config) => {
              config.define = {
                ...config.define,
                STORYBOOK_CONSTANTS: constants
                  ? JSON.stringify(constants)
                  : "undefined",
              };
              return config;
            },
          }),
          build("./server.ts", { scope: "server" }),
          htmlTemplate("./index.html"),
          exec("server", { args: ["-A"] }),
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
