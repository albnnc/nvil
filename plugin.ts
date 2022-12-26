import { Hook } from "./hook.ts";

export interface Plugin {
  onStart?: Hook;
  onBuildStart?: Hook<{ entryPoint: string }>;
  onBuild?: Hook<{ entryPoint: string }>;
  onBuildEnd?: Hook<{ entryPoint: string }>;
  onRequest?: Hook<{ request: Request }, Response | undefined | void>;
}
