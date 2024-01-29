import { path } from "../../_deps.ts";
import { Plugin, PluginApplyOptions } from "../../plugin.ts";
import { Project } from "../../project.ts";
import { BuildPlugin } from "../build.ts";
import { ExecPlugin } from "../exec.ts";
import { HtmlTemplatePlugin } from "../html_template.ts";
import { StoryLiveReloadPlugin } from "./_plugins/story_live_reload.ts";
import { StoryMetaPlugin } from "./_plugins/story_meta.ts";
import { Theme } from "./_ui/theme.ts";
import { StoryMeta } from "./_utils/story_meta.ts";
import { StorySetWatcher } from "./_utils/story_set_watcher.ts";

export interface StorybookPluginOptions {
  globUrl: string;
  constants?: { theme: Theme };
  getPlugins?: (entryPoint: string) => Plugin[];
}

export class StorybookPlugin extends Plugin {
  globUrl: string;
  constants?: { theme: Theme };
  getPlugins?: (entryPoint: string) => Plugin[];

  storySetWatcher?: StorySetWatcher;
  storyInstanceMap = new Map<
    string,
    {
      project: Project;
      clean: () => Promise<void>;
    }
  >();
  uiProject?: Project;

  constructor(options: StorybookPluginOptions) {
    super("STORYBOOK");
    this.globUrl = options.globUrl;
    this.constants = options.constants;
    this.getPlugins = options.getPlugins;
  }

  async apply(this: StorybookPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.storySetWatcher = new StorySetWatcher({
      rootUrl: this.project.rootUrl,
      globUrl: this.globUrl,
    });
    await this.storySetWatcher.walk();
    this.project.stager.on("BOOTSTRAP", () => {
      if (this.project.dev) {
        this.storySetWatcher?.watch();
      }
      this.uiProject = new Project({
        plugins: [
          new BuildPlugin({
            entryPoint: "./index.tsx",
            overrideEsbuildOptions: (options) => {
              options.define = {
                ...options.define,
                STORYBOOK_CONSTANTS: this.constants
                  ? JSON.stringify(this.constants)
                  : "undefined",
              };
              return options;
            },
          }),
          new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
          new BuildPlugin({ entryPoint: "./server.ts", scope: "SERVER" }),
          new ExecPlugin({ scope: "SERVER", args: ["-A"] }),
        ],
        rootUrl: import.meta.resolve("./_ui/"),
        destUrl: this.project.destUrl,
        importMapUrl: "./import_map.json",
        dev: this.project.dev,
      });
      this.uiProject.bootstrap();
    });
  }

  onStoryFind(this: StorybookPlugin, entryPoint: string) {
    const storyMeta = StoryMeta.fromEntryPoint(
      entryPoint,
      this.project.rootUrl,
    );
    this.logger.info(`Found story ${storyMeta.entryPoint}`);
    const storyDestUrl = new URL(
      `./stories/${storyMeta.id}/`,
      this.project.destUrl,
    ).toString();
    const storyProject = new Project({
      plugins: [
        ...(this.getPlugins?.(entryPoint) ?? []),
        new StoryMetaPlugin({ entryPoint }),
        new StoryLiveReloadPlugin(),
      ],
      rootUrl: this.project.rootUrl,
      destUrl: storyDestUrl,
      importMapUrl: this.project.importMapUrl,
      dev: this.project.dev,
    });
    this.project.stager.on("BOOTSTRAP", () => storyProject.bootstrap());
    const cleanStory = async () => {
      await Deno.remove(path.fromFileUrl(storyDestUrl), { recursive: true });
    };
    this.storyInstanceMap.set(entryPoint, {
      project: storyProject,
      clean: cleanStory,
    });
  }

  onStoryLoss(this: StorybookPlugin, entryPoint: string) {
    const storyMeta = StoryMeta.fromEntryPoint(
      entryPoint,
      this.project.rootUrl,
    );
    this.logger.info(`Lost story ${storyMeta.entryPoint}`);
    const storyInstance = this.storyInstanceMap.get(entryPoint);
    if (!storyInstance) {
      return;
    }
    storyInstance.clean();
    this.storyInstanceMap.delete(entryPoint);
  }

  async [Symbol.asyncDispose]() {
    await this.uiProject?.[Symbol.asyncDispose]();
    for (const { project } of this.storyInstanceMap.values()) {
      await project[Symbol.asyncDispose]();
    }
  }
}
