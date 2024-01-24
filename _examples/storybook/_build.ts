#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../plugins/build.ts";
import { clean } from "../../plugins/clean.ts";
import { htmlTemplate } from "../../plugins/html_template.ts";
import { storybook } from "../../plugins/storybook/mod.ts";
import { createProject } from "../../project.ts";

const project = createProject(
  [
    clean(),
    storybook("./**/*_story.{ts,tsx}", (v) => [
      build(v),
      htmlTemplate(import.meta.resolve("./index.html")),
    ]),
  ],
  {
    rootUrl: import.meta.resolve("./"),
    destUrl: "./dest/",
    importMapUrl: "./import_map.json",
    dev: Deno.args[0] === "dev",
  }
);

await project.bootstrap();
