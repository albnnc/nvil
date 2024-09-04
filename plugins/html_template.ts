import { default as mustache } from "mustache";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";

mustache.escape = (v: unknown) => v;

export interface HtmlTemplatePluginOptions {
  entryPoint: string;
  scope?: string;
  constants?: Record<string, string>;
}

export class HtmlTemplatePlugin extends Plugin {
  #entryPoint: string;
  #scope?: string;
  #constants?: Record<string, string>;

  constructor(options: HtmlTemplatePluginOptions) {
    super("HTML_TEMPLATE");
    this.#entryPoint = options.entryPoint;
    this.#scope = options.scope;
    this.#constants = options.constants;
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", () => this.#populate());
    this.project.stager.on("BUILD_END", () => this.#populate());
    this.project.stager.on(
      "LIVE_RELOAD_SCRIPT_POPULATE",
      () => this.#populate(),
    );
  }

  // TODO: Watch entry point changes.
  async #populate() {
    try {
      this.logger.debug(`Populating ./index.html`);
      const scriptUrl = Array.from(this.project.bundle.entries())
        .filter(([k, v]) => k.endsWith(".js") && v.scope === this.#scope)
        ?.[0]?.[0];
      const view = {
        ...this.#constants,
        SCRIPT_URL: scriptUrl,
        DEV: !!this.project.dev,
      };
      const indexHtmlTemplate = await fetch(
        new URL(this.#entryPoint, this.project.sourceUrl),
      ).then((v) => v.text());
      const indexHtmlString = mustache.render(indexHtmlTemplate, view);
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(indexHtmlString);
      this.project.bundle.set("./index.html", { data });
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
