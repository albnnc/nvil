#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../atoms/build.ts";
import { clean } from "../../atoms/clean.ts";
import { htmlTemplate } from "../../atoms/html_template.ts";
import { storybook } from "../../atoms/storybook/mod.ts";
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
