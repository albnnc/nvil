import { Plugin, PluginApplyOptions } from "../plugin.ts";

export interface HtmlTemplatePluginOptions {
  entryPoint: string;
  scope?: string;
  constants?: Record<string, string>;
}

export class HtmlTemplatePlugin extends Plugin {
  entryPoint: string;
  scope?: string;
  constants?: Record<string, string>;

  constructor(options: HtmlTemplatePluginOptions) {
    super("HTML_TEMPLATE");
    this.entryPoint = options.entryPoint;
    this.scope = options.scope;
    this.constants = options.constants;
  }

  apply(this: HtmlTemplatePlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", () => this.populate());
    this.project.stager.on("BUILD_END", () => this.populate());
    this.project.stager.on(
      "LIVE_RELOAD_SCRIPT_POPULATE",
      () => this.populate(),
    );
  }

  // TODO: Watch entry point changes.
  private async populate(this: HtmlTemplatePlugin) {
    try {
      this.logger.info(`Populating ./index.html`);
      const scriptUrl = Array.from(this.project.bundle.entries())
        .filter(([k, v]) => k.endsWith(".js") && v.scope === this.scope)
        ?.[0][0];
      const view = {
        ...this.constants,
        SCRIPT_URL: scriptUrl,
      };
      const templateSource = await fetch(
        new URL(this.entryPoint, this.project.rootUrl),
      ).then((v) => v.text());
      const templateTarget = Object
        .entries(view)
        .reduce((p, [k, v]) => p.replace(`{{${k}}}`, v), templateSource);
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(templateTarget);
      this.project.bundle.set("./index.html", { data });
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
