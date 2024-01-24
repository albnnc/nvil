import { Project } from "./project.ts";

export interface Plugin {
  (project: Project): void;
}
