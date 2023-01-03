import { fs } from "../../deps.ts";
import { absolutisePath } from "../../utils/absolutise_path.ts";

export interface UpdateStorySetOptions {
  rootDir: string;
  glob: string;
  onFind?: (v: string) => void;
  onLoss?: (v: string) => void;
}

export async function updateStorySet(
  set: Set<string>,
  config: UpdateStorySetOptions
) {
  const { rootDir, glob } = config;
  const nextSet = new Set<string>();
  const completeGlob = absolutisePath(glob, rootDir);
  for await (const v of fs.expandGlob(completeGlob, { globstar: true })) {
    v.isFile && nextSet.add(v.path);
  }
  update(set, nextSet, config);
}

export function updateStorySetSync(
  set: Set<string>,
  config: UpdateStorySetOptions
) {
  const { rootDir, glob } = config;
  const nextSet = new Set<string>();
  const completeGlob = absolutisePath(glob, rootDir);
  for (const v of fs.expandGlobSync(completeGlob, { globstar: true })) {
    v.isFile && nextSet.add(v.path);
  }
  update(set, nextSet, config);
}

function update(
  set: Set<string>,
  nextSet: Set<string>,
  { onFind, onLoss }: UpdateStorySetOptions
) {
  for (const v of nextSet) {
    if (!set.has(v)) {
      set.add(v);
      onFind?.(v);
    }
  }
  for (const v of set) {
    if (!nextSet.has(v)) {
      set.delete(v);
      onLoss?.(v);
    }
  }
}
