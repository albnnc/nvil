import { Bundle } from "./bundle.ts";
import { async, fileServer, fs, http, log, path } from "./deps.ts";
import { HookInput } from "./hook.ts";
import { Plugin } from "./plugin.ts";
import { completePath } from "./utils/complete_path.ts";
import { watchModule } from "./utils/watch_module.ts";

export interface KoatOptions {
  dev?: boolean;
  rootDir: string;
  outputDir: string;
  entryPoints: string[];
  plugins: Plugin[];
}

export async function koat({
  dev,
  rootDir,
  outputDir,
  entryPoints,
  plugins,
}: KoatOptions) {
  const completeRoot = completePath(rootDir);
  const completeOutputDir = completePath(outputDir, completeRoot);
  const completeEntryPoints = await (async () => {
    const values: string[] = [];
    for (const entryPoint of entryPoints) {
      const glob = completePath(entryPoint, completeRoot);
      for await (const v of fs.expandGlob(glob)) {
        v.isFile && values.push(v.path);
      }
    }
    return values;
  })();
  const bundle = new Bundle();
  const hookInput: HookInput = {
    dev: !!dev,
    root: completePath(rootDir),
    bundle,
  };
  log.info("Cleaning output dir");
  await Deno.remove(completeOutputDir, { recursive: true }).catch(
    () => undefined
  );
  await fs.ensureDir(completeOutputDir);
  for (const { onStart } of plugins) {
    await onStart?.(hookInput);
  }
  const build = async (entryPoint: string) => {
    const buildInput = { ...hookInput, entryPoint };
    for (const { onBuildStart } of plugins) {
      await onBuildStart?.(buildInput);
    }
    log.info(`Building "${path.relative(completeRoot, entryPoint)}"`);
    for (const { onBuild } of plugins) {
      await onBuild?.(buildInput);
    }
    for (const { onBuildEnd } of plugins) {
      await onBuildEnd?.(buildInput);
    }
    await bundle.writeChanges(completeOutputDir);
  };
  const watch = async (entryPoint: string) => {
    const watcher = watchModule(entryPoint);
    const handle = async.debounce(() => build(entryPoint), 200);
    for await (const event of watcher) {
      if (
        event.kind === "modify" ||
        event.kind === "create" ||
        event.kind === "remove"
      ) {
        handle();
      }
    }
  };
  for (const v of completeEntryPoints) {
    await build(v);
  }
  await bundle.writeChanges(completeOutputDir);
  if (dev) {
    completeEntryPoints.forEach(watch);
    http.serve(
      async (request) => {
        for (const { onRequest } of plugins) {
          const response = await onRequest?.({ ...hookInput, request });
          if (response) {
            return response;
          }
        }
        return fileServer.serveDir(request, { fsRoot: completeOutputDir });
      },
      {
        onListen({ port, hostname }) {
          log.info(`Dev server started at http://${hostname}:${port}`);
        },
      }
    );
  }
}
