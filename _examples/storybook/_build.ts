#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../atoms/build.ts";
import { clean } from "../../atoms/clean.ts";
import { htmlTemplate } from "../../atoms/html_template.ts";
import { storybook } from "../../atoms/storybook/mod.ts";
import { createKoat } from "../../mod.ts";

const koat = createKoat(
  [
    clean(),
    storybook("./**/*_story.{ts,tsx}", (v) => [
      build(v),
      htmlTemplate("./index.html"),
    ]),
  ],
  {
    dev: Deno.args[0] === "dev",
    rootDir: import.meta.resolve("./"),
    destDir: "./dest",
    importMapUrl: import.meta.resolve("./import_map.json"),
  }
);

await koat.bootstrap();
