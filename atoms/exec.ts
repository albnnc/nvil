import { Atom } from "../atom.ts";
import { log } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { absolutisePath } from "../utils/absolutise_path.ts";
import { relativisePath } from "../utils/relativise_path.ts";

export interface ExecConfig {
  logger?: log.Logger;
}

export function exec(
  scope: string,
  { logger = createLogger("exec") }: ExecConfig = {}
): Atom {
  return ({ config: { dev, destDir }, bundle, on }) => {
    if (!dev) {
      return;
    }
    let childProcess: Deno.ChildProcess;
    const handle = (entryPoint: string) => {
      logger.info(`Executing ${relativisePath(entryPoint, destDir)}`);
      childProcess?.kill();
      childProcess = new Deno.Command("deno", {
        args: ["run", "-A", entryPoint],
        stdout: "piped",
        stderr: "piped",
      }).spawn();
      const handleOutput = async (
        stream: ReadableStream<Uint8Array>,
        error = false
      ) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const chunk = await reader.read();
          const text = decoder.decode(chunk.value);
          if (text.trim().length) {
            error ? logger.error(text) : logger.info(text);
          }
          if (chunk.done) {
            return;
          }
        }
      };
      handleOutput(childProcess.stdout);
      handleOutput(childProcess.stderr, true);
    };
    on("BUILD_END", () => {
      for (const [k, v] of bundle.entries()) {
        if (v.scope === scope) {
          const entryPoint = absolutisePath(k, destDir);
          handle(entryPoint);
        }
      }
    });
  };
}
