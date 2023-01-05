import { Project } from "./project.ts";

export interface Atom {
  (project: Project): void;
}
