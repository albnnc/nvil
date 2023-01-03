import { path, graph } from "../deps.ts";

export async function expandModule(specifier: string) {
  const process = Deno.run({
    cmd: ["deno", "info", specifier, "--json"],
    stdout: "piped",
    stderr: "piped",
  });
  const [raw] = await Promise.all([process.output(), process.status()]);
  const { modules } = JSON.parse(
    new TextDecoder().decode(raw)
  ) as graph.ModuleGraphJson;
  // One should use deno_graph when it will be able to cache its WASM.
  // See: https://deno.land/x/deno_graph@0.18.0/lib/deno_graph.generated.js#L842
  //
  // const specifier = path.toFileUrl(absoluteModulePath).toString();
  // const { modules } = await denoGraph.createGraph(specifier, {
  //   load: async (specifier: string) => {
  //     if (!specifier.startsWith("file://")) {
  //       return undefined;
  //     }
  //     const filePath = path.fromFileUrl(specifier);
  //     return {
  //       specifier,
  //       content: await Deno.readTextFile(filePath),
  //     };
  //   },
  // });
  const fileUrls = modules
    .map((v) => v.specifier)
    .concat([specifier])
    .filter((v) => v.startsWith("file:"));
  const dirs = fileUrls.map(path.fromFileUrl).map(path.dirname);
  const commonUrl = path.toFileUrl(path.common(dirs)).toString();
  return { fileUrls, commonUrl };
}
