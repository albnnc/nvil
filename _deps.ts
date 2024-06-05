import mustache from "https://esm.sh/mustache@4.2.0?pin=v135&target=esnext";

mustache.escape = (v: string) => v;

export { mustache };
export * as async from "https://deno.land/std@0.224.0/async/mod.ts";
export { deepMerge } from "https://deno.land/std@0.224.0/collections/deep_merge.ts";
export * as datetime from "https://deno.land/std@0.224.0/datetime/mod.ts";
export * as colors from "https://deno.land/std@0.224.0/fmt/colors.ts";
export * as fs from "https://deno.land/std@0.224.0/fs/mod.ts";
export * as fileServer from "https://deno.land/std@0.224.0/http/file_server.ts";
export * as http from "https://deno.land/std@0.224.0/http/mod.ts";
export * as log from "https://deno.land/std@0.224.0/log/mod.ts";
export * as path from "https://deno.land/std@0.224.0/path/mod.ts";
export * as graph from "https://deno.land/x/deno_graph@0.40.0/mod.ts";
export * as esbuild from "https://deno.land/x/esbuild@v0.21.4/mod.js";
export { denoPlugins as esbuildDenoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.5/mod.ts";
