#!/usr/bin/env -S deno run -A
import { fs, path, log, deepMerge } from "../deps.ts";

const rootDir = path.fromFileUrl(import.meta.resolve("../"));
const vscodeDir = path.fromFileUrl(import.meta.resolve("../.vscode"));
const importMapGlob = path.fromFileUrl(
  import.meta.resolve("../**/import_map.json")
);

log.info("Searching for import maps");
let importMap: Record<string, unknown> = {};
for await (const v of fs.expandGlob(importMapGlob, { globstar: true })) {
  if (!v.isFile || v.path.includes(".vscode")) {
    continue;
  }
  log.info(`Found import map at ${path.relative(rootDir, v.path)}`);
  importMap = deepMerge(
    importMap,
    await Deno.readTextFile(v.path).then(JSON.parse)
  );
}

log.info("Removing VSCode dir");
await Deno.remove(vscodeDir, { recursive: true });

log.info(`Creating VSCode dir`);
await fs.ensureDir(vscodeDir);

log.info("Writing compound import map");
await Deno.writeTextFile(
  path.join(vscodeDir, "import_map.json"),
  JSON.stringify(importMap, null, 2)
);

log.info("Writing settings");
await Deno.writeTextFile(
  path.join(vscodeDir, "settings.json"),
  JSON.stringify(
    {
      "deno.enable": true,
      "deno.unstable": true,
      "deno.importMap": "./.vscode/import_map.json",
    },
    null,
    2
  )
);
