import { Atom } from "../atom.ts";
import { log } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { completePath } from "../utils/complete_path.ts";

export interface HtmlTemplateConfig {
  scope?: string;
  logger?: log.Logger;
}

// TODO: Watch entry point changes.
export function htmlTemplate(
  entryPoint: string,
  { scope, logger = createLogger("HTML_TEMPLATE") }: HtmlTemplateConfig = {}
): Atom {
  return ({ config: { rootDir }, bundle, on }) => {
    const handle = async () => {
      logger.info(`Updating ./index.html`);
      const completeEntryPoint = completePath(entryPoint, rootDir);
      const template = await Deno.readTextFile(completeEntryPoint);
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
    };
    on("BUILD_END", handle);
    on("LIVE_RELOAD_INJECT", handle);
  };
}
