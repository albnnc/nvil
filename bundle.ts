import { fs, path } from "./_deps.ts";

export interface BundleChunk {
  data: Uint8Array;
  scope?: string;
}

export class Bundle extends Map<string, BundleChunk> {
  private changes = new Set<string>();

  constructor(entries?: readonly (readonly [string, BundleChunk])[] | null) {
    if (entries?.some(([k]) => !k.startsWith("."))) {
      throw new Error("Only relative paths are allowed");
    }
    entries?.forEach(([k]) => this.changes.add(k));
    super(entries);
  }

  set(url: string, chunk: BundleChunk) {
    if (!url.startsWith(".")) {
      throw new Error("Only relative paths are allowed");
    }
    super.set(url, chunk);
    this.changes.add(url);
    return this;
  }

  isChanged(url: string) {
    return this.changes.has(url);
  }

  clearChanges() {
    this.changes.clear();
  }

  getChanges() {
    return Array.from(this.changes.values());
  }

  async writeChanges(targetUrl: string) {
    for (const change of this.getChanges()) {
      const { data } = this.get(change) ?? {};
      if (!data) {
        throw new Error(`Unable to get data for change "${change}"`);
      }
      this.changes.delete(change);
      const changeTargetUrl = new URL(change, targetUrl).toString();
      const changeTargetPath = path.fromFileUrl(changeTargetUrl);
      const changeTargetDir = path.dirname(changeTargetPath);
      await fs.ensureDir(changeTargetDir);
      await Deno.writeFile(changeTargetPath, data);
    }
  }
}
