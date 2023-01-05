import { async } from "./deps.ts";

export type StageHandler = (context?: unknown) => void | Promise<void>;

export function createStager() {
  const stages: Record<string, StageHandler[]> = {};
  const onStage = (stageName: string, fn: StageHandler) => {
    if (stages[stageName]) {
      stages[stageName].push(fn);
    } else {
      stages[stageName] = [fn];
    }
    return () => {
      const index = (stages[stageName] ?? []).indexOf(fn);
      index >= 0 && stages[stageName].splice(index, 1);
    };
  };
  let runCount = 0;
  let runCycleDeferred = async.deferred();
  const runStage = async (stageName: string, context?: unknown) => {
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
  const waitStages = () => {
    return runCycleDeferred;
  };
  return { stages, onStage, runStage, waitStages };
}

export type Stager = ReturnType<typeof createStager>;
