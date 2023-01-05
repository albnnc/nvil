import { Atom } from "../atom.ts";

export interface HtmlTemplateConfig {
  scope?: string;
}

// TODO: Watch entry point changes.
export function htmlTemplate(
  entryPoint: string,
  { scope }: HtmlTemplateConfig = {}
): Atom {
  return ({ config: { rootUrl }, bundle, getLogger, onStage }) => {
    const logger = getLogger("htmlTemplate");
    const handle = async () => {
      try {
        logger.info(`Populating ./index.html`);
        const template = await fetch(new URL(entryPoint, rootUrl)).then((v) =>
          v.text()
        );
        const scripts = Array.from(bundle.entries())
          .filter(([k, v]) => k.endsWith(".js") && v.scope === scope)
          .map(([k]) => `<script type="module" src="${k}"></script>`);
        const encoder = new TextEncoder();
        const data = encoder.encode(
          template.replace(
            /(\s+)<\/body>/,
            `$1  ${scripts.join("$1  ")}$1</body>`
          )
        );
        bundle.set("./index.html", { data });
      } catch (e) {
        logger.error(e.message);
      }
    };
    onStage("BUILD_END", handle);
    onStage("LIVE_RELOAD_SCRIPT_POPULATE", handle);
  };
}
