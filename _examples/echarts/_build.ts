#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../plugins/build.ts";
import { clean } from "../../plugins/clean.ts";
import { devServer } from "../../plugins/dev_server.ts";
import { htmlTemplate } from "../../plugins/html_template.ts";
import { liveReload } from "../../plugins/live_reload.ts";
import { createProject } from "../../project.ts";

const project = createProject(
  [
    clean(),
    build("./index.tsx"),
    htmlTemplate("./index.html"),
    liveReload(),
    devServer(),
  ],
  {
    rootUrl: import.meta.resolve("./"),
    destUrl: "./dest/",
    importMapUrl: "./import_map.json",
    dev: Deno.args[0] === "dev",
  }
);

await project.bootstrap();
