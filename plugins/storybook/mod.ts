import { path } from "../../_deps.ts";
import { ScopeLogger } from "../../mod.ts";
import { Plugin, PluginApplyOptions } from "../../plugin.ts";
import { Project } from "../../project.ts";
import { BuildPlugin } from "../build.ts";
import { HtmlTemplatePlugin } from "../html_template.ts";
import { RunPlugin } from "../run.ts";
import { StoryLiveReloadPlugin } from "./_plugins/story_live_reload.ts";
import { StoryMetaPlugin } from "./_plugins/story_meta.ts";
import { StoryMeta } from "./_utils/story_meta.ts";
import { StorySetWatcher } from "./_utils/story_set_watcher.ts";

export interface StorybookPluginOptions {
  globUrl: string;
  constants?: { groupOrder?: string[] };
  getPlugins?: (entryPoint: string) => Plugin[];
}

export class StorybookPlugin extends Plugin {
  globUrl: string;
  constants?: StorybookPluginOptions["constants"];
  getPlugins?: (entryPoint: string) => Plugin[];

  private storySetWatcher?: StorySetWatcher;
  private uiProject?: Project;
  private storyProjects = new Map<string, Project>();

  constructor(options: StorybookPluginOptions) {
    super("STORYBOOK");
    this.globUrl = options.globUrl;
    this.constants = options.constants;
    this.getPlugins = options.getPlugins;
  }

  apply(this: StorybookPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      this.storySetWatcher = new StorySetWatcher({
        rootUrl: this.project.rootUrl,
        globUrl: this.globUrl,
      });
      await this.storySetWatcher.walk();
      await Promise.all(
        Array.from(this.storySetWatcher.data.values()).map((v) =>
          this.onStoryFind(v)
        )
      );
      if (this.project.dev) {
        this.storySetWatcher?.watch();
        (async () => {
          for await (const event of this.storySetWatcher ?? []) {
            if (event.type === "FIND") {
              this.onStoryFind(event.entryPoint);
            }
            if (event.type === "LOSS") {
              this.onStoryLoss(event.entryPoint);
            }
          }
        })();
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
            },
          }),
          new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
          new BuildPlugin({ entryPoint: "./server.ts", scope: "SERVER" }),
          new RunPlugin({ scope: "SERVER", args: ["-A"] }),
        ],
        rootUrl: import.meta.resolve("./_ui/"),
        targetUrl: this.project.targetUrl,
        importMapUrl: "./import_map.json",
        dev: this.project.dev,
      });
      this.nestProjectLoggers(this.uiProject, ["UI"]);
      await this.uiProject.bootstrap();
    });
  }

  async [Symbol.asyncDispose]() {
    await this.uiProject?.[Symbol.asyncDispose]();
    for (const project of this.storyProjects.values()) {
      await project[Symbol.asyncDispose]();
    }
  }

  private async onStoryFind(this: StorybookPlugin, entryPoint: string) {
    const storyMeta = StoryMeta.fromEntryPoint(
      entryPoint,
      this.project.rootUrl
    );
    this.logger.info(`Found story ${storyMeta.entryPoint}`);
    const storyTargetUrl = this.getStoryTargetUrl(storyMeta);
    const storyProject = new Project({
      plugins: [
        ...(this.getPlugins?.(entryPoint) ?? []),
        new StoryMetaPlugin({ entryPoint }),
        new StoryLiveReloadPlugin(),
      ],
      rootUrl: this.project.rootUrl,
      targetUrl: storyTargetUrl,
      importMapUrl: this.project.importMapUrl,
      dev: this.project.dev,
    });
    this.nestProjectLoggers(storyProject, [storyMeta.id]);
    this.storyProjects.set(entryPoint, storyProject);
    await storyProject.bootstrap();
  }

  private async onStoryLoss(this: StorybookPlugin, entryPoint: string) {
    const storyMeta = StoryMeta.fromEntryPoint(
      entryPoint,
      this.project.rootUrl
    );
    this.logger.info(`Lost story ${storyMeta.entryPoint}`);
    const storyProject = this.storyProjects.get(entryPoint);
    if (!storyProject) {
      return;
    }
    await storyProject[Symbol.asyncDispose]();
    const storyTargetUrl = this.getStoryTargetUrl(storyMeta);
    this.storyProjects.delete(entryPoint);
    await Deno.remove(path.fromFileUrl(storyTargetUrl), { recursive: true });
  }

  private getStoryTargetUrl(this: StorybookPlugin, storyMeta: StoryMeta) {
    return new URL(
      `./stories/${storyMeta.id}/`,
      this.project.targetUrl
    ).toString();
  }

  private nestScopeLogger(scopeLogger: ScopeLogger, segments: string[] = []) {
    scopeLogger.scope = [
      this.logger.scope,
      ...segments,
      scopeLogger.scope,
    ].join(" > ");
  }

  private nestProjectLoggers(project: Project, segments: string[] = []) {
    this.nestScopeLogger(project.logger, segments);
    project.plugins.forEach((v) => {
      this.nestScopeLogger(v.logger, segments);
    });
  }
}
