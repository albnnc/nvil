import { Koat } from "./mod.ts";

export interface Atom {
  (koat: Koat): void;
}
