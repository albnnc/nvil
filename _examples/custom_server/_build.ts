#!/usr/bin/env -S deno run --unstable -A
import { build } from "../../plugins/build.ts";
import { clean } from "../../plugins/clean.ts";
import { exec } from "../../plugins/exec.ts";
import { htmlTemplate } from "../../plugins/html_template.ts";
import { liveReload } from "../../plugins/live_reload.ts";
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
  },
);

await project.bootstrap();
