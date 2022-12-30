import { Atom } from "../atom.ts";

export function clean(): Atom {
  return ({ config: { destDir }, on }) => {
    on("BOOTSTRAP", async () => {
      await Deno.remove(destDir, {
        recursive: true,
      }).catch(() => undefined);
    });
  };
}
