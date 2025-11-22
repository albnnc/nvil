import * as path from "@std/path";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";
import type { WriteStageContext } from "../project.ts";
import { relativiseUrl } from "../utils/relativise_url.ts";

export interface RunPluginOptions {
  scope: string;
  args?: string[];
  env?: Record<string, string>;
}

export class RunPlugin extends Plugin {
  #scope: string;
  #args?: string[];
  #env?: Record<string, string>;
  #childProcess?: Deno.ChildProcess;

  constructor(options: RunPluginOptions) {
    super("RUN");
    this.#scope = options.scope;
    this.#args = options.args;
    this.#env = options.env;
  }

  override apply(options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.project.stager.after("WRITE", ({ changes }: WriteStageContext) => {
      for (const v of changes as string[]) {
        const entry = this.project.bundle.get(v);
        if (entry && entry.scope === this.#scope) {
          const absoluteUrl = new URL(v, this.project.targetUrl).toString();
          this.#run(absoluteUrl);
        }
      }
    });
  }

  override async [Symbol.asyncDispose]() {
    await this.#childProcess?.[Symbol.asyncDispose]();
  }

  #run(entryPoint: string) {
    this.logger.debug(
      `Running ${relativiseUrl(entryPoint, this.project.targetUrl)}`,
    );
    this.#childProcess?.[Symbol.asyncDispose]();
    this.#childProcess = new Deno.Command("deno", {
      args: ["run", ...(this.#args ?? []), entryPoint],
      cwd: path.dirname(path.fromFileUrl(entryPoint)),
      env: this.#env,
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
    handleOutput(this.#childProcess.stdout);
    handleOutput(this.#childProcess.stderr, true);
  }
}
