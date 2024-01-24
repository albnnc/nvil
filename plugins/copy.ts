import { Plugin } from "../plugin.ts";
import { async, fs, path } from "../_deps.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface CopyConfig {
  glob?: boolean;
}

export function copy(url: string, { glob }: CopyConfig = {}): Plugin {
  return ({
    config: { rootUrl, dev },
    bundle,
    getLogger,
    onStage,
    runStage,
  }) => {
    const logger = getLogger("copy");
    const absoluteUrl = new URL(url, rootUrl).toString();
    const relativeUrl = relativiseUrl(url, rootUrl);
    const targetRegExp = absoluteUrl.startsWith("file:")
      ? path.globToRegExp(path.fromFileUrl(absoluteUrl), { globstar: true })
      : undefined;
    const handleFile = async (fileUrl: string) => {
      const relativeUrl = relativiseUrl(fileUrl, rootUrl);
      bundle.set(relativeUrl, {
        data: await fetch(fileUrl).then(async (v) => {
          const arrayBuffer = await v.arrayBuffer();
          return new Uint8Array(arrayBuffer);
        }),
      });
    };
    const handle = async () => {
      logger.info(`Copying ${relativeUrl}`);
      await runStage("COPY_START");
      if (glob) {
        if (!absoluteUrl.startsWith("file:")) {
          logger.error("Glob to copy must be a local URL");
          return;
        }
        const fileUrls: string[] = [];
        for await (const v of fs.expandGlob(
          path.fromFileUrl(decodeURIComponent(absoluteUrl))
        )) {
          if (!v.isFile) {
            return;
          }
          fileUrls.push(path.toFileUrl(v.path).toString());
        }
        await Promise.all(fileUrls.map(handleFile));
      } else {
        await handleFile(absoluteUrl);
      }
      await runStage("COPY_END");
    };
    const watch = async () => {
      if (!targetRegExp) {
        return;
      }
      logger.info(`Watching ${relativeUrl}`);
      const dirToWatch = path.dirname(
        path.fromFileUrl(absoluteUrl).replace(/\*.*$/, "")
      );
      const watcher = Deno.watchFs(dirToWatch);
      const debounced = async.debounce(handle, 200);
      for await (const event of watcher) {
        if (
          event.paths.some((v) => targetRegExp.test(v)) &&
          (event.kind === "modify" ||
            event.kind === "create" ||
            event.kind === "remove")
        ) {
          debounced();
        }
      }
    };
    onStage("BOOTSTRAP", async () => {
      await handle();
      dev && watch();
    });
  };
}
