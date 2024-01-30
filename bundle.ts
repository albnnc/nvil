import { fs, path } from "./_deps.ts";

export interface BundleChunk {
  data: Uint8Array;
  scope?: string;
}

export class Bundle extends Map<string, BundleChunk> {
  #changes = new Set<string>();

  constructor(entries?: readonly (readonly [string, BundleChunk])[] | null) {
    if (entries?.some(([k]) => !k.startsWith("."))) {
      throw new Error("Only relative paths are allowed");
    }
    entries?.forEach(([k]) => this.#changes.add(k));
    super(entries);
  }

  set(url: string, chunk: BundleChunk) {
    if (!url.startsWith(".")) {
      throw new Error("Only relative paths are allowed");
    }
    super.set(url, chunk);
    this.#changes.add(url);
    return this;
  }

  isChanged(url: string) {
    return this.#changes.has(url);
  }

  clearChanges() {
    this.#changes.clear();
  }

  getChanges() {
    return Array.from(this.#changes.values());
  }

  async writeChanges(destUrl: string) {
    for (const k of this.getChanges()) {
      const { data } = this.get(k) ?? {};
      if (!data) {
        throw new Error(`Unable to get data for change "${k}"`);
      }
      this.#changes.delete(k);
      const targetUrl = new URL(k, destUrl).toString();
      const targetPath = path.fromFileUrl(targetUrl);
      const targetDir = path.dirname(targetPath);
      await fs.ensureDir(targetDir);
      await Deno.writeFile(targetPath, data);
    }
  }
}
