import { async } from "./deps.ts";

export type StageHandler = (context?: unknown) => void | Promise<void>;

export function createStager() {
  const stages: Record<string, StageHandler[]> = {};
  const on = (name: string, fn: StageHandler) => {
    if (stages[name]) {
      stages[name].push(fn);
    } else {
      stages[name] = [fn];
    }
  };
  let runCount = 0;
  let runCycleDeferred = async.deferred();
  const run = async (name: string, context?: unknown) => {
    ++runCount;
    for (const fn of stages[name] || []) {
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
