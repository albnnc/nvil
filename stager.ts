import { async } from "./_deps.ts";

export type StageHandler = (context?: unknown) => void | Promise<void>;

export class Stager {
  stages: Record<string, StageHandler[]> = {};
  runCount = 0;
  runCycleDeferred = async.deferred();

  on(this: Stager, stageName: string, fn: StageHandler) {
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

  async run(this: Stager, stageName: string, context?: unknown) {
    ++this.runCount;
    for (const fn of this.stages[stageName] || []) {
      await fn(context);
    }
    --this.runCount;
    if (!this.runCount) {
      this.runCycleDeferred.resolve();
      this.runCycleDeferred = async.deferred();
    }
  }

  async wait(this: Stager) {
    return await this.runCycleDeferred;
  }
}
