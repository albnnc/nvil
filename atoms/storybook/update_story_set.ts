import { fs, path } from "../../deps.ts";

export interface UpdateStorySetOptions {
  rootUrl: string;
  glob: string;
  onFind?: (v: string) => void;
  onLoss?: (v: string) => void;
}

export async function updateStorySet(
  set: Set<string>,
  config: UpdateStorySetOptions
) {
  const { rootUrl, glob } = config;
  const nextSet = new Set<string>();
  const targetGlob = path.fromFileUrl(new URL(glob, rootUrl));
  for await (const v of fs.expandGlob(targetGlob, { globstar: true })) {
    v.isFile && nextSet.add(v.path);
  }
  update(set, nextSet, config);
}

export function updateStorySetSync(
  set: Set<string>,
  config: UpdateStorySetOptions
) {
  const { rootUrl, glob } = config;
  const nextSet = new Set<string>();
  const targetGlob = path.fromFileUrl(new URL(glob, rootUrl));
  for (const v of fs.expandGlobSync(targetGlob, { globstar: true })) {
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
