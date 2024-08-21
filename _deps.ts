import mustache from "https://esm.sh/mustache@4.2.0?pin=v135&target=esnext";

mustache.escape = (v: string) => v;

export { mustache };
export * as esbuild from "https://deno.land/x/esbuild@v0.21.5/mod.js";
export * as graph from "jsr:@deno/graph@0.81.2";
export { denoPlugins as esbuildDenoPlugins } from "jsr:@luca/esbuild-deno-loader@0.10.3";
export * as async from "jsr:@std/async@1.0.3";
export { deepMerge } from "jsr:@std/collections@1.0.5/deep-merge";
export * as datetime from "jsr:@std/datetime@0.225.0";
export * as colors from "jsr:@std/fmt@1.0.0/colors";
export * as fs from "jsr:@std/fs@1.0.1";
export * as fileServer from "jsr:@std/http@1.0.3/file-server";
export * as log from "jsr:@std/log@0.224.5";
export * as path from "jsr:@std/path@0.225.2";
