import { Plugin } from "../plugin.ts";
import { completePath } from "../utils/complete_path.ts";

export type CopyItem = string | { from: string; to: string };

export function copy(items: CopyItem[]): Plugin {
  return {
    onStart: async ({ root, bundle }) => {
      for await (const v of items) {
        const { from, to = "" } = typeof v === "string" ? { from: v } : v;
        const completeFrom = completePath(from, root);
        const relativeTo = to || "./" + completeFrom.replace(root, ""); // FIXME
        const data = await Deno.readFile(completeFrom);
        bundle.set(relativeTo, { data });
      }
    },
  };
}
