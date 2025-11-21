export type StageHandler = (context?: unknown) => void | Promise<void>;

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

  async run(stageName: string, context?: unknown): Promise<void> {
    if (!this.#runCount) {
      this.#runStartPwr.resolve();
      this.#runStartPwr = Promise.withResolvers();
    }
    ++this.#runCount;
    for (const fn of this.#stages[stageName] || []) {
      await fn(context);
    }
    --this.#runCount;
    if (!this.#runCount) {
      this.#runEndPwr.resolve();
      this.#runEndPwr = Promise.withResolvers();
    }
  }

  async waitStart(): Promise<void> {
    return await this.#runStartPwr.promise;
  }

  async waitEnd(): Promise<void> {
    return await this.#runEndPwr.promise;
  }
}
