export type StageHandler = (context?: unknown) => void | Promise<void>;

export class Stager {
  private stages: Record<string, StageHandler[]> = {};
  private runCount = 0;
  private runCyclePWR = Promise.withResolvers<void>();

  on(this: Stager, stageName: string, fn: StageHandler): () => void {
    if (this.stages[stageName]) {
      this.stages[stageName].push(fn);
    } else {
      this.stages[stageName] = [fn];
    }
    return () => {
      const index = (this.stages[stageName] ?? []).indexOf(fn);
      index >= 0 && this.stages[stageName].splice(index, 1);
    };
  }

  async run(this: Stager, stageName: string, context?: unknown): Promise<void> {
    ++this.runCount;
    for (const fn of this.stages[stageName] || []) {
      await fn(context);
    }
    --this.runCount;
    if (!this.runCount) {
      this.runCyclePWR.resolve();
      this.runCyclePWR = Promise.withResolvers<void>();
    }
  }

  async waitCycle(this: Stager): Promise<void> {
    return await this.runCyclePWR.promise;
  }
}
