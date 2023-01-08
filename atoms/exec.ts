import { Atom } from "../atom.ts";
import { async, path } from "../deps.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface ExecConfig {
  args?: string[];
}

export function exec(scope: string, { args = [] }: ExecConfig = {}): Atom {
  return ({ config: { destUrl, dev }, bundle, getLogger }) => {
    const logger = getLogger("exec");
    if (!dev) {
      return;
    }
    let childProcess: Deno.ChildProcess;
    const handle = async.debounce((entryPoint: string) => {
      logger.info(`Executing ${relativiseUrl(entryPoint, destUrl)}`);
      childProcess?.kill();
      childProcess = new Deno.Command("deno", {
        args: ["run", ...args, entryPoint],
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
    }, 200);
    const watch = async () => {
      const watcher = Deno.watchFs(path.fromFileUrl(destUrl));
      for await (const entry of watcher) {
        if (entry.kind === "create" || entry.kind === "modify") {
          for (const v of entry.paths) {
            const absoluteUrl = path.toFileUrl(v).toString();
            const relativeUrl = relativiseUrl(absoluteUrl, destUrl);
            const entry = bundle.get(relativeUrl);
            if (entry && entry.scope === scope) {
              handle(absoluteUrl);
            }
          }
        }
      }
    };
    watch();
  };
}
