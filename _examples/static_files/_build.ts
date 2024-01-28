#!/usr/bin/env -S deno run --unstable -A
import { clean } from "../../plugins/clean.ts";
import { copy } from "../../plugins/copy.ts";
import { devServer } from "../../plugins/dev_server.ts";
import { htmlTemplate } from "../../plugins/html_template.ts";
import { createProject } from "../../project.ts";

const project = createProject(
  [
    clean(),
    htmlTemplate("./index.html"),
    copy("./fonts/*.{otf,css}", { glob: true }),
    devServer(),
  ],
  {
    rootUrl: import.meta.resolve("./"),
    destUrl: "./dest/",
    importMapUrl: "./import_map.json",
    dev: Deno.args[0] === "dev",
  },
);

await project.bootstrap();
