#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../atoms/build.ts";
import { clean } from "../../atoms/clean.ts";
import { devServer } from "../../atoms/dev_server.ts";
import { htmlTemplate } from "../../atoms/html_template.ts";
import { liveReload } from "../../atoms/live_reload.ts";
import { createKoat } from "../../mod.ts";

const koat = createKoat(
  [
    clean(),
    build("./index.tsx"),
    htmlTemplate("./index.html"),
    liveReload(),
    devServer(),
  ],
  {
    dev: Deno.args[0] === "dev",
    rootDir: import.meta.resolve("./"),
    destDir: "./dest",
    importMapUrl: import.meta.resolve("./import_map.json"),
  }
);

await koat.bootstrap();
