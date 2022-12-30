import { Koat } from "./koat.ts";

export interface Atom {
  (koat: Koat): void;
}
