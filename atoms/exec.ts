import { Atom } from "../atom.ts";
import { path } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { completePath } from "../utils/complete_path.ts";

export function exec(scope: string): Atom {
  const log = createLogger("EXEC");
  return ({ config: { dev, destDir }, bundle, on }) => {
    if (!dev) {
      return;
    }
    let childProcess: Deno.ChildProcess;
    const handle = (entryPoint: string) => {
      log.info(`Executing ${path.relative(destDir, entryPoint)}`);
      childProcess?.kill();
      childProcess = new Deno.Command("deno", {
        args: ["run", "-A", entryPoint],
      }).spawn();
    };
    on("BUILD_END", () => {
      for (const [k, v] of bundle.entries()) {
        if (v.scope === scope) {
          const entryPoint = completePath(k, destDir);
          handle(entryPoint);
        }
      }
    });
  };
}
