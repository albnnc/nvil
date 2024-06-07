import mustache from "https://esm.sh/mustache@4.2.0?pin=v135&target=esnext";

mustache.escape = (v: string) => v;

export { mustache };
export * as esbuild from "https://deno.land/x/esbuild@v0.21.4/mod.js";
export * as graph from "jsr:@deno/graph";
export { denoPlugins as esbuildDenoPlugins } from "jsr:@luca/esbuild-deno-loader";
export * as async from "jsr:@std/async";
export { deepMerge } from "jsr:@std/collections/deep-merge";
export * as datetime from "jsr:@std/datetime";
export * as colors from "jsr:@std/fmt/colors";
export * as fs from "jsr:@std/fs";
export * as fileServer from "jsr:@std/http/file-server";
export * as log from "jsr:@std/log";
export * as path from "jsr:@std/path";
