import { Plugin, PluginApplyOptions } from "../plugin.ts";

export interface HtmlTemplatePluginOptions {
  entryPoint: string;
  scope?: string;
}

export class HtmlTemplatePlugin extends Plugin {
  entryPoint: string;
  scope?: string;

  constructor(options: HtmlTemplatePluginOptions) {
    super("HTML_TEMPLATE");
    this.entryPoint = options.entryPoint;
    this.scope = options.scope;
  }

  apply(this: HtmlTemplatePlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", () => this.populate());
    this.project.stager.on("BUILD_END", () => this.populate());
    this.project.stager.on("LIVE_RELOAD_SCRIPT_POPULATE", () =>
      this.populate()
    );
  }

  // TODO: Watch entry point changes.
  async populate(this: HtmlTemplatePlugin) {
    try {
      this.logger.info(`Populating ./index.html`);
      const template = await fetch(
        new URL(this.entryPoint, this.project.rootUrl)
      ).then((v) => v.text());
      const scripts = Array.from(this.project.bundle.entries())
        .filter(([k, v]) => k.endsWith(".js") && v.scope === this.scope)
        .map(([k]) => `<script type="module" src="${k}"></script>`);
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(
        template.replace(
          /(\s+)<\/body>/,
          `$1  ${scripts.join("$1  ")}$1</body>`
        )
      );
      this.project.bundle.set("./index.html", { data });
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
