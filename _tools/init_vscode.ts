#!/usr/bin/env -S deno run -A
import { fs, log, path } from "../_deps.ts";

const rootDir = path.fromFileUrl(import.meta.resolve("../"));
const vscodeDir = path.fromFileUrl(import.meta.resolve("../.vscode"));
const importMapGlob = path.fromFileUrl(
  import.meta.resolve("../**/import_map.json"),
);

log.info("Searching for import maps");
const importMap = {
  imports: {} as Record<string, string>,
};
for await (const v of fs.expandGlob(importMapGlob, { globstar: true })) {
  if (!v.isFile || v.path.includes(".vscode")) {
    continue;
  }
  log.info(`Found import map at ${path.relative(rootDir, v.path)}`);
  const { imports, scopes } = await Deno.readTextFile(v.path).then(JSON.parse);
  if (scopes) {
    throw new Error("Scopes are not supported");
  }
  for (const [k, v] of Object.entries(imports)) {
    if (importMap.imports[k] && importMap.imports[k] !== v) {
      log.warn(
        `Import map entry ${k} was overridden from "${
          importMap.imports[k]
        }" to "${v}"`,
      );
    }
    importMap.imports[k] = v as string;
  }
}

log.info("Removing VSCode dir");
await Deno.remove(vscodeDir, { recursive: true }).catch(() => undefined);

log.info(`Creating VSCode dir`);
await fs.ensureDir(vscodeDir);

log.info("Writing compound import map");
await Deno.writeTextFile(
  path.join(vscodeDir, "import_map.json"),
  JSON.stringify(importMap, null, 2),
);

log.info("Writing settings");
await Deno.writeTextFile(
  path.join(vscodeDir, "settings.json"),
  JSON.stringify(
    {
      "deno.enable": true,
      "deno.unstable": true,
      "deno.importMap": "./.vscode/import_map.json",
      "[json]": { "editor.defaultFormatter": "dprint.dprint" },
      "[jsonc]": { "editor.defaultFormatter": "dprint.dprint" },
      "[markdown]": { "editor.defaultFormatter": "dprint.dprint" },
      "[typescript]": { "editor.defaultFormatter": "dprint.dprint" },
      "[typescriptreact]": { "editor.defaultFormatter": "dprint.dprint" },
    },
    null,
    2,
  ),
);
