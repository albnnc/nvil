import { async } from "./deps.ts";

export type StageHandler = (context?: unknown) => void | Promise<void>;

export function createStager() {
  const stages: Record<string, StageHandler[]> = {};
  const on = (stageName: string, fn: StageHandler) => {
    if (stages[stageName]) {
      stages[stageName].push(fn);
    } else {
      stages[stageName] = [fn];
    }
  };
  let runCount = 0;
  let runCycleDeferred = async.deferred();
  const run = async (stageName: string, context?: unknown) => {
    ++runCount;
    for (const fn of stages[stageName] || []) {
      await fn(context);
    }
    --runCount;
    if (!runCount) {
      runCycleDeferred.resolve();
      runCycleDeferred = async.deferred();
    }
  };
  const wait = () => {
    return runCycleDeferred;
  };
  return { stages, on, run, wait };
}

export type Stager = ReturnType<typeof createStager>;
