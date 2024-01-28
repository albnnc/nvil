import { path } from "../_deps.ts";
import { relativiseUrl } from "../_utils/relativise_url.ts";
import { Plugin, PluginApplyOptions } from "../plugin.ts";

export interface ExecPluginOptions {
  scope: string;
  args?: string[];
  env?: Record<string, string>;
}

export class ExecPlugin extends Plugin {
  scope: string;
  args?: string[];
  env?: Record<string, string>;

  childProcess?: Deno.ChildProcess;

  constructor(options: ExecPluginOptions) {
    super("EXEC");
    this.scope = options.scope;
    this.args = options.args;
    this.env = options.env;
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.project.stager.on("WRITE_END", (changes) => {
      for (const v of changes as string[]) {
        const entry = this.project.bundle.get(v);
        if (entry && entry.scope === this.scope) {
          const absoluteUrl = new URL(v, this.project.destUrl).toString();
          this.exec(absoluteUrl);
        }
      }
    });
  }

  exec(entryPoint: string) {
    this.logger.info(
      `Executing ${relativiseUrl(entryPoint, this.project.destUrl)}`,
    );
    this.childProcess?.[Symbol.asyncDispose]();
    this.childProcess = new Deno.Command("deno", {
      args: ["run", ...(this.args ?? []), entryPoint],
      cwd: path.dirname(path.fromFileUrl(entryPoint)),
      env: this.env,
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    const handleOutput = async (
      stream: ReadableStream<Uint8Array>,
      error = false,
    ) => {
      const reader = stream.getReader();
      const textDecoder = new TextDecoder();
      while (true) {
        const chunk = await reader.read();
        const text = textDecoder.decode(chunk.value);
        if (text.trim().length) {
          error ? this.logger.error(text) : this.logger.info(text);
        }
        if (chunk.done) {
          return;
        }
      }
    };
    handleOutput(this.childProcess.stdout);
    handleOutput(this.childProcess.stderr, true);
  }

  async [Symbol.asyncDispose]() {
    await this.childProcess?.[Symbol.asyncDispose]();
  }
}
