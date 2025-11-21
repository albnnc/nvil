import { delay } from "@std/async/delay";

// deno-lint-ignore no-explicit-any
export type StageHandler = (context?: any) => void | Promise<void>;

export class Stager {
  #stages: Record<string, StageHandler[]> = {};
  #runCount = 0;
  #runStartPwr = Promise.withResolvers<void>();
  #runEndPwr = Promise.withResolvers<void>();

  on(stageName: string, fn: StageHandler): () => void {
    if (this.#stages[stageName]) {
      this.#stages[stageName].push(fn);
    } else {
      this.#stages[stageName] = [fn];
    }
    return () => {
      const index = (this.#stages[stageName] ?? []).indexOf(fn);
      index >= 0 && this.#stages[stageName].splice(index, 1);
    };
  }

  before(stageName: string, fn: StageHandler): () => void {
    return this.on(`${stageName}__BEFORE`, fn);
  }

  after(stageName: string, fn: StageHandler): () => void {
    return this.on(`${stageName}__AFTER`, fn);
  }

  async run(stageName: string, context?: unknown): Promise<void> {
    if (!this.#runCount) {
      this.#runStartPwr.resolve();
      this.#runStartPwr = Promise.withResolvers();
    }
    ++this.#runCount;
    await delay(0);
    for (const fn of this.#stages[`${stageName}__BEFORE`] || []) {
      await fn(context);
    }
    for (const fn of this.#stages[stageName] || []) {
      await fn(context);
    }
    for (const fn of this.#stages[`${stageName}__AFTER`] || []) {
      await fn(context);
    }
    --this.#runCount;
    delay(100).then(() => {
      if (!this.#runCount) {
        this.#runEndPwr.resolve();
        this.#runEndPwr = Promise.withResolvers();
      }
    });
  }

  async waitStart(): Promise<void> {
    return await this.#runStartPwr.promise;
  }

  async waitEnd(): Promise<void> {
    return await this.#runEndPwr.promise;
  }
}
