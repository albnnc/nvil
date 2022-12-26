import { Bundle } from "./bundle.ts";

export interface HookInput {
  dev: boolean;
  root: string;
  bundle: Bundle;
}

export interface Hook<ExtraInput = Record<never, never>, Output = void> {
  (options: HookInput & ExtraInput): Output | Promise<Output>;
}
