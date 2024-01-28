import { graph, path } from "../_deps.ts";

export async function expandModule(specifier: string) {
  const textDecoder = new TextDecoder();
  const { success, stdout, stderr } = await new Deno.Command("deno", {
    args: ["info", specifier, "--json"],
    stdout: "piped",
    stderr: "piped",
  }).output();
  if (!success) {
    throw new Error(textDecoder.decode(stderr) || "Unable to expand module");
  }
  const { modules } = JSON.parse(
    textDecoder.decode(stdout),
  ) as graph.ModuleGraphJson;
  // One should use deno_graph when it will be able to cache its WASM.
  // See: https://deno.land/x/deno_graph@0.18.0/lib/deno_graph.generated.js#L842
  const fileUrls = modules
    .map((v) => v.specifier)
    .concat([specifier])
    .filter((v) => v.startsWith("file:"));
  const dirs = fileUrls.map(path.fromFileUrl).map(path.dirname);
  const commonUrl = path.toFileUrl(path.common(dirs)).toString();
  return { fileUrls, commonUrl };
}

export type ExpandedModule = Awaited<ReturnType<typeof expandModule>>;
