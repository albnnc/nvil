import { fs, path } from "./deps.ts";

export interface BundleChunk {
  data: Uint8Array;
  scope?: string;
}

export class Bundle extends Map<string, BundleChunk> {
  #changes = new Set<string>();

  constructor(entries?: readonly (readonly [string, BundleChunk])[] | null) {
    if (entries?.some(([k]) => !k.startsWith("."))) {
      throw new Error("Only realative paths are allowed");
    }
    entries?.forEach(([k]) => this.#changes.add(k));
    super(entries);
  }

  set(key: string, value: BundleChunk) {
    if (!key.startsWith(".")) {
      throw new Error("Only realative paths are allowed");
    }
    super.set(key, value);
    this.#changes.add(key);
    return this;
  }

  clearChanges() {
    this.#changes.clear();
  }

  getChanges() {
    return Array.from(this.#changes.values());
  }

  async writeChanges(destDir: string) {
    for (const k of this.getChanges()) {
      const { data } = this.get(k) ?? {};
      if (!data) {
        throw new Error(`Unable to get data for change "${k}"`);
      }
      this.#changes.delete(k);
      const targetPath = path.join(destDir, k);
      const targetDir = path.dirname(targetPath);
      await fs.ensureDir(targetDir);
      await Deno.writeFile(targetPath, data);
    }
  }
}
