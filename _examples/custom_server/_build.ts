#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../atoms/build.ts";
import { clean } from "../../atoms/clean.ts";
import { exec } from "../../atoms/exec.ts";
import { htmlTemplate } from "../../atoms/html_template.ts";
import { liveReload } from "../../atoms/live_reload.ts";
import { createProject } from "../../project.ts";

const project = createProject(
  [
    clean(),
    build("./index.tsx"),
    htmlTemplate("./index.html"),
    liveReload(),
    build("./server.ts", { scope: "server" }),
    exec("server", { args: ["-A"] }),
  ],
  {
    rootUrl: import.meta.resolve("./"),
    destUrl: "./dest/",
    importMapUrl: "./import_map.json",
    dev: Deno.args[0] === "dev",
  }
);

await project.bootstrap();
