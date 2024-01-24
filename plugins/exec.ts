import { Plugin } from "../plugin.ts";
import { path } from "../deps.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface ExecConfig {
  args?: string[];
  env?: Record<string, string>;
}

export function exec(
  scope: string,
  { args = [], env }: ExecConfig = {}
): Plugin {
  return ({ config: { destUrl, dev }, bundle, getLogger, onStage }) => {
    const logger = getLogger("exec");
    if (!dev) {
      return;
    }
    let childProcess: Deno.ChildProcess;
    const handle = (entryPoint: string) => {
      logger.info(`Executing ${relativiseUrl(entryPoint, destUrl)}`);
      childProcess?.kill();
      childProcess = new Deno.Command("deno", {
        args: ["run", ...args, entryPoint],
        cwd: path.dirname(path.fromFileUrl(entryPoint)),
        env,
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
    onStage("WRITE_END", (changes) => {
      for (const v of changes as string[]) {
        const entry = bundle.get(v);
        if (entry && entry.scope === scope) {
          const absoluteUrl = new URL(v, destUrl).toString();
          handle(absoluteUrl);
        }
      }
    });
  };
}
