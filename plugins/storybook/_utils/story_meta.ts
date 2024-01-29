import { cyrb53 } from "../../../_utils/cyrb53.ts";
import { relativiseUrl } from "../../../_utils/relativise_url.ts";

export interface StoryMetaOptions {
  id: string;
  entryPoint: string;
}

export class StoryMeta {
  id: string;
  entryPoint: string;
  [key: string]: unknown;

  constructor(options: StoryMetaOptions) {
    this.id = options.id;
    this.entryPoint = options.entryPoint;
  }

  static fromEntryPoint(entryPoint: string, rootUrl: string): StoryMeta {
    const relativeEntryPoint = relativiseUrl(entryPoint as string, rootUrl);
    const id = cyrb53(relativeEntryPoint).toString().slice(0, 6);
    return new StoryMeta({
      id,
      entryPoint: relativeEntryPoint,
    });
  }
}
