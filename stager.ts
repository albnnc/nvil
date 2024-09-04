export type StageHandler = (context?: unknown) => void | Promise<void>;

export class Stager {
  #stages: Record<string, StageHandler[]> = {};
  #runCount = 0;
  #runCyclePwr = Promise.withResolvers<void>();

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

  async run(stageName: string, context?: unknown): Promise<void> {
    ++this.#runCount;
    for (const fn of this.#stages[stageName] || []) {
      await fn(context);
    }
    --this.#runCount;
    if (!this.#runCount) {
      this.#runCyclePwr.resolve();
      this.#runCyclePwr = Promise.withResolvers<void>();
    }
  }

  async waitCycle(): Promise<void> {
    return await this.#runCyclePwr.promise;
  }
}
