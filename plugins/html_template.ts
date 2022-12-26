import { Plugin } from "../plugin.ts";

export interface HtmlTemplatePluginOptions {
  template: string;
}

export function createHtmlTemplatePlugin({
  template,
}: HtmlTemplatePluginOptions): Plugin {
  return {
    onBuildEnd: ({ bundle }) => {
      const scripts = Array.from(bundle.keys())
        .filter((v) => v.endsWith(".js"))
        .map((v) => `<script src="${v}"></script>`);
      const encoder = new TextEncoder();
      const data = encoder.encode(
        template.replace(
          /(\s+)<\/body>/,
          `$1  ${scripts.join("$1  ")}$1</body>`
        )
      );
      bundle.set("./index.html", { data });
    },
  };
}
